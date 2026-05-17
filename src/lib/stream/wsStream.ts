import type { StreamEvent, StreamMetrics, StreamPhase } from "@/types";
import { mockStream } from "./mockStream";
import { SseParser } from "./parseSSE";
import type { RunStreamArgs, RunStreamHandlers } from "./runStream";

export type StreamTransport = "http" | "ws";

interface WsFrame {
  type: "phase" | "token" | "event" | "metrics" | "done" | "error" | "open" | "close";
  phase?: StreamPhase;
  token?: string;
  full?: string;
  event?: StreamEvent;
  metrics?: StreamMetrics;
  message?: string;
  partial?: string;
}

interface Channel {
  send: (frame: WsFrame) => void;
}

async function runProducer(
  args: Omit<RunStreamArgs, "handlers">,
  channel: Channel,
): Promise<void> {
  const t0 = performance.now();
  let output = "";
  let tokens = 0;
  let bytesIn = 0;
  let firstByteT: number | null = null;
  let tpsEma = 0;
  let lastTickT = t0;
  let tokensSinceTick = 0;

  const metrics = (): StreamMetrics => {
    const now = performance.now();
    const durationMs = now - t0;
    const effectiveTps =
      tpsEma > 0 ? tpsEma : tokens > 0 && durationMs > 0 ? (tokens / durationMs) * 1000 : 0;
    let health: StreamMetrics["health"];
    if (tpsEma === 0 && tokens === 0) health = "healthy";
    else if (effectiveTps > 40) health = "healthy";
    else if (effectiveTps > 12) health = "degraded";
    else health = "critical";
    return {
      tokens,
      tokensPerSec: effectiveTps,
      ttft: firstByteT,
      durationMs,
      retries: 0,
      bytesIn,
      health,
    };
  };

  const log = (
    kind: StreamEvent["kind"],
    message: string,
    meta?: Record<string, unknown>,
  ) => {
    const e: StreamEvent = {
      t: performance.now() - t0,
      kind,
      message,
      meta,
    };
    channel.send({ type: "event", event: e });
  };

  channel.send({ type: "open" });
  channel.send({ type: "phase", phase: "connecting" });
  log("connect", `Opening WS to ${args.model}`);

  let res: Response;
  try {
    res = await mockStream({
      prompt: args.prompt,
      model: args.model,
      failureMode: args.failureMode,
      signal: args.signal,
      speed: args.speed,
      seed: args.seed,
    });
  } catch (err) {
    const e = err as Error;
    if (e.name === "AbortError") {
      channel.send({ type: "phase", phase: "aborted" });
      log("abort", "WS aborted before handshake");
      channel.send({ type: "close" });
      return;
    }
    log("error", `WS handshake failed: ${e.message}`);
    channel.send({ type: "phase", phase: "partial-error" });
    channel.send({ type: "error", message: e.message });
    channel.send({ type: "close" });
    return;
  }

  if (!res.ok || !res.body) {
    const msg = `WS upgrade failed · HTTP ${res.status}`;
    log("error", msg);
    channel.send({ type: "phase", phase: "partial-error" });
    channel.send({ type: "error", message: msg });
    channel.send({ type: "close" });
    return;
  }

  log("connect", `Socket open · ${args.model}`);
  channel.send({ type: "phase", phase: "streaming" });

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  const parser = new SseParser();

  const tickMetrics = () => {
    const now = performance.now();
    const dt = now - lastTickT;
    if (dt >= 250) {
      const instTps = (tokensSinceTick / dt) * 1000;
      tpsEma = tpsEma === 0 ? instTps : tpsEma * 0.65 + instTps * 0.35;
      tokensSinceTick = 0;
      lastTickT = now;
      channel.send({ type: "metrics", metrics: metrics() });
    }
  };

  try {
    for (;;) {
      if (args.signal.aborted) throw new DOMException("Aborted", "AbortError");
      const { value, done } = await reader.read();
      if (done) break;
      if (value) {
        bytesIn += value.byteLength;
        if (firstByteT === null) {
          firstByteT = performance.now() - t0;
          log("first-byte", `WS first frame in ${firstByteT.toFixed(0)}ms`);
        }
        const text = decoder.decode(value, { stream: true });
        const frames = parser.feed(text);
        let payloadFrames = 0;
        for (const f of frames) {
          if (f.data === "[DONE]") continue;
          payloadFrames++;
          tokens += 1;
          tokensSinceTick += 1;
          output += f.data;
          channel.send({ type: "token", token: f.data, full: output });
        }
        tickMetrics();
        if (payloadFrames > 0) {
          log("chunk", `+${payloadFrames} via WS`, { totalTokens: tokens });
        }
      }
    }
    // UTF-8 tail flush — see `runStream` for rationale.
    const tail = decoder.decode();
    if (tail) {
      for (const f of parser.feed(tail)) {
        if (f.data === "[DONE]") continue;
        tokens += 1;
        tokensSinceTick += 1;
        output += f.data;
        channel.send({ type: "token", token: f.data, full: output });
      }
    }
    for (const f of parser.flush()) {
      if (f.data === "[DONE]") continue;
      tokens += 1;
      tokensSinceTick += 1;
      output += f.data;
      channel.send({ type: "token", token: f.data, full: output });
    }
    log("close", `WS closed cleanly · ${tokens} tokens`);
    channel.send({ type: "phase", phase: "done" });
    channel.send({ type: "metrics", metrics: metrics() });
    channel.send({ type: "done", full: output, metrics: metrics() });
    channel.send({ type: "close" });
  } catch (err) {
    const e = err as Error;
    if (e.name === "AbortError") {
      channel.send({ type: "phase", phase: "aborted" });
      log("abort", `WS aborted · ${tokens} partial tokens preserved`);
      channel.send({ type: "metrics", metrics: metrics() });
      channel.send({ type: "close" });
      try {
        await reader.cancel("aborted");
      } catch {
      }
      return;
    }
    log("error", e.message, { partialTokens: tokens });
    channel.send({ type: "phase", phase: "partial-error" });
    channel.send({ type: "error", message: e.message, partial: output });
    channel.send({ type: "metrics", metrics: metrics() });
    channel.send({ type: "close" });
    try {
      await reader.cancel(e.message);
    } catch {
    }
  } finally {
    try {
      reader.releaseLock();
    } catch {
    }
  }
}

export async function wsStream(args: RunStreamArgs): Promise<void> {
  const handlers = args.handlers as RunStreamHandlers;

  const channel: Channel = {
    send(frame) {
      switch (frame.type) {
        case "phase":
          if (frame.phase) handlers.onPhase?.(frame.phase);
          break;
        case "token":
          if (frame.token !== undefined && frame.full !== undefined) {
            handlers.onToken?.(frame.token, frame.full);
          }
          break;
        case "event":
          if (frame.event) handlers.onEvent?.(frame.event);
          break;
        case "metrics":
          if (frame.metrics) handlers.onMetrics?.(frame.metrics);
          break;
        case "done":
          if (frame.full !== undefined && frame.metrics) {
            handlers.onDone?.(frame.full, frame.metrics);
          }
          break;
        case "error":
          handlers.onError?.(
            new Error(frame.message ?? "WS error"),
            frame.partial ?? "",
          );
          break;
        case "open":
        case "close":
          break;
      }
    },
  };

  await runProducer(
    {
      prompt: args.prompt,
      model: args.model,
      failureMode: args.failureMode,
      signal: args.signal,
      speed: args.speed,
      seed: args.seed,
    },
    channel,
  );
}

