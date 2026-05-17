import { cn, formatNumber } from "@/lib/utils";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/lib/a11y/useReducedMotion";

interface MetricProps {
  label: string;
  value: string | number;
  unit?: string;
  hint?: string;
  tone?: "default" | "positive" | "warn" | "danger";
  trend?: "up" | "down" | "flat";
  className?: string;
  isLive?: boolean;
  fractionDigits?: number;
}

const toneClass = {
  default: "text-ink",
  positive: "text-ok",
  warn: "text-warn",
  danger: "text-danger",
} as const;

export function Metric({
  label,
  value,
  unit,
  hint,
  tone = "default",
  className,
  isLive,
  fractionDigits,
}: MetricProps) {
  const reduced = useReducedMotion();
  const display =
    typeof value === "number"
      ? formatNumber(value, fractionDigits ?? 0)
      : value;
  return (
    <div
      className={cn(
        "hx-surface px-3 py-3 flex flex-col gap-1.5 min-w-0",
        "transition-colors hover:border-line-strong",
        className,
      )}
      role="status"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="text-[10px] uppercase tracking-[0.08em] text-ink-subtle font-semibold">
          {label}
        </div>
        {isLive && (
          <motion.div
            className="h-1.5 w-1.5 rounded-full bg-ok shadow-[0_0_8px_rgba(61,220,151,0.6)]"
            animate={reduced ? undefined : { opacity: [0.35, 1, 0.35] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
            aria-hidden
          />
        )}
      </div>
      <div className="flex items-baseline gap-1">
        <span
          className={cn(
            "font-mono text-[22px] font-semibold tabular-nums leading-none tracking-tightish",
            toneClass[tone],
          )}
        >
          {display}
        </span>
        {unit && (
          <span className="font-mono text-[11px] text-ink-subtle leading-none">
            {unit}
          </span>
        )}
      </div>
      {hint && (
        <div className="text-2xs text-ink-subtle leading-tight">{hint}</div>
      )}
    </div>
  );
}
