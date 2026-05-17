import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { REGIONS } from "@/data/regions";
import { useReducedMotion } from "@/lib/a11y/useReducedMotion";
import { cn } from "@/lib/utils";

export function FleetMap() {
  const reduced = useReducedMotion();
  const healthy = REGIONS.filter((r) => r.health === "healthy").length;
  const degraded = REGIONS.filter((r) => r.health === "degraded").length;
  const primary = REGIONS[0];
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="relative rounded-2xl border border-line/8 bg-bg-surface overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-line/8">
        <div className="flex items-center gap-3">
          <span className="font-display text-[15px] font-semibold text-ink tracking-tight">
            Fleet topology
          </span>
          <span className="text-ink-dim">·</span>
          <span className="text-[12px] text-ink-subtle">Global inference network</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-ok">
            <span className="h-1.5 w-1.5 rounded-full bg-ok" />
            {healthy} healthy
          </span>
          {degraded > 0 && (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-warn">
              <span className="h-1.5 w-1.5 rounded-full bg-warn" />
              {degraded} degraded
            </span>
          )}
        </div>
      </div>

      <div
        className="relative w-full"
        style={{ height: "clamp(320px, 40vh, 480px)" }}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(rgb(var(--ink) / 0.04) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        <div
          aria-hidden
          className="absolute pointer-events-none"
          style={{
            left: `${primary.x}%`,
            top: `${primary.y}%`,
            width: 200,
            height: 200,
            transform: "translate(-50%, -50%)",
            background: "radial-gradient(circle, rgb(var(--accent) / 0.08), transparent 70%)",
            filter: "blur(20px)",
          }}
        />

        <svg
          viewBox="0 0 100 80"
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="xMidYMid meet"
          aria-label="Global inference fleet topology"
          role="img"
        >
          {REGIONS.slice(1).map((r) => (
            <g key={`link-${r.id}`}>
              <line
                x1={primary.x}
                y1={primary.y}
                x2={r.x}
                y2={r.y}
                stroke={
                  hovered === r.id
                    ? "rgb(var(--accent) / 0.4)"
                    : "rgb(var(--ink) / 0.08)"
                }
                strokeWidth={hovered === r.id ? "0.4" : "0.2"}
                strokeLinecap="round"
                strokeDasharray="1.2 2"
                style={{ transition: "stroke 300ms, stroke-width 300ms" }}
              >
                {!reduced && (
                  <animate
                    attributeName="stroke-dashoffset"
                    from="0"
                    to="-6.4"
                    dur="4s"
                    repeatCount="indefinite"
                  />
                )}
              </line>
            </g>
          ))}

          {REGIONS.map((r, idx) => {
            const fill =
              r.health === "healthy"
                ? "rgb(var(--accent))"
                : r.health === "degraded"
                ? "rgb(var(--warn))"
                : "rgb(var(--danger))";
            const isPrimary = r === primary;
            const isHovered = hovered === r.id;
            const labelLeft = r.x > 55;

            return (
              <g
                key={r.id}
                role="group"
                tabIndex={0}
                aria-label={`${r.city}, ${r.id}: ${r.health}, ${r.latencyMs}ms latency`}
                onMouseEnter={() => setHovered(r.id)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(r.id)}
                onBlur={() => setHovered((h) => (h === r.id ? null : h))}
                style={{ cursor: "default", outline: "none" }}
              >
                {isPrimary && (
                  <circle
                    cx={r.x}
                    cy={r.y}
                    r={4.5}
                    fill="none"
                    stroke="rgb(var(--accent) / 0.15)"
                    strokeWidth="0.3"
                    strokeDasharray="1 1"
                  />
                )}

                {isHovered && (
                  <motion.circle
                    cx={r.x}
                    cy={r.y}
                    r={3.5}
                    fill="none"
                    stroke={fill}
                    strokeWidth="0.25"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 0.5, scale: 1 }}
                    style={{ transformOrigin: `${r.x}px ${r.y}px` }}
                  />
                )}

                {!reduced && r.health === "healthy" && (
                  <motion.circle
                    cx={r.x}
                    cy={r.y}
                    r={2}
                    fill="none"
                    stroke={fill}
                    strokeWidth="0.15"
                    animate={{
                      r: [2, 3.2, 2],
                      opacity: [0.5, 0, 0.5],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: idx * 0.4,
                    }}
                    style={{ transformOrigin: `${r.x}px ${r.y}px` }}
                  />
                )}

                <motion.circle
                  cx={r.x}
                  cy={r.y}
                  r={isPrimary ? 2.2 : 1.8}
                  fill={fill}
                  stroke="rgb(var(--bg))"
                  strokeWidth="0.5"
                  initial={reduced ? false : { scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 15,
                    delay: idx * 0.08,
                  }}
                  style={{ transformOrigin: `${r.x}px ${r.y}px` }}
                />

                <text
                  x={labelLeft ? r.x - 4 : r.x + 4}
                  y={r.y - 0.3}
                  fontSize="2.6"
                  textAnchor={labelLeft ? "end" : "start"}
                  fill={isHovered ? "rgb(var(--ink))" : "rgb(var(--ink) / 0.85)"}
                  style={{
                    fontFamily: '"Bricolage Grotesque", sans-serif',
                    fontWeight: 600,
                    letterSpacing: "-0.012em",
                    transition: "fill 200ms",
                  }}
                >
                  {r.city}
                </text>
                <text
                  x={labelLeft ? r.x - 4 : r.x + 4}
                  y={r.y + 2.8}
                  fontSize="1.9"
                  textAnchor={labelLeft ? "end" : "start"}
                  fill={isHovered ? "rgb(var(--ink) / 0.7)" : "rgb(var(--ink) / 0.4)"}
                  style={{
                    fontFamily: '"IBM Plex Mono", monospace',
                    transition: "fill 200ms",
                  }}
                >
                  {r.latencyMs}ms · {r.code}
                </text>
              </g>
            );
          })}
        </svg>

        <AnimatePresence>
          {hovered && (() => {
            const region = REGIONS.find((r) => r.id === hovered);
            if (!region) return null;
            return (
              <motion.div
                key={hovered}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.15 }}
                className="absolute bottom-3 left-4 flex items-center gap-3 px-3 py-2 rounded-lg border border-line/10 bg-bg-elevated/90 backdrop-blur-md text-xs pointer-events-none"
              >
                <span className={cn(
                  "h-2 w-2 rounded-full",
                  region.health === "healthy" ? "bg-ok" : "bg-warn"
                )} />
                <span className="font-semibold text-ink">{region.city}</span>
                <span className="text-ink-subtle font-mono">{region.code}</span>
                <span className="text-ink-dim">·</span>
                <span className="font-mono text-ink-muted tabular-nums">{region.latencyMs}ms p50</span>
                <span className={cn(
                  "font-medium capitalize",
                  region.health === "healthy" ? "text-ok" : "text-warn"
                )}>
                  {region.health}
                </span>
              </motion.div>
            );
          })()}
        </AnimatePresence>
      </div>
    </div>
  );
}
