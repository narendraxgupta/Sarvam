import { useEffect, useRef } from "react";
import {
  AlertOctagon,
  CircleDashed,
  CircleDot,
  ChevronDown,
  Plug,
  Square,
  Terminal,
  Zap,
} from "lucide-react";
import { usePlaygroundStore } from "@/store/playgroundStore";
import { cn, formatMs } from "@/lib/utils";
import type { StreamEvent } from "@/types";

const ICONS: Record<StreamEvent["kind"], React.ComponentType<{ className?: string }>> = {
  connect: Plug,
  "first-byte": Zap,
  chunk: CircleDot,
  retry: CircleDashed,
  warn: AlertOctagon,
  error: AlertOctagon,
  close: Square,
  abort: Square,
};

const TONES: Record<StreamEvent["kind"], string> = {
  connect: "text-accent",
  "first-byte": "text-ok",
  chunk: "text-ink-muted",
  retry: "text-warn",
  warn: "text-warn",
  error: "text-danger",
  close: "text-ivory",
  abort: "text-warn",
};

export function DiagnosticsPanel() {
  const events = usePlaygroundStore((s) => s.events);
  const toggleDiagnostics = usePlaygroundStore((s) => s.toggleDiagnostics);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [events.length]);

  return (
    <section
      aria-label="Stream diagnostics"
      className="hx-surface flex flex-col h-full overflow-hidden"
    >
      <div className="h-10 px-3.5 flex items-center gap-2 border-b border-line">
        <Terminal className="h-3.5 w-3.5 text-ink-subtle" />
        <h3 className="hx-eyebrow text-ink-muted">Stream diagnostics</h3>
        <span className="text-2xs text-ink-subtle font-mono tabular-nums">
          <span className="italic">{events.length}</span> events
        </span>
        <button
          type="button"
          onClick={toggleDiagnostics}
          aria-label="Close diagnostics"
          className="ml-auto h-6 w-6 grid place-items-center rounded-md text-ink-subtle hover:text-ink hover:bg-ivory-soft"
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </div>
      <div
        ref={scrollerRef}
        className="flex-1 min-h-0 overflow-auto px-2 py-1.5 font-mono text-2xs scrollbar-thin"
      >
        {events.length === 0 && (
          <div className="px-2 py-1 text-ink-subtle">
            No events yet — run an inference to see the live event stream.
          </div>
        )}
        {events.map((e, i) => {
          const Icon = ICONS[e.kind];
          return (
            <div
              key={i}
              className="grid grid-cols-[60px_18px_1fr] gap-2 items-baseline py-0.5 px-1 hover:bg-ivory-soft rounded-sm"
            >
              <span className="text-ink-subtle tabular-nums">
                {formatMs(e.t).padStart(7)}
              </span>
              <Icon className={cn("h-3 w-3 mt-0.5", TONES[e.kind])} />
              <span className="text-ink-muted">
                <span className={cn("uppercase mr-1.5", TONES[e.kind])}>
                  {e.kind}
                </span>
                <span className="break-all">{e.message}</span>
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
