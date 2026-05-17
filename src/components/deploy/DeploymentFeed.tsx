import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  CircleDot,
  Hourglass,
  XCircle,
  Activity,
} from "lucide-react";
import { useDeployStore, getModelById } from "@/store/deployStore";
import { useReducedMotion } from "@/lib/a11y/useReducedMotion";
import { cn, formatMs } from "@/lib/utils";
import type { Deployment } from "@/types";

const STATUS_META: Record<
  Deployment["status"],
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    dot: string;
  }
> = {
  queued: {
    label: "Queued",
    icon: Hourglass,
    color: "text-ink-muted",
    dot: "bg-ink-subtle",
  },
  building: {
    label: "Building",
    icon: Activity,
    color: "text-accent",
    dot: "bg-accent",
  },
  "rolling-out": {
    label: "Rolling out",
    icon: CircleDot,
    color: "text-warn",
    dot: "bg-warn",
  },
  healthy: {
    label: "Healthy",
    icon: CheckCircle2,
    color: "text-ok",
    dot: "bg-ok",
  },
  failed: {
    label: "Failed",
    icon: XCircle,
    color: "text-danger",
    dot: "bg-danger",
  },
};

function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function DeploymentFeed() {
  const deployments = useDeployStore((s) => s.deployments);
  const reduced = useReducedMotion();
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 30_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <section aria-label="Deployment activity">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="h-3.5 w-3.5 text-accent" />
        <span className="text-[13px] font-semibold text-ink">Activity</span>
        <span className="ml-auto text-[11px] text-ink-dim font-mono tabular-nums">
          {deployments.length} events
        </span>
      </div>

      <div className="relative">
        <div className="absolute left-[11px] top-0 bottom-0 w-px bg-line/8" aria-hidden />

        <ol className="flex flex-col">
          <AnimatePresence initial={false}>
            {deployments.map((d, idx) => {
              const m = getModelById(d.modelId);
              const meta = STATUS_META[d.status];
              const Icon = meta.icon;
              return (
                <motion.li
                  key={d.id}
                  layout={!reduced}
                  initial={reduced ? false : { opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: 0.3,
                    delay: idx * 0.04,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="relative pl-8 group"
                >
                  <span
                    className={cn(
                      "absolute left-[3px] top-4 grid h-[18px] w-[18px] place-items-center rounded-full",
                      "border-[3px] border-bg",
                      meta.dot,
                    )}
                    aria-hidden
                  >
                    <Icon className="h-2 w-2 text-bg" />
                  </span>

                  <div className="py-3 pl-1 border-b border-line/6 last:border-b-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-display text-[13px] font-semibold text-ink tracking-tight">
                        {m.name}
                      </span>
                      <span className={cn("text-[11px] font-medium", meta.color)}>
                        {meta.label}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-ink-dim">
                        {d.env}
                      </span>
                      <span className="ml-auto text-[11px] text-ink-subtle font-mono tabular-nums">
                        {relativeTime(d.createdAt)}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-[11px] text-ink-subtle font-mono tabular-nums flex-wrap">
                      <span className="text-ink-muted">{d.version}</span>
                      <span className="text-ink-dim">·</span>
                      <span>{d.region}</span>
                      <span className="text-ink-dim">·</span>
                      <span>
                        canary{" "}
                        <span className={d.canaryPct === 100 ? "text-ok" : "text-warn"}>
                          {d.canaryPct}%
                        </span>
                      </span>
                      {d.durationMs && (
                        <>
                          <span className="text-ink-dim">·</span>
                          <span>{formatMs(d.durationMs)}</span>
                        </>
                      )}
                    </div>
                  </div>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ol>
      </div>
    </section>
  );
}
