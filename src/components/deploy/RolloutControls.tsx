import { useState } from "react";
import { motion } from "framer-motion";
import { Rocket, RotateCcw, Zap, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Slider } from "@/components/ui/Slider";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/Dialog";
import { useDeployStore, getModelById } from "@/store/deployStore";
import { useReducedMotion } from "@/lib/a11y/useReducedMotion";
import type { Environment } from "@/types";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/toast";

const CANARY_STOPS = [0, 5, 25, 50, 100];

export function RolloutControls() {
  const env = useDeployStore((s) => s.env);
  const setEnv = useDeployStore((s) => s.setEnv);
  const selected = useDeployStore((s) => s.selectedModel);
  const canaryPct = useDeployStore((s) => s.canaryPct);
  const setCanaryPct = useDeployStore((s) => s.setCanaryPct);
  const deploy = useDeployStore((s) => s.deploy);
  const promote = useDeployStore((s) => s.promoteCanary);
  const rollback = useDeployStore((s) => s.rollback);
  const [rollbackOpen, setRollbackOpen] = useState(false);
  const reduced = useReducedMotion();

  const model = getModelById(selected);

  return (
    <section aria-label="Rollout controls">
      <div className="flex items-center gap-2 mb-4">
        <Rocket className="h-3.5 w-3.5 text-accent" />
        <span className="text-[13px] font-semibold text-ink">Rollout</span>
      </div>

      <div className="rounded-xl border border-line/8 bg-bg-surface/50 p-4 mb-3">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div>
            <div className="text-[10px] uppercase tracking-wide text-ink-dim font-semibold mb-0.5">
              Target
            </div>
            <span className="text-[14px] font-semibold text-ink tracking-tight">
              {model.name}
            </span>
          </div>
          <Tabs value={env} onValueChange={(v) => setEnv(v as Environment)}>
            <TabsList>
              <TabsTrigger value="dev">dev</TabsTrigger>
              <TabsTrigger value="staging">stg</TabsTrigger>
              <TabsTrigger value="prod">prod</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <motion.div
        className="relative rounded-xl border border-line/8 bg-bg-surface/50 p-4 mb-3 overflow-hidden"
        whileHover={reduced ? {} : { borderColor: "rgb(var(--accent) / 0.15)" }}
        transition={{ duration: 0.2 }}
      >
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-br from-accent/[0.04] via-transparent to-accent/[0.03] pointer-events-none"
        />

        <div className="relative flex items-center justify-between mb-4">
          <div className="text-[10px] uppercase tracking-wide text-ink-dim font-semibold">
            Canary traffic
          </div>
          <div className="flex items-baseline gap-1">
            <motion.span
              key={canaryPct}
              initial={reduced ? false : { scale: 1.1 }}
              animate={{ scale: 1 }}
              className="font-mono text-[32px] font-semibold tabular-nums text-ink leading-none"
              style={{ letterSpacing: "-0.03em" }}
            >
              {canaryPct}
            </motion.span>
            <span className="font-mono text-sm text-ink-dim">%</span>
          </div>
        </div>

        <div className="relative mb-4">
          <Slider
            value={[canaryPct]}
            min={0}
            max={100}
            step={1}
            onValueChange={(v) => setCanaryPct(v[0] ?? 0)}
            aria-label="Canary traffic percentage"
          />
        </div>

        <div className="relative flex gap-1.5">
          {CANARY_STOPS.map((stop) => (
            <button
              key={stop}
              type="button"
              onClick={() => setCanaryPct(stop)}
              className={cn(
                "flex-1 h-8 rounded-lg text-[11px] font-mono tabular-nums font-semibold transition-all duration-200",
                canaryPct === stop
                  ? "bg-accent/15 text-accent border border-accent/25"
                  : "bg-bg-elevated/40 text-ink-muted border border-line/6 hover:text-ink hover:border-line/12",
              )}
            >
              {stop}%
            </button>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-3 gap-2">
        <Button
          variant="accent"
          size="md"
          onClick={() => {
            deploy();
            toast.success(
              `Deploying ${model.name}`,
              `Canary at ${canaryPct}% across ${env} fleet.`,
            );
          }}
          className="gap-1.5"
        >
          <Rocket className="h-3.5 w-3.5" />
          Deploy
        </Button>
        <Button
          variant="primary"
          size="md"
          onClick={() => {
            promote();
            toast.info(
              `Promoting ${model.name}`,
              `Canary expanding to 100% across ${env}.`,
            );
          }}
          className="gap-1.5"
        >
          <Zap className="h-3.5 w-3.5" />
          Promote
        </Button>
        <Button
          variant="outline"
          size="md"
          onClick={() => setRollbackOpen(true)}
          className="gap-1.5"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Rollback
        </Button>
      </div>

      <Dialog open={rollbackOpen} onOpenChange={setRollbackOpen}>
        <DialogContent>
          <div className="flex items-start gap-3">
            <div className="grid h-8 w-8 place-items-center rounded-md border border-warn/30 bg-warn/10 text-warn shrink-0">
              <ShieldAlert className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <DialogTitle>Roll back {model.name}?</DialogTitle>
              <DialogDescription>
                Traffic will be routed to the previous healthy version
                across the {env} fleet within ~80ms per region. In-flight
                inferences are drained gracefully.
              </DialogDescription>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setRollbackOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={() => {
                rollback();
                setRollbackOpen(false);
                toast.warn(
                  `Rolling back ${model.name}`,
                  `Traffic re-routing to previous healthy version.`,
                );
              }}
            >
              Roll back now
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
