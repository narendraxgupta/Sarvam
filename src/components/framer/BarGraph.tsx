import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/lib/a11y/useReducedMotion";

export type BarDatum = { label: string; value: number; hint?: string };

export type BarGraphProps = {
  data: BarDatum[];
  max?: number;
  height?: number;
  showValues?: boolean;
  highlightPeak?: boolean;
  unit?: string;
  className?: string;
};

export function BarGraph({
  data,
  max,
  height = 180,
  showValues = true,
  highlightPeak = true,
  unit = "",
  className,
}: BarGraphProps) {
  const reduced = useReducedMotion();
  const [hover, setHover] = useState<number | null>(null);

  const finiteValues = data
    .map((d) => d.value)
    .filter((v) => Number.isFinite(v));
  const computedCeiling =
    finiteValues.length > 0 ? Math.max(...finiteValues) : 1;
  const ceiling = max ?? Math.max(1, computedCeiling);
  const peakIndex =
    data.length === 0
      ? -1
      : data.reduce(
          (best, d, i) =>
            Number.isFinite(d.value) && d.value > (data[best]?.value ?? -Infinity)
              ? i
              : best,
          0,
        );

  const ticks = 4;

  if (data.length === 0) {
    return (
      <div
        className={cn(
          "w-full grid place-items-center text-[11px] text-ink-subtle",
          className,
        )}
        style={{ height }}
        aria-label="No data to display"
      >
        no data
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      <div className="relative" style={{ height }}>
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: ticks + 1 }).map((_, i) => {
            const t = i / ticks;
            const v = ceiling * (1 - t);
            return (
              <div
                key={i}
                className="absolute left-0 right-0 flex items-center"
                style={{ top: `${t * 100}%` }}
              >
                <span className="hx-mono-tab text-[10px] text-ink-dim w-10 tabular-nums text-right pr-2">
                  {Number.isInteger(v) ? v : v.toFixed(1)}
                  {unit && <span className="text-ink-dim/70">{unit}</span>}
                </span>
                <span className="flex-1 border-t border-dashed border-line/8" />
              </div>
            );
          })}
        </div>

        <div className="absolute inset-0 pl-12 pr-1 flex items-end gap-2">
          {data.map((d, i) => {
            const safeValue = Number.isFinite(d.value)
              ? Math.max(0, d.value)
              : 0;
            const ratio = ceiling > 0 ? safeValue / ceiling : 0;
            const isPeak = highlightPeak && i === peakIndex;
            const isHover = hover === i;
            return (
              <div
                key={`${d.label}-${i}`}
                className="relative flex-1 min-w-0 h-full flex flex-col justify-end"
                onPointerEnter={() => setHover(i)}
                onPointerLeave={() => setHover(null)}
              >
                {showValues && (
                  <div
                    className={cn(
                      "absolute left-1/2 -translate-x-1/2 hx-mono-tab",
                      "text-[10.5px] uppercase tracking-[0.06em] tabular-nums",
                      "transition-all duration-200 ease-out-expo",
                      isHover
                        ? "text-accent -translate-y-1"
                        : "text-ink-muted",
                    )}
                    style={{ bottom: `calc(${ratio * 100}% + 6px)` }}
                  >
                    {Number.isInteger(d.value) ? d.value : d.value.toFixed(1)}
                    {unit && <span className="text-ink-dim/80">{unit}</span>}
                  </div>
                )}

                <motion.div
                  className={cn(
                    "w-full rounded-t-sm relative overflow-hidden",
                    isPeak
                      ? "bg-accent"
                      : "bg-ink/70 dark:bg-ink/60",
                  )}
                  style={{ originY: 1 }}
                  initial={reduced ? false : { scaleY: 0 }}
                  whileInView={{ scaleY: 1 }}
                  viewport={{ once: true, margin: "0px 0px -10% 0px" }}
                  transition={{
                    duration: 0.55,
                    delay: i * 0.045,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  animate={{
                    height: `${ratio * 100}%`,
                    filter: isHover ? "brightness(1.15)" : "brightness(1)",
                  }}
                >
                  <span
                    aria-hidden
                    className="absolute inset-x-0 top-0 h-px bg-white/30"
                  />
                </motion.div>

                <div
                  className={cn(
                    "absolute top-full mt-2 left-1/2 -translate-x-1/2",
                    "hx-mono-tab text-[10px] uppercase tracking-[0.12em] whitespace-nowrap",
                    isHover
                      ? "text-ink"
                      : isPeak
                      ? "text-accent"
                      : "text-ink-subtle",
                  )}
                >
                  {d.label}
                </div>
              </div>
            );
          })}
        </div>

        <div className="absolute inset-x-0 bottom-0 ml-12 h-px bg-ink/30" />
      </div>

      <div className="mt-7 hx-mono-tab text-[10px] uppercase tracking-[0.18em] text-ink-dim">
        {hover != null && data[hover]?.hint
          ? data[hover].hint
          : "live · 60s window"}
      </div>
    </div>
  );
}
