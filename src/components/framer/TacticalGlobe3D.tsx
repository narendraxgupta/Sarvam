import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/lib/a11y/useReducedMotion";

export type GlobeMarker = {
  id: string;
  lat: number;
  lon: number;
  label?: string;
  status?: "healthy" | "degraded" | "down";
};

export type TacticalGlobe3DProps = {
  markers?: GlobeMarker[];
  size?: number;
  rotationSpeed?: number;
  showGrid?: boolean;
  showSweep?: boolean;
  showLabels?: boolean;
  className?: string;
};

const DEFAULT_MARKERS: GlobeMarker[] = [
  { id: "sfo", lat: 37.77, lon: -122.42, label: "SFO", status: "healthy" },
  { id: "iad", lat: 38.94, lon: -77.45, label: "IAD", status: "healthy" },
  { id: "lhr", lat: 51.47, lon: -0.45, label: "LHR", status: "healthy" },
  { id: "fra", lat: 50.04, lon: 8.56, label: "FRA", status: "degraded" },
  { id: "bom", lat: 19.1, lon: 72.88, label: "BOM", status: "healthy" },
  { id: "sin", lat: 1.36, lon: 103.99, label: "SIN", status: "healthy" },
  { id: "nrt", lat: 35.77, lon: 140.39, label: "NRT", status: "healthy" },
  { id: "syd", lat: -33.94, lon: 151.18, label: "SYD", status: "healthy" },
  { id: "gru", lat: -23.43, lon: -46.48, label: "GRU", status: "down" },
];

function toCartesian(lat: number, lon: number, r: number) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return {
    x: -r * Math.sin(phi) * Math.cos(theta),
    y: r * Math.cos(phi),
    z: r * Math.sin(phi) * Math.sin(theta),
  };
}

function rotateY({ x, y, z }: { x: number; y: number; z: number }, a: number) {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return { x: x * c + z * s, y, z: -x * s + z * c };
}

function rotateX({ x, y, z }: { x: number; y: number; z: number }, a: number) {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return { x, y: y * c - z * s, z: y * s + z * c };
}

export function TacticalGlobe3D({
  markers = DEFAULT_MARKERS,
  size = 360,
  rotationSpeed = 12,
  showGrid = true,
  showSweep = true,
  showLabels = true,
  className,
}: TacticalGlobe3DProps) {
  const reduced = useReducedMotion();
  const [angle, setAngle] = useState(reduced ? 0.6 : 0);
  const raf = useRef<number | null>(null);
  const last = useRef<number | null>(null);

  useEffect(() => {
    if (reduced) return;
    const step = (t: number) => {
      if (last.current == null) last.current = t;
      const dt = (t - last.current) / 1000;
      last.current = t;
      setAngle((a) => a + (rotationSpeed * Math.PI) / 180 * dt);
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => {
      if (raf.current != null) cancelAnimationFrame(raf.current);
      raf.current = null;
      last.current = null;
    };
  }, [reduced, rotationSpeed]);

  // Camera: tilt the globe slightly forward.
  const tilt = -0.32;
  const r = 100;

  // Build latitude rings (5 between -60..60).
  const latRings = [-60, -30, 0, 30, 60];
  // Meridians every 30°.
  const meridians = Array.from({ length: 12 }, (_, i) => (i * 30) * (Math.PI / 180));

  // Sample meridians as line strips.
  const meridianPaths = meridians.map((lonRad) => {
    const pts: { x: number; y: number; visible: boolean }[] = [];
    for (let lat = -90; lat <= 90; lat += 6) {
      const p0 = toCartesian(lat, (lonRad * 180) / Math.PI - 180, r);
      const p1 = rotateY(p0, angle);
      const p2 = rotateX(p1, tilt);
      pts.push({ x: p2.x, y: -p2.y, visible: p2.z >= -8 });
    }
    return pts;
  });

  const latPaths = latRings.map((lat) => {
    const pts: { x: number; y: number; visible: boolean }[] = [];
    for (let lon = -180; lon <= 180; lon += 6) {
      const p0 = toCartesian(lat, lon, r);
      const p1 = rotateY(p0, angle);
      const p2 = rotateX(p1, tilt);
      pts.push({ x: p2.x, y: -p2.y, visible: p2.z >= -8 });
    }
    return pts;
  });

  const projectedMarkers = markers.map((m) => {
    const p0 = toCartesian(m.lat, m.lon, r);
    const p1 = rotateY(p0, angle);
    const p2 = rotateX(p1, tilt);
    return { m, x: p2.x, y: -p2.y, z: p2.z, front: p2.z >= 0 };
  });

  const view = size;

  return (
    <div
      className={cn("relative", className)}
      style={{ width: view, height: view }}
    >
      <div
        aria-hidden
        className="absolute inset-0 rounded-full opacity-70"
        style={{
          background:
            "radial-gradient(closest-side, rgb(var(--grad-2) / 0.30), rgb(var(--grad-3) / 0.15) 50%, transparent 75%)",
          filter: "blur(18px)",
        }}
      />

      <svg
        viewBox={`-${r * 1.25} -${r * 1.25} ${r * 2.5} ${r * 2.5}`}
        className="absolute inset-0 w-full h-full"
        role="img"
        aria-label="Inference fleet — global topology"
      >
        <defs>
          <radialGradient id="globe-surface" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgb(var(--bg-elevated))" stopOpacity="0.55" />
            <stop offset="70%" stopColor="rgb(var(--bg-sunken))" stopOpacity="0.4" />
            <stop offset="100%" stopColor="rgb(var(--bg-sunken))" stopOpacity="0.1" />
          </radialGradient>
          <linearGradient id="globe-rim" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(var(--grad-1) / 0.8)" />
            <stop offset="100%" stopColor="rgb(var(--grad-3) / 0.6)" />
          </linearGradient>
        </defs>

        <circle cx={0} cy={0} r={r} fill="url(#globe-surface)" />

        <circle
          cx={0}
          cy={0}
          r={r}
          fill="none"
          stroke="url(#globe-rim)"
          strokeWidth={0.6}
        />

        {showGrid && (
          <g>
            {latPaths.map((pts, i) => (
              <polyline
                key={`lat-${i}`}
                fill="none"
                stroke="rgb(var(--ink) / 0.14)"
                strokeWidth={0.35}
                points={pts
                  .map((p) => (p.visible ? `${p.x},${p.y}` : ""))
                  .filter(Boolean)
                  .join(" ")}
              />
            ))}
            {meridianPaths.map((pts, i) => (
              <polyline
                key={`mer-${i}`}
                fill="none"
                stroke="rgb(var(--ink) / 0.12)"
                strokeWidth={0.32}
                points={pts
                  .map((p) => (p.visible ? `${p.x},${p.y}` : ""))
                  .filter(Boolean)
                  .join(" ")}
              />
            ))}
          </g>
        )}

        {showSweep && !reduced && (
          <g>
            <path
              d={equatorArcPath(r, angle)}
              fill="none"
              stroke="rgb(var(--accent) / 0.7)"
              strokeWidth={0.7}
              strokeLinecap="round"
            />
          </g>
        )}

        <g>
          {projectedMarkers.map(({ m, x, y, z, front }) => {
            const opacity = front ? 1 : 0.18;
            const color =
              m.status === "down"
                ? "rgb(var(--danger))"
                : m.status === "degraded"
                ? "rgb(var(--warn))"
                : "rgb(var(--accent))";
            return (
              <g key={m.id} style={{ opacity }}>
                {front && (
                  <circle
                    cx={x}
                    cy={y}
                    r={3.2}
                    fill="none"
                    stroke={color}
                    strokeOpacity={0.4}
                    strokeWidth={0.5}
                  >
                    {!reduced && (
                      <animate
                        attributeName="r"
                        values="1.6;5;1.6"
                        dur="2.4s"
                        repeatCount="indefinite"
                      />
                    )}
                    {!reduced && (
                      <animate
                        attributeName="stroke-opacity"
                        values="0.6;0;0.6"
                        dur="2.4s"
                        repeatCount="indefinite"
                      />
                    )}
                  </circle>
                )}
                <circle cx={x} cy={y} r={front ? 1.6 : 1.1} fill={color} />
                {showLabels && front && m.label && (
                  <text
                    x={x + 3.5}
                    y={y - 1.5}
                    fontSize={3.2}
                    fill="rgb(var(--ink))"
                    fillOpacity={0.85}
                    style={{ fontFamily: '"IBM Plex Mono", monospace' }}
                  >
                    {m.label}
                  </text>
                )}

                {front && (
                  <line
                    x1={x}
                    y1={y + 1.4}
                    x2={x}
                    y2={y + 2.4 + (1 - z / r) * 1.2}
                    stroke={color}
                    strokeOpacity={0.5}
                    strokeWidth={0.35}
                  />
                )}
              </g>
            );
          })}
        </g>

        <g stroke="rgb(var(--ink) / 0.25)" strokeWidth={0.3}>
          <line x1={-r * 1.18} y1={0} x2={-r - 4} y2={0} />
          <line x1={r + 4} y1={0} x2={r * 1.18} y2={0} />
          <line x1={0} y1={-r * 1.18} x2={0} y2={-r - 4} />
          <line x1={0} y1={r + 4} x2={0} y2={r * 1.18} />
        </g>
      </svg>

      <div className="absolute top-0 left-0 hx-mono-tab text-[10px] uppercase tracking-[0.2em] text-ink-subtle">
        FIG_GLOBE · {Math.round((angle * 180) / Math.PI) % 360}°
      </div>
      <div className="absolute bottom-0 right-0 hx-mono-tab text-[10px] uppercase tracking-[0.2em] text-ink-subtle">
        {markers.length} node{markers.length === 1 ? "" : "s"}
      </div>
    </div>
  );
}

function equatorArcPath(r: number, angle: number) {
  const SLICE = (60 * Math.PI) / 180;
  const steps = 24;
  const pts: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const a = angle + (i / steps) * SLICE - SLICE / 2;
    const x = Math.sin(a) * r * 0.98;
    const z = Math.cos(a) * r * 0.98;
    if (z < 0) continue;
    pts.push(`${x},0`);
  }
  if (pts.length < 2) return "";
  return `M ${pts[0]} L ${pts.slice(1).join(" L ")}`;
}
