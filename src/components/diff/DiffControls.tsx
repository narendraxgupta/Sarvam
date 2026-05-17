import {
  ArrowLeftRight,
  ChevronLeft,
  ChevronRight,
  Download,
  FileJson,
  FileText,
  Filter,
  Link2,
  Printer,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { Switch } from "@/components/ui/Switch";
import { Kbd } from "@/components/shared/Kbd";
import { cn, formatMs } from "@/lib/utils";
import { useDiffStore, type DiffFilter } from "@/store/diffStore";
import { toast } from "@/lib/toast";
import { buildShareUrl, copyToClipboard } from "@/lib/share/url";
import {
  diffToJSON,
  diffToMarkdown,
  downloadFile,
  exportTimestamp,
  printToPdf,
} from "@/lib/export";

const FILTERS: { id: DiffFilter; label: string; cls: string }[] = [
  { id: "all", label: "All", cls: "" },
  { id: "ins", label: "Add", cls: "text-ok" },
  { id: "rep", label: "Replace", cls: "text-accent" },
  { id: "del", label: "Remove", cls: "text-warn" },
];

export function DiffControls() {
  const filter = useDiffStore((s) => s.filter);
  const setFilter = useDiffStore((s) => s.setFilter);
  const onlyChanges = useDiffStore((s) => s.onlyChanges);
  const setOnlyChanges = useDiffStore((s) => s.setOnlyChanges);
  const swap = useDiffStore((s) => s.swap);
  const result = useDiffStore((s) => s.result);
  const current = useDiffStore((s) => s.currentChange);
  const setCurrent = useDiffStore((s) => s.setCurrentChange);
  const reload = useDiffStore((s) => s.loadSample);
  const prompt = useDiffStore((s) => s.prompt);
  const outputA = useDiffStore((s) => s.outputA);
  const outputB = useDiffStore((s) => s.outputB);
  const modelA = useDiffStore((s) => s.modelA);
  const modelB = useDiffStore((s) => s.modelB);

  const count = result.changeCount;

  const share = async () => {
    const url = buildShareUrl({
      v: 1,
      kind: "diff",
      prompt,
      outputA,
      outputB,
      modelA,
      modelB,
    });
    const ok = await copyToClipboard(url);
    if (ok) {
      toast.success("Share link copied", "Both outputs and models included.");
    } else {
      toast.danger("Couldn't copy link");
    }
  };

  const exportMd = () => {
    const md = diffToMarkdown({ prompt, outputA, outputB, modelA, modelB });
    downloadFile(md, `helix-diff-${exportTimestamp()}.md`, "text/markdown");
    toast.success("Exported diff as Markdown");
  };

  const exportJson = () => {
    const json = diffToJSON({ prompt, outputA, outputB, modelA, modelB });
    downloadFile(json, `helix-diff-${exportTimestamp()}.json`, "application/json");
    toast.success("Exported diff as JSON");
  };

  const exportPdf = () => {
    toast.info("Opening print dialog", "Choose 'Save as PDF' as the destination.");
    printToPdf({ regionId: "diff-printable", title: `Helix diff · ${modelA} vs ${modelB}` });
  };

  return (
    <div className="h-10 flex items-center gap-2 px-3 rounded-xl border border-line bg-bg-surface/60 backdrop-blur-xl">
      <div className="flex items-center gap-2 min-w-0">
        <Filter className="h-3.5 w-3.5 text-ink-subtle shrink-0" />
        <span className="text-[10px] uppercase tracking-[0.14em] text-ink-dim font-mono truncate">
          Myers O(ND) · <span className="italic text-ink-muted">{formatMs(result.ms)}</span> ·
          D=<span className="italic text-ink-muted">{result.d}</span> ·
          <span className="italic text-ink-muted"> {result.a.length}↔{result.b.length}</span> tokens
        </span>
      </div>

      <div className="hx-divider-y h-6 mx-1" />

      <div className="flex items-center gap-1">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={cn(
              "px-2.5 h-7 rounded-md text-2xs font-semibold uppercase tracking-tightish",
              "border transition-all",
              filter === f.id
                ? "bg-gradient-to-b from-white/[0.07] to-white/[0.02] text-ink border-line-strong shadow-ring-soft"
                : "border-line text-ink-muted hover:text-ink hover:border-line-strong",
              f.cls,
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="hx-divider-y h-6 mx-1" />

      <div className="flex items-center gap-2 text-2xs text-ink-muted">
        <Switch
          checked={onlyChanges}
          onCheckedChange={setOnlyChanges}
          aria-label="Show only changed regions"
        />
        Only changes
      </div>

      <div className="flex-1" />

      <Button
        size="sm"
        variant="ghost"
        className="h-7"
        onClick={() => reload()}
      >
        <Sparkles className="h-3 w-3" />
        <span className="text-xs">Reset sample</span>
      </Button>

      <Button size="sm" variant="ghost" className="h-7" onClick={() => swap()}>
        <ArrowLeftRight className="h-3 w-3" />
        <span className="text-xs">Swap A ↔ B</span>
      </Button>

      <Button size="sm" variant="ghost" className="h-7" onClick={share}>
        <Link2 className="h-3 w-3" />
        <span className="text-xs">Share</span>
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="ghost" className="h-7">
            <Download className="h-3 w-3" />
            <span className="text-xs">Export</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuLabel>Export diff</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={exportMd}>
            <FileText className="h-3.5 w-3.5" />
            <span>Markdown (.md)</span>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={exportJson}>
            <FileJson className="h-3.5 w-3.5" />
            <span>JSON (.json)</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={exportPdf}>
            <Printer className="h-3.5 w-3.5" />
            <span>PDF · Print</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="hx-divider-y h-6 mx-1" />

      <div className="flex items-center gap-1">
        <Button
          size="sm"
          variant="outline"
          className="h-7 px-2"
          onClick={() => setCurrent(Math.max(0, current - 1))}
          disabled={count === 0 || current === 0}
          aria-label="Previous change"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </Button>
        <span className="font-mono tabular-nums text-2xs text-ink min-w-[64px] text-center">
          {count === 0 ? "no changes" : `${current + 1} / ${count}`}
        </span>
        <Button
          size="sm"
          variant="outline"
          className="h-7 px-2"
          onClick={() => setCurrent(Math.min(count - 1, current + 1))}
          disabled={count === 0 || current === count - 1}
          aria-label="Next change"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
        <div className="ml-1 flex items-center gap-1 text-2xs text-ink-subtle">
          <Kbd>j</Kbd>
          <Kbd>k</Kbd>
        </div>
      </div>
    </div>
  );
}
