import { useEffect } from "react";
import { readShareState, clearShareState } from "@/lib/share/url";
import { usePlaygroundStore } from "@/store/playgroundStore";
import { useDiffStore } from "@/store/diffStore";
import { toast } from "@/lib/toast";
import { MODELS } from "@/data/models";
import type { ModelId } from "@/types";

interface PlaygroundShare {
  v: 1;
  prompt: string;
  model: ModelId;
  temperature: number;
  maxTokens: number;
  kind?: undefined;
}

interface DiffShare {
  v: 1;
  kind: "diff";
  prompt: string;
  outputA: string;
  outputB: string;
  modelA: ModelId;
  modelB: ModelId;
}

type Share = PlaygroundShare | DiffShare;

const VALID_MODELS = new Set(MODELS.map((m) => m.id));

const isString = (v: unknown): v is string => typeof v === "string";
const isModelId = (v: unknown): v is ModelId =>
  typeof v === "string" && VALID_MODELS.has(v as ModelId);
const clamp = (n: unknown, lo: number, hi: number, fallback: number): number => {
  const x = typeof n === "number" && Number.isFinite(n) ? n : fallback;
  return Math.min(hi, Math.max(lo, x));
};

function validate(raw: unknown): Share | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (r.v !== 1) return null;
  if (r.kind === "diff") {
    if (!isString(r.prompt) || !isString(r.outputA) || !isString(r.outputB)) {
      return null;
    }
    if (!isModelId(r.modelA) || !isModelId(r.modelB)) return null;
    return {
      v: 1,
      kind: "diff",
      prompt: r.prompt.slice(0, 16_000),
      outputA: r.outputA.slice(0, 64_000),
      outputB: r.outputB.slice(0, 64_000),
      modelA: r.modelA,
      modelB: r.modelB,
    };
  }
  if (r.kind !== undefined) return null;
  if (!isString(r.prompt) || !isModelId(r.model)) return null;
  return {
    v: 1,
    prompt: r.prompt.slice(0, 16_000),
    model: r.model,
    temperature: clamp(r.temperature, 0, 2, 0.4),
    maxTokens: clamp(r.maxTokens, 16, 32_768, 1024),
  };
}

export function useApplyShareState() {
  useEffect(() => {
    const raw = readShareState<unknown>();
    const shared = validate(raw);
    if (!shared) {

      if (raw) {
        toast.warn(
          "Ignored shared link",
          "The URL state was malformed or referenced an unknown model.",
        );
        clearShareState();
      }
      return;
    }

    let cancelled = false;

    const apply = () => {
      if (cancelled) return;
      if (shared.kind === "diff") {
        const diff = useDiffStore.getState();
        diff.setPrompt(shared.prompt);
        diff.setOutputA(shared.outputA);
        diff.setOutputB(shared.outputB);
        diff.setModelA(shared.modelA);
        diff.setModelB(shared.modelB);
        toast.info(
          "Loaded shared diff",
          "Two outputs and models applied from the link.",
        );
      } else {
        const pg = usePlaygroundStore.getState();
        pg.setPrompt(shared.prompt);
        pg.setModel(shared.model);
        pg.setTemperature(shared.temperature);
        pg.setMaxTokens(shared.maxTokens);
        toast.info(
          "Loaded shared prompt",
          "Prompt and settings applied from the link.",
        );
      }
      clearShareState();
    };

    if (shared.kind === "diff") {
      apply();
      return;
    }

    if (usePlaygroundStore.persist.hasHydrated()) {
      apply();
      return;
    }

    const unsub = usePlaygroundStore.persist.onFinishHydration(() => {
      apply();
    });
    return () => {
      cancelled = true;
      unsub?.();
    };
  }, []);
}
