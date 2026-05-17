import { useCallback, useEffect, useMemo, useRef } from "react";
import { useDiffStore } from "@/store/diffStore";
import type { DiffOp } from "@/types";
import { cn } from "@/lib/utils";
import { MODELS } from "@/data/models";
import { useReducedMotion } from "@/lib/a11y/useReducedMotion";

interface DiffPaneProps {
  side: "a" | "b";
  scrollRef?: { current: HTMLDivElement | null };
}

export function DiffPane({ side, scrollRef }: DiffPaneProps) {
  const result = useDiffStore((s) => s.result);
  const filter = useDiffStore((s) => s.filter);
  const onlyChanges = useDiffStore((s) => s.onlyChanges);
  const current = useDiffStore((s) => s.currentChange);
  const setCurrent = useDiffStore((s) => s.setCurrentChange);
  const modelA = useDiffStore((s) => s.modelA);
  const modelB = useDiffStore((s) => s.modelB);

  const localScrollRef = useRef<HTMLDivElement | null>(null);
  const setScrollRef = useCallback(
    (el: HTMLDivElement | null) => {
      localScrollRef.current = el;
      if (scrollRef) scrollRef.current = el;
    },
    [scrollRef],
  );

  const reduced = useReducedMotion();
  const model = side === "a" ? modelA : modelB;
  const modelMeta = MODELS.find((m) => m.id === model) ?? MODELS[0];

    // Walk ops and produce renderable spans, indexed by changeIndex.
    const rendered = useMemo(() => {
      const items: Array<{
        key: string;
        text: string;
        cls?: string;
        changeIndex?: number;
        op?: DiffOp["kind"];
      }> = [];
      let changeIdx = -1;
      for (let i = 0; i < result.ops.length; i++) {
        const op = result.ops[i];
        if (op.kind === "eq") {
          const tokens = side === "a" ? op.tokensA : op.tokensB;
          // Skip eq in only-changes mode unless it's a tiny neighbour gap.
          if (onlyChanges) {
            const text = tokens.map((t) => t.text).join("");
            const trimmed =
              text.length > 24
                ? text.slice(0, 12) + " ⋯ " + text.slice(-12)
                : text;
            items.push({ key: `eq-${i}`, text: trimmed, cls: "text-ink-subtle/70" });
          } else {
            items.push({
              key: `eq-${i}`,
              text: tokens.map((t) => t.text).join(""),
            });
          }
          continue;
        }

        changeIdx++;
        const passesFilter =
          filter === "all" ||
          (filter === "ins" && op.kind === "ins") ||
          (filter === "del" && op.kind === "del") ||
          (filter === "rep" && op.kind === "rep");

        if (op.kind === "ins") {
          if (side === "b") {
            items.push({
              key: `op-${i}`,
              text: op.tokens.map((t) => t.text).join(""),
              cls: cn("token-add", !passesFilter && "opacity-30"),
              changeIndex: changeIdx,
              op: "ins",
            });
          } else {

            items.push({
              key: `anchor-${i}`,
              text: "",
              cls: "inline-block w-0 h-0",
              changeIndex: changeIdx,
              op: "ins",
            });
          }
        } else if (op.kind === "del") {
          if (side === "a") {
            items.push({
              key: `op-${i}`,
              text: op.tokens.map((t) => t.text).join(""),
              cls: cn("token-del", !passesFilter && "opacity-30"),
              changeIndex: changeIdx,
              op: "del",
            });
          } else {
            // Same symmetry trick for the B side — see comment above.
            items.push({
              key: `anchor-${i}`,
              text: "",
              cls: "inline-block w-0 h-0",
              changeIndex: changeIdx,
              op: "del",
            });
          }
        } else {
          const tokens = side === "a" ? op.from : op.to;
          items.push({
            key: `op-${i}`,
            text: tokens.map((t) => t.text).join(""),
            cls: cn("token-rep", !passesFilter && "opacity-30"),
            changeIndex: changeIdx,
            op: "rep",
          });
        }
      }
      return items;
    }, [result, filter, onlyChanges, side]);

  useEffect(() => {
    const el = localScrollRef.current?.querySelector<HTMLElement>(
      `[data-change-index="${current}"]`,
    );
    if (el) {
      el.scrollIntoView({
        block: "center",
        behavior: reduced ? "auto" : "smooth",
      });
    }
  }, [current, rendered, reduced]);

  const onTokenClick = useCallback(
    (idx?: number) => {
      if (typeof idx === "number") setCurrent(idx);
    },
    [setCurrent],
  );

  const accent = side === "a" ? "amber" : "azure";
  return (
    <div className="hx-surface flex flex-col h-full overflow-hidden min-w-0">
      <div className="h-11 px-3 flex items-center gap-2.5 border-b border-line shrink-0 relative">
        <span
          aria-hidden
          className={cn(
            "absolute top-0 inset-x-0 h-px",
            accent === "amber"
              ? "bg-gradient-to-r from-transparent via-amber/50 to-transparent"
              : "bg-gradient-to-r from-transparent via-accent/50 to-transparent",
          )}
        />
        <div
          className={cn(
            "grid h-6 w-6 place-items-center rounded-md font-mono text-2xs font-bold",
            accent === "amber"
              ? "bg-warn/10 border border-warn/30 text-warn"
              : "bg-accent/10 border border-accent/30 text-accent",
          )}
        >
          {side === "a" ? "A" : "B"}
        </div>
        <div className="flex flex-col min-w-0 leading-tight">
          <span className="text-[13px] font-semibold text-ink truncate tracking-tightish">
            {modelMeta.name}
          </span>
          <span className="text-[9px] uppercase tracking-[0.1em] text-ink-dim font-mono">
            {modelMeta.parameters} · {modelMeta.contextLength.toLocaleString()}{" "}
            ctx
          </span>
        </div>
        <div className="flex-1" />
        <span className="hx-chip h-5 px-1.5 text-[9px]">
          {(side === "a" ? result.a : result.b).length} tokens
        </span>
      </div>
      <div
        ref={setScrollRef}
        className="flex-1 min-h-0 overflow-auto px-4 py-3 scrollbar-thin"
      >
        <div className="token leading-[1.75] break-words">
          {rendered.map((item) => {
            if (item.cls && item.changeIndex !== undefined) {
              const focused = item.changeIndex === current;

              const isAnchor = item.key.startsWith("anchor-");
              return (
                <span
                  key={item.key}
                  className={cn(
                    item.cls,
                    !isAnchor && "cursor-pointer transition-shadow",
                    focused &&
                      !isAnchor &&
                      "ring-2 ring-offset-2 ring-offset-bg ring-accent",
                  )}
                  data-change-index={item.changeIndex}
                  onClick={isAnchor ? undefined : () => onTokenClick(item.changeIndex)}
                  aria-hidden={isAnchor || undefined}
                  title={
                    isAnchor
                      ? undefined
                      : item.op === "ins"
                      ? "Inserted"
                      : item.op === "del"
                      ? "Removed"
                      : item.op === "rep"
                      ? "Replaced"
                      : ""
                  }
                >
                  {item.text}
                </span>
              );
            }
            return (
              <span key={item.key} className={item.cls}>
                {item.text}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
