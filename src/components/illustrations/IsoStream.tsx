import { motion } from "framer-motion";
import { useReducedMotion } from "@/lib/a11y/useReducedMotion";

export function IsoStream() {
  const reduced = useReducedMotion();

  // Iso projection helpers — converts (x, y, z) cube coords into 2D plane.
  const iso = (x: number, y: number, z: number = 0) => ({
    x: 80 + (x - y) * 24,
    y: 60 + (x + y) * 12 - z * 14,
  });

  // Token cards from bottom-up.
  const cards = [0, 1, 2, 3, 4];

  return (
    <svg
      viewBox="0 0 160 120"
      className="absolute inset-0 w-full h-full text-ink-muted"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <defs>
        <linearGradient id="iso-stream-scan" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="rgb(var(--accent))" stopOpacity="0" />
          <stop offset="50%" stopColor="rgb(var(--accent))" stopOpacity="0.55" />
          <stop offset="100%" stopColor="rgb(var(--accent))" stopOpacity="0" />
        </linearGradient>
      </defs>

      {cards.map((i) => {
        const z = i * 4;
        const a = iso(-2, -2, z);
        const b = iso(2, -2, z);
        const c = iso(2, 2, z);
        const d = iso(-2, 2, z);
        const isTop = i === cards.length - 1;
        return (
          <g key={i}>
            <path
              d={`M ${a.x} ${a.y} L ${b.x} ${b.y} L ${c.x} ${c.y} L ${d.x} ${d.y} Z`}
              fill={isTop ? "rgb(var(--accent))" : "transparent"}
              stroke="currentColor"
              strokeWidth="0.6"
              strokeLinejoin="round"
            />

            {!isTop &&
              [-1, 0, 1].map((row, k) => {
                const p1 = iso(-1.6, row * 0.6, z);
                const p2 = iso(1.6, row * 0.6, z);
                return (
                  <line
                    key={k}
                    x1={p1.x}
                    y1={p1.y}
                    x2={p2.x}
                    y2={p2.y}
                    stroke="currentColor"
                    strokeWidth="0.35"
                    strokeOpacity="0.35"
                  />
                );
              })}
          </g>
        );
      })}

      {(() => {
        const z = 0;
        const b = iso(2, -2, z);
        const c = iso(2, 2, z);
        const bDn = iso(2, -2, z - 2.4);
        const cDn = iso(2, 2, z - 2.4);
        return (
          <path
            d={`M ${b.x} ${b.y} L ${c.x} ${c.y} L ${cDn.x} ${cDn.y} L ${bDn.x} ${bDn.y} Z`}
            fill="rgb(var(--ink) / 0.06)"
            stroke="currentColor"
            strokeWidth="0.6"
            strokeLinejoin="round"
          />
        );
      })()}

      {!reduced && (
        <motion.line
          x1={iso(-2, 0, 16).x}
          y1={iso(-2, 0, 16).y}
          x2={iso(2, 0, 16).x}
          y2={iso(2, 0, 16).y}
          stroke="url(#iso-stream-scan)"
          strokeWidth="2.2"
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      <motion.rect
        x={iso(2, -2, 16).x - 1}
        y={iso(2, -2, 16).y - 3}
        width="2"
        height="6"
        fill="rgb(var(--accent))"
        animate={reduced ? undefined : { opacity: [1, 0.2, 1] }}
        transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
      />
    </svg>
  );
}
