export interface SamplePrompt {
  id: string;
  lang: "en" | "code" | "json" | "doc";
  langLabel: string;
  title: string;
  prompt: string;
}

export const SAMPLE_PROMPTS: SamplePrompt[] = [
  {
    id: "code-stream",
    lang: "code",
    langLabel: "TypeScript",
    title: "Generate a streaming React hook",
    prompt:
      "Write a fully-typed TypeScript React hook called `useTokenStream` that consumes a Fetch ReadableStream over Server-Sent Events and exposes `{ tokens, tokensPerSec, phase, abort }`. Include AbortController cleanup, partial-output preservation, and an exponential-backoff reconnect.",
  },
  {
    id: "explain-arch",
    lang: "doc",
    langLabel: "Architecture",
    title: "Explain SSE vs WebSocket for token streaming",
    prompt:
      "Compare Server-Sent Events and WebSockets for streaming LLM tokens from inference servers to web clients. Cover backpressure, reconnection, HTTP/2 multiplexing, proxy compatibility, and which one is right for a production AI product.",
  },
  {
    id: "eval-suite",
    lang: "en",
    langLabel: "Evaluation",
    title: "Design an LLM evaluation suite",
    prompt:
      "Design a comprehensive evaluation suite for a production LLM, covering: (1) factuality and hallucination detection, (2) instruction following at long context lengths, (3) safety and refusal calibration, (4) code generation quality. Include datasets, metrics, and failure-mode reporting.",
  },
  {
    id: "rag-design",
    lang: "doc",
    langLabel: "Systems",
    title: "Outline a production RAG pipeline",
    prompt:
      "Outline a production-grade Retrieval Augmented Generation pipeline. Cover chunking strategy, embedding model selection, vector store choice, hybrid search, reranking, prompt construction, citation rendering, and latency budgets for sub-second TTFT.",
  },
  {
    id: "release-notes",
    lang: "en",
    langLabel: "Writing",
    title: "Draft enterprise release notes",
    prompt:
      "Draft formal release notes for an enterprise inference platform that ships: (a) 40% faster time-to-first-token via speculative decoding, (b) per-region canary rollouts, (c) structured streaming events with retry markers. Tone: confident, technical, vendor-neutral.",
  },
  {
    id: "infra-spec",
    lang: "json",
    langLabel: "Schema",
    title: "Generate a JSON schema for stream events",
    prompt:
      "Produce a JSON Schema (draft-07) describing the events emitted by an LLM inference stream: `connect`, `first-byte`, `chunk`, `retry`, `warn`, `error`, `close`, `abort`. Include timing fields, payload shapes, and an extensible meta object. Use strict additionalProperties: false.",
  },
];

export const DIFF_SAMPLE = {
  prompt:
    "Summarize how a production LLM platform handles streaming inference across multiple regions and explain its failover model.",
  outputA: `The platform streams inference responses token by token over HTTPS. The model runs in two data centers. If a region goes down, requests are routed to the other region. Time to first token is usually under 250 milliseconds. The system uses keep-alive connections to reduce latency. Failover is automatic and transparent to the client.`,
  outputB: `The platform streams inference tokens incrementally over HTTP/2 with backpressure-aware framing. The model is replicated across three active-active regions behind a region-aware load balancer. When a region degrades, traffic is automatically shifted to the nearest healthy replica within 80 milliseconds. Time to first token typically lands under 180 milliseconds across primary geographies. The pipeline uses persistent HTTP/2 streams and a token buffer that paces emission to the slowest active consumer. Failover is fully automatic, observable through structured stream events, and transparent to the SDK.`,
};
