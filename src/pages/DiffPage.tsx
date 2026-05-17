import { useEffect, useMemo, useRef } from "react";
import { DiffControls } from "@/components/diff/DiffControls";
import { DiffPane } from "@/components/diff/DiffPane";
import { DiffMinimap } from "@/components/diff/DiffMinimap";
import { DiffEditor } from "@/components/diff/DiffEditor";
import { DiffLegend } from "@/components/diff/DiffLegend";
import { PageHeader } from "@/components/layout/PageHeader";
import { StaggerReveal } from "@/components/shared/StaggerReveal";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/Resizable";
import { useShortcut } from "@/lib/keyboard/useShortcut";
import { useDiffStore } from "@/store/diffStore";
import { getModelMeta } from "@/store/playgroundStore";

export function DiffPage() {
  const nextChange = useDiffStore((s) => s.nextChange);
  const prevChange = useDiffStore((s) => s.prevChange);
  const prompt = useDiffStore((s) => s.prompt);
  const result = useDiffStore((s) => s.result);
  const modelA = useDiffStore((s) => s.modelA);
  const modelB = useDiffStore((s) => s.modelB);

  useShortcut([
    { key: "j", handler: () => nextChange() },
    { key: "k", handler: () => prevChange() },
  ]);

  const aScroll = useRef<HTMLDivElement | null>(null);
  const bScroll = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const a = aScroll.current;
    const b = bScroll.current;
    if (!a || !b) return;
    let syncing = false;
    const sync = (from: HTMLDivElement, to: HTMLDivElement) => () => {
      if (syncing) return;
      syncing = true;
      const denom = Math.max(1, from.scrollHeight - from.clientHeight);
      const ratio = from.scrollTop / denom;
      to.scrollTop = ratio * (to.scrollHeight - to.clientHeight);
      requestAnimationFrame(() => (syncing = false));
    };
    const onA = sync(a, b);
    const onB = sync(b, a);
    a.addEventListener("scroll", onA, { passive: true });
    b.addEventListener("scroll", onB, { passive: true });
    return () => {
      a.removeEventListener("scroll", onA);
      b.removeEventListener("scroll", onB);
    };
  }, []);

  const summary = useMemo(() => {
    let added = 0;
    let removed = 0;
    let replaced = 0;
    let unchanged = 0;
    for (const op of result.ops) {
      if (op.kind === "ins") added += op.tokens.filter((t) => t.kind === "word").length;
      else if (op.kind === "del") removed += op.tokens.filter((t) => t.kind === "word").length;
      else if (op.kind === "rep") replaced += op.to.filter((t) => t.kind === "word").length;
      else
        unchanged += op.tokensA.filter((t) => t.kind === "word").length;
    }
    const total = added + removed + replaced + unchanged;
    const similarity = total === 0 ? 100 : Math.round((unchanged / total) * 100);
    return { added, removed, replaced, unchanged, similarity };
  }, [result]);

  const aMeta = getModelMeta(modelA);
  const bMeta = getModelMeta(modelB);

  return (
    <StaggerReveal
      id="diff-printable"
      data-printable
      data-print-region="diff"
      className="min-w-0 px-4 lg:px-6 pt-4 pb-8"
    >
      <PageHeader
        eyebrow="Compare · Token diff"
        title={
          <>
            Spot the difference,<br />
            <em>token by token.</em>
          </>
        }
        description={
          <>
            A Myers O(ND) diff renders semantic deltas between two model
            outputs — additions, removals, and replacements — annotated
            with per-token edit kinds. Use{" "}
            <span className="hx-kbd">j</span>{" "}
            <span className="hx-kbd">k</span> to walk through every change.
          </>
        }
        trailing={<DiffEditor />}
      />

      <div className="hx-surface p-6 mb-4">
        <div className="grid grid-cols-[1fr_auto] gap-8 items-end">
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="hx-eyebrow">From</span>
            <span className="font-display text-[18px] font-semibold text-ink">
              {aMeta.name}
            </span>
            <span className="text-ink-dim text-[18px]">→</span>
            <span className="hx-eyebrow">To</span>
            <span className="font-display text-[18px] font-semibold text-ink">
              {bMeta.name}
            </span>
          </div>

          <div className="text-right">
            <div className="hx-eyebrow mb-1">Similarity</div>
            <div
              className="hx-mono-tab text-[56px] leading-[0.9] font-light text-ink"
              style={{ letterSpacing: "-0.04em" }}
            >
              {summary.similarity}
              <span className="text-[28px] text-ink-subtle font-light ml-0.5">%</span>
            </div>
          </div>
        </div>

        <div className="hx-divider-x my-6" />

        <div className="flex items-center gap-8 flex-wrap">
          <SummaryChip count={summary.added} label="added" tone="ok" />
          <SummaryChip count={summary.replaced} label="replaced" tone="accent" />
          <SummaryChip count={summary.removed} label="removed" tone="warn" />
          <div className="flex-1 min-w-[200px]" />
          <DiffLegend />
        </div>

        {prompt && (
          <div className="mt-4 pt-4 border-t border-line/8">
            <div className="hx-eyebrow mb-1.5">Prompt</div>
            <p className="text-[13px] font-light text-ink-muted italic leading-relaxed line-clamp-2">
              "{prompt}"
            </p>
          </div>
        )}
      </div>

      <DiffControls />

      <div className="mt-3 grid grid-cols-[minmax(0,1fr)_14px] gap-3 h-[70vh] min-h-[480px]">
        <ResizablePanelGroup direction="horizontal" autoSaveId="hx-diff-ab-v1">
          <ResizablePanel defaultSize={50} minSize={25}>
            <DiffPane side="a" scrollRef={aScroll} />
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={50} minSize={25}>
            <DiffPane side="b" scrollRef={bScroll} />
          </ResizablePanel>
        </ResizablePanelGroup>
        <DiffMinimap />
      </div>
    </StaggerReveal>
  );
}

function SummaryChip({
  count,
  label,
  tone,
}: {
  count: number;
  label: string;
  tone: "ok" | "accent" | "warn";
}) {
  const color =
    tone === "ok"
      ? "text-ok"
      : tone === "accent"
      ? "text-accent"
      : "text-warn";
  const dotBg =
    tone === "ok"
      ? "bg-ok"
      : tone === "accent"
      ? "bg-accent"
      : "bg-warn";
  return (
    <div className="flex items-baseline gap-2">
      <span
        className={`inline-block h-1.5 w-1.5 rounded-full self-center ${dotBg}`}
      />
      <span
        className={`hx-mono-tab text-[24px] font-light ${color}`}
        style={{ letterSpacing: "-0.02em" }}
      >
        {count}
      </span>
      <span className="hx-eyebrow">{label}</span>
    </div>
  );
}
