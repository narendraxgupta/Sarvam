import { useMemo } from "react";
import { useDiffStore } from "@/store/diffStore";
import { cn } from "@/lib/utils";

export function DiffMinimap() {
  const result = useDiffStore((s) => s.result);
  const current = useDiffStore((s) => s.currentChange);
  const setCurrent = useDiffStore((s) => s.setCurrentChange);

  const ticks = useMemo(() => {
    const out: Array<{ idx: number; cls: string; label: string }> = [];
    let changeIdx = -1;
    for (const op of result.ops) {
      if (op.kind === "eq") continue;
      changeIdx++;
      out.push({
        idx: changeIdx,
        cls:
          op.kind === "ins"
            ? "bg-ok"
            : op.kind === "del"
            ? "bg-warn"
            : "bg-accent",
        label:
          op.kind === "ins"
            ? "Insertion"
            : op.kind === "del"
            ? "Deletion"
            : "Replacement",
      });
    }
    return out;
  }, [result]);

  if (ticks.length === 0) {
    return (
      <div className="w-3 h-full bg-bg-elevated border border-line rounded-md" />
    );
  }

  return (
    <div
      className="w-3 h-full bg-bg-elevated border border-line rounded-md py-1 flex flex-col gap-[2px] items-stretch"
      role="navigation"
      aria-label="Diff minimap"
    >
      {ticks.map((t) => (
        <button
          key={t.idx}
          type="button"
          onClick={() => setCurrent(t.idx)}
          className={cn(
            "flex-1 mx-[2px] rounded-sm transition-all",
            t.cls,
            t.idx === current
              ? "scale-y-150 ring-1 ring-ink/40"
              : "opacity-60 hover:opacity-100",
          )}
          aria-label={`${t.label} ${t.idx + 1}`}
          title={t.label}
        />
      ))}
    </div>
  );
}
