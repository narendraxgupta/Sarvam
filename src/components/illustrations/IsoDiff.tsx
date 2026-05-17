import { useReducedMotion } from "@/lib/a11y/useReducedMotion";
import { motion } from "framer-motion";

export function IsoDiff() {
  const reduced = useReducedMotion();

  // Iso helper — same projection as IsoStream so the figs feel related.
  const iso = (x: number, y: number, z: number = 0) => ({
    x: 80 + (x - y) * 16,
    y: 60 + (x + y) * 8 - z * 10,
  });

  // Build one panel as a unit cube extruded along z.
  const panel = (offsetX: number, accentRows: number[]) => {
    const rows = [0, 1, 2, 3, 4];
    return (
      <g transform={`translate(${offsetX} 0)`}>
        {(() => {
          const a = iso(-2, -3, 0);
          const b = iso(2, -3, 0);
          const c = iso(2, 3, 0);
          const d = iso(-2, 3, 0);
          return (
            <path
              d={`M ${a.x} ${a.y} L ${b.x} ${b.y} L ${c.x} ${c.y} L ${d.x} ${d.y} Z`}
              fill="rgb(var(--bg-surface))"
              stroke="currentColor"
              strokeWidth="0.6"
              strokeLinejoin="round"
            />
          );
        })()}

        {rows.map((row) => {
          const yOff = -2.4 + row * 1.2;
          const a = iso(-1.6, yOff, 0);
          const b = iso(1.6, yOff, 0);
          const isAccent = accentRows.includes(row);
          return (
            <g key={row}>
              <line
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke={
                  isAccent ? "rgb(var(--accent))" : "currentColor"
                }
                strokeWidth={isAccent ? 1.6 : 0.5}
                strokeOpacity={isAccent ? 0.95 : 0.45}
                strokeLinecap="round"
              />
            </g>
          );
        })}

        {(() => {
          const c = iso(2, 3, 0);
          const d = iso(-2, 3, 0);
          const cDn = iso(2, 3, -2);
          const dDn = iso(-2, 3, -2);
          return (
            <path
              d={`M ${d.x} ${d.y} L ${c.x} ${c.y} L ${cDn.x} ${cDn.y} L ${dDn.x} ${dDn.y} Z`}
              fill="rgb(var(--ink) / 0.06)"
              stroke="currentColor"
              strokeWidth="0.6"
              strokeLinejoin="round"
            />
          );
        })()}
        {(() => {
          const b = iso(2, -3, 0);
          const c = iso(2, 3, 0);
          const bDn = iso(2, -3, -2);
          const cDn = iso(2, 3, -2);
          return (
            <path
              d={`M ${b.x} ${b.y} L ${c.x} ${c.y} L ${cDn.x} ${cDn.y} L ${bDn.x} ${bDn.y} Z`}
              fill="rgb(var(--ink) / 0.10)"
              stroke="currentColor"
              strokeWidth="0.6"
              strokeLinejoin="round"
            />
          );
        })()}
      </g>
    );
  };

  // Connector path that arcs between the two panels at row=1.
  const cFrom = iso(2, -1, 0);
  const cTo = { x: 80 + 36 + (- 2 - -1) * 16, y: 60 + (-2 + -1) * 8 };
  void cTo;

  return (
    <svg
      viewBox="0 0 160 120"
      className="absolute inset-0 w-full h-full text-ink-muted"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      {panel(-36, [1, 3])}
      {panel(36, [1, 2])}

      <motion.g
        animate={reduced ? undefined : { opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
      >
        <line
          x1={cFrom.x - 36 + 6}
          y1={cFrom.y}
          x2={cFrom.x + 36 - 6}
          y2={cFrom.y}
          stroke="rgb(var(--accent))"
          strokeWidth="0.8"
          strokeDasharray="2 2"
        />
        <polygon
          points={`${cFrom.x + 36 - 6},${cFrom.y} ${cFrom.x + 36 - 9},${cFrom.y - 2} ${cFrom.x + 36 - 9},${cFrom.y + 2}`}
          fill="rgb(var(--accent))"
        />
      </motion.g>

      <text
        x={iso(0, 4, 0).x - 36}
        y={iso(0, 4, 0).y + 8}
        fontSize="4"
        textAnchor="middle"
        fill="currentColor"
        opacity="0.55"
        style={{ fontFamily: '"IBM Plex Mono", monospace' }}
      >
        A
      </text>
      <text
        x={iso(0, 4, 0).x + 36}
        y={iso(0, 4, 0).y + 8}
        fontSize="4"
        textAnchor="middle"
        fill="currentColor"
        opacity="0.55"
        style={{ fontFamily: '"IBM Plex Mono", monospace' }}
      >
        B
      </text>
    </svg>
  );
}
