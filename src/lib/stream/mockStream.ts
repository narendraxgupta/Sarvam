import { pickResponse } from "@/data/corpora";
import type { FailureMode, ModelId } from "@/types";

interface MockStreamOptions {
  prompt: string;
  model: ModelId;
  failureMode?: FailureMode;
  signal?: AbortSignal;
  speed?: number;
  seed?: number;
}

const enc = new TextEncoder();

export async function mockStream({
  prompt,
  model: _model,
  failureMode = "none",
  signal,
  speed = 1,
  seed,
}: MockStreamOptions): Promise<Response> {
  const fullText = pickResponse(prompt);
  const tokens = tokenizeForStream(fullText);
  const rng = mulberry32(seed ?? (Math.random() * 1e9) | 0);

  if (failureMode === "network-drop") {
    await wait(150 + rng() * 200, signal);
    throw new TypeError("Failed to fetch");
  }

  if (failureMode === "timeout") {
    await wait(15000, signal);
    throw new DOMException("timeout", "TimeoutError");
  }

  let i = 0;
  const stream = new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        if (signal?.aborted) {
          controller.error(new DOMException("Aborted", "AbortError"));
          return;
        }

        if (i >= tokens.length) {
          controller.enqueue(enc.encode("data: [DONE]\n\n"));
          controller.close();
          return;
        }

        const tok = tokens[i];
        const baseDelay = baseDelayMs(tok, rng);
        const delay =
          (failureMode === "slow-token" ? baseDelay * 3 : baseDelay) * speed;
        await wait(delay, signal);

        if (
          failureMode === "malformed-chunk" &&
          i === Math.floor(tokens.length * 0.3)
        ) {
          controller.enqueue(enc.encode("not-a-valid-frame\n\n"));
          // Continue normally — consumer should ignore unknown frames.
        }

        // Mid-stream 500: error out around 40% progress.
        if (
          failureMode === "mid-stream-500" &&
          i === Math.floor(tokens.length * 0.4)
        ) {
          controller.error(
            new Error("HTTP 500 — upstream model server crashed"),
          );
          return;
        }

        const frame = `data: ${escapeSse(tok)}\n\n`;
        controller.enqueue(enc.encode(frame));
        i++;
      } catch (e) {
        controller.error(e);
      }
    },
    cancel() {
      // Mark the stream as drained so the next pull() short-circuits cleanly.
      i = tokens.length;
    },
  });

  // Simulate connection-setup latency.
  await wait(80 + rng() * 70, signal);

  return new Response(stream, {
    status: 200,
    headers: {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-cache",
      connection: "keep-alive",
    },
  });
}

function tokenizeForStream(text: string): string[] {
  const out: string[] = [];
  const matcher = /(\s+\S+|\S+|\s+)/g;
  let m: RegExpExecArray | null;
  while ((m = matcher.exec(text)) !== null) {
    const piece = m[0];
    if (piece.length <= 6 || /^\s+$/.test(piece)) {
      out.push(piece);
    } else {
      // BPE-like sub-split for the demo.
      for (let i = 0; i < piece.length; i += 4) {
        out.push(piece.slice(i, i + 4));
      }
    }
  }
  return out;
}

function baseDelayMs(tok: string, rng: () => number): number {
  // Sentence-end pauses feel realistic.
  if (/[.!?]\s*$/.test(tok)) return 90 + rng() * 80;
  if (/[,;:]\s*$/.test(tok)) return 50 + rng() * 40;
  if (/\n/.test(tok)) return 60 + rng() * 50;
  return 18 + rng() * 42;
}

function escapeSse(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/\r\n/g, "\\n")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r");
}

export function unescapeSse(s: string): string {
  let out = "";
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === "\\" && i + 1 < s.length) {
      const n = s[i + 1];
      if (n === "n") {
        out += "\n";
        i++;
        continue;
      }
      if (n === "r") {
        out += "\r";
        i++;
        continue;
      }
      if (n === "\\") {
        out += "\\";
        i++;
        continue;
      }
    }
    out += c;
  }
  return out;
}

function wait(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }
    const id = setTimeout(resolve, Math.max(0, ms));
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(id);
        reject(new DOMException("Aborted", "AbortError"));
      },
      { once: true },
    );
  });
}

function mulberry32(a: number): () => number {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
