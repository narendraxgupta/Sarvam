import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, TrendingDown, TrendingUp } from "lucide-react";
import { resultKey } from "@/store/evalsStore";
import type { EvalRun, EvalSuite } from "@/types/evals";
import { cn } from "@/lib/utils";

interface Props {
  suite: EvalSuite;
  currentRun: EvalRun | null;
  previousRun: EvalRun | undefined;
}

interface DeltaCase {
  caseId: string;
  prompt: string;
  model: string;
  prevPass: boolean;
  currentPass: boolean;
}

export function RegressionBanner({ suite, currentRun, previousRun }: Props) {
  if (!currentRun || currentRun.progress < 1 || !previousRun) return null;

  const regressions: DeltaCase[] = [];
  const recoveries: DeltaCase[] = [];
  for (const c of suite.cases) {
    for (const m of currentRun.models) {
      const k = resultKey(c.id, m);
      const cur = currentRun.results[k];
      const prev = previousRun.results[k];
      if (!cur || !prev) continue;
      const curPass = cur.status === "pass";
      const prevPass = prev.status === "pass";
      if (prevPass && !curPass) {
        regressions.push({
          caseId: c.id,
          prompt: c.prompt,
          model: m,
          prevPass,
          currentPass: curPass,
        });
      } else if (!prevPass && curPass) {
        recoveries.push({
          caseId: c.id,
          prompt: c.prompt,
          model: m,
          prevPass,
          currentPass: curPass,
        });
      }
    }
  }

  if (regressions.length === 0 && recoveries.length === 0) return null;

  const tone = regressions.length > 0 ? "danger" : "ok";
  const cls =
    tone === "danger"
      ? "border-danger/30 bg-danger/[0.05] text-danger"
      : "border-ok/30 bg-ok/[0.05] text-ok";

  return (
    <AnimatePresence>
      <motion.div
        layout
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        className={cn("rounded-xl border p-4", cls)}
      >
        <div className="flex items-center gap-2 mb-2">
          {regressions.length > 0 ? (
            <AlertTriangle className="h-4 w-4" />
          ) : (
            <TrendingUp className="h-4 w-4" />
          )}
          <div className="font-semibold text-[13px] uppercase tracking-tightish">
            {regressions.length > 0
              ? `${regressions.length} regression${regressions.length === 1 ? "" : "s"} vs last run`
              : `${recoveries.length} recovery vs last run`}
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-2">
          {regressions.slice(0, 6).map((r, i) => (
            <div
              key={`reg-${i}`}
              className="flex items-start gap-2 text-[12px] leading-snug"
            >
              <TrendingDown className="h-3.5 w-3.5 mt-0.5 shrink-0 opacity-80" />
              <span>
                <span className="font-mono text-[11px] opacity-80">
                  {r.model}
                </span>{" "}
                — <span className="line-clamp-1">{r.prompt}</span>
              </span>
            </div>
          ))}
          {recoveries.slice(0, 6).map((r, i) => (
            <div
              key={`rec-${i}`}
              className="flex items-start gap-2 text-[12px] leading-snug"
            >
              <TrendingUp className="h-3.5 w-3.5 mt-0.5 shrink-0 opacity-80" />
              <span>
                <span className="font-mono text-[11px] opacity-80">
                  {r.model}
                </span>{" "}
                — <span className="line-clamp-1">{r.prompt}</span>
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
