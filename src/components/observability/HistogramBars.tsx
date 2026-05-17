import { motion } from "framer-motion";
import type { HistogramBucket } from "@/types/observability";
import { useReducedMotion } from "@/lib/a11y/useReducedMotion";
import { cn } from "@/lib/utils";

interface Props {
  buckets: HistogramBucket[];
  className?: string;
}

function fmt(ms: number) {
  if (!Number.isFinite(ms)) return "∞";
  if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`;
  return `${ms}`;
}

export function HistogramBars({ buckets, className }: Props) {
  const reduced = useReducedMotion();
  const max = Math.max(1, ...buckets.map((b) => b.count));

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-end gap-1.5 h-32">
        {buckets.map((b, i) => {
          const h = (b.count / max) * 100;
          const key = `${b.lower}-${b.upper}`;
          return (
            <motion.div
              key={key}
              className="flex-1 min-w-[8px] relative rounded-t-sm bg-gradient-to-b from-accent/80 to-accent/30 border-t border-accent/40"
              initial={reduced ? false : { height: 0, opacity: 0 }}
              animate={{ height: `${Math.max(2, h)}%`, opacity: 1 }}
              transition={{
                duration: 0.5,
                delay: reduced ? 0 : i * 0.03,
                ease: [0.16, 1, 0.3, 1],
              }}
              title={`${fmt(b.lower)}–${fmt(b.upper)}ms · ${b.count} req`}
            />
          );
        })}
      </div>
      <div className="flex items-center gap-1.5">
        {buckets.map((b) => (
          <div
            key={`label-${b.lower}-${b.upper}`}
            className="flex-1 min-w-[8px] text-center text-[9px] font-mono text-ink-subtle"
          >
            {fmt(b.lower)}
          </div>
        ))}
      </div>
    </div>
  );
}
