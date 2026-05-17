import { useMemo } from "react";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { computeDiff } from "@/lib/diff";
import { cn } from "@/lib/utils";
import { resultKey } from "@/store/evalsStore";
import type { DiffOp } from "@/types";
import type { EvalCase, EvalRun } from "@/types/evals";

interface Props {
  caseObj: EvalCase | null;
  run: EvalRun | null;
}

const OP_CLS: Record<DiffOp["kind"], string> = {
  eq: "text-ink",
  ins: "bg-ok/15 text-ok border-b border-ok/40",
  del: "bg-warn/15 text-warn line-through opacity-80",
  rep: "bg-accent/15 text-accent",
};

function renderDiff(expected: string, actual: string) {
  const result = computeDiff(expected, actual);
  const nodes: React.ReactNode[] = [];
  result.ops.forEach((op, i) => {
    if (op.kind === "eq") {
      const text = op.tokensA.map((t) => t.text).join("");
      nodes.push(
        <span key={i} className={OP_CLS.eq}>
          {text}
        </span>,
      );
    } else if (op.kind === "ins") {
      const text = op.tokens.map((t) => t.text).join("");
      nodes.push(
        <span key={i} className={cn(OP_CLS.ins, "rounded-sm px-0.5")}>
          {text}
        </span>,
      );
    } else if (op.kind === "del") {
      const text = op.tokens.map((t) => t.text).join("");
      nodes.push(
        <span key={i} className={cn(OP_CLS.del, "rounded-sm px-0.5")}>
          {text}
        </span>,
      );
    } else {
      const fromText = op.from.map((t) => t.text).join("");
      const toText = op.to.map((t) => t.text).join("");
      nodes.push(
        <span key={i} className={cn(OP_CLS.rep, "rounded-sm px-0.5")}>
          <span className="opacity-60 line-through mr-0.5">{fromText}</span>
          {toText}
        </span>,
      );
    }
  });
  return nodes;
}

export function CaseDetail({ caseObj, run }: Props) {
  const perModel = useMemo(() => {
    if (!caseObj || !run) return [];
    return run.models.map((m) => ({
      model: m,
      result: run.results[resultKey(caseObj.id, m)],
    }));
  }, [caseObj, run]);

  if (!caseObj) {
    return (
      <div className="hx-surface p-8 text-center">
        <div className="hx-eyebrow text-ink-dim mb-2">No case selected</div>
        <p className="text-[12.5px] text-ink-subtle max-w-[280px] mx-auto leading-relaxed">
          Pick a row in the grid to inspect the expected answer and how each
          model deviated from it.
        </p>
      </div>
    );
  }

  return (
    <div className="hx-surface">
      <div className="px-5 pt-4 pb-3 border-b border-line/8">
        <div className="hx-eyebrow text-accent mb-1">Case detail</div>
        <div className="text-[13.5px] text-ink leading-snug">
          {caseObj.prompt}
        </div>
        {caseObj.rubric && (
          <div className="mt-2 text-[11.5px] text-ink-subtle italic">
            Rubric: {caseObj.rubric}
          </div>
        )}
      </div>

      <div className="p-5 border-b border-line/8">
        <div className="hx-eyebrow text-ink-subtle mb-2">Expected</div>
        <pre className="text-[12.5px] text-ink whitespace-pre-wrap font-mono bg-bg-elevated/40 border border-line/8 rounded-md p-3 leading-relaxed">
{caseObj.expected}
        </pre>
      </div>

      <div className="p-5 flex flex-col gap-5">
        {perModel.map((p, i) => (
          <motion.div
            key={p.model}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: i * 0.05 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-[12px] text-ink">{p.model}</span>
              {p.result?.status === "pass" && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-ok/10 text-ok border border-ok/20">
                  <Check className="h-3 w-3" /> pass
                </span>
              )}
              {p.result?.status === "fail" && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-danger/10 text-danger border border-danger/20">
                  <X className="h-3 w-3" /> fail
                </span>
              )}
              {p.result?.status &&
                (p.result.status === "pass" || p.result.status === "fail") && (
                  <span className="ml-auto text-[10.5px] font-mono text-ink-subtle">
                    score {(p.result.score * 100).toFixed(0)} ·{" "}
                    {p.result.latencyMs}ms
                  </span>
                )}
            </div>
            <div className="bg-bg-elevated/40 border border-line/8 rounded-md p-3 text-[12.5px] font-mono whitespace-pre-wrap leading-relaxed">
              {p.result && p.result.actual
                ? renderDiff(caseObj.expected, p.result.actual)
                : <span className="text-ink-dim">— pending —</span>}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
