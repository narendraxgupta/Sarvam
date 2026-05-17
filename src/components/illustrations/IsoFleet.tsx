import { motion } from "framer-motion";
import { useReducedMotion } from "@/lib/a11y/useReducedMotion";

export function IsoFleet() {
  const reduced = useReducedMotion();

  const iso = (x: number, y: number, z: number = 0) => ({
    x: 80 + (x - y) * 14,
    y: 64 + (x + y) * 7 - z * 8,
  });

  const racks: { x: number; y: number; primary?: boolean }[] = [];
  for (let gx = -1; gx <= 1; gx++) {
    for (let gy = -1; gy <= 1; gy++) {
      racks.push({ x: gx * 1.6, y: gy * 1.6, primary: gx === 0 && gy === 0 });
    }
  }

  // Plinth corners.
  const p = {
    a: iso(-3, -3, 0),
    b: iso(3, -3, 0),
    c: iso(3, 3, 0),
    d: iso(-3, 3, 0),
  };

  return (
    <svg
      viewBox="0 0 160 120"
      className="absolute inset-0 w-full h-full text-ink-muted"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <defs>
        <pattern
          id="iso-fleet-grid"
          width="6"
          height="3.5"
          patternUnits="userSpaceOnUse"
          patternTransform="skewX(-30) skewY(0)"
        >
          <path
            d="M 0 0 L 6 0 M 0 0 L 0 3.5"
            stroke="currentColor"
            strokeWidth="0.2"
            strokeOpacity="0.18"
          />
        </pattern>
      </defs>

      <path
        d={`M ${p.a.x} ${p.a.y} L ${p.b.x} ${p.b.y} L ${p.c.x} ${p.c.y} L ${p.d.x} ${p.d.y} Z`}
        fill="rgb(var(--bg-surface))"
        stroke="currentColor"
        strokeWidth="0.6"
        strokeLinejoin="round"
      />
      <path
        d={`M ${p.a.x} ${p.a.y} L ${p.b.x} ${p.b.y} L ${p.c.x} ${p.c.y} L ${p.d.x} ${p.d.y} Z`}
        fill="url(#iso-fleet-grid)"
      />

      {(() => {
        const cDn = { x: p.c.x, y: p.c.y + 6 };
        const bDn = { x: p.b.x, y: p.b.y + 6 };
        const dDn = { x: p.d.x, y: p.d.y + 6 };
        return (
          <>
            <path
              d={`M ${p.d.x} ${p.d.y} L ${p.c.x} ${p.c.y} L ${cDn.x} ${cDn.y} L ${dDn.x} ${dDn.y} Z`}
              fill="rgb(var(--ink) / 0.06)"
              stroke="currentColor"
              strokeWidth="0.5"
            />
            <path
              d={`M ${p.b.x} ${p.b.y} L ${p.c.x} ${p.c.y} L ${cDn.x} ${cDn.y} L ${bDn.x} ${bDn.y} Z`}
              fill="rgb(var(--ink) / 0.10)"
              stroke="currentColor"
              strokeWidth="0.5"
            />
          </>
        );
      })()}

      {racks
        .filter((r) => !r.primary)
        .map((r, i) => {
          const from = iso(0, 0, 0.4);
          const to = iso(r.x, r.y, 0.4);
          return (
            <line
              key={i}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke="rgb(var(--accent) / 0.35)"
              strokeWidth="0.4"
              strokeDasharray="1.5 1.5"
            >
              {!reduced && (
                <animate
                  attributeName="stroke-dashoffset"
                  from="0"
                  to="-6"
                  dur="3.2s"
                  repeatCount="indefinite"
                />
              )}
            </line>
          );
        })}

      {racks.map((r, i) => {
        const h = 1.6 + (Math.abs(r.x) + Math.abs(r.y)) * 0.2;
        const a = iso(r.x - 0.45, r.y - 0.45, h);
        const b = iso(r.x + 0.45, r.y - 0.45, h);
        const c = iso(r.x + 0.45, r.y + 0.45, h);
        const d = iso(r.x - 0.45, r.y + 0.45, h);
        const bDn = iso(r.x + 0.45, r.y - 0.45, 0);
        const cDn = iso(r.x + 0.45, r.y + 0.45, 0);
        const dDn = iso(r.x - 0.45, r.y + 0.45, 0);

        const fill = r.primary
          ? "rgb(var(--accent))"
          : "rgb(var(--bg-elevated))";

        return (
          <g key={i}>
            <path
              d={`M ${b.x} ${b.y} L ${c.x} ${c.y} L ${cDn.x} ${cDn.y} L ${bDn.x} ${bDn.y} Z`}
              fill={r.primary ? "rgb(var(--accent) / 0.7)" : "rgb(var(--ink) / 0.08)"}
              stroke="currentColor"
              strokeWidth="0.5"
            />
            <path
              d={`M ${d.x} ${d.y} L ${c.x} ${c.y} L ${cDn.x} ${cDn.y} L ${dDn.x} ${dDn.y} Z`}
              fill={r.primary ? "rgb(var(--accent) / 0.85)" : "rgb(var(--ink) / 0.04)"}
              stroke="currentColor"
              strokeWidth="0.5"
            />
            <path
              d={`M ${a.x} ${a.y} L ${b.x} ${b.y} L ${c.x} ${c.y} L ${d.x} ${d.y} Z`}
              fill={fill}
              stroke="currentColor"
              strokeWidth="0.6"
              strokeLinejoin="round"
            />

            {r.primary && !reduced && (
              <motion.circle
                cx={(a.x + c.x) / 2}
                cy={(a.y + c.y) / 2}
                r="0.8"
                fill="rgb(var(--accent-ink))"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{
                  duration: 2.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            )}
          </g>
        );
      })}
    </svg>
  );
}
