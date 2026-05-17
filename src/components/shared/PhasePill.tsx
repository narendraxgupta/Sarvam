import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/lib/a11y/useReducedMotion";
import type { StreamPhase } from "@/types";

const PHASE_META: Record<
  StreamPhase,
  { label: string; dot: string; bg: string; ring: string; text: string }
> = {
  idle: {
    label: "Idle",
    dot: "bg-ink-subtle",
    bg: "bg-bg-elevated",
    ring: "border-line",
    text: "text-ink-muted",
  },
  connecting: {
    label: "Connecting",
    dot: "bg-accent",
    bg: "bg-accent/10",
    ring: "border-accent/30",
    text: "text-accent",
  },
  streaming: {
    label: "Streaming",
    dot: "bg-ok",
    bg: "bg-ok/10",
    ring: "border-ok/30",
    text: "text-ok",
  },
  "partial-error": {
    label: "Partial · error",
    dot: "bg-danger",
    bg: "bg-danger/10",
    ring: "border-danger/30",
    text: "text-danger",
  },
  done: {
    label: "Done",
    dot: "bg-ink",
    bg: "bg-ink/5",
    ring: "border-line/15",
    text: "text-ink",
  },
  aborted: {
    label: "Aborted",
    dot: "bg-warn",
    bg: "bg-warn/10",
    ring: "border-warn/30",
    text: "text-warn",
  },
};

export function PhasePill({
  phase,
  className,
}: {
  phase: StreamPhase;
  className?: string;
}) {
  const meta = PHASE_META[phase];
  const reduced = useReducedMotion();
  const isLive = phase === "streaming" || phase === "connecting";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 h-6 rounded-md border",
        "text-2xs uppercase tracking-tightish font-semibold",
        "shadow-ring-soft",
        meta.bg,
        meta.ring,
        meta.text,
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <span className="relative inline-flex h-1.5 w-1.5">
        {isLive && !reduced && (
          <motion.span
            className={cn("absolute inset-0 rounded-full opacity-40", meta.dot)}
            animate={{ scale: [1, 2.2, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
            aria-hidden
          />
        )}
        <span className={cn("relative h-1.5 w-1.5 rounded-full", meta.dot)} />
      </span>
      {meta.label}
    </span>
  );
}
