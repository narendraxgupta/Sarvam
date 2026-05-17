import { History, PanelLeftClose } from "lucide-react";
import { usePlaygroundStore } from "@/store/playgroundStore";
import { cn, formatMs } from "@/lib/utils";
import { getModel } from "@/data/models";

export function HistoryDrawer() {
  const history = usePlaygroundStore((s) => s.history);
  const loadRun = usePlaygroundStore((s) => s.loadRun);
  const toggleHistory = usePlaygroundStore((s) => s.toggleHistory);

  return (
    <aside
      aria-label="Inference history"
      className="hx-surface flex flex-col h-full overflow-hidden"
    >
      <div className="h-10 px-3 flex items-center gap-2 border-b border-line">
        <History className="h-3.5 w-3.5 text-ink-subtle" />
        <h3 className="hx-eyebrow text-ink-muted">History</h3>
        <span className="text-2xs text-ink-subtle font-mono ml-auto tabular-nums">
          {history.length} {history.length === 1 ? "run" : "runs"}
        </span>
        <button
          type="button"
          onClick={toggleHistory}
          aria-label="Close history"
          className="h-6 w-6 grid place-items-center rounded-md text-ink-subtle hover:text-ink hover:bg-ivory-soft"
        >
          <PanelLeftClose className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="flex-1 min-h-0 overflow-auto scrollbar-thin">
        {history.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <div className="hx-eyebrow text-ink-dim mb-2">Empty</div>
            <p className="text-[12px] text-ink-subtle leading-relaxed">
              Completed runs will <em>land here</em>. Press{" "}
              <span className="hx-kbd">Ctrl</span>
              <span className="hx-kbd ml-0.5">↵</span> to run your first
              inference.
            </p>
          </div>
        ) : (
          <ul className="p-2 flex flex-col">
            {history.map((run, idx) => {
              const m = getModel(run.model);
              return (
                <li key={run.id} className="relative">
                  {idx !== history.length - 1 && (
                    <span
                      aria-hidden
                      className="absolute left-[11px] top-9 bottom-0 w-px bg-line"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => loadRun(run.id)}
                    className={cn(
                      "w-full text-left rounded-md py-2 pl-7 pr-2",
                      "hover:bg-bg-elevated transition-colors",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                    )}
                  >
                    <span
                      aria-hidden
                      className="absolute left-[7px] top-3.5 grid h-2 w-2 rounded-full bg-accent ring-[3px] ring-bg-surface"
                    />
                    <div className="flex items-baseline justify-between gap-2 mb-1">
                      <span className="font-mono text-[11px] text-accent font-semibold uppercase tracking-tightish">
                        {m.name}
                      </span>
                      <span className="text-2xs text-ink-dim font-mono tabular-nums">
                        <span className="italic text-ink-muted">{formatMs(run.durationMs)}</span>
                        <span className="mx-1 text-ink-dim">·</span>
                        <span className="italic text-ink-muted">{run.tokens}</span>t
                      </span>
                    </div>
                    <div className="text-[12px] text-ink-muted line-clamp-2 leading-snug">
                      {run.prompt}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </aside>
  );
}
