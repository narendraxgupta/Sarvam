import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { safeStorage } from "@/lib/persist/storage";
import { MODELS } from "@/data/models";
import type {
  FailureMode,
  InferenceRun,
  InputMode,
  ModelId,
  StreamEvent,
  StreamMetrics,
  StreamPhase,
} from "@/types";
import { runStream } from "@/lib/stream/runStream";
import { wsStream, type StreamTransport } from "@/lib/stream/wsStream";
import { uid } from "@/lib/utils";

interface PlaygroundState {
  // Inputs
  prompt: string;
  mode: InputMode;
  model: ModelId;
  failureMode: FailureMode;
  temperature: number;
  maxTokens: number;
  transport: StreamTransport;

  // Stream state
  phase: StreamPhase;
  output: string;
  metrics: StreamMetrics;
  events: StreamEvent[];
  error: string | null;
  diagnosticsOpen: boolean;
  historyOpen: boolean;

  // History
  history: InferenceRun[];

  // Actions
  setPrompt: (p: string) => void;
  setMode: (m: InputMode) => void;
  setModel: (m: ModelId) => void;
  setFailureMode: (f: FailureMode) => void;
  setTemperature: (t: number) => void;
  setMaxTokens: (n: number) => void;
  setTransport: (t: StreamTransport) => void;
  toggleDiagnostics: () => void;
  toggleHistory: () => void;
  clearOutput: () => void;
  loadRun: (id: string) => void;
  runInference: () => Promise<void>;
  abort: () => void;
}

let currentAbort: AbortController | null = null;
let currentRunId = 0;

const emptyMetrics: StreamMetrics = {
  tokens: 0,
  tokensPerSec: 0,
  ttft: null,
  durationMs: 0,
  retries: 0,
  bytesIn: 0,
  health: "healthy",
};

export const usePlaygroundStore = create<PlaygroundState>()(
  persist(
    (set, get) => ({
      prompt: "",
      mode: "text",
      model: "helix-m",
      failureMode: "none",
      temperature: 0.4,
      maxTokens: 1024,
      transport: "http",
      phase: "idle",
      output: "",
      metrics: emptyMetrics,
      events: [],
      error: null,
      diagnosticsOpen: true,
      historyOpen: true,
      history: [],
      setPrompt: (prompt) => set({ prompt }),
      setMode: (mode) => set({ mode }),
      setModel: (model) => set({ model }),
      setFailureMode: (failureMode) => set({ failureMode }),
      setTemperature: (temperature) => set({ temperature }),
      setMaxTokens: (maxTokens) => set({ maxTokens }),
      setTransport: (transport) => set({ transport }),
      toggleDiagnostics: () =>
        set((s) => ({ diagnosticsOpen: !s.diagnosticsOpen })),
      toggleHistory: () => set((s) => ({ historyOpen: !s.historyOpen })),
      clearOutput: () =>
        set({
          output: "",
          metrics: emptyMetrics,
          events: [],
          error: null,
          phase: "idle",
        }),
      loadRun: (id) => {
        const run = get().history.find((r) => r.id === id);
        if (!run) return;
        if (currentAbort) currentAbort.abort();
        currentAbort = null;
        currentRunId++;
        set({
          prompt: run.prompt,
          model: run.model,
          mode: run.mode,
          failureMode: run.failureMode,
          output: run.output,
          phase: run.phase,
          metrics: { ...emptyMetrics, tokens: run.tokens, durationMs: run.durationMs },
          events: [],
          error: null,
        });
      },
      abort: () => {
        currentAbort?.abort();
      },
      runInference: async () => {
        const { prompt, model, failureMode, mode, transport } = get();
        if (!prompt.trim()) return;
        if (currentAbort) currentAbort.abort();
        const ac = new AbortController();
        currentAbort = ac;
        const runId = ++currentRunId;
        const isCurrent = () => runId === currentRunId;

        const startedAt = Date.now();
        set({
          phase: "connecting",
          output: "",
          metrics: emptyMetrics,
          events: [],
          error: null,
        });

        const transportFn = transport === "ws" ? wsStream : runStream;
        await transportFn({
          prompt,
          model,
          failureMode,
          signal: ac.signal,
          handlers: {
            onPhase: (phase) => {
              if (isCurrent()) set({ phase });
            },
            onToken: (_token, fullOutput) => {
              if (isCurrent()) set({ output: fullOutput });
            },
            onMetrics: (metrics) => {
              if (isCurrent()) set({ metrics });
            },
            onEvent: (event) => {
              if (isCurrent())
                set((s) => ({ events: [...s.events, event].slice(-200) }));
            },
            onError: (err, partial) => {
              if (isCurrent()) set({ error: err.message, output: partial });
            },
            onDone: (finalOutput, metrics) => {
              if (!isCurrent()) return;
              const run: InferenceRun = {
                id: uid(),
                createdAt: startedAt,
                model,
                mode,
                prompt,
                output: finalOutput,
                durationMs: metrics.durationMs,
                tokens: metrics.tokens,
                phase: "done",
                failureMode,
              };

              set({ history: [run, ...get().history].slice(0, 25) });
            },
          },
        });
      },
    }),
    {
      name: "hx-playground",
      storage: createJSONStorage(() => safeStorage),
      partialize: (s) => ({
        history: s.history,
        prompt: s.prompt,
        model: s.model,
        mode: s.mode,
        temperature: s.temperature,
        maxTokens: s.maxTokens,
        transport: s.transport,
        diagnosticsOpen: s.diagnosticsOpen,
        historyOpen: s.historyOpen,
      }),
    },
  ),
);

export function getModelMeta(id: ModelId) {
  return MODELS.find((m) => m.id === id) ?? MODELS[0];
}
