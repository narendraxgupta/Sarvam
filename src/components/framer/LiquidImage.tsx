import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/lib/a11y/useReducedMotion";

export type LiquidImageProps = {
  src?: string;
  alt?: string;
  children?: React.ReactNode;
  intensity?: number;
  frequency?: number;
  octaves?: number;
  alwaysOn?: boolean;
  aspect?: string;
  className?: string;
  style?: CSSProperties;
};

export function LiquidImage({
  src,
  alt = "",
  children,
  intensity = 38,
  frequency = 0.018,
  octaves = 2,
  alwaysOn,
  aspect,
  className,
  style,
}: LiquidImageProps) {
  const reduced = useReducedMotion();
  const filterId = useId();
  const fid = `liquid-${filterId.replace(/[:]/g, "")}`;

  const [hover, setHover] = useState(false);

  // Animated values smoothed in a RAF loop.
  const dispRef = useRef<SVGFEDisplacementMapElement | null>(null);
  const turbRef = useRef<SVGFETurbulenceElement | null>(null);
  const seedRef = useRef<number>(Math.random() * 100);
  const raf = useRef<number | null>(null);
  const target = useRef({ scale: 0, base: frequency });
  const current = useRef({ scale: 0, base: frequency, seed: seedRef.current });

  // Mirror `hover` into a ref so the RAF loop can read the latest value

  const hoverRef = useRef(hover);
  useEffect(() => {
    hoverRef.current = hover;
  }, [hover]);

  useEffect(() => {
    if (reduced) return;
    const tick = () => {
      const isActive = alwaysOn || hoverRef.current;
      const desired = isActive ? intensity : 0;
      const desiredBase = isActive ? frequency * 1.7 : frequency;
      target.current = { scale: desired, base: desiredBase };

      current.current.scale += (target.current.scale - current.current.scale) * 0.16;
      current.current.base += (target.current.base - current.current.base) * 0.16;
      current.current.seed += 0.5;

      if (dispRef.current) {
        dispRef.current.setAttribute(
          "scale",
          current.current.scale.toFixed(2),
        );
      }
      if (turbRef.current) {
        turbRef.current.setAttribute(
          "baseFrequency",
          `${current.current.base.toFixed(4)} ${(current.current.base * 0.9).toFixed(4)}`,
        );
        if (isActive) {
          turbRef.current.setAttribute(
            "seed",
            String(Math.floor(current.current.seed) % 256),
          );
        }
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current != null) cancelAnimationFrame(raf.current);
      raf.current = null;
    };
  }, [intensity, frequency, alwaysOn, reduced]);

  const filterStyle: CSSProperties = reduced
    ? {}
    : { filter: `url(#${fid})` };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md hx-hairline-card bg-bg-sunken/40",
        className,
      )}
      style={{ aspectRatio: aspect, ...style }}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
    >
      {!reduced && (
        <svg
          aria-hidden
          className="absolute w-0 h-0 pointer-events-none"
          focusable="false"
        >
          <defs>
            <filter id={fid} x="-10%" y="-10%" width="120%" height="120%">
              <feTurbulence
                ref={turbRef as unknown as React.Ref<SVGFETurbulenceElement>}
                type="fractalNoise"
                baseFrequency={`${frequency} ${frequency * 0.9}`}
                numOctaves={octaves}
                seed={Math.floor(seedRef.current)}
                result="turbulence"
              />
              <feDisplacementMap
                ref={dispRef as unknown as React.Ref<SVGFEDisplacementMapElement>}
                in="SourceGraphic"
                in2="turbulence"
                scale="0"
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
          </defs>
        </svg>
      )}

      <div
        className="absolute inset-0 transition-transform duration-700 ease-out-expo"
        style={filterStyle}
      >
        {src ? (
          <img
            src={src}
            alt={alt}
            className="w-full h-full object-cover select-none"
            draggable={false}
          />
        ) : (
          children
        )}
      </div>

      <div
        aria-hidden
        className={cn(
          "absolute inset-0 pointer-events-none transition-opacity duration-500",
          hover ? "opacity-100" : "opacity-0",
        )}
        style={{
          background:
            "radial-gradient(60% 60% at 80% 20%, rgb(var(--grad-2) / 0.18), transparent 70%)",
          mixBlendMode: "screen",
        }}
      />

      <div className="absolute bottom-2 left-2 hx-mono-tab text-[10px] uppercase tracking-[0.18em] text-ink-subtle pointer-events-none">
        liquid · displacement
      </div>
    </div>
  );
}
