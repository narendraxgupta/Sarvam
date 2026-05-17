import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { safeStorage } from "@/lib/persist/storage";
import { EVAL_SUITES, getSuite } from "@/data/evalSuites";
import { computeDiff } from "@/lib/diff";
import { uid } from "@/lib/utils";
import type { ModelId } from "@/types";
import type {
  CaseStatus,
  EvalCase,
  EvalCaseResult,
  EvalRun,
  EvalSuite,
} from "@/types/evals";

interface EvalsState {
  suites: EvalSuite[];
  selectedSuiteId: string;
  models: ModelId[];
  activeRun: EvalRun | null;
  history: EvalRun[];
  selectedCaseId: string | null;
  setSelectedSuite: (id: string) => void;
  setModels: (models: ModelId[]) => void;
  toggleModel: (m: ModelId) => void;
  setSelectedCase: (id: string | null) => void;
  startRun: () => void;
  cancelRun: () => void;
}

function resultKey(caseId: string, model: ModelId) {
  return `${caseId}:${model}`;
}

let activeTickHandle: number | null = null;

function hashedRand(...parts: string[]): number {
  let h = 2166136261;
  for (const p of parts) {
    for (let i = 0; i < p.length; i++) {
      h ^= p.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
  }
  // Coerce to unsigned and normalise into [0, 1).
  return ((h >>> 0) % 1_000_000) / 1_000_000;
}

function syntheticActual(c: EvalCase, model: ModelId, runId: string): string {
  const expected = c.expected;
  const r = hashedRand(c.id, model, runId);
  switch (model) {
    case "helix-m":
      if (r < 0.75) return expected;
      return expected.replace(/^/, "Answer: ");
    case "helix-1":
      if (r < 0.55) return expected;
      return expected
        .replace(/\bGabriel García Márquez\b/i, "Gabriel Garcia Marquez")
        .replace(/206 bones/, "around 206")
        .replace(/299,792,458 m\/s/, "≈ 3 × 10⁸ m/s");
    case "echo-v2":
      if (r < 0.4) return expected;
      return expected
        .replace(/Berlin Wall/g, "berlin wall")
        .replace(/Gabriel García Márquez/i, "gabriel garcia marquez");
    case "lyra-translate":
      if (c.tags?.includes("python") || c.tags?.includes("typescript")) {
        return "// (Lyra is a translation model — code tasks are out of scope.)";
      }
      return expected;
    default:
      return expected;
  }
}

function scoreOutput(expected: string, actual: string): {
  score: number;
  status: CaseStatus;
} {
  const r = computeDiff(expected, actual);
  const longer = Math.max(r.a.length, r.b.length, 1);
  const similarity = 1 - r.d / longer;
  const clamped = Math.max(0, Math.min(1, similarity));
  return {
    score: clamped,
    status: clamped >= 0.78 ? "pass" : "fail",
  };
}

export const useEvalsStore = create<EvalsState>()(
  persist(
    (set, get) => ({
      suites: EVAL_SUITES,
      selectedSuiteId: EVAL_SUITES[0].id,
      models: ["helix-m", "helix-1"],
      activeRun: null,
      history: [],
      selectedCaseId: null,
      setSelectedSuite: (selectedSuiteId) =>
        set({ selectedSuiteId, selectedCaseId: null }),
      setModels: (models) => set({ models }),
      toggleModel: (m) =>
        set((s) => ({
          models: s.models.includes(m)
            ? s.models.filter((x) => x !== m)
            : [...s.models, m],
        })),
      setSelectedCase: (selectedCaseId) => set({ selectedCaseId }),
      startRun: () => {
        const { selectedSuiteId, models } = get();
        const suite = getSuite(selectedSuiteId);
        if (!suite || models.length === 0) return;

        if (activeTickHandle !== null) {
          window.clearInterval(activeTickHandle);
          activeTickHandle = null;
        }

        const runId = uid();
        const startedAt = Date.now();
        const initialResults: Record<string, EvalCaseResult> = {};
        for (const c of suite.cases) {
          for (const m of models) {
            initialResults[resultKey(c.id, m)] = {
              caseId: c.id,
              model: m,
              status: "pending",
              score: 0,
              actual: "",
              latencyMs: 0,
            };
          }
        }
        const run: EvalRun = {
          id: runId,
          suiteId: selectedSuiteId,
          models: [...models],
          startedAt,
          finishedAt: null,
          results: initialResults,
          progress: 0,
        };
        set({ activeRun: run });

        const pairs: Array<{ caseId: string; model: ModelId }> = [];
        for (const c of suite.cases) {
          for (const m of models) pairs.push({ caseId: c.id, model: m });
        }
        let i = 0;
        const tick = window.setInterval(() => {
          const current = get().activeRun;
          if (!current || current.id !== runId) {
            window.clearInterval(tick);
            if (activeTickHandle === tick) activeTickHandle = null;
            return;
          }
          if (i >= pairs.length) {
            window.clearInterval(tick);
            if (activeTickHandle === tick) activeTickHandle = null;
            const finished: EvalRun = {
              ...current,
              progress: 1,
              finishedAt: Date.now(),
            };
            set((s) => ({
              activeRun: null,
              history: [
                finished,
                ...s.history.filter((h) => h.suiteId !== finished.suiteId).slice(0, 5),
              ],
            }));
            return;
          }
          const pair = pairs[i];
          if (!pair) return;
          const c = suite.cases.find((x) => x.id === pair.caseId);
          if (!c) {
            i++;
            return;
          }
          const actual = syntheticActual(c, pair.model, runId);
          const scored = scoreOutput(c.expected, actual);
          const result: EvalCaseResult = {
            caseId: pair.caseId,
            model: pair.model,
            status: scored.status,
            score: scored.score,
            actual,
            latencyMs: 120 + Math.floor(hashedRand(pair.caseId, pair.model, runId, "latency") * 380),
          };
          i++;
          set((s) => {
            if (!s.activeRun || s.activeRun.id !== runId) return s;
            const nextResults = {
              ...s.activeRun.results,
              [resultKey(pair.caseId, pair.model)]: result,
            };
            return {
              activeRun: {
                ...s.activeRun,
                results: nextResults,
                progress: i / pairs.length,
              },
            };
          });
        }, 220);
        activeTickHandle = tick;
      },
      cancelRun: () => {
        if (activeTickHandle !== null) {
          window.clearInterval(activeTickHandle);
          activeTickHandle = null;
        }
        set({ activeRun: null });
      },
    }),
    {
      name: "hx-evals",
      storage: createJSONStorage(() => safeStorage),
      partialize: (s) => ({
        selectedSuiteId: s.selectedSuiteId,
        models: s.models,
        history: s.history.slice(0, 5),
      }),
    },
  ),
);

export { resultKey };
