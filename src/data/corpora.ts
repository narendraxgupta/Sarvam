export interface CorpusEntry {
  match: RegExp;
  response: string;
}

export const CORPORA: CorpusEntry[] = [
  {
    match: /useTokenStream|streaming.*hook|streaming.*react/i,
    response: `Here's a production-ready, fully-typed streaming hook:

\`\`\`typescript
import { useCallback, useEffect, useRef, useState } from "react";

type Phase = "idle" | "streaming" | "done" | "error" | "aborted";

interface UseTokenStreamResult {
  tokens: string;
  tokensPerSec: number;
  phase: Phase;
  abort: () => void;
  run: (url: string, body: unknown) => Promise<void>;
}

export function useTokenStream(): UseTokenStreamResult {
  const [tokens, setTokens] = useState("");
  const [tokensPerSec, setTPS] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");
  const abortRef = useRef<AbortController | null>(null);
  const startRef = useRef<number>(0);
  const countRef = useRef<number>(0);

  const abort = useCallback(() => {
    abortRef.current?.abort();
    setPhase("aborted");
  }, []);

  const run = useCallback(async (url: string, body: unknown) => {
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    setTokens("");
    setTPS(0);
    setPhase("streaming");
    startRef.current = performance.now();
    countRef.current = 0;

    try {
      const res = await fetch(url, {
        method: "POST",
        body: JSON.stringify(body),
        headers: { "Content-Type": "application/json" },
        signal: ac.signal,
      });
      if (!res.ok || !res.body) throw new Error(\`HTTP \${res.status}\`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\\n\\n");
        buffer = parts.pop() ?? "";
        for (const part of parts) {
          if (!part.startsWith("data: ")) continue;
          const token = part.slice(6);
          countRef.current += 1;
          const elapsed = (performance.now() - startRef.current) / 1000;
          setTokens((t) => t + token);
          setTPS(countRef.current / Math.max(elapsed, 0.001));
        }
      }
      setPhase("done");
    } catch (err) {
      if ((err as Error).name !== "AbortError") setPhase("error");
    }
  }, []);

  useEffect(() => () => abortRef.current?.abort(), []);

  return { tokens, tokensPerSec, phase, abort, run };
}
\`\`\`

**Key design choices:**
- AbortController on every run prevents request leaks during fast user re-runs.
- Refs for hot counters (tokens, TPS) avoid re-renders on every byte.
- Buffer split on \`\\n\\n\` correctly handles partial SSE frames at chunk boundaries.
- Cleanup effect aborts in-flight requests on component unmount.

This is the same pattern Helix uses internally to stay responsive even under heavy concurrent inference load.`,
  },
  {
    match: /sse|server-sent events|websocket.*stream/i,
    response: `## SSE vs WebSocket for LLM token streaming

For one-way token streaming from an inference server to a browser client, **Server-Sent Events is almost always the right choice** in 2026.

### Why SSE wins for inference

1. **It's just HTTP.** SSE rides on a vanilla HTTP/2 response. Every corporate proxy, CDN, and load balancer already knows how to handle it. No \`Upgrade\` handshakes, no protocol-specific edge config, no WAF surprises.

2. **Automatic reconnection.** The browser \`EventSource\` API reconnects on disconnect with a configurable retry header. Building the equivalent for WebSockets means writing your own reconnect/backoff/resume logic in every client SDK.

3. **HTTP/2 multiplexing.** Multiple SSE streams share a single TCP connection — critical when a page has, say, a chat stream and a separate telemetry stream open at the same time.

4. **Cleaner backpressure.** TCP flow control naturally applies. A slow client just slows the producer down. With WebSockets you typically need an explicit token-bucket on top.

### When WebSocket still wins

- You need **bidirectional** chat with mid-stream user interrupts that the server should react to immediately (rare — most "interrupts" are just an HTTP cancel + a new stream).
- Sub-frame **binary** payloads, like real-time audio capture for ASR.
- Your transport sits behind exotic infrastructure that strips long-lived HTTP responses.

### The shape Helix uses

\`\`\`
POST /v1/inference/stream HTTP/2
Accept: text/event-stream
data: { "token": "Helix", "i": 0 }
data: { "token": " streams", "i": 1 }
data: [DONE]
\`\`\`

Strict newline framing, JSON payloads, and a sentinel \`[DONE]\` marker. That's all the protocol you need for 95% of real-world LLM products.`,
  },
  {
    match: /eval.*suite|evaluation suite|llm.*eval/i,
    response: `# LLM Evaluation Suite — Design

A rigorous evaluation suite is what separates a research demo from a production system. Here is how I would scope one.

## 1. Factuality and Hallucination

**Datasets**
- *TruthfulQA* (817 questions, adversarially designed for confidently-wrong answers).
- *HaluEval* — model-generated hallucinations annotated by humans.
- An in-house *knowledge cut-off* probe that asks for events after the model's training data ends — the right answer is "I don't know".

**Metrics**
- Pass rate on TruthfulQA-MC1 (single-best).
- Faithfulness score against a retrieved evidence span (NLI-based).
- Confidence calibration: ECE across the answer distribution.

## 2. Instruction Following at Long Context

**Setup**
- 500 multi-step instructions placed at varying depths inside a 32k-token document (the "needle in a haystack" pattern, extended).
- Each instruction has a verifiable JSON-extractable answer.

**Metrics**
- Exact-match accuracy by needle position.
- Length-bias correction so verbose answers don't inflate scores.

## 3. Safety and Refusal Calibration

**Probes**
- Borderline requests where the *right* answer is a polite refusal.
- Over-refusal probes where the *right* answer is to comply.
- A jailbreak suite refreshed monthly from the public adversarial corpus.

**Metrics**
- Refusal precision and recall.
- Pre/post-RLHF regression deltas surfaced as a single dashboard number.

## 4. Code Generation

**Datasets**
- *HumanEval+* and *MBPP+* for unit-test-graded code.
- *SWE-bench Lite* for end-to-end repository-aware tasks.

**Metrics**
- pass@1 and pass@10 with bootstrap confidence intervals.
- Latency-adjusted pass: tokens-to-first-test multiplied by accuracy.

## Reporting

Every run produces a structured eval card with confidence intervals (1000-sample bootstrap). Regressions vs. the production baseline are surfaced in the deploy console **before** canary promotion. This is non-negotiable.`,
  },
  {
    match: /rag|retrieval augmented|retrieval.*pipeline/i,
    response: `# Production RAG — Pipeline Outline

A production RAG stack has more moving parts than the literature usually shows. Here is the version I would ship.

## 1. Ingestion and Chunking

- **Source connectors** for Notion, Confluence, GitHub, S3, and arbitrary PDFs.
- **Semantic chunking** (not fixed-size). Use sentence embeddings to find local topic boundaries; aim for chunks of 200–500 tokens.
- **Hierarchical metadata** on every chunk: source, author, last-modified, ACL.

## 2. Embeddings

- A 1024-dim model fine-tuned on your corpus beats a generic 3072-dim model on retrieval recall every time.
- Cache embeddings keyed by chunk hash so re-indexing is incremental.

## 3. Storage and Retrieval

- **Hybrid search**: BM25 + dense, fused with reciprocal rank fusion.
- pgvector for small footprints (<10M chunks), a dedicated vector DB for larger.
- **Recency boost** when relevance is tied — recent docs usually win.

## 4. Reranking

- A cross-encoder reranks the top-50 candidates down to the top-5.
- This single stage typically moves nDCG@5 by 8–12 points.

## 5. Prompt Construction

- A strict template with retrieved spans, source citations, and a refusal escape hatch ("Say UNKNOWN if the answer is not in the sources").
- Token budget allocated dynamically: roughly 60% retrieval, 30% conversation, 10% system.

## 6. Generation and Citation Rendering

- Stream tokens directly to the client; rebuild citations on the fly by matching emitted spans against retrieval keys.
- Render citations as inline footnotes with hover-to-preview.

## 7. Latency Budget

For sub-second TTFT end-to-end:

| Stage | Budget |
| --- | --- |
| Query embedding | 25 ms |
| Vector search | 60 ms |
| Reranking | 80 ms |
| Prompt assembly | 10 ms |
| Model TTFT | 150 ms |
| **Total TTFT** | **~325 ms** |

Hitting this consistently is mostly about colocating the vector DB with the model server and warming the reranker in advance.`,
  },
  {
    match: /release note|launch note|changelog/i,
    response: `# Release Notes — Helix v1.4

Three changes ship today across the inference and deployment surfaces.

## ⚡ 40% faster time-to-first-token

We've enabled speculative decoding by default on all flagship checkpoints. A lightweight draft model generates candidate continuations that the target model verifies in a single forward pass. In production traffic across our primary regions this reduces median TTFT from 280 ms to 168 ms — measured client-side, end-to-end.

No client changes are required. The token stream format is byte-identical to v1.3.

## 🌐 Per-region canary rollouts

The deploy console now supports staged rollouts at region granularity. You can ship a new build to a single region at 5% canary traffic, observe health for an hour, then promote globally with a single click — or roll back at any point during the rollout window.

Region health is reported live in the rollout panel with p50 latency, error rate, and a structured event log.

## 📡 Structured streaming events with retry markers

Every inference stream now emits typed events alongside the token stream:

\`\`\`json
{ "event": "first-byte", "t": 142 }
{ "event": "chunk", "t": 280, "tokens": 16 }
{ "event": "retry", "t": 1240, "reason": "upstream-degraded", "region": "eu-west-1" }
{ "event": "close", "t": 2890, "tokens": 412 }
\`\`\`

Retries are surfaced as observable events, so dashboards and SDKs can report transient instability without losing partial output.

---

Full upgrade guide and SDK changelog at \`helix.ai/docs/v1.4\`. Questions: \`support@helix.ai\`.`,
  },
  {
    match: /json schema|stream event.*schema|inference event/i,
    response: `Here is a strict JSON Schema (draft-07) for inference stream events:

\`\`\`json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://helix.ai/schemas/stream-event.json",
  "title": "StreamEvent",
  "type": "object",
  "additionalProperties": false,
  "required": ["event", "t"],
  "properties": {
    "event": {
      "type": "string",
      "enum": [
        "connect",
        "first-byte",
        "chunk",
        "retry",
        "warn",
        "error",
        "close",
        "abort"
      ]
    },
    "t": {
      "type": "integer",
      "minimum": 0,
      "description": "Milliseconds since stream start."
    },
    "tokens": {
      "type": "integer",
      "minimum": 0,
      "description": "Cumulative tokens emitted at this point."
    },
    "payload": {
      "oneOf": [
        { "$ref": "#/definitions/ChunkPayload" },
        { "$ref": "#/definitions/RetryPayload" },
        { "$ref": "#/definitions/ErrorPayload" }
      ]
    },
    "meta": {
      "type": "object",
      "description": "Extensible bag for transport-level context."
    }
  },
  "definitions": {
    "ChunkPayload": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "data": { "type": "string" },
        "logprob": { "type": "number" }
      },
      "required": ["data"]
    },
    "RetryPayload": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "reason": { "type": "string" },
        "region": { "type": "string" },
        "attempt": { "type": "integer", "minimum": 1 }
      },
      "required": ["reason"]
    },
    "ErrorPayload": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "code": { "type": "string" },
        "message": { "type": "string" },
        "retryable": { "type": "boolean" }
      },
      "required": ["code", "message"]
    }
  }
}
\`\`\`

**Notes**
- \`additionalProperties: false\` at every level forces wire-format discipline — useful when many SDKs depend on the schema.
- \`payload\` is a \`oneOf\` instead of an embedded discriminator so old clients can ignore unknown event types gracefully.
- \`meta\` is intentionally permissive: it carries trace IDs, region hints, and other transport context without each new field requiring a schema bump.`,
  },
];

const FALLBACK_RESPONSES = [
  `A modern inference platform streams responses incrementally over HTTP/2, with the first token typically arriving in under 200 milliseconds.

The pipeline is built on three principles:

**1. Backpressure-aware streaming.** The model server emits chunks at the rate the client can consume them, preventing buffer bloat on slow connections and keeping memory bounded under load.

**2. Multi-region replication.** Each region hosts warm replicas behind a region-aware load balancer. A degradation signal triggers traffic shift within 80 milliseconds, observed client-side as a single retried chunk — never a dropped session.

**3. Partial-output preservation.** If a stream terminates mid-generation, the client retains everything that arrived. We never reset the session on transient failures — that's table stakes for a production AI product.

This architecture is what makes a streaming UI feel responsive even on flaky networks.`,

  `Great question. Here is how I would think about it.

The core observation is that LLM outputs are token streams — meaning the natural unit of comparison, caching, and diffing is the **token**, not the line or the character. Once you accept that, a lot of design problems become tractable:

- Streaming becomes "render-as-you-go" instead of "wait-for-completion".
- Caching becomes prefix-based, since identical prefixes always produce identical KV-cache states.
- Diffing becomes semantically meaningful — you can highlight the single adjective a fine-tune changed.

The hardest part is honoring this everywhere. The UI, the protocol, and the storage layer all have to agree that tokens are first-class. Helix is built on that assumption from the ground up.`,

  `Here is a structured response.

## Overview
Multi-region streaming inference requires careful coordination between the load balancer, the model server, and the client SDK. The goal is *graceful degradation*: a single region failure should never produce a visible error to the user.

## Architecture
- **Edge:** TLS termination at the nearest PoP. HTTP/2 keep-alive is mandatory.
- **Region:** Each region runs an active-active fleet of model replicas behind an internal load balancer.
- **Client:** The SDK maintains a connection budget per session and migrates on failure.

## Failure modes
| Mode | Detection | Recovery |
|---|---|---|
| Region degradation | p95 latency > 3× baseline | Shift traffic to nearest healthy region |
| Replica crash | Connection reset mid-stream | Retry with exponential backoff, preserving partial output |
| Network partition | No bytes for > 5s | Reconnect, emit \`warn\` event |

This is the contract a production inference platform maintains across every model in the catalog.`,
];

export function pickResponse(prompt: string): string {
  for (const entry of CORPORA) {
    if (entry.match.test(prompt)) return entry.response;
  }
  const idx = Math.abs(hashCode(prompt)) % FALLBACK_RESPONSES.length;
  return FALLBACK_RESPONSES[idx];
}

function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return h;
}
