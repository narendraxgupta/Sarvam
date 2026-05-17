import { motion } from "framer-motion";
import { useReducedMotion } from "@/lib/a11y/useReducedMotion";

export function IsoApiStack() {
  const reduced = useReducedMotion();

  const cx = 80;
  const cy = 60;
  const sx = 22; // x scale
  const sy = 11; // y scale
  const sz = 14; // z scale (vertical offset between tiers)

  const iso = (x: number, y: number, z: number = 0) => ({
    x: cx + (x - y) * sx,
    y: cy + (x + y) * sy - z * sz,
  });

  const tiers = [
    { id: "edge", z: 2.4, extent: 1.6, hi: false, label: "edge" },
    { id: "inference", z: 1.2, extent: 1.9, hi: true, label: "inference" },
    { id: "storage", z: 0.0, extent: 2.2, hi: false, label: "storage" },
  ];

  return (
    <svg
      viewBox="0 0 160 120"
      className="absolute inset-0 w-full h-full"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <defs>

        <linearGradient id="iso-api-stroke" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#143CA3" />
          <stop offset="100%" stopColor="#63A1FF" />
        </linearGradient>

        <linearGradient id="iso-api-fill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#63A1FF" stopOpacity="0.20" />
          <stop offset="100%" stopColor="#143CA3" stopOpacity="0.06" />
        </linearGradient>

        <linearGradient id="iso-api-pulse" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#63A1FF" stopOpacity="0" />
          <stop offset="50%" stopColor="#63A1FF" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#63A1FF" stopOpacity="0" />
        </linearGradient>
      </defs>

      {tiers.map((t) => {
        const a = iso(-t.extent, -t.extent, t.z);
        const b = iso(t.extent, -t.extent, t.z);
        const c = iso(t.extent, t.extent, t.z);
        const d = iso(-t.extent, t.extent, t.z);

        return (
          <g key={t.id}>
            <path
              d={`M ${a.x} ${a.y} L ${b.x} ${b.y} L ${c.x} ${c.y} L ${d.x} ${d.y} Z`}
              fill={t.hi ? "url(#iso-api-fill)" : "transparent"}
              stroke="url(#iso-api-stroke)"
              strokeWidth="0.7"
              strokeLinejoin="round"
            />

            {t.hi &&
              [-0.9, -0.3, 0.3, 0.9].map((u, k) => {
                const p1 = iso(-t.extent + 0.15, u, t.z);
                const p2 = iso(t.extent - 0.15, u, t.z);
                return (
                  <line
                    key={k}
                    x1={p1.x}
                    y1={p1.y}
                    x2={p2.x}
                    y2={p2.y}
                    stroke="url(#iso-api-stroke)"
                    strokeWidth="0.35"
                    strokeOpacity="0.55"
                  />
                );
              })}

            {[a, b, c, d].map((p, k) => (
              <rect
                key={k}
                x={p.x - 0.9}
                y={p.y - 0.9}
                width="1.8"
                height="1.8"
                fill={t.hi ? "#63A1FF" : "transparent"}
                stroke="#143CA3"
                strokeWidth="0.4"
              />
            ))}
          </g>
        );
      })}

      {(() => {
        const top = iso(0, 0, 2.4);
        const mid = iso(0, 0, 1.2);
        const bot = iso(0, 0, 0);
        return (
          <g>
            <line
              x1={top.x}
              y1={top.y}
              x2={bot.x}
              y2={bot.y}
              stroke="url(#iso-api-stroke)"
              strokeWidth="0.5"
              strokeDasharray="2 2"
              strokeOpacity="0.65"
            />

            {[top, mid, bot].map((p, k) => (
              <circle
                key={k}
                cx={p.x}
                cy={p.y}
                r="1.4"
                fill="#63A1FF"
                stroke="#143CA3"
                strokeWidth="0.4"
              />
            ))}

            {!reduced && (
              <motion.rect
                x={top.x - 1.2}
                width="2.4"
                height="10"
                fill="url(#iso-api-pulse)"
                animate={{ y: [top.y, bot.y - 10] }}
                transition={{
                  duration: 2.4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  repeatDelay: 0.6,
                }}
              />
            )}
          </g>
        );
      })()}

      {(() => {
        const t = tiers[2];
        const b = iso(t.extent, -t.extent, t.z);
        const c = iso(t.extent, t.extent, t.z);
        const bDn = iso(t.extent, -t.extent, t.z - 0.6);
        const cDn = iso(t.extent, t.extent, t.z - 0.6);
        return (
          <path
            d={`M ${b.x} ${b.y} L ${c.x} ${c.y} L ${cDn.x} ${cDn.y} L ${bDn.x} ${bDn.y} Z`}
            fill="rgba(20, 60, 163, 0.08)"
            stroke="url(#iso-api-stroke)"
            strokeWidth="0.6"
            strokeLinejoin="round"
            strokeOpacity="0.85"
          />
        );
      })()}
    </svg>
  );
}
