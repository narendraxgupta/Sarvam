import { motion } from "framer-motion";
import { useReducedMotion } from "@/lib/a11y/useReducedMotion";

export function IsoCommandSheet() {
  const reduced = useReducedMotion();

  const cx = 80;
  const cy = 60;
  const sx = 22;
  const sy = 11;
  const sz = 14;

  const iso = (x: number, y: number, z: number = 0) => ({
    x: cx + (x - y) * sx,
    y: cy + (x + y) * sy - z * sz,
  });

  const panelU = 2.6;
  const panelV = 1.9;
  const panelZ = 1.0;

  const rows = [
    { v: -1.25, kind: "input" as const },
    { v: -0.55, kind: "item" as const },
    { v: 0.05, kind: "item-active" as const },
    { v: 0.65, kind: "item" as const },
    { v: 1.25, kind: "item" as const },
  ];

  const strip = (v: number, half: number) => {
    const a = iso(-panelU + 0.18, v - half, panelZ);
    const b = iso(panelU - 0.18, v - half, panelZ);
    const c = iso(panelU - 0.18, v + half, panelZ);
    const d = iso(-panelU + 0.18, v + half, panelZ);
    return `M ${a.x} ${a.y} L ${b.x} ${b.y} L ${c.x} ${c.y} L ${d.x} ${d.y} Z`;
  };

  // Frame corners for the full panel top face.
  const fa = iso(-panelU, -panelV, panelZ);
  const fb = iso(panelU, -panelV, panelZ);
  const fc = iso(panelU, panelV, panelZ);
  const fd = iso(-panelU, panelV, panelZ);

  // Right side panel thickness so the figure reads as a solid card.
  const fbDn = iso(panelU, -panelV, panelZ - 0.4);
  const fcDn = iso(panelU, panelV, panelZ - 0.4);

  return (
    <svg
      viewBox="0 0 160 120"
      className="absolute inset-0 w-full h-full"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <defs>
        <linearGradient id="iso-cmd-stroke" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#143CA3" />
          <stop offset="100%" stopColor="#63A1FF" />
        </linearGradient>
        <linearGradient id="iso-cmd-panel-fill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#143CA3" stopOpacity="0.04" />
          <stop offset="100%" stopColor="#63A1FF" stopOpacity="0.14" />
        </linearGradient>
        <linearGradient id="iso-cmd-active-fill" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#143CA3" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#63A1FF" stopOpacity="0.45" />
        </linearGradient>
      </defs>

      <path
        d={`M ${fb.x} ${fb.y} L ${fc.x} ${fc.y} L ${fcDn.x} ${fcDn.y} L ${fbDn.x} ${fbDn.y} Z`}
        fill="rgba(20, 60, 163, 0.10)"
        stroke="url(#iso-cmd-stroke)"
        strokeWidth="0.55"
        strokeLinejoin="round"
        strokeOpacity="0.85"
      />

      <path
        d={`M ${fa.x} ${fa.y} L ${fb.x} ${fb.y} L ${fc.x} ${fc.y} L ${fd.x} ${fd.y} Z`}
        fill="url(#iso-cmd-panel-fill)"
        stroke="url(#iso-cmd-stroke)"
        strokeWidth="0.7"
        strokeLinejoin="round"
      />

      {rows.map((r, i) => {
        if (r.kind === "input") {
          return (
            <g key={i}>
              <path
                d={strip(r.v, 0.22)}
                fill="rgba(99, 161, 255, 0.10)"
                stroke="url(#iso-cmd-stroke)"
                strokeWidth="0.45"
                strokeOpacity="0.8"
              />
              {(() => {
                const p = iso(-panelU + 0.55, r.v, panelZ);
                return (
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="1.6"
                    fill="none"
                    stroke="url(#iso-cmd-stroke)"
                    strokeWidth="0.55"
                  />
                );
              })()}

              {(() => {
                const p = iso(panelU - 0.55, r.v, panelZ);
                return (
                  <motion.rect
                    x={p.x - 0.55}
                    y={p.y - 2.2}
                    width="1.1"
                    height="4.4"
                    fill="#63A1FF"
                    animate={
                      reduced ? undefined : { opacity: [1, 0.25, 1] }
                    }
                    transition={{
                      duration: 1.05,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                );
              })()}
            </g>
          );
        }

        const isActive = r.kind === "item-active";
        return (
          <g key={i}>
            <path
              d={strip(r.v, 0.18)}
              fill={isActive ? "url(#iso-cmd-active-fill)" : "transparent"}
              stroke="url(#iso-cmd-stroke)"
              strokeWidth="0.4"
              strokeOpacity={isActive ? 0.95 : 0.5}
            />

            {(() => {
              const p = iso(-panelU + 0.45, r.v, panelZ);
              return (
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="1.0"
                  fill={isActive ? "#63A1FF" : "transparent"}
                  stroke="#143CA3"
                  strokeWidth="0.4"
                />
              );
            })()}

            {(() => {
              const p = iso(panelU - 0.7, r.v, panelZ);
              return (
                <rect
                  x={p.x - 4}
                  y={p.y - 1.8}
                  width="8"
                  height="3.6"
                  rx="0.6"
                  fill="rgba(20, 60, 163, 0.08)"
                  stroke="url(#iso-cmd-stroke)"
                  strokeWidth="0.32"
                  strokeOpacity={isActive ? 0.9 : 0.55}
                />
              );
            })()}
          </g>
        );
      })}

      {!reduced && (
        <motion.circle
          cx={iso(panelU + 0.6, -panelV - 0.2, panelZ + 0.6).x}
          cy={iso(panelU + 0.6, -panelV - 0.2, panelZ + 0.6).y}
          r="1.6"
          fill="#63A1FF"
          animate={{ opacity: [0.3, 0.9, 0.3], scale: [1, 1.3, 1] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
    </svg>
  );
}
