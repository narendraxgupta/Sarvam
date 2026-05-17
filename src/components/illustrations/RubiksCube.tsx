import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { motion, useMotionValue, useSpring, animate } from "framer-motion";
import { useReducedMotion } from "@/lib/a11y/useReducedMotion";
import { cn } from "@/lib/utils";

interface RubiksCubeProps {
  size?: number;
  className?: string;
  glow?: boolean;
  paused?: boolean;
  interactive?: boolean;
  hint?: boolean;
}

type StickerKind = "white" | "yellow" | "red" | "orange" | "green" | "blue";

type Palette = StickerKind[];

const ALL = (kind: StickerKind, centre: StickerKind = kind): Palette => [
  kind, kind, kind,
  kind, centre, kind,
  kind, kind, kind,
];

interface FaceSpec {
  id: string;
  transformOf: (half: number) => string;
  palette: Palette;
}

const FACE_SPECS: FaceSpec[] = [
  { id: "front",  transformOf: (h) => `translateZ(${h}px)`,                   palette: ALL("green")  },
  { id: "back",   transformOf: (h) => `rotateY(180deg) translateZ(${h}px)`,   palette: ALL("blue")   },
  { id: "right",  transformOf: (h) => `rotateY(90deg) translateZ(${h}px)`,    palette: ALL("red")    },
  { id: "left",   transformOf: (h) => `rotateY(-90deg) translateZ(${h}px)`,   palette: ALL("orange") },
  { id: "top",    transformOf: (h) => `rotateX(90deg) translateZ(${h}px)`,    palette: ALL("white")  },
  { id: "bottom", transformOf: (h) => `rotateX(-90deg) translateZ(${h}px)`,   palette: ALL("yellow") },
];

const STICKER_BG: Record<StickerKind, string> = {
  white:
    "linear-gradient(180deg, rgb(255 255 255) 0%, rgb(240 240 236) 55%, rgb(212 212 208) 100%)",
  yellow:
    "linear-gradient(180deg, rgb(255 224 80) 0%, rgb(248 206 40) 55%, rgb(214 170 18) 100%)",
  red:
    "linear-gradient(180deg, rgb(244 86 74) 0%, rgb(220 54 48) 55%, rgb(176 28 28) 100%)",
  orange:
    "linear-gradient(180deg, rgb(255 158 56) 0%, rgb(238 128 30) 55%, rgb(202 92 14) 100%)",
  green:
    "linear-gradient(180deg, rgb(82 196 112) 0%, rgb(46 162 82) 55%, rgb(22 124 58) 100%)",
  blue:
    "linear-gradient(180deg, rgb(72 124 232) 0%, rgb(40 96 212) 55%, rgb(22 70 176) 100%)",
};

export function RubiksCube({
  size = 280,
  className,
  glow = true,
  paused = false,
  interactive = true,
  hint = true,
}: RubiksCubeProps) {
  const reduced = useReducedMotion();
  const edge = Math.round(size * 0.6);
  const half = edge / 2;
  const tile = edge / 3;

  const rx = useMotionValue(-24);
  const ry = useMotionValue(36);
  const sRx = useSpring(rx, { stiffness: 90, damping: 18, mass: 0.7 });
  const sRy = useSpring(ry, { stiffness: 90, damping: 18, mass: 0.7 });

  const draggingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const dragDistRef = useRef(0);
  const lockUntilRef = useRef(0);
  const [grabbing, setGrabbing] = useState(false);

  useEffect(() => {
    if (reduced || paused) return;
    let raf = 0;
    let last = performance.now();
    const tick = (t: number) => {
      const dt = (t - last) / 1000;
      last = t;
      if (!draggingRef.current && t > lockUntilRef.current) {
        ry.set(ry.get() + dt * 14);
        const targetX = -24 + Math.sin(t / 1800) * 4;
        const curX = rx.get();
        rx.set(curX + (targetX - curX) * 0.04);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduced, paused, rx, ry]);

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!interactive || reduced) return;
    draggingRef.current = true;
    dragDistRef.current = 0;
    lastPointRef.current = { x: e.clientX, y: e.clientY };
    setGrabbing(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current || !lastPointRef.current) return;
    const dx = e.clientX - lastPointRef.current.x;
    const dy = e.clientY - lastPointRef.current.y;
    lastPointRef.current = { x: e.clientX, y: e.clientY };
    dragDistRef.current += Math.abs(dx) + Math.abs(dy);
    ry.set(ry.get() + dx * 0.55);
    const nextX = rx.get() - dy * 0.55;
    rx.set(Math.max(-85, Math.min(85, nextX)));
  };

  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    lastPointRef.current = null;
    setGrabbing(false);
    lockUntilRef.current = performance.now() + 1400;
    if ((e.currentTarget as HTMLElement).hasPointerCapture(e.pointerId)) {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    }
  };

  const onCubeClick = () => {
    if (!interactive || reduced) return;
    if (dragDistRef.current > 6) return;

    const curY = ry.get();
    const curX = rx.get();
    const spinY = (Math.random() > 0.5 ? 1 : -1) * (90 + Math.floor(Math.random() * 2) * 90);
    const spinX = (Math.random() > 0.5 ? 1 : -1) * (Math.random() > 0.6 ? 15 : 0);

    lockUntilRef.current = performance.now() + 1400;

    animate(ry, curY + spinY, {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1],
    });
    if (spinX !== 0) {
      animate(rx, Math.max(-85, Math.min(85, curX + spinX)), {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1],
      });
    }
  };

  return (
    <div
      className={cn(
        "relative grid place-items-center select-none",
        className,
      )}
      style={{ width: size, height: size, perspective: size * 4 }}
    >
      {glow && (
        <>
          <div
            aria-hidden
            className={cn(
              "absolute inset-[8%] rounded-full bg-grad-aurora blur-3xl opacity-60",
              !reduced && "animate-aurora",
            )}
            style={{ mixBlendMode: "screen" }}
          />
          <div
            aria-hidden
            className="absolute inset-[18%] rounded-full"
            style={{
              background:
                "radial-gradient(closest-side, rgb(var(--grad-2) / 0.45), rgb(var(--grad-3) / 0.18) 55%, transparent 75%)",
              filter: "blur(10px)",
            }}
          />
        </>
      )}

      <motion.div
        className="relative"
        role={interactive ? "slider" : undefined}
        aria-label={interactive ? "Rubik's cube — drag to rotate, click to spin" : undefined}
        style={{
          width: edge,
          height: edge,
          transformStyle: "preserve-3d",
          rotateX: sRx,
          rotateY: sRy,
          cursor: interactive
            ? grabbing
              ? "grabbing"
              : "grab"
            : "default",
          touchAction: "none",
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClick={onCubeClick}
      >
        {FACE_SPECS.map((face) => (
          <Face
            key={face.id}
            transform={face.transformOf(half)}
            tile={tile}
            palette={face.palette}
          />
        ))}
      </motion.div>

      <div
        aria-hidden
        className="absolute left-1/2 -translate-x-1/2 rounded-full"
        style={{
          bottom: "8%",
          width: edge * 0.88,
          height: edge * 0.11,
          background:
            "radial-gradient(ellipse at center, rgb(0 0 0 / 0.55), transparent 70%)",
          filter: "blur(12px)",
          opacity: 0.6,
        }}
      />

      {interactive && hint && !reduced && (
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 hx-mono-tab text-[9px] uppercase tracking-[0.22em] text-ink-dim pointer-events-none whitespace-nowrap">
          drag · tap · rotate
        </div>
      )}
    </div>
  );
}

function Face({
  transform,
  tile,
  palette,
}: {
  transform: string;
  tile: number;
  palette: Palette;
}) {
  const gap = Math.max(3, Math.round(tile * 0.06));
  const radius = Math.round(tile * 0.18);
  return (
    <div
      className="absolute inset-0 grid grid-cols-3 grid-rows-3"
      style={{
        transform,
        backfaceVisibility: "hidden",
        background:
          "linear-gradient(135deg, rgb(8 8 10) 0%, rgb(18 18 22) 100%)",
        borderRadius: radius,
        padding: gap,
        gap,
        boxShadow:
          "inset 0 0 0 1px rgb(255 255 255 / 0.05), inset 0 0 0 2px rgb(0 0 0 / 0.6)",
      }}
    >
      {palette.map((kind, i) => (
        <Sticker key={i} kind={kind} index={i} tile={tile - gap * 1.5} />
      ))}
    </div>
  );
}

function Sticker({
  kind,
  index,
  tile,
}: {
  kind: StickerKind;
  index: number;
  tile: number;
}) {
  const reduced = useReducedMotion();
  const [pulsing, setPulsing] = useState(false);
  const [hovering, setHovering] = useState(false);
  const radius = Math.max(4, Math.round(tile * 0.18));
  const bg = STICKER_BG[kind];
  const ambientDelay = `${(index * 0.18).toFixed(2)}s`;

  const pulseTimerRef = useRef<number | null>(null);
  useEffect(() => {
    return () => {
      if (pulseTimerRef.current !== null) {
        window.clearTimeout(pulseTimerRef.current);
      }
    };
  }, []);

  const onTap = () => {
    setPulsing(true);
    if (pulseTimerRef.current !== null) {
      window.clearTimeout(pulseTimerRef.current);
    }
    pulseTimerRef.current = window.setTimeout(() => {
      setPulsing(false);
      pulseTimerRef.current = null;
    }, 480);
  };

  return (
    <motion.div
      className="relative cursor-pointer"
      onClick={(e) => {
        e.stopPropagation();
        onTap();
      }}
      onPointerEnter={() => setHovering(true)}
      onPointerLeave={() => setHovering(false)}
      animate={{
        scale: pulsing ? 1.1 : hovering ? 1.04 : 1,
        filter: pulsing
          ? "brightness(1.5)"
          : hovering
          ? "brightness(1.15)"
          : "brightness(1)",
      }}
      transition={{
        scale: { type: "spring", stiffness: 280, damping: 20 },
        filter: { duration: 0.18, ease: "easeOut" },
      }}
      style={{
        borderRadius: radius,
        background: bg,
        boxShadow: [
          "inset 0 1px 0 rgb(255 255 255 / 0.28)",
          "inset 0 -1.5px 0 rgb(0 0 0 / 0.32)",
          "inset 1px 0 0 rgb(255 255 255 / 0.06)",
          "inset -1px 0 0 rgb(0 0 0 / 0.18)",
          "0 1px 2px rgb(0 0 0 / 0.4)",
        ].join(", "),
        animation: reduced
          ? undefined
          : `cube-sticker 4.6s ease-in-out ${ambientDelay} infinite`,
      }}
    >
      <span
        aria-hidden
        className="absolute inset-0"
        style={{
          borderRadius: "inherit",
          background:
            "radial-gradient(circle at 28% 22%, rgb(255 255 255 / 0.32), transparent 48%)",
          pointerEvents: "none",
        }}
      />
      <span
        aria-hidden
        className="absolute inset-0"
        style={{
          borderRadius: "inherit",
          background:
            "linear-gradient(150deg, transparent 55%, rgb(0 0 0 / 0.18) 100%)",
          pointerEvents: "none",
        }}
      />
    </motion.div>
  );
}
