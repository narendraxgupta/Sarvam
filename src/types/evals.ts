import type { ModelId } from "@/types";

export type EvalCategory = "factuality" | "code" | "safety";

export interface EvalCase {
  id: string;
  prompt: string;
  expected: string;
  rubric?: string;
  tags?: string[];
}

export interface EvalSuite {
  id: string;
  name: string;
  category: EvalCategory;
  description: string;
  cases: EvalCase[];
}

export type CaseStatus = "pending" | "running" | "pass" | "fail";

export interface EvalCaseResult {
  caseId: string;
  model: ModelId;
  status: CaseStatus;
  score: number;
  actual: string;
  latencyMs: number;
}

export interface EvalRun {
  id: string;
  suiteId: string;
  models: ModelId[];
  startedAt: number;
  finishedAt: number | null;
  results: Record<string, EvalCaseResult>;
  progress: number;
}
