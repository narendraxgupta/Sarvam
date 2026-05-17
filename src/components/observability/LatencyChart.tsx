import { useMemo } from "react";
import { motion } from "framer-motion";
import type { LatencySample } from "@/types/observability";
import { useReducedMotion } from "@/lib/a11y/useReducedMotion";
import { cn } from "@/lib/utils";

interface Props {
  samples: LatencySample[];
  height?: number;
  className?: string;
}

const PAD_TOP = 16;
const PAD_BOTTOM = 24;
const PAD_LEFT = 36;
const PAD_RIGHT = 12;

export function LatencyChart({ samples, height = 220, className }: Props) {
  const reduced = useReducedMotion();
  const width = 720; // viewBox; the SVG scales responsively.

  const { paths, area, maxY, gridLines, latest } = useMemo(() => {
    if (samples.length === 0) {
      return {
        paths: { p50: "", p95: "", p99: "" },
        area: "",
        maxY: 1000,
        gridLines: [] as { y: number; label: string }[],
        latest: null as LatencySample | null,
      };
    }
    const xs = samples.map((_, i) => i);
    const maxValue = Math.max(
      ...samples.flatMap((s) => [s.p50, s.p95, s.p99]),
    );
    // Round up to a nice ceiling so the grid labels are readable.
    const niceCeil = (n: number) => {
      const tiers = [200, 400, 600, 800, 1000, 1500, 2000, 3000, 5000, 8000, 12000];
      for (const t of tiers) if (n <= t) return t;
      return Math.ceil(n / 1000) * 1000;
    };
    const ceil = niceCeil(maxValue);

    const lastX = xs.length - 1;
    const sx = (i: number) =>
      lastX === 0
        ? PAD_LEFT
        : PAD_LEFT + (i / lastX) * (width - PAD_LEFT - PAD_RIGHT);
    const sy = (v: number) =>
      height - PAD_BOTTOM - (v / ceil) * (height - PAD_TOP - PAD_BOTTOM);

    const make = (key: "p50" | "p95" | "p99") =>
      samples
        .map((s, i) => `${i === 0 ? "M" : "L"} ${sx(i).toFixed(2)} ${sy(s[key]).toFixed(2)}`)
        .join(" ");

    const lastSample = samples[samples.length - 1];

    // Area under p95 line for a soft accent fill.
    const areaPath = samples.length
      ? `${samples
          .map((s, i) => `${i === 0 ? "M" : "L"} ${sx(i).toFixed(2)} ${sy(s.p95).toFixed(2)}`)
          .join(" ")} L ${sx(lastX).toFixed(2)} ${height - PAD_BOTTOM} L ${sx(0).toFixed(2)} ${height - PAD_BOTTOM} Z`
      : "";

    const lines: { y: number; label: string }[] = [];
    for (let i = 0; i <= 4; i++) {
      const v = (ceil * i) / 4;
      lines.push({ y: sy(v), label: v >= 1000 ? `${(v / 1000).toFixed(1)}s` : `${Math.round(v)}` });
    }

    return {
      paths: { p50: make("p50"), p95: make("p95"), p99: make("p99") },
      area: areaPath,
      maxY: ceil,
      gridLines: lines,
      latest: lastSample,
    };
  }, [samples, height]);

  return (
    <div className={cn("relative w-full", className)}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-auto"
        role="img"
        aria-label="Latency over time"
      >
        <defs>

          <linearGradient id="latency-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(var(--accent))" stopOpacity="0.22" />
            <stop offset="100%" stopColor="rgb(var(--accent))" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="latency-p99-stroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgb(var(--warn))" />
            <stop offset="100%" stopColor="rgb(var(--danger))" />
          </linearGradient>
        </defs>

        {gridLines.map((g) => (
          <g key={`grid-${g.label}`}>
            <line
              x1={PAD_LEFT}
              x2={width - PAD_RIGHT}
              y1={g.y}
              y2={g.y}
              stroke="rgb(var(--line) / 0.4)"
              strokeWidth="0.6"
              strokeDasharray="2 4"
            />
            <text
              x={PAD_LEFT - 6}
              y={g.y + 3}
              textAnchor="end"
              className="fill-[rgb(var(--ink-subtle))] text-[10px] font-mono"
            >
              {g.label}
            </text>
          </g>
        ))}

        <motion.path
          d={area}
          fill="url(#latency-area)"
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        />

        <motion.path
          d={paths.p99}
          stroke="url(#latency-p99-stroke)"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          initial={reduced ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        />
        <motion.path
          d={paths.p95}
          stroke="rgb(var(--accent))"
          strokeWidth="1.6"
          fill="none"
          strokeLinecap="round"
          initial={reduced ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        />
        <motion.path
          d={paths.p50}
          stroke="rgb(var(--ok))"
          strokeWidth="1.4"
          fill="none"
          strokeLinecap="round"
          initial={reduced ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        />

        <text
          x={PAD_LEFT}
          y={height - 4}
          className="fill-[rgb(var(--ink-subtle))] text-[10px] font-mono"
        >
          -60s
        </text>
        <text
          x={width - PAD_RIGHT}
          y={height - 4}
          textAnchor="end"
          className="fill-[rgb(var(--ink-subtle))] text-[10px] font-mono"
        >
          now
        </text>
      </svg>

      {latest && (
        <div className="absolute right-3 top-3 flex flex-col items-end gap-1 pointer-events-none">
          <div className="flex items-center gap-1.5 text-[10.5px] font-mono">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-ok" />
            <span className="text-ink-subtle">p50</span>
            <span className="text-ink tabular-nums">{Math.round(latest.p50)}ms</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10.5px] font-mono">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
            <span className="text-ink-subtle">p95</span>
            <span className="text-ink tabular-nums">{Math.round(latest.p95)}ms</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10.5px] font-mono">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-warn" />
            <span className="text-ink-subtle">p99</span>
            <span className="text-ink tabular-nums">
              {latest.p99 >= 1000 ? `${(latest.p99 / 1000).toFixed(1)}s` : `${Math.round(latest.p99)}ms`}
            </span>
          </div>
        </div>
      )}

      <span className="sr-only">
        Maximum latency on the y axis is {maxY} milliseconds.
      </span>
    </div>
  );
}
