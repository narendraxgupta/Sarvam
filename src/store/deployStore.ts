import { create } from "zustand";
import { MODELS } from "@/data/models";
import type { Deployment, Environment, ModelId } from "@/types";
import { uid } from "@/lib/utils";

interface DeployState {
  env: Environment;
  selectedModel: ModelId;
  canaryPct: number;
  deployments: Deployment[];
  setEnv: (e: Environment) => void;
  setSelectedModel: (m: ModelId) => void;
  setCanaryPct: (n: number) => void;
  promoteCanary: () => void;
  rollback: () => void;
  deploy: () => void;
}

const seed: Deployment[] = [
  {
    id: uid(),
    modelId: "helix-m",
    version: "v2026.05.16-c3a4f0",
    env: "prod",
    status: "healthy",
    canaryPct: 100,
    region: "us-east-1",
    createdAt: Date.now() - 1000 * 60 * 38,
    durationMs: 132_000,
    author: "alex@helix.ai",
  },
  {
    id: uid(),
    modelId: "echo-v2",
    version: "v2026.05.16-9b21de",
    env: "staging",
    status: "rolling-out",
    canaryPct: 25,
    region: "eu-west-1",
    createdAt: Date.now() - 1000 * 60 * 6,
    author: "priya@helix.ai",
  },
  {
    id: uid(),
    modelId: "lyra-translate",
    version: "v2026.05.15-7a02ff",
    env: "prod",
    status: "healthy",
    canaryPct: 100,
    region: "sa-east-1",
    createdAt: Date.now() - 1000 * 60 * 60 * 6,
    durationMs: 184_000,
    author: "marcus@helix.ai",
  },
  {
    id: uid(),
    modelId: "helix-1",
    version: "v2026.05.14-4f1c88",
    env: "dev",
    status: "failed",
    canaryPct: 0,
    region: "ap-northeast-1",
    createdAt: Date.now() - 1000 * 60 * 60 * 18,
    durationMs: 41_000,
    author: "ci-bot@helix.ai",
  },
];

const ROTATING_REGIONS = [
  "us-east-1",
  "eu-west-1",
  "sa-east-1",
  "ap-northeast-1",
] as const;

export const useDeployStore = create<DeployState>()((set, get) => ({
  env: "prod",
  selectedModel: "helix-m",
  canaryPct: 25,
  deployments: seed,
  setEnv: (env) => set({ env }),
  setSelectedModel: (selectedModel) => set({ selectedModel }),
  setCanaryPct: (canaryPct) => set({ canaryPct }),
  promoteCanary: () => {
    const next: Deployment = {
      id: uid(),
      modelId: get().selectedModel,
      version: `v2026.05.16-${uid().slice(0, 6)}`,
      env: get().env,
      status: "queued",
      canaryPct: 100,
      region:
        ROTATING_REGIONS[Math.floor(Math.random() * ROTATING_REGIONS.length)],
      createdAt: Date.now(),
      author: "you@helix.ai",
    };
    set({ deployments: [next, ...get().deployments].slice(0, 30) });
    advance(next.id, "building", 500, set);
    advance(next.id, "rolling-out", 1800, set);
    advance(next.id, "healthy", 3400, set);
  },
  rollback: () => {
    const prev = get().deployments.find(
      (d) => d.modelId === get().selectedModel && d.status === "healthy",
    );
    if (!prev) return;
    const next: Deployment = {
      ...prev,
      id: uid(),
      version: prev.version + "-rb",
      createdAt: Date.now(),
      status: "rolling-out",
      author: "you@helix.ai (rollback)",
    };
    set({ deployments: [next, ...get().deployments] });
    advance(next.id, "healthy", 1500, set);
  },
  deploy: () => {
    const next: Deployment = {
      id: uid(),
      modelId: get().selectedModel,
      version: `v2026.05.16-${uid().slice(0, 6)}`,
      env: get().env,
      status: "queued",
      canaryPct: get().canaryPct,
      region: "us-east-1",
      createdAt: Date.now(),
      author: "you@helix.ai",
    };
    set({ deployments: [next, ...get().deployments].slice(0, 30) });
    advance(next.id, "building", 600, set);
    advance(next.id, "rolling-out", 1900, set);
    advance(next.id, "healthy", 3600, set);
  },
}));

function advance(
  id: string,
  status: Deployment["status"],
  delay: number,
  set: (fn: (s: DeployState) => Partial<DeployState>) => void,
) {
  setTimeout(() => {
    set((s) => ({
      deployments: s.deployments.map((d) =>
        d.id === id
          ? { ...d, status, durationMs: Date.now() - d.createdAt }
          : d,
      ),
    }));
  }, delay);
}

export function getModelById(id: ModelId) {
  return MODELS.find((m) => m.id === id) ?? MODELS[0];
}
