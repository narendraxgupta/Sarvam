import { motion } from "framer-motion";
import { useReducedMotion } from "@/lib/a11y/useReducedMotion";

export function IsoFlow() {
  const reduced = useReducedMotion();

  // Five source positions along the top, slightly staggered in y.
  const sources = [
    { x: 30, y: 28, label: "GPT" },
    { x: 64, y: 22, label: "CLAUDE" },
    { x: 100, y: 18, label: "LLAMA" },
    { x: 136, y: 22, label: "MIXTRAL" },
    { x: 170, y: 28, label: "GROK" },
  ];
  const target = { x: 100, y: 88 };

  return (
    <svg
      viewBox="0 0 200 120"
      className="absolute inset-0 w-full h-full text-ink-muted"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <defs>
        <linearGradient id="flow-line" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="rgb(var(--grad-1))" stopOpacity="0" />
          <stop offset="50%" stopColor="rgb(var(--grad-2))" stopOpacity="0.85" />
          <stop offset="100%" stopColor="rgb(var(--grad-3))" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="flow-target" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="rgb(var(--grad-1))" stopOpacity="0.7" />
          <stop offset="100%" stopColor="rgb(var(--grad-2))" stopOpacity="0" />
        </radialGradient>
      </defs>

      {sources.map((s, i) => {
        const cx = (s.x + target.x) / 2;
        const cy = target.y - 18;
        const d = `M ${s.x} ${s.y + 8} Q ${cx} ${cy} ${target.x} ${target.y - 8}`;
        return (
          <g key={i}>
            <path
              d={d}
              stroke="currentColor"
              strokeOpacity="0.22"
              strokeWidth="0.6"
              fill="none"
            />
            {!reduced && (
              <path
                d={d}
                stroke="url(#flow-line)"
                strokeWidth="1.4"
                fill="none"
                strokeDasharray="6 24"
                strokeLinecap="round"
              >
                <animate
                  attributeName="stroke-dashoffset"
                  from="0"
                  to="-60"
                  dur={`${3 + i * 0.4}s`}
                  repeatCount="indefinite"
                />
              </path>
            )}
          </g>
        );
      })}

      {sources.map((s, i) => (
        <g key={`s-${i}`} transform={`translate(${s.x} ${s.y})`}>
          <rect
            x={-12}
            y={-5}
            width={24}
            height={10}
            rx="2"
            fill="rgb(var(--bg-elevated))"
            stroke="currentColor"
            strokeWidth="0.5"
            strokeOpacity="0.45"
          />
          <text
            x={0}
            y={2.2}
            textAnchor="middle"
            fontSize="4.2"
            fill="currentColor"
            opacity="0.7"
            style={{
              fontFamily: '"IBM Plex Mono", monospace',
              fontWeight: 500,
            }}
          >
            {s.label}
          </text>
        </g>
      ))}

      <g transform={`translate(${target.x} ${target.y})`}>
        <circle r="14" fill="url(#flow-target)" />
        {!reduced && (
          <motion.circle
            r="9"
            fill="none"
            stroke="rgb(var(--accent) / 0.6)"
            strokeWidth="0.6"
            animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: "easeOut" }}
          />
        )}
        <circle
          r="5.6"
          fill="rgb(var(--accent))"
          stroke="rgb(var(--accent-ink))"
          strokeWidth="0.6"
        />
        <text
          y="1.6"
          textAnchor="middle"
          fontSize="3.4"
          fill="rgb(var(--accent-ink))"
          style={{
            fontFamily: '"IBM Plex Mono", monospace',
            fontWeight: 600,
            letterSpacing: "0.15em",
          }}
        >
          HELIX
        </text>
      </g>
    </svg>
  );
}
