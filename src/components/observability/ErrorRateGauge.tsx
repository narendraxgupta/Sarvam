import { motion, useTransform, useSpring } from "framer-motion";
import { useEffect } from "react";
import { useReducedMotion } from "@/lib/a11y/useReducedMotion";
import { cn } from "@/lib/utils";

interface Props {

  rate: number;
  className?: string;
}

const SIZE = 140;
const STROKE = 10;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const SWEEP = 0.7; // 70% of the circle (240deg)

export function ErrorRateGauge({ rate, className }: Props) {
  const reduced = useReducedMotion();
  const target = Math.max(0, Math.min(1, rate));

  const motionValue = useSpring(target, {
    stiffness: 90,
    damping: 22,
    mass: 0.6,
  });

  useEffect(() => {
    motionValue.set(target);
  }, [target, motionValue]);

  const dashOffset = useTransform(
    motionValue,
    (v) => CIRCUMFERENCE - v * CIRCUMFERENCE * SWEEP,
  );

  const colorVar =
    target < 0.02 ? "--ok" : target < 0.06 ? "--warn" : "--danger";
  const labelText =
    target < 0.02 ? "Healthy" : target < 0.06 ? "Degraded" : "Critical";

  return (
    <div
      className={cn(
        "relative grid place-items-center",
        className,
      )}
      role="img"
      aria-label={`Error rate ${(target * 100).toFixed(2)} percent — ${labelText}`}
    >
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="rgb(var(--line) / 0.5)"
          strokeWidth={STROKE}
          strokeDasharray={`${CIRCUMFERENCE * SWEEP} ${CIRCUMFERENCE}`}
          strokeLinecap="round"
          transform={`rotate(126 ${SIZE / 2} ${SIZE / 2})`}
        />
        <motion.circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke={`rgb(var(${colorVar}))`}
          strokeWidth={STROKE}
          strokeDasharray={`${CIRCUMFERENCE * SWEEP} ${CIRCUMFERENCE}`}
          strokeDashoffset={reduced ? CIRCUMFERENCE - target * CIRCUMFERENCE * SWEEP : dashOffset}
          strokeLinecap="round"
          transform={`rotate(126 ${SIZE / 2} ${SIZE / 2})`}
          style={{
            filter: `drop-shadow(0 0 6px rgb(var(${colorVar}) / 0.5))`,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
        <div className="text-[28px] font-semibold tabular-nums text-ink leading-none">
          {(target * 100).toFixed(2)}
          <span className="text-[14px] text-ink-subtle ml-0.5">%</span>
        </div>
        <div
          className="mt-1.5 text-[10px] uppercase tracking-[0.18em] font-semibold"
          style={{ color: `rgb(var(${colorVar}))` }}
        >
          {labelText}
        </div>
      </div>
    </div>
  );
}
