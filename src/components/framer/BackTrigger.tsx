import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/lib/a11y/useReducedMotion";

export type BackTriggerProps = {
  threshold?: number;
  targetId?: string;
  inset?: number;
  label?: string;
  className?: string;
};

export function BackTrigger({
  threshold = 480,
  targetId,
  inset = 24,
  label = "Back to top",
  className,
}: BackTriggerProps) {
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(false);
  const [progress, setProgress] = useState(0);
  const [hover, setHover] = useState(false);

  useEffect(() => {
    const target: HTMLElement | Window =
      (targetId && document.getElementById(targetId)) || window;

    const compute = () => {
      let y: number;
      let max: number;
      if (target === window) {
        y = window.scrollY;
        max = Math.max(
          1,
          document.documentElement.scrollHeight - window.innerHeight,
        );
      } else {
        const el = target as HTMLElement;
        y = el.scrollTop;
        max = Math.max(1, el.scrollHeight - el.clientHeight);
      }
      setShown(y > threshold);
      setProgress(Math.min(1, y / max));
    };

    compute();
    const handler = () => compute();
    target.addEventListener("scroll", handler, { passive: true });
    window.addEventListener("resize", handler);
    return () => {
      target.removeEventListener("scroll", handler);
      window.removeEventListener("resize", handler);
    };
  }, [threshold, targetId]);

  const onClick = () => {
    const target: HTMLElement | Window =
      (targetId && document.getElementById(targetId)) || window;
    if (target === window) {
      window.scrollTo({
        top: 0,
        behavior: reduced ? "auto" : "smooth",
      });
    } else {
      (target as HTMLElement).scrollTo({
        top: 0,
        behavior: reduced ? "auto" : "smooth",
      });
    }
  };

  const RING = 28;
  const STROKE = 1.6;
  const RADIUS = RING - STROKE;
  const CIRC = 2 * Math.PI * RADIUS;

  return (
    <AnimatePresence>
      {shown && (
        <motion.button
          type="button"
          onClick={onClick}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          aria-label={label}
          className={cn(
            "fixed z-40 group select-none",
            "rounded-full overflow-hidden",
            "hx-elevated text-ink",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
            className,
          )}
          style={{
            right: inset,
            bottom: inset,
            width: RING * 2,
            height: RING * 2,
          }}
          initial={reduced ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, y: 12 }}
          transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
        >

          <span
            aria-hidden
            className="absolute inset-0 bg-accent origin-bottom transition-transform duration-300 ease-out-expo"
            style={{
              transform: `scaleY(${hover ? 1 : 0})`,
            }}
          />

          <svg
            aria-hidden
            className="absolute inset-0 -rotate-90"
            viewBox={`0 0 ${RING * 2} ${RING * 2}`}
          >
            <circle
              cx={RING}
              cy={RING}
              r={RADIUS}
              fill="none"
              stroke="rgb(var(--line) / 0.18)"
              strokeWidth={STROKE}
            />
            <circle
              cx={RING}
              cy={RING}
              r={RADIUS}
              fill="none"
              stroke="rgb(var(--accent))"
              strokeWidth={STROKE}
              strokeDasharray={CIRC}
              strokeDashoffset={CIRC * (1 - progress)}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 200ms ease-out" }}
            />
          </svg>

          <span
            className={cn(
              "absolute inset-0 grid place-items-center transition-colors duration-200",
              hover ? "text-accent-ink" : "text-ink",
            )}
          >
            <ArrowUp className="h-4 w-4" />
          </span>

          <span
            aria-hidden
            className={cn(
              "hidden lg:block absolute right-full top-1/2 -translate-y-1/2 mr-3",
              "hx-mono-tab text-[10px] uppercase tracking-[0.18em]",
              "whitespace-nowrap px-2 py-1 rounded hx-surface",
              "transition-opacity duration-200",
              hover ? "opacity-100" : "opacity-0",
            )}
          >
            {label}
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
