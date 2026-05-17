import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/lib/a11y/useReducedMotion";

export type MouseTextEffectProps = {
  children: string | ReactNode;
  radius?: number;
  lift?: number;
  className?: string;
  style?: CSSProperties;
  as?: keyof JSX.IntrinsicElements;
};

export function MouseTextEffect({
  children,
  radius = 80,
  lift = 18,
  className,
  style,
  as: Tag = "span",
}: MouseTextEffectProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  const text =
    typeof children === "string"
      ? children
      : Array.isArray(children)
      ? children.join("")
      : String(children ?? "");

  useEffect(() => {
    if (reduced) return;
    const node = ref.current;
    if (!node) return;
    const move = (e: PointerEvent) => {
      const r = node.getBoundingClientRect();
      setPos({ x: e.clientX - r.left, y: e.clientY - r.top });
    };
    const leave = () => setPos(null);
    node.addEventListener("pointermove", move);
    node.addEventListener("pointerleave", leave);
    return () => {
      node.removeEventListener("pointermove", move);
      node.removeEventListener("pointerleave", leave);
    };
  }, [reduced]);

  const Element = Tag as unknown as "span";

  const words = text.split(/(\s+)/);

  return (
    <Element
      ref={ref as unknown as React.Ref<HTMLSpanElement>}
      className={cn("relative inline", className)}
      style={style}
      aria-label={typeof children === "string" ? children : undefined}
    >
      {words.map((word, wi) => {
        if (/^\s+$/.test(word)) {
          return <span key={`s${wi}`}>{" "}</span>;
        }
        return (
          <span key={`w${wi}`} className="inline-block whitespace-nowrap">
            {Array.from(word).map((ch, ci) => (
              <Glyph
                key={ci}
                ch={ch}
                pos={pos}
                radius={radius}
                lift={lift}
              />
            ))}
          </span>
        );
      })}
    </Element>
  );
}

function Glyph({
  ch,
  pos,
  radius,
  lift,
}: {
  ch: string;
  pos: { x: number; y: number } | null;
  radius: number;
  lift: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  let intensity = 0;
  if (pos && ref.current) {
    const r = ref.current.getBoundingClientRect();
    const parent = ref.current.offsetParent as HTMLElement | null;
    const parentR = parent?.getBoundingClientRect();
    const cx = r.left + r.width / 2 - (parentR?.left ?? 0);
    const cy = r.top + r.height / 2 - (parentR?.top ?? 0);
    const dx = cx - pos.x;
    const dy = cy - pos.y;
    const dist = Math.hypot(dx, dy);
    if (dist < radius) {
      const t = 1 - dist / radius;
      intensity = t * t * (3 - 2 * t);
    }
  }

  return (
    <span
      ref={ref}
      className="inline-block transition-[transform,color,filter] duration-150 ease-out will-change-transform"
      style={{
        transform: `translateY(${-lift * intensity}px) scale(${1 + 0.12 * intensity})`,
        color:
          intensity > 0.05
            ? `rgb(var(--accent))`
            : undefined,
        textShadow:
          intensity > 0.2
            ? `0 ${4 + intensity * 8}px ${12 + intensity * 12}px rgb(var(--accent) / ${(0.2 + intensity * 0.3).toFixed(2)})`
            : undefined,
        filter: intensity > 0.05 ? `brightness(${1 + intensity * 0.2})` : undefined,
      }}
    >
      {ch}
    </span>
  );
}
