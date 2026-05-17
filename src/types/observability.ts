import type { ModelId } from "@/types";

export interface LatencySample {

  t: number;
  p50: number;
  p95: number;
  p99: number;
  rps: number;
}

export type RequestStatus = "ok" | "client-error" | "server-error" | "timeout";

export interface ObservabilityRequest {
  id: string;
  startedAt: number;
  model: ModelId;
  endpoint: "/v1/inference" | "/v1/embeddings" | "/v1/chat";
  status: RequestStatus;
  latencyMs: number;
  ttftMs: number;
  tokens: number;
  region: string;
  error?: string;
  events: {
    t: number;
    kind: "connect" | "first-byte" | "chunk" | "retry" | "warn" | "error" | "close";
    message: string;
  }[];
}

export interface HistogramBucket {

  lower: number;
  upper: number;
  count: number;
}
