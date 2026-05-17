import { useEffect, useLayoutEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useCoachmarkStore } from "@/store/coachmarkStore";
import { useReducedMotion } from "@/lib/a11y/useReducedMotion";
import { cn } from "@/lib/utils";

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const PAD = 8;

export function CoachmarkTour() {
  const open = useCoachmarkStore((s) => s.open);
  const step = useCoachmarkStore((s) => s.step);
  const steps = useCoachmarkStore((s) => s.steps);
  const next = useCoachmarkStore((s) => s.next);
  const back = useCoachmarkStore((s) => s.back);
  const close = useCoachmarkStore((s) => s.close);
  const reduced = useReducedMotion();
  const navigate = useNavigate();

  const [rect, setRect] = useState<Rect | null>(null);
  const current = open ? steps[step] : null;

  // Navigate first if the step has a route
  useEffect(() => {
    if (!current?.route) return;
    if (window.location.pathname === current.route) return;
    navigate(current.route);
  }, [current?.route, navigate]);

  // Measure target on step change + on resize/scroll
  useLayoutEffect(() => {
    if (!open || !current) return;
    let raf = 0;
    const measure = () => {
      const el = document.querySelector(current.target);
      if (!el) {
        setRect(null);
        return;
      }
      const r = el.getBoundingClientRect();
      setRect({
        top: r.top,
        left: r.left,
        width: r.width,
        height: r.height,
      });
      try {
        el.scrollIntoView({
          block: "center",
          behavior: reduced ? "auto" : "smooth",
        });
      } catch {
      }
    };
    // Wait a frame so a route change settles before measuring.
    raf = requestAnimationFrame(() => {
      raf = requestAnimationFrame(measure);
    });
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [open, current, reduced]);

  // Keyboard nav
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      } else if (e.key === "ArrowRight" || e.key === "Enter") {
        e.preventDefault();
        next();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        back();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close, next, back]);

  if (!open || !current) return null;

  const popover = computePopover(rect, current.side);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="coach-backdrop"
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-[55] bg-bg-sunken/60 backdrop-blur-[2px] pointer-events-none"
          />

          {rect && (
            <motion.div
              key="coach-spot"
              aria-hidden
              layout
              initial={false}
              animate={{
                top: rect.top - PAD,
                left: rect.left - PAD,
                width: rect.width + PAD * 2,
                height: rect.height + PAD * 2,
                opacity: 1,
              }}
              transition={
                reduced
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 220, damping: 28 }
              }
              className={cn(
                "fixed z-[56] rounded-xl pointer-events-none",
                "ring-2 ring-accent/70 shadow-[0_0_0_4px_rgb(var(--accent)/0.15),0_0_38px_rgb(var(--accent)/0.35)]",
              )}
            />
          )}

          <motion.div
            key={`coach-pop-${current.id}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`coach-title-${current.id}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.18 }}
            style={popover}
            className={cn(
              "fixed z-[58] w-[320px] max-w-[92vw]",
              "hx-glass rounded-xl p-4 shadow-elev",
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="hx-eyebrow text-accent">
                Tour · {step + 1} / {steps.length}
              </span>
              <button
                type="button"
                onClick={close}
                aria-label="End tour"
                className="h-6 w-6 grid place-items-center rounded text-ink-dim hover:text-ink hover:bg-ink/[0.05]"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <h3
              id={`coach-title-${current.id}`}
              className="text-[14.5px] font-semibold text-ink mb-1.5"
            >
              {current.title}
            </h3>
            <p className="text-[12.5px] text-ink-muted leading-relaxed">
              {current.body}
            </p>

            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-1">
                {steps.map((_, i) => (
                  <span
                    key={i}
                    className={cn(
                      "h-1 rounded-full transition-all",
                      i === step ? "w-6 bg-accent" : "w-3 bg-ink/15",
                    )}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={back}
                  disabled={step === 0}
                  className="h-7"
                >
                  <ArrowLeft className="h-3 w-3" />
                  <span className="text-[11.5px]">Back</span>
                </Button>
                <Button
                  size="sm"
                  variant="accent"
                  onClick={next}
                  className="h-7 gap-1"
                >
                  <span className="text-[11.5px]">
                    {step === steps.length - 1 ? "Done" : "Next"}
                  </span>
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function computePopover(
  rect: Rect | null,
  side: "top" | "bottom" | "left" | "right",
): React.CSSProperties {
  const POPOVER_W = 320;
  const POPOVER_H = 180;
  const MARGIN = 16;

  if (!rect) {
    return {
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
    };
  }

  const viewportW =
    typeof window === "undefined" ? 1280 : window.innerWidth;
  const viewportH =
    typeof window === "undefined" ? 720 : window.innerHeight;

  let top = 0;
  let left = 0;

  switch (side) {
    case "right":
      top = rect.top + rect.height / 2 - POPOVER_H / 2;
      left = rect.left + rect.width + MARGIN;
      break;
    case "left":
      top = rect.top + rect.height / 2 - POPOVER_H / 2;
      left = rect.left - POPOVER_W - MARGIN;
      break;
    case "top":
      top = rect.top - POPOVER_H - MARGIN;
      left = rect.left + rect.width / 2 - POPOVER_W / 2;
      break;
    case "bottom":
    default:
      top = rect.top + rect.height + MARGIN;
      left = rect.left + rect.width / 2 - POPOVER_W / 2;
      break;
  }

  // Clamp into viewport
  top = Math.max(8, Math.min(viewportH - POPOVER_H - 8, top));
  left = Math.max(8, Math.min(viewportW - POPOVER_W - 8, left));

  return { top, left };
}
