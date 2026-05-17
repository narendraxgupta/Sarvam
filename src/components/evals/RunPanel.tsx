import { motion, AnimatePresence } from "framer-motion";
import { Play, Square, Clock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { MODELS } from "@/data/models";
import type { EvalRun, EvalSuite } from "@/types/evals";
import type { ModelId } from "@/types";
import { cn } from "@/lib/utils";

interface Props {
  suite: EvalSuite;
  models: ModelId[];
  toggleModel: (m: ModelId) => void;
  activeRun: EvalRun | null;
  onStart: () => void;
  onCancel: () => void;
  lastRunAt?: number;
}

export function RunPanel({
  suite,
  models,
  toggleModel,
  activeRun,
  onStart,
  onCancel,
  lastRunAt,
}: Props) {
  const running = activeRun !== null && activeRun.progress < 1;
  const totalPairs = suite.cases.length * models.length;
  const completedPairs = activeRun
    ? Math.round(activeRun.progress * totalPairs)
    : 0;

  return (
    <section className="hx-surface p-5">
      <div className="flex items-start justify-between mb-4 gap-4">
        <div className="min-w-0">
          <div className="hx-eyebrow text-accent">Run configuration</div>
          <div className="mt-1 text-[14px] text-ink font-medium truncate">
            {suite.name}
          </div>
          <div className="text-[12px] text-ink-subtle flex items-center gap-2 mt-0.5">
            <Clock className="h-3 w-3" />
            {lastRunAt
              ? `Last run · ${new Date(lastRunAt).toLocaleTimeString()}`
              : "No previous run for this suite"}
          </div>
        </div>
        {running ? (
          <Button
            variant="danger"
            size="md"
            className="gap-1.5"
            onClick={onCancel}
          >
            <Square className="h-3.5 w-3.5" />
            Cancel run
          </Button>
        ) : (
          <Button
            variant="accent"
            size="md"
            disabled={models.length === 0}
            onClick={onStart}
            className="gap-1.5"
          >
            <Play className="h-3.5 w-3.5" />
            Run suite
          </Button>
        )}
      </div>

      <div className="hx-eyebrow mb-2.5 text-ink-subtle">Evaluate models</div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-4">
        {MODELS.map((m) => {
          const on = models.includes(m.id);
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => toggleModel(m.id)}
              disabled={running}
              className={cn(
                "text-left rounded-md border px-3 py-2.5 transition-all",
                on
                  ? "border-accent/30 bg-accent/[0.04] text-ink"
                  : "border-line/10 text-ink-muted hover:text-ink hover:border-line/20",
                running && "opacity-50 cursor-not-allowed",
              )}
            >
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[12.5px] font-medium">{m.name}</span>
                <span
                  className={cn(
                    "h-2 w-2 rounded-full",
                    on ? "bg-accent shadow-[0_0_6px_rgb(var(--accent))]" : "bg-ink/15",
                  )}
                />
              </div>
              <div className="text-[10px] font-mono text-ink-subtle truncate">
                {m.parameters} · {m.modalities.join(" + ")}
              </div>
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {running && (
          <motion.div
            key="progress"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="hx-eyebrow mb-2 text-accent">In progress</div>
            <div className="flex items-center gap-3 text-[12.5px] text-ink-muted mb-2">
              <span className="font-mono tabular-nums">
                {completedPairs} / {totalPairs}
              </span>
              <span className="text-ink-subtle">
                ({Math.round(activeRun!.progress * 100)}%)
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-line/30 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-accent to-accent-strong"
                animate={{ width: `${activeRun!.progress * 100}%` }}
                transition={{ duration: 0.25 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
