import { motion } from "framer-motion";
import { useReducedMotion } from "@/lib/a11y/useReducedMotion";
import { MOD_LABEL } from "@/lib/keyboard/platform";

export function IsoKeyboard() {
  const reduced = useReducedMotion();

  const rows: string[][] = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["Z", "X", "C", "V", "B", "N", "M"],
  ];

  const KEY_W = 12;
  const KEY_H = 12;
  const GAP = 1.6;

  const accentKeys = new Set([`mod`, `K`]);

  return (
    <svg
      viewBox="0 0 200 110"
      className="absolute inset-0 w-full h-full text-ink-muted"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <defs>
        <radialGradient id="iso-kbd-glow" cx="0.5" cy="0.5" r="0.7">
          <stop offset="0%" stopColor="rgb(var(--accent))" stopOpacity="0.55" />
          <stop offset="100%" stopColor="rgb(var(--accent))" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect
        x="6"
        y="10"
        width="188"
        height="92"
        rx="6"
        fill="rgb(var(--bg-elevated))"
        stroke="currentColor"
        strokeWidth="0.6"
        strokeOpacity="0.35"
      />

      {rows.map((row, ri) => {
        const rowOffset = ri * 4; // staircase offset like a real keyboard
        const rowY = 16 + ri * (KEY_H + GAP);
        const totalRowW = row.length * KEY_W + (row.length - 1) * GAP;
        const startX = (200 - totalRowW) / 2 + rowOffset;
        return row.map((k, ki) => {
          const x = startX + ki * (KEY_W + GAP);
          const isAccent = accentKeys.has(k);
          return (
            <g key={`${ri}-${ki}`}>
              {isAccent && !reduced && (
                <motion.circle
                  cx={x + KEY_W / 2}
                  cy={rowY + KEY_H / 2}
                  r="18"
                  fill="url(#iso-kbd-glow)"
                  animate={{ opacity: [0.4, 0.9, 0.4] }}
                  transition={{
                    duration: 2.4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              )}
              <rect
                x={x}
                y={rowY}
                width={KEY_W}
                height={KEY_H}
                rx="1.5"
                fill={isAccent ? "rgb(var(--accent))" : "rgb(var(--bg-surface))"}
                stroke="currentColor"
                strokeWidth="0.45"
                strokeOpacity={isAccent ? 0.9 : 0.45}
              />
              <text
                x={x + KEY_W / 2}
                y={rowY + KEY_H / 2 + 2.5}
                fontSize="5"
                textAnchor="middle"
                fill={isAccent ? "rgb(var(--accent-ink))" : "currentColor"}
                fillOpacity={isAccent ? 1 : 0.7}
                style={{
                  fontFamily: '"IBM Plex Mono", monospace',
                  fontWeight: 500,
                }}
              >
                {k}
              </text>
            </g>
          );
        });
      })}

      {(() => {
        const rowY = 16 + 3 * (KEY_H + GAP) + 2;
        const modX = 36;
        const spaceX = modX + KEY_W * 1.4 + GAP;
        const spaceW = 80;
        return (
          <g>
            {!reduced && (
              <motion.circle
                cx={modX + (KEY_W * 1.4) / 2}
                cy={rowY + KEY_H / 2}
                r="22"
                fill="url(#iso-kbd-glow)"
                animate={{ opacity: [0.4, 0.95, 0.4] }}
                transition={{
                  duration: 2.4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.3,
                }}
              />
            )}
            <rect
              x={modX}
              y={rowY}
              width={KEY_W * 1.4}
              height={KEY_H}
              rx="1.5"
              fill="rgb(var(--accent))"
              stroke="currentColor"
              strokeWidth="0.45"
              strokeOpacity="0.9"
            />
            <text
              x={modX + (KEY_W * 1.4) / 2}
              y={rowY + KEY_H / 2 + 2.5}
              fontSize="4.2"
              textAnchor="middle"
              fill="rgb(var(--accent-ink))"
              style={{
                fontFamily: '"IBM Plex Mono", monospace',
                fontWeight: 600,
              }}
            >
              {MOD_LABEL}
            </text>

            <rect
              x={spaceX}
              y={rowY}
              width={spaceW}
              height={KEY_H}
              rx="1.5"
              fill="rgb(var(--bg-surface))"
              stroke="currentColor"
              strokeWidth="0.45"
              strokeOpacity="0.45"
            />
          </g>
        );
      })()}
    </svg>
  );
}
