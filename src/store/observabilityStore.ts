import { create } from "zustand";
import { MODELS } from "@/data/models";
import { REGIONS } from "@/data/regions";
import { uid } from "@/lib/utils";
import type {
  HistogramBucket,
  LatencySample,
  ObservabilityRequest,
  RequestStatus,
} from "@/types/observability";
import type { ModelId } from "@/types";

interface ObservabilityState {

  samples: LatencySample[];
  requests: ObservabilityRequest[];
  selectedRequestId: string | null;
  running: boolean;
  totalRequests: number;
  totalErrors: number;
  start: () => void;
  stop: () => void;
  reset: () => void;
  select: (id: string | null) => void;
  filterModel: ModelId | "all";
  setFilterModel: (m: ModelId | "all") => void;
}

const MAX_SAMPLES = 60;
const MAX_REQUESTS = 200;

let interval: number | null = null;

function gauss(mean: number, stdev: number) {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return mean + stdev * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function clampPos(n: number) {
  return Math.max(1, Math.round(n));
}

function rollStatus(): RequestStatus {
  const r = Math.random();
  if (r < 0.93) return "ok";
  if (r < 0.965) return "client-error";
  if (r < 0.99) return "server-error";
  return "timeout";
}

function pickEndpoint(): ObservabilityRequest["endpoint"] {
  const r = Math.random();
  if (r < 0.7) return "/v1/inference";
  if (r < 0.9) return "/v1/chat";
  return "/v1/embeddings";
}

function generateRequest(now: number): ObservabilityRequest {
  const status = rollStatus();
  const model = MODELS[Math.floor(Math.random() * MODELS.length)].id;
  const region = REGIONS[Math.floor(Math.random() * REGIONS.length)].city;
  const baseLatency =
    status === "timeout"
      ? 12_000 + gauss(2000, 600)
      : status === "server-error"
      ? gauss(380, 90)
      : gauss(220, 60);
  const latency = clampPos(baseLatency);
  const ttft = clampPos(latency * (0.18 + Math.random() * 0.14));
  const tokens =
    status === "timeout" ? Math.floor(Math.random() * 30) : Math.floor(60 + Math.random() * 240);

  const events: ObservabilityRequest["events"] = [
    { t: 0, kind: "connect", message: "TLS handshake complete" },
    { t: ttft, kind: "first-byte", message: "first token streamed" },
  ];
  // A few chunk events
  const chunkSpace = (latency - ttft) / 4;
  for (let i = 1; i < 4; i++) {
    events.push({
      t: Math.round(ttft + i * chunkSpace),
      kind: "chunk",
      message: `chunk ${i} · ${Math.floor(tokens / 4)} tokens`,
    });
  }
  if (status === "server-error") {
    events.push({
      t: latency,
      kind: "error",
      message: "upstream 502 · helix-router",
    });
  } else if (status === "client-error") {
    events.push({
      t: latency,
      kind: "warn",
      message: "client cancelled · 499",
    });
  } else if (status === "timeout") {
    events.push({
      t: latency,
      kind: "error",
      message: "deadline exceeded · 504",
    });
  } else {
    events.push({ t: latency, kind: "close", message: "stream complete" });
  }

  return {
    id: uid(),
    startedAt: now - Math.floor(Math.random() * 2000),
    model,
    endpoint: pickEndpoint(),
    status,
    latencyMs: latency,
    ttftMs: ttft,
    tokens,
    region,
    error:
      status === "server-error"
        ? "Upstream Helix router returned 502 Bad Gateway."
        : status === "timeout"
        ? "Deadline exceeded after 12.0s waiting for upstream."
        : undefined,
    events,
  };
}

function percentile(sorted: number[], p: number): number {
  const n = sorted.length;
  if (n === 0) return 0;
  if (n === 1) return sorted[0];
  const rank = (p / 100) * (n - 1);
  const lo = Math.floor(rank);
  const hi = Math.ceil(rank);
  if (lo === hi) return sorted[lo];
  const frac = rank - lo;
  return sorted[lo] * (1 - frac) + sorted[hi] * frac;
}

function seed(): { samples: LatencySample[]; requests: ObservabilityRequest[] } {
  const now = Date.now();
  const requests: ObservabilityRequest[] = [];
  const samples: LatencySample[] = [];
  for (let i = 30; i >= 1; i--) {
    const bucketEnd = now - i * 1000;
    const burst = 4 + Math.floor(Math.random() * 6);
    const bucketLatencies: number[] = [];
    for (let k = 0; k < burst; k++) {
      const r = generateRequest(bucketEnd);
      requests.push(r);
      bucketLatencies.push(r.latencyMs);
    }
    const sorted = [...bucketLatencies].sort((a, b) => a - b);
    samples.push({
      t: bucketEnd,
      p50: percentile(sorted, 50),
      p95: percentile(sorted, 95),
      p99: percentile(sorted, 99),
      rps: burst,
    });
  }
  return { samples, requests: requests.slice(-MAX_REQUESTS) };
}

const seeded = seed();

export const useObservabilityStore = create<ObservabilityState>((set) => ({
  samples: seeded.samples,
  requests: seeded.requests,
  selectedRequestId: null,
  running: false,
  totalRequests: seeded.requests.length,
  totalErrors: seeded.requests.filter((r) => r.status !== "ok").length,
  filterModel: "all",
  setFilterModel: (filterModel) => set({ filterModel }),
  select: (id) => set({ selectedRequestId: id }),
  start: () => {
    if (interval !== null) return;
    set({ running: true });
    interval = window.setInterval(() => {
      const now = Date.now();
      const burst = 3 + Math.floor(Math.random() * 8);
      const next: ObservabilityRequest[] = [];
      const latencies: number[] = [];
      for (let k = 0; k < burst; k++) {
        const r = generateRequest(now);
        next.push(r);
        latencies.push(r.latencyMs);
      }
      const sorted = [...latencies].sort((a, b) => a - b);
      const sample: LatencySample = {
        t: now,
        p50: percentile(sorted, 50),
        p95: percentile(sorted, 95),
        p99: percentile(sorted, 99),
        rps: burst,
      };
      set((s) => {
        const requests = [...next, ...s.requests].slice(0, MAX_REQUESTS);
        const samples = [...s.samples, sample].slice(-MAX_SAMPLES);
        return {
          requests,
          samples,
          totalRequests: s.totalRequests + burst,
          totalErrors: s.totalErrors + next.filter((r) => r.status !== "ok").length,
        };
      });
    }, 1500);
  },
  stop: () => {
    if (interval !== null) {
      window.clearInterval(interval);
      interval = null;
    }
    set({ running: false });
  },
  reset: () => {
    if (interval !== null) {
      window.clearInterval(interval);
      interval = null;
    }
    const fresh = seed();
    set({
      samples: fresh.samples,
      requests: fresh.requests,
      selectedRequestId: null,
      running: false,
      totalRequests: fresh.requests.length,
      totalErrors: fresh.requests.filter((r) => r.status !== "ok").length,
    });
  },
}));

export function buildHistogram(
  latencies: number[],
  edges = [0, 100, 200, 300, 500, 800, 1200, 2000, 4000, 8000, Infinity],
): HistogramBucket[] {
  const buckets: HistogramBucket[] = [];
  for (let i = 0; i < edges.length - 1; i++) {
    buckets.push({ lower: edges[i], upper: edges[i + 1], count: 0 });
  }
  for (const lat of latencies) {
    for (let i = 0; i < buckets.length; i++) {
      if (lat >= buckets[i].lower && lat < buckets[i].upper) {
        buckets[i].count++;
        break;
      }
    }
  }
  return buckets;
}

export { percentile };

export type { ObservabilityRequest };
