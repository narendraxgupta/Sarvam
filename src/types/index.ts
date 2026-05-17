export type ModelId =
  | "helix-m"
  | "helix-1"
  | "echo-v2"
  | "lyra-translate";

export type Modality = "text" | "audio" | "multilingual";

export interface Model {
  id: ModelId;
  name: string;
  family: string;
  description: string;
  parameters: string;
  contextLength: number;
  modalities: Modality[];
  languages: string[];
  badge?: "new" | "preview" | "stable";
}

export type StreamPhase =
  | "idle"
  | "connecting"
  | "streaming"
  | "partial-error"
  | "done"
  | "aborted";

export type FailureMode =
  | "none"
  | "network-drop"
  | "timeout"
  | "malformed-chunk"
  | "slow-token"
  | "mid-stream-500";

export interface StreamEvent {
  t: number;
  kind:
    | "connect"
    | "first-byte"
    | "chunk"
    | "retry"
    | "warn"
    | "error"
    | "close"
    | "abort";
  message: string;
  meta?: Record<string, unknown>;
}

export interface StreamMetrics {
  tokens: number;
  tokensPerSec: number;
  ttft: number | null;
  durationMs: number;
  retries: number;
  bytesIn: number;
  health: "healthy" | "degraded" | "critical";
}

export type InputMode = "text" | "audio";

export interface InferenceRun {
  id: string;
  createdAt: number;
  model: ModelId;
  mode: InputMode;
  prompt: string;
  output: string;
  durationMs: number;
  tokens: number;
  phase: StreamPhase;
  failureMode: FailureMode;
}

export type DiffOp =
  | { kind: "eq"; tokensA: Token[]; tokensB: Token[] }
  | { kind: "ins"; tokens: Token[] }
  | { kind: "del"; tokens: Token[] }
  | { kind: "rep"; from: Token[]; to: Token[] };

export interface Token {
  text: string;
  kind: "word" | "whitespace" | "punct";
  start: number;
  end: number;
}

export interface DiffResult {
  ops: DiffOp[];
  a: Token[];
  b: Token[];
  changeCount: number;
  pairs: Array<{ aIndex: number; bIndex: number }>;
  d: number;
  ms: number;
}

export type Environment = "dev" | "staging" | "prod";

export interface Region {
  id: string;
  city: string;
  code: string;
  x: number;
  y: number;
  latencyMs: number;
  health: "healthy" | "degraded" | "down";
}

export interface Deployment {
  id: string;
  modelId: ModelId;
  version: string;
  env: Environment;
  status: "queued" | "building" | "rolling-out" | "healthy" | "failed";
  canaryPct: number;
  region: string;
  createdAt: number;
  durationMs?: number;
  author: string;
}
