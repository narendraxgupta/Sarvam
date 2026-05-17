import { motion } from "framer-motion";
import { useReducedMotion } from "@/lib/a11y/useReducedMotion";

export function IsoTokenPipe() {
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

  const pipeStart = { u: -2.4, v: 2.4 };
  const pipeEnd = { u: 2.4, v: -2.4 };

  const railA = {
    a: iso(pipeStart.u - 0.35, pipeStart.v - 0.35, 0.4),
    b: iso(pipeEnd.u - 0.35, pipeEnd.v - 0.35, 0.4),
  };
  const railB = {
    a: iso(pipeStart.u + 0.35, pipeStart.v + 0.35, 0.4),
    b: iso(pipeEnd.u + 0.35, pipeEnd.v + 0.35, 0.4),
  };

  const rungs = [0.12, 0.32, 0.52, 0.72, 0.92];

  const cards = [
    { t: 0.08, size: 0.38, label: "tok" },
    { t: 0.30, size: 0.44, label: "tok" },
    { t: 0.52, size: 0.50, label: "tok" },
    { t: 0.74, size: 0.56, label: "tok" },
  ];

  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

  return (
    <svg
      viewBox="0 0 160 120"
      className="absolute inset-0 w-full h-full"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <defs>
        <linearGradient id="iso-pipe-stroke" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#143CA3" />
          <stop offset="100%" stopColor="#63A1FF" />
        </linearGradient>
        <linearGradient id="iso-pipe-card-fill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#63A1FF" stopOpacity="0.20" />
          <stop offset="100%" stopColor="#143CA3" stopOpacity="0.04" />
        </linearGradient>
        <linearGradient id="iso-pipe-flow" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#63A1FF" stopOpacity="0" />
          <stop offset="50%" stopColor="#63A1FF" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#63A1FF" stopOpacity="0" />
        </linearGradient>
      </defs>

      <line
        x1={railA.a.x}
        y1={railA.a.y}
        x2={railA.b.x}
        y2={railA.b.y}
        stroke="url(#iso-pipe-stroke)"
        strokeWidth="0.6"
        strokeLinecap="round"
      />
      <line
        x1={railB.a.x}
        y1={railB.a.y}
        x2={railB.b.x}
        y2={railB.b.y}
        stroke="url(#iso-pipe-stroke)"
        strokeWidth="0.6"
        strokeLinecap="round"
      />

      {rungs.map((t, i) => {
        const u = lerp(pipeStart.u, pipeEnd.u, t);
        const v = lerp(pipeStart.v, pipeEnd.v, t);
        const p1 = iso(u - 0.35, v - 0.35, 0.4);
        const p2 = iso(u + 0.35, v + 0.35, 0.4);
        return (
          <line
            key={i}
            x1={p1.x}
            y1={p1.y}
            x2={p2.x}
            y2={p2.y}
            stroke="url(#iso-pipe-stroke)"
            strokeWidth="0.32"
            strokeOpacity="0.55"
          />
        );
      })}

      {cards.map((card, i) => {
        const u = lerp(pipeStart.u, pipeEnd.u, card.t);
        const v = lerp(pipeStart.v, pipeEnd.v, card.t);
        const s = card.size;
        const a = iso(u - s, v - s, 1.0);
        const b = iso(u + s, v - s, 1.0);
        const c = iso(u + s, v + s, 1.0);
        const d = iso(u - s, v + s, 1.0);

        const lift = reduced
          ? 0
          : Math.sin((i / cards.length) * Math.PI * 2) * 0.6;

        return (
          <motion.g
            key={i}
            initial={reduced ? false : { y: 0 }}
            animate={
              reduced
                ? undefined
                : { y: [lift, -lift, lift] }
            }
            transition={{
              duration: 3.6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.4,
            }}
          >
            <path
              d={`M ${a.x} ${a.y} L ${b.x} ${b.y} L ${c.x} ${c.y} L ${d.x} ${d.y} Z`}
              fill="url(#iso-pipe-card-fill)"
              stroke="url(#iso-pipe-stroke)"
              strokeWidth="0.55"
              strokeLinejoin="round"
            />

            <text
              x={iso(u, v, 1.0).x}
              y={iso(u, v, 1.0).y + 1.4}
              textAnchor="middle"
              fontSize="3.4"
              fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
              fill="#143CA3"
              fillOpacity="0.85"
              letterSpacing="0.4"
            >
              {card.label}
            </text>
          </motion.g>
        );
      })}

      {!reduced && (
        <motion.line
          x1={iso(pipeStart.u, pipeStart.v, 0.4).x}
          y1={iso(pipeStart.u, pipeStart.v, 0.4).y}
          x2={iso(pipeEnd.u, pipeEnd.v, 0.4).x}
          y2={iso(pipeEnd.u, pipeEnd.v, 0.4).y}
          stroke="url(#iso-pipe-flow)"
          strokeWidth="1.8"
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      <motion.rect
        x={iso(pipeEnd.u, pipeEnd.v, 0.4).x - 0.9}
        y={iso(pipeEnd.u, pipeEnd.v, 0.4).y - 3}
        width="1.8"
        height="6"
        fill="#63A1FF"
        animate={reduced ? undefined : { opacity: [1, 0.25, 1] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
      />
    </svg>
  );
}
