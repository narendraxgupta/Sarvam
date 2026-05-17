import type {
  FailureMode,
  ModelId,
  StreamEvent,
  StreamMetrics,
  StreamPhase,
} from "@/types";
import { mockStream } from "./mockStream";
import { SseParser } from "./parseSSE";

export interface RunStreamHandlers {
  onPhase?: (phase: StreamPhase) => void;
  onToken?: (token: string, fullOutput: string) => void;
  onMetrics?: (metrics: StreamMetrics) => void;
  onEvent?: (event: StreamEvent) => void;
  onError?: (error: Error, partialOutput: string) => void;
  onDone?: (finalOutput: string, metrics: StreamMetrics) => void;
}

export interface RunStreamArgs {
  prompt: string;
  model: ModelId;
  failureMode: FailureMode;
  signal: AbortSignal;
  handlers: RunStreamHandlers;
  speed?: number;
  seed?: number;
}

export async function runStream({
  prompt,
  model,
  failureMode,
  signal,
  handlers,
  speed = 1,
  seed,
}: RunStreamArgs): Promise<void> {
  const events: StreamEvent[] = [];
  const t0 = performance.now();
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
    events.push(e);
    handlers.onEvent?.(e);
  };

  const setPhase = (p: StreamPhase) => handlers.onPhase?.(p);

  let output = "";
  let tokens = 0;
  let bytesIn = 0;
  let firstByteT: number | null = null;

  // EMA over a 500ms window for tokens/sec.
  let tpsEma = 0;
  let lastTickT = t0;
  let tokensSinceTick = 0;

  const metrics = (): StreamMetrics => {
    const now = performance.now();
    const durationMs = now - t0;
    const effectiveTps =
      tpsEma > 0 ? tpsEma : tokens > 0 && durationMs > 0 ? (tokens / durationMs) * 1000 : 0;
    // Don't surface a "critical" verdict until we have a real sample, otherwise

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

  const tickMetrics = () => {
    const now = performance.now();
    const dt = now - lastTickT;
    if (dt >= 250) {
      const instTps = (tokensSinceTick / dt) * 1000;
      // EMA, alpha=0.35 for responsive but smooth feel.
      tpsEma = tpsEma === 0 ? instTps : tpsEma * 0.65 + instTps * 0.35;
      tokensSinceTick = 0;
      lastTickT = now;
      handlers.onMetrics?.(metrics());
    }
  };

  setPhase("connecting");
  log("connect", `Opening stream to ${model}`);

  let res: Response;
  try {
    res = await mockStream({
      prompt,
      model,
      failureMode,
      signal,
      speed,
      seed,
    });
  } catch (err) {
    const e = err as Error;
    if (e.name === "AbortError") {
      setPhase("aborted");
      log("abort", "Connection aborted by user");
      return;
    }
    log("error", `Connect failed: ${e.message}`);
    setPhase("partial-error");
    handlers.onError?.(e, output);
    return;
  }

  if (!res.ok || !res.body) {
    const e = new Error(`HTTP ${res.status}`);
    log("error", e.message);
    setPhase("partial-error");
    handlers.onError?.(e, output);
    return;
  }

  log("connect", `Connected · ${res.status} ${res.statusText || "OK"}`, {
    model,
  });
  setPhase("streaming");

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  const parser = new SseParser();

  try {
    for (;;) {
      if (signal.aborted) throw new DOMException("Aborted", "AbortError");
      const { value, done } = await reader.read();
      if (done) break;
      if (value) {
        bytesIn += value.byteLength;
        if (firstByteT === null) {
          firstByteT = performance.now() - t0;
          log("first-byte", `First byte in ${firstByteT.toFixed(0)}ms`);
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
          handlers.onToken?.(f.data, output);
        }
        tickMetrics();
        if (payloadFrames > 0) {
          log(
            "chunk",
            `+${payloadFrames} token${payloadFrames === 1 ? "" : "s"}`,
            { totalTokens: tokens },
          );
        }
      }
    }

    const tail = decoder.decode();
    if (tail) {
      for (const f of parser.feed(tail)) {
        if (f.data === "[DONE]") continue;
        tokens += 1;
        tokensSinceTick += 1;
        output += f.data;
        handlers.onToken?.(f.data, output);
      }
    }

    for (const f of parser.flush()) {
      if (f.data === "[DONE]") continue;
      tokens += 1;
      tokensSinceTick += 1;
      output += f.data;
      handlers.onToken?.(f.data, output);
    }
    log("close", `Stream closed cleanly · ${tokens} tokens`);
    setPhase("done");
    handlers.onMetrics?.(metrics());
    handlers.onDone?.(output, metrics());
  } catch (err) {
    const e = err as Error;
    if (e.name === "AbortError") {
      setPhase("aborted");
      log("abort", `Stream aborted · ${tokens} partial tokens preserved`);
      handlers.onMetrics?.(metrics());
      try {
        await reader.cancel("aborted");
      } catch {
      }
      return;
    }
    log("error", e.message, { partialTokens: tokens });
    setPhase("partial-error");
    handlers.onError?.(e, output);
    handlers.onMetrics?.(metrics());
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
