import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/lib/a11y/useReducedMotion";

export type WireframeShape = "icosahedron" | "octahedron" | "torus";

export type WireframeModelProps = {
  shape?: WireframeShape;
  size?: number;
  spinY?: number;
  spinX?: number;
  vertices?: boolean;
  caption?: string;
  className?: string;
};

type V3 = { x: number; y: number; z: number };
type Edge = [number, number];

export function WireframeModel({
  shape = "icosahedron",
  size = 320,
  spinY = 18,
  spinX = 6,
  vertices = true,
  caption = "model.obj · wireframe",
  className,
}: WireframeModelProps) {
  const reduced = useReducedMotion();
  const [angle, setAngle] = useState({ x: 0.2, y: 0.4 });
  const raf = useRef<number | null>(null);
  const last = useRef<number | null>(null);

  useEffect(() => {
    if (reduced) return;
    const step = (t: number) => {
      if (last.current == null) last.current = t;
      const dt = (t - last.current) / 1000;
      last.current = t;
      setAngle((a) => ({
        x: a.x + (spinX * Math.PI) / 180 * dt,
        y: a.y + (spinY * Math.PI) / 180 * dt,
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

  const mesh = MESHES[shape];
  const scale = 38;
  const camera = 220;

  const projected = mesh.vertices.map((v) => {
    const rx = rotateX(v, angle.x);
    const ry = rotateY(rx, angle.y);
    const z = ry.z + 4;
    const pz = camera / (camera + z * scale * 0.6);
    return {
      x: ry.x * scale * pz,
      y: -ry.y * scale * pz,
      z: ry.z,
    };
  });

  const minZ = Math.min(...projected.map((p) => p.z));
  const maxZ = Math.max(...projected.map((p) => p.z));
  const norm = (z: number) =>
    maxZ === minZ ? 0.5 : (z - minZ) / (maxZ - minZ);

  // Depth-sort edges by midpoint Z so back edges render first.
  const sortedEdges = mesh.edges
    .map((e) => ({
      e,
      midZ: (projected[e[0]].z + projected[e[1]].z) / 2,
    }))
    .sort((a, b) => a.midZ - b.midZ);

  return (
    <div
      className={cn("relative rounded-md hx-hairline-card overflow-hidden", className)}
      style={{ width: size, height: size }}
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(60% 50% at 70% 30%, rgb(var(--grad-2) / 0.18), transparent 65%), radial-gradient(50% 50% at 20% 80%, rgb(var(--grad-4) / 0.15), transparent 65%)",
        }}
      />

      <svg
        viewBox={`-${size / 2} -${size / 2} ${size} ${size}`}
        className="absolute inset-0 w-full h-full"
        role="img"
        aria-label={`Wireframe ${shape}`}
      >
        {sortedEdges.map(({ e }, i) => {
          const a = projected[e[0]];
          const b = projected[e[1]];
          const t = (norm(a.z) + norm(b.z)) / 2;
          const stroke = t > 0.55 ? "rgb(var(--accent))" : "rgb(var(--ink))";
          const opacity = 0.18 + t * 0.7;
          return (
            <line
              key={i}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke={stroke}
              strokeOpacity={opacity}
              strokeWidth={t > 0.55 ? 0.8 : 0.6}
              strokeLinecap="round"
            />
          );
        })}

        {vertices &&
          projected.map((p, i) => {
            const t = norm(p.z);
            return (
              <circle
                key={i}
                cx={p.x}
                cy={p.y}
                r={t > 0.55 ? 1.4 : 0.9}
                fill={
                  t > 0.55 ? "rgb(var(--accent))" : "rgb(var(--ink) / 0.6)"
                }
                opacity={0.25 + t * 0.75}
              />
            );
          })}
      </svg>

      <div className="absolute top-2 left-2 hx-mono-tab text-[10px] uppercase tracking-[0.2em] text-ink-subtle">
        FIG_3D · {shape}
      </div>
      <div className="absolute top-2 right-2 hx-mono-tab text-[10px] uppercase tracking-[0.2em] text-ink-subtle">
        v{mesh.vertices.length} · e{mesh.edges.length}
      </div>
      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between hx-mono-tab text-[10px] uppercase tracking-[0.16em] text-ink-dim">
        <span>{caption}</span>
        <span>
          rx {(((angle.x * 180) / Math.PI) % 360).toFixed(0).padStart(3, "0")}°
          · ry {(((angle.y * 180) / Math.PI) % 360).toFixed(0).padStart(3, "0")}°
        </span>
      </div>
    </div>
  );
}

function rotateX(v: V3, a: number): V3 {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return { x: v.x, y: v.y * c - v.z * s, z: v.y * s + v.z * c };
}

function rotateY(v: V3, a: number): V3 {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return { x: v.x * c + v.z * s, y: v.y, z: -v.x * s + v.z * c };
}

const PHI = (1 + Math.sqrt(5)) / 2;

const ICOSAHEDRON_VERTICES: V3[] = [
  { x: -1, y: PHI, z: 0 },
  { x: 1, y: PHI, z: 0 },
  { x: -1, y: -PHI, z: 0 },
  { x: 1, y: -PHI, z: 0 },
  { x: 0, y: -1, z: PHI },
  { x: 0, y: 1, z: PHI },
  { x: 0, y: -1, z: -PHI },
  { x: 0, y: 1, z: -PHI },
  { x: PHI, y: 0, z: -1 },
  { x: PHI, y: 0, z: 1 },
  { x: -PHI, y: 0, z: -1 },
  { x: -PHI, y: 0, z: 1 },
].map((v) => normalize(v, 1.05));

const ICOSAHEDRON_EDGES: Edge[] = [
  [0, 11],
  [0, 5],
  [0, 1],
  [0, 7],
  [0, 10],
  [1, 5],
  [5, 11],
  [11, 10],
  [10, 7],
  [7, 1],
  [3, 9],
  [3, 4],
  [3, 2],
  [3, 6],
  [3, 8],
  [4, 9],
  [9, 8],
  [8, 6],
  [6, 2],
  [2, 4],
  [5, 4],
  [11, 2],
  [10, 6],
  [7, 8],
  [1, 9],
  [4, 11],
  [2, 10],
  [6, 7],
  [8, 1],
  [9, 5],
];

const OCT_VERTS: V3[] = [
  { x: 1, y: 0, z: 0 },
  { x: -1, y: 0, z: 0 },
  { x: 0, y: 1, z: 0 },
  { x: 0, y: -1, z: 0 },
  { x: 0, y: 0, z: 1 },
  { x: 0, y: 0, z: -1 },
].map((v) => normalize(v, 1.1));

const OCT_EDGES: Edge[] = [
  [0, 2],
  [0, 3],
  [0, 4],
  [0, 5],
  [1, 2],
  [1, 3],
  [1, 4],
  [1, 5],
  [2, 4],
  [2, 5],
  [3, 4],
  [3, 5],
];

const TORUS = buildTorus(14, 8, 0.8, 0.32);

const MESHES: Record<WireframeShape, { vertices: V3[]; edges: Edge[] }> = {
  icosahedron: { vertices: ICOSAHEDRON_VERTICES, edges: ICOSAHEDRON_EDGES },
  octahedron: { vertices: OCT_VERTS, edges: OCT_EDGES },
  torus: TORUS,
};

function normalize(v: V3, target = 1): V3 {
  const len = Math.hypot(v.x, v.y, v.z) || 1;
  return { x: (v.x / len) * target, y: (v.y / len) * target, z: (v.z / len) * target };
}

function buildTorus(
  segments: number,
  rings: number,
  major: number,
  minor: number,
): { vertices: V3[]; edges: Edge[] } {
  const verts: V3[] = [];
  for (let i = 0; i < segments; i++) {
    const u = (i / segments) * Math.PI * 2;
    for (let j = 0; j < rings; j++) {
      const w = (j / rings) * Math.PI * 2;
      verts.push({
        x: (major + minor * Math.cos(w)) * Math.cos(u),
        y: minor * Math.sin(w),
        z: (major + minor * Math.cos(w)) * Math.sin(u),
      });
    }
  }
  const edges: Edge[] = [];
  for (let i = 0; i < segments; i++) {
    for (let j = 0; j < rings; j++) {
      const a = i * rings + j;
      const b = i * rings + ((j + 1) % rings);
      const c = ((i + 1) % segments) * rings + j;
      edges.push([a, b]);
      edges.push([a, c]);
    }
  }
  return { vertices: verts, edges };
}
