import { useEffect, useState, type ReactNode } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/lib/a11y/useReducedMotion";

export type CardStackItem = {
  id: string;
  fig: string;
  kicker?: string;
  title: ReactNode;
  body?: ReactNode;
  illustration?: ReactNode;
  meta?: string;
};

export type CardStackProps = {
  items: CardStackItem[];
  offset?: number;
  scaleStep?: number;
  dimStep?: number;
  stiff?: number;
  damp?: number;
  aspect?: number;
  className?: string;
  onAdvance?: (next: CardStackItem) => void;
};

export function CardStack({
  items,
  offset = 14,
  scaleStep = 0.045,
  dimStep = 0.12,
  stiff = 220,
  damp = 28,
  aspect = 1.55,
  className,
  onAdvance,
}: CardStackProps) {
  const reduced = useReducedMotion();
  const [order, setOrder] = useState(items);

  useEffect(() => {
    setOrder(items);
  }, [items]);

  const advance = () => {
    setOrder((prev) => {

      if (prev.length < 2) return prev;
      const [front, ...rest] = prev;
      const next = [...rest, front];
      onAdvance?.(next[0]);
      return next;
    });
  };

  const spring = { type: "spring" as const, stiffness: stiff, damping: damp };

  return (
    <div
      className={cn(
        "relative w-full",
        className,
      )}
      style={{ aspectRatio: aspect, perspective: 1200 }}
    >
      {order.map((card, i) => {
        const isFront = i === 0;
        const brightness = Math.max(0.55, 1 - i * dimStep);
        const z = order.length - i;
        return (
          <CardLayer
            key={card.id}
            card={card}
            index={i}
            isFront={isFront}
            brightness={brightness}
            z={z}
            offset={offset}
            scaleStep={scaleStep}
            spring={spring}
            reduced={reduced}
            onDismiss={advance}
            length={order.length}
          />
        );
      })}
    </div>
  );
}

function CardLayer({
  card,
  index,
  isFront,
  brightness,
  z,
  offset,
  scaleStep,
  spring,
  reduced,
  onDismiss,
  length,
}: {
  card: CardStackItem;
  index: number;
  isFront: boolean;
  brightness: number;
  z: number;
  offset: number;
  scaleStep: number;
  spring: { type: "spring"; stiffness: number; damping: number };
  reduced: boolean;
  onDismiss: () => void;
  length: number;
}) {
  const y = useMotionValue(0);
  const rotate = useTransform(y, [-200, 200], [-4, 4]);
  const opacity = useTransform(y, [-260, 0, 260], [0, 1, 0]);

  return (
    <motion.article
      className="absolute inset-0 hx-surface overflow-hidden"
      style={{
        zIndex: z,
        cursor: isFront && !reduced ? "grab" : "default",
        y: isFront ? y : undefined,
        rotate: isFront && !reduced ? rotate : undefined,
        opacity: isFront ? opacity : 1,
        filter: `brightness(${brightness})`,
        boxShadow:
          index === 0
            ? "0 30px 80px -36px rgb(0 0 0 / 0.4)"
            : "0 20px 50px -36px rgb(0 0 0 / 0.3)",
      }}
      animate={{
        top: index * -offset,
        scale: 1 - index * scaleStep,
        transition: spring,
      }}
      drag={isFront && !reduced ? "y" : false}
      dragConstraints={{ top: -300, bottom: 300 }}
      dragElastic={0.18}
      onDragEnd={(_, info) => {
        if (Math.abs(info.offset.y) > 120 || Math.abs(info.velocity.y) > 400) {
          onDismiss();
        }
      }}
      whileDrag={{ scale: 1.02, cursor: "grabbing" }}
    >
      <header className="flex items-center justify-between px-5 pt-4 pb-3">
        <div className="hx-eyebrow flex items-center gap-2">
          <span aria-hidden className="inline-block h-1.5 w-1.5 bg-accent" />
          <span>{card.fig}</span>
          {card.kicker && (
            <>
              <span aria-hidden className="inline-block h-px w-3 bg-ink/30" />
              <span className="text-ink-subtle">{card.kicker}</span>
            </>
          )}
        </div>
        <div className="hx-mono-tab text-[10px] uppercase tracking-[0.18em] text-ink-dim">
          {String(index + 1).padStart(2, "0")} / {String(length).padStart(2, "0")}
        </div>
      </header>

      <div className="relative px-5">
        <div className="relative aspect-[16/9] rounded-lg border border-line/8 bg-bg-sunken/40 overflow-hidden">
          {card.illustration ?? (
            <div className="stripes absolute inset-0" />
          )}
        </div>
      </div>

      <div className="px-5 pt-4 pb-5">
        <h3
          className="font-display text-[18px] font-semibold text-ink"
          style={{ letterSpacing: "-0.022em" }}
        >
          {card.title}
        </h3>
        {card.body && (
          <p className="mt-1.5 text-[12.5px] font-light leading-[1.55] text-ink-muted">
            {card.body}
          </p>
        )}
      </div>

      <footer className="absolute inset-x-0 bottom-0 px-5 py-2.5 border-t border-line/8 flex items-center justify-between">
        <span className="hx-mono-tab text-[10px] uppercase tracking-[0.16em] text-ink-dim">
          {card.meta ?? "drag · swipe to advance"}
        </span>
        {isFront && (
          <button
            type="button"
            onClick={onDismiss}
            className="hx-mono-tab text-[10px] uppercase tracking-[0.16em] text-accent hover:underline focus-visible:underline"
          >
            next →
          </button>
        )}
      </footer>
    </motion.article>
  );
}
