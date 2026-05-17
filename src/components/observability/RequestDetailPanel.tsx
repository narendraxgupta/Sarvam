import { AnimatePresence, motion } from "framer-motion";
import { Clock, Cpu, Hash, MapPin, X, Zap } from "lucide-react";
import type { ObservabilityRequest } from "@/types/observability";
import { useReducedMotion } from "@/lib/a11y/useReducedMotion";
import { cn } from "@/lib/utils";

interface Props {
  request: ObservabilityRequest | null;
  onClose: () => void;
}

const EVENT_META = {
  connect: { dot: "bg-ink-subtle", label: "connect" },
  "first-byte": { dot: "bg-accent", label: "first byte" },
  chunk: { dot: "bg-accent/60", label: "chunk" },
  retry: { dot: "bg-warn", label: "retry" },
  warn: { dot: "bg-warn", label: "warn" },
  error: { dot: "bg-danger", label: "error" },
  close: { dot: "bg-ok", label: "close" },
} as const;

export function RequestDetailPanel({ request, onClose }: Props) {
  const reduced = useReducedMotion();

  return (
    <AnimatePresence>
      {request && (
        <motion.aside
          key={request.id}
          initial={reduced ? false : { x: 24, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 24, opacity: 0 }}
          transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          className="hx-surface flex flex-col h-full overflow-hidden"
        >
          <header className="px-4 h-12 flex items-center gap-2 border-b border-line/8 shrink-0">
            <div className="hx-eyebrow text-ink-subtle">Request</div>
            <span className="font-mono text-[11px] text-ink-muted truncate flex-1">
              {request.id}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="h-7 w-7 grid place-items-center rounded text-ink-dim hover:text-ink hover:bg-ink/[0.05] transition-colors"
              aria-label="Close detail"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </header>

          <div className="flex-1 min-h-0 overflow-auto scrollbar-thin">
            <div className="grid grid-cols-2 gap-px bg-line/8 border-b border-line/8">
              <Cell icon={<Clock className="h-3 w-3" />} label="Latency">
                <span className="font-mono tabular-nums">
                  {request.latencyMs >= 1000
                    ? `${(request.latencyMs / 1000).toFixed(2)}s`
                    : `${request.latencyMs}ms`}
                </span>
              </Cell>
              <Cell icon={<Zap className="h-3 w-3" />} label="TTFT">
                <span className="font-mono tabular-nums">{request.ttftMs}ms</span>
              </Cell>
              <Cell icon={<Cpu className="h-3 w-3" />} label="Model">
                <span className="font-mono text-[11.5px]">{request.model}</span>
              </Cell>
              <Cell icon={<Hash className="h-3 w-3" />} label="Tokens">
                <span className="font-mono tabular-nums">{request.tokens}</span>
              </Cell>
              <Cell icon={<MapPin className="h-3 w-3" />} label="Region">
                <span className="text-[12px]">{request.region}</span>
              </Cell>
              <Cell icon={null} label="Endpoint">
                <span className="font-mono text-[11.5px]">{request.endpoint}</span>
              </Cell>
            </div>

            {request.error && (
              <div className="m-4 p-3 rounded-lg border border-danger/30 bg-danger/5 text-[12px] text-danger leading-relaxed">
                <div className="font-semibold uppercase tracking-tightish text-[10px] mb-1">
                  Error
                </div>
                {request.error}
              </div>
            )}

            <div className="px-4 py-4">
              <div className="hx-eyebrow mb-3">Stream timeline</div>
              <ol className="flex flex-col">
                {request.events.map((ev, i) => {
                  const meta = EVENT_META[ev.kind];
                  return (
                    <li
                      key={`${ev.kind}-${ev.t}-${i}`}
                      className="grid grid-cols-[56px_12px_1fr] items-start gap-2 py-2 border-b border-line/6 last:border-b-0"
                    >
                      <span className="font-mono text-[11px] text-ink-subtle tabular-nums">
                        +{ev.t}ms
                      </span>
                      <span className="grid place-items-center pt-1.5">
                        <span className={cn("h-2 w-2 rounded-full", meta.dot)} />
                      </span>
                      <span className="text-[12.5px] text-ink leading-snug">
                        <span className="font-semibold uppercase tracking-tightish text-[10px] text-ink-subtle mr-1.5">
                          {meta.label}
                        </span>
                        {ev.message}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

function Cell({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-bg-surface/30 px-4 py-3 flex flex-col gap-1">
      <span className="flex items-center gap-1.5 text-[9.5px] uppercase tracking-[0.14em] font-semibold text-ink-subtle">
        {icon}
        {label}
      </span>
      <span className="text-[13px] text-ink">{children}</span>
    </div>
  );
}
