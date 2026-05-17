import { motion } from "framer-motion";
import { Check, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { resultKey } from "@/store/evalsStore";
import type { EvalRun, EvalSuite } from "@/types/evals";

interface Props {
  suite: EvalSuite;
  run: EvalRun | null;
  selectedCaseId: string | null;
  onSelectCase: (caseId: string) => void;
}

const STATUS_CELL = {
  pending: "bg-line/15 text-ink-dim border-line/10",
  running: "bg-accent/10 text-accent border-accent/20",
  pass: "bg-ok/10 text-ok border-ok/25",
  fail: "bg-danger/10 text-danger border-danger/25",
} as const;

export function ResultsGrid({ suite, run, selectedCaseId, onSelectCase }: Props) {
  if (!run) {
    return (
      <div className="hx-surface p-12 text-center">
        <div className="hx-eyebrow text-ink-dim mb-2">No results yet</div>
        <p className="text-[13px] text-ink-subtle max-w-md mx-auto leading-relaxed">
          Pick models and press <span className="font-mono text-ink">Run suite</span>{" "}
          to see the pass / fail grid populate in real time.
        </p>
      </div>
    );
  }

  return (
    <div className="hx-surface overflow-hidden">
      <div className="px-5 pt-4 pb-3 border-b border-line/8">
        <div className="hx-eyebrow text-accent">Results grid</div>
        <div className="text-[13px] text-ink-muted">
          {suite.cases.length} cases × {run.models.length} models
        </div>
      </div>
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full border-collapse">
          <thead>
            <tr className="text-[10px] uppercase tracking-[0.14em] font-semibold text-ink-subtle">
              <th className="sticky left-0 z-10 bg-bg-surface text-left px-4 py-2.5 min-w-[260px] border-b border-line/8">
                Case
              </th>
              {run.models.map((m) => (
                <th
                  key={m}
                  className="text-center px-3 py-2.5 font-mono normal-case tracking-tight text-[10.5px] text-ink border-b border-line/8 min-w-[100px]"
                >
                  {m}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {suite.cases.map((c, rowIdx) => {
              const isSelected = c.id === selectedCaseId;
              return (
                <tr
                  key={c.id}
                  role="row"

                  tabIndex={0}
                  aria-selected={isSelected}
                  onClick={() => onSelectCase(c.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelectCase(c.id);
                    }
                  }}
                  className={cn(
                    "cursor-pointer transition-colors outline-none",
                    "focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset",
                    isSelected ? "bg-accent/[0.04]" : "hover:bg-ink/[0.03]",
                  )}
                >
                  <td
                    className={cn(
                      "sticky left-0 px-4 py-3 border-b border-line/6",
                      isSelected ? "bg-accent/[0.04]" : "bg-bg-surface",
                    )}
                  >
                    <div className="text-[12.5px] text-ink line-clamp-2 leading-snug">
                      {c.prompt}
                    </div>
                    {c.tags && (
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {c.tags.map((t) => (
                          <span
                            key={t}
                            className="text-[9.5px] font-mono px-1.5 py-0.5 rounded bg-bg-elevated border border-line/8 text-ink-subtle"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  {run.models.map((m) => {
                    const r = run.results[resultKey(c.id, m)];
                    const status = r?.status ?? "pending";
                    return (
                      <td
                        key={m}
                        className="px-3 py-3 text-center border-b border-line/6"
                      >
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          key={`${rowIdx}-${m}-${status}`}
                          transition={{ duration: 0.25 }}
                          className={cn(
                            "inline-flex items-center justify-center gap-1 px-2 h-7 min-w-[52px]",
                            "rounded-md border text-[10.5px] font-mono font-semibold tabular-nums",
                            STATUS_CELL[status],
                          )}
                        >
                          {status === "pass" && <Check className="h-3 w-3" />}
                          {status === "fail" && <X className="h-3 w-3" />}
                          {status === "running" && (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          )}
                          {status === "pending" && <span>·</span>}
                          {(status === "pass" || status === "fail") && (
                            <span>{Math.round((r?.score ?? 0) * 100)}</span>
                          )}
                        </motion.div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
