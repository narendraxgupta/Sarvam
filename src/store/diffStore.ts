import { create } from "zustand";
import { DIFF_SAMPLE } from "@/data/samplePrompts";
import { computeDiff } from "@/lib/diff";
import type { DiffResult, ModelId } from "@/types";

export type DiffFilter = "all" | "ins" | "del" | "rep";

interface DiffState {
  prompt: string;
  outputA: string;
  outputB: string;
  modelA: ModelId;
  modelB: ModelId;
  filter: DiffFilter;
  onlyChanges: boolean;
  currentChange: number;
  result: DiffResult;
  setOutputA: (s: string) => void;
  setOutputB: (s: string) => void;
  setPrompt: (s: string) => void;
  setModelA: (m: ModelId) => void;
  setModelB: (m: ModelId) => void;
  setFilter: (f: DiffFilter) => void;
  setOnlyChanges: (v: boolean) => void;
  swap: () => void;
  setCurrentChange: (i: number) => void;
  nextChange: () => void;
  prevChange: () => void;
  recompute: () => void;
  loadSample: () => void;
}

function recomputeFn(a: string, b: string): DiffResult {
  return computeDiff(a, b);
}

function clampChange(next: number, count: number): number {
  if (count <= 0) return 0;
  return Math.max(0, Math.min(next, count - 1));
}

export const useDiffStore = create<DiffState>()((set, get) => ({
  prompt: DIFF_SAMPLE.prompt,
  outputA: DIFF_SAMPLE.outputA,
  outputB: DIFF_SAMPLE.outputB,
  modelA: "helix-1",
  modelB: "helix-m",
  filter: "all",
  onlyChanges: false,
  currentChange: 0,
  result: recomputeFn(DIFF_SAMPLE.outputA, DIFF_SAMPLE.outputB),
  setPrompt: (prompt) => set({ prompt }),
  setOutputA: (outputA) =>
    set({ outputA, result: recomputeFn(outputA, get().outputB), currentChange: 0 }),
  setOutputB: (outputB) =>
    set({ outputB, result: recomputeFn(get().outputA, outputB), currentChange: 0 }),
  setModelA: (modelA) => set({ modelA }),
  setModelB: (modelB) => set({ modelB }),
  setFilter: (filter) => set({ filter, currentChange: 0 }),
  setOnlyChanges: (onlyChanges) => set({ onlyChanges }),
  swap: () => {
    const { outputA, outputB, modelA, modelB } = get();
    set({
      outputA: outputB,
      outputB: outputA,
      modelA: modelB,
      modelB: modelA,
      result: recomputeFn(outputB, outputA),
      currentChange: 0,
    });
  },
  setCurrentChange: (currentChange) =>
    set((s) => ({
      currentChange: clampChange(currentChange, s.result.changeCount),
    })),
  nextChange: () =>
    set((s) => ({
      currentChange: clampChange(s.currentChange + 1, s.result.changeCount),
    })),
  prevChange: () =>
    set((s) => ({
      currentChange: clampChange(s.currentChange - 1, s.result.changeCount),
    })),
  recompute: () =>
    set((s) => ({ result: recomputeFn(s.outputA, s.outputB) })),
  loadSample: () => {
    set({
      prompt: DIFF_SAMPLE.prompt,
      outputA: DIFF_SAMPLE.outputA,
      outputB: DIFF_SAMPLE.outputB,
      result: recomputeFn(DIFF_SAMPLE.outputA, DIFF_SAMPLE.outputB),
      currentChange: 0,
    });
  },
}));
