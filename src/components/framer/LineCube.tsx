import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/lib/a11y/useReducedMotion";

export type LineCubeProps = {
  size?: number;
  spinY?: number;
  spinX?: number;
  shadow?: boolean;
  className?: string;
};

type V3 = { x: number; y: number; z: number };

const CUBE_VERTS: V3[] = [
  { x: -1, y: -1, z: -1 },
  { x: 1, y: -1, z: -1 },
  { x: 1, y: 1, z: -1 },
  { x: -1, y: 1, z: -1 },
  { x: -1, y: -1, z: 1 },
  { x: 1, y: -1, z: 1 },
  { x: 1, y: 1, z: 1 },
  { x: -1, y: 1, z: 1 },
];

const CUBE_EDGES: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 0],
  [4, 5], [5, 6], [6, 7], [7, 4],
  [0, 4], [1, 5], [2, 6], [3, 7],
];

export function LineCube({
  size = 220,
  spinY = 22,
  spinX = 8,
  shadow = true,
  className,
}: LineCubeProps) {
  const reduced = useReducedMotion();
  const [a, setA] = useState({ x: -0.42, y: 0.65 });
  const raf = useRef<number | null>(null);
  const last = useRef<number | null>(null);

  useEffect(() => {
    if (reduced) return;
    const step = (t: number) => {
      if (last.current == null) last.current = t;
      const dt = (t - last.current) / 1000;
      last.current = t;
      setA((p) => ({
        x: p.x + (spinX * Math.PI) / 180 * dt,
        y: p.y + (spinY * Math.PI) / 180 * dt,
      }));
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => {
      if (raf.current != null) cancelAnimationFrame(raf.current);
      raf.current = null;
      last.current = null;
    };
  }, [reduced, spinX, spinY]);

  const scale = size * 0.18;
  const camera = 320;
  const projected = CUBE_VERTS.map((v) => {
    const r1 = rotX(v, a.x);
    const r2 = rotY(r1, a.y);
    const pz = camera / (camera + r2.z * scale);
    return {
      x: r2.x * scale * pz,
      y: -r2.y * scale * pz,
      z: r2.z,
    };
  });

  const minZ = Math.min(...projected.map((p) => p.z));
  const maxZ = Math.max(...projected.map((p) => p.z));
  const norm = (z: number) =>
    maxZ === minZ ? 0.5 : (z - minZ) / (maxZ - minZ);

  const sorted = CUBE_EDGES.map((e) => ({
    e,
    z: (projected[e[0]].z + projected[e[1]].z) / 2,
  })).sort((p, q) => p.z - q.z);

  return (
    <div
      className={cn("relative", className)}
      style={{ width: size, height: size }}
    >
      {shadow && (
        <div
          aria-hidden
          className="absolute left-1/2 bottom-2 -translate-x-1/2 rounded-full pointer-events-none"
          style={{
            width: size * 0.6,
            height: size * 0.08,
            background:
              "radial-gradient(closest-side, rgb(var(--accent) / 0.35), transparent 75%)",
            filter: "blur(6px)",
          }}
        />
      )}
      <svg
        viewBox={`-${size / 2} -${size / 2} ${size} ${size}`}
        className="absolute inset-0 w-full h-full"
        aria-hidden
      >
        {sorted.map(({ e }, i) => {
          const A = projected[e[0]];
          const B = projected[e[1]];
          const t = (norm(A.z) + norm(B.z)) / 2;
          const stroke =
            t > 0.55 ? "rgb(var(--accent))" : "rgb(var(--ink))";
          return (
            <line
              key={i}
              x1={A.x}
              y1={A.y}
              x2={B.x}
              y2={B.y}
              stroke={stroke}
              strokeOpacity={0.2 + t * 0.7}
              strokeWidth={t > 0.55 ? 1.4 : 1}
              strokeLinecap="round"
            />
          );
        })}
        {projected.map((p, i) => {
          const t = norm(p.z);
          return (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={t > 0.55 ? 2.4 : 1.6}
              fill={t > 0.55 ? "rgb(var(--accent))" : "rgb(var(--ink))"}
              opacity={0.3 + t * 0.7}
            />
          );
        })}
      </svg>
    </div>
  );
}

function rotX(v: V3, a: number): V3 {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return { x: v.x, y: v.y * c - v.z * s, z: v.y * s + v.z * c };
}
function rotY(v: V3, a: number): V3 {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return { x: v.x * c + v.z * s, y: v.y, z: -v.x * s + v.z * c };
}
