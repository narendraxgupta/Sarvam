import { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ChevronRight } from "lucide-react";
import type { ObservabilityRequest } from "@/types/observability";
import { useReducedMotion } from "@/lib/a11y/useReducedMotion";
import { cn } from "@/lib/utils";

interface Props {
  requests: ObservabilityRequest[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const STATUS_META = {
  ok: { label: "200", cls: "text-ok bg-ok/10 border-ok/20" },
  "client-error": { label: "4xx", cls: "text-warn bg-warn/10 border-warn/20" },
  "server-error": { label: "5xx", cls: "text-danger bg-danger/10 border-danger/20" },
  timeout: { label: "504", cls: "text-danger bg-danger/10 border-danger/20" },
} as const;

function relativeTime(t: number, now: number): string {
  const delta = Math.max(0, now - t);
  if (delta < 1000) return "just now";
  if (delta < 60_000) return `${Math.floor(delta / 1000)}s ago`;
  return `${Math.floor(delta / 60_000)}m ago`;
}

export function RequestExplorer({ requests, selectedId, onSelect }: Props) {
  const reduced = useReducedMotion();
  const parentRef = useRef<HTMLDivElement>(null);

  const now = Date.now();

  const virtualizer = useVirtualizer({
    count: requests.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 44,
    overscan: 8,
  });

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="grid grid-cols-[80px_1fr_120px_70px_70px_60px] gap-3 px-4 h-8 items-center border-b border-line/8 text-[10px] uppercase tracking-[0.14em] font-semibold text-ink-subtle bg-bg/30">
        <span>Status</span>
        <span>Endpoint · Model</span>
        <span>Region</span>
        <span className="text-right">Latency</span>
        <span className="text-right">Tokens</span>
        <span className="text-right">When</span>
      </div>
      <div
        ref={parentRef}
        className="flex-1 min-h-0 overflow-auto scrollbar-thin"
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            position: "relative",
            width: "100%",
          }}
        >
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const r = requests[virtualRow.index];
            if (!r) return null;
            const meta = STATUS_META[r.status];
            const selected = r.id === selectedId;
            // IMPORTANT: this MUST be a plain <button>, not <motion.button>.

            return (
              <button
                key={r.id}
                type="button"
                onClick={() => onSelect(r.id)}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                  animation: reduced ? undefined : "fade-in 180ms ease-out",
                }}
                className={cn(
                  "grid grid-cols-[80px_1fr_120px_70px_70px_60px] gap-3 px-4 items-center",
                  "text-left text-[12.5px] border-b border-line/6 cursor-pointer",
                  "transition-colors",
                  selected
                    ? "bg-accent/5 text-ink"
                    : "text-ink-muted hover:bg-ink/[0.03] hover:text-ink",
                )}
              >
                <span
                  className={cn(
                    "inline-flex items-center justify-center w-12 h-5 rounded border text-[10px] font-mono font-semibold",
                    meta.cls,
                  )}
                >
                  {meta.label}
                </span>
                <span className="truncate">
                  <span className="font-mono text-[11px] text-ink">{r.endpoint}</span>
                  <span className="text-ink-subtle mx-1.5">·</span>
                  <span className="text-[11.5px]">{r.model}</span>
                </span>
                <span className="text-[11.5px] text-ink-muted truncate">{r.region}</span>
                <span className="text-right font-mono tabular-nums">
                  {r.latencyMs >= 1000
                    ? `${(r.latencyMs / 1000).toFixed(2)}s`
                    : `${r.latencyMs}ms`}
                </span>
                <span className="text-right font-mono tabular-nums text-ink-subtle">
                  {r.tokens}
                </span>
                <span className="text-right text-[10.5px] text-ink-subtle font-mono">
                  {relativeTime(r.startedAt, now)}
                </span>
                {selected && (
                  <ChevronRight className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-accent" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
