import { motion } from "framer-motion";
import { Layers } from "lucide-react";
import { MODELS } from "@/data/models";
import { useDeployStore } from "@/store/deployStore";
import { useReducedMotion } from "@/lib/a11y/useReducedMotion";
import { cn } from "@/lib/utils";

export function ModelRegistry() {
  const selected = useDeployStore((s) => s.selectedModel);
  const setSelected = useDeployStore((s) => s.setSelectedModel);
  const reduced = useReducedMotion();

  return (
    <section aria-label="Model registry">
      <div className="flex items-center gap-2 mb-4">
        <Layers className="h-3.5 w-3.5 text-accent" />
        <span className="text-[13px] font-semibold text-ink">Model registry</span>
        <span className="ml-auto text-[11px] font-mono text-ink-dim tabular-nums">
          {MODELS.length} models
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {MODELS.map((m, idx) => {
          const active = m.id === selected;
          return (
            <motion.button
              key={m.id}
              onClick={() => setSelected(m.id)}
              initial={reduced ? false : { opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.4,
                delay: idx * 0.06,
                ease: [0.16, 1, 0.3, 1],
              }}
              className={cn(
                "text-left rounded-xl border p-4 transition-all duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                active
                  ? "border-accent/30 bg-accent/[0.06] shadow-glow-accent"
                  : "border-line/8 bg-bg-surface/50 hover:border-line/15 hover:bg-bg-elevated/40",
              )}
              aria-pressed={active}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[13px] font-semibold text-ink">
                    {m.name}
                  </span>
                  {m.badge && (
                    <span
                      className={cn(
                        "px-1.5 py-0.5 rounded-md text-[9px] font-semibold uppercase tracking-wide",
                        m.badge === "new" && "text-ok bg-ok/10",
                        m.badge === "preview" && "text-warn bg-warn/10",
                        m.badge === "stable" && "text-accent bg-accent/10",
                      )}
                    >
                      {m.badge}
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-ink-dim font-mono">
                  {m.parameters}
                </span>
              </div>
              <p className="text-[12px] text-ink-muted leading-relaxed line-clamp-2">
                {m.description}
              </p>
              <div className="mt-2.5 flex flex-wrap gap-1">
                {m.modalities.map((mod) => (
                  <span
                    key={mod}
                    className="text-[9px] px-1.5 py-0.5 rounded-md bg-bg-elevated/60 text-ink-subtle uppercase tracking-wide font-medium"
                  >
                    {mod}
                  </span>
                ))}
                <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-bg-elevated/60 text-ink-subtle font-mono">
                  {m.contextLength.toLocaleString()} ctx
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
