import { useEffect, useRef, useState } from "react";
import {
  ArrowDownToLine,
  Check,
  Copy,
  Download,
  FileJson,
  FileText,
  GitCompare,
  Link2,
  RotateCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { PhasePill } from "@/components/shared/PhasePill";
import { usePlaygroundStore, getModelMeta } from "@/store/playgroundStore";
import { useReducedMotion } from "@/lib/a11y/useReducedMotion";
import { useAnnouncer } from "@/lib/a11y/useAnnouncer";
import { useDiffStore } from "@/store/diffStore";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/toast";
import { buildShareUrl, copyToClipboard } from "@/lib/share/url";
import {
  downloadFile,
  exportTimestamp,
  inferenceToJSON,
  inferenceToMarkdown,
} from "@/lib/export";

export function StreamView() {
  const phase = usePlaygroundStore((s) => s.phase);
  const output = usePlaygroundStore((s) => s.output);
  const error = usePlaygroundStore((s) => s.error);
  const runInference = usePlaygroundStore((s) => s.runInference);
  const setOutputA = useDiffStore((s) => s.setOutputA);
  const setOutputB = useDiffStore((s) => s.setOutputB);
  const setPromptDiff = useDiffStore((s) => s.setPrompt);
  const playgroundPrompt = usePlaygroundStore((s) => s.prompt);
  const model = usePlaygroundStore((s) => s.model);
  const temperature = usePlaygroundStore((s) => s.temperature);
  const maxTokens = usePlaygroundStore((s) => s.maxTokens);
  const metrics = usePlaygroundStore((s) => s.metrics);

  const reduced = useReducedMotion();
  const announce = useAnnouncer();
  const navigate = useNavigate();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [copied, setCopied] = useState(false);

  const isStreaming = phase === "streaming" || phase === "connecting";
  const hasOutput = output.length > 0;

  useEffect(() => {
    if (!isStreaming || !autoScroll) return;
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [output, isStreaming, autoScroll]);

  const lastAnnouncedRef = useRef(0);
  useEffect(() => {
    if (!isStreaming) return;
    const since = output.slice(lastAnnouncedRef.current);
    const idx = since.search(/[.!?]\s/);
    if (idx === -1) return;
    const announcedTo = lastAnnouncedRef.current + idx + 1;
    announce(output.slice(lastAnnouncedRef.current, announcedTo));
    lastAnnouncedRef.current = announcedTo;
  }, [output, isStreaming, announce]);

  useEffect(() => {
    if (phase === "connecting") {
      lastAnnouncedRef.current = 0;
      setAutoScroll(true);
    }
    if (phase === "done") {
      announce("Inference complete.");
    }
    if (phase === "partial-error") {
      announce("Stream errored. Partial output preserved.");
    }
  }, [phase, announce]);

  const onScroll = () => {
    const el = scrollerRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 24;
    setAutoScroll(atBottom);
  };

  const copiedTimerRef = useRef<number | null>(null);
  useEffect(() => {
    return () => {
      if (copiedTimerRef.current !== null) {
        window.clearTimeout(copiedTimerRef.current);
      }
    };
  }, []);

  const copy = async () => {
    const ok = await copyToClipboard(output);
    if (!ok) {
      toast.danger("Copy failed", "Your browser blocked clipboard access.");
      return;
    }
    setCopied(true);
    if (copiedTimerRef.current !== null) {
      window.clearTimeout(copiedTimerRef.current);
    }
    copiedTimerRef.current = window.setTimeout(() => {
      setCopied(false);
      copiedTimerRef.current = null;
    }, 1500);
    toast.success("Copied to clipboard");
  };

  const compareWithB = () => {
    setPromptDiff(playgroundPrompt);
    setOutputA(output);
    setOutputB(
      output + "\n\n(Edit this side to compare another model's output.)",
    );
    navigate("/diff");
  };

  const modelMeta = getModelMeta(model);

  const shareLink = async () => {
    const url = buildShareUrl({
      v: 1,
      prompt: playgroundPrompt,
      model,
      temperature,
      maxTokens,
    });
    const ok = await copyToClipboard(url);
    if (ok) {
      toast.success("Share link copied", "Anyone with this link sees your prompt + settings.");
    } else {
      toast.danger("Couldn't copy link", "Clipboard access was denied.");
    }
  };

  const exportMarkdown = () => {
    const md = inferenceToMarkdown({
      prompt: playgroundPrompt,
      model: modelMeta.id,
      output,
      metrics: {
        tokens: metrics.tokens,
        ttft: metrics.ttft,
        durationMs: metrics.durationMs,
        tokensPerSec: metrics.tokensPerSec,
      },
      createdAt: Date.now(),
    });
    downloadFile(md, `helix-${exportTimestamp()}.md`, "text/markdown");
    toast.success("Exported as Markdown");
  };

  const exportJson = () => {
    const json = inferenceToJSON({
      prompt: playgroundPrompt,
      model: modelMeta.id,
      output,
      metrics: {
        tokens: metrics.tokens,
        ttft: metrics.ttft,
        durationMs: metrics.durationMs,
        tokensPerSec: metrics.tokensPerSec,
      },
      createdAt: Date.now(),
    });
    downloadFile(json, `helix-${exportTimestamp()}.json`, "application/json");
    toast.success("Exported as JSON");
  };

  return (
    <section
      className="hx-surface flex flex-col h-full overflow-hidden"
      aria-label="Inference output"
    >
      <div className="h-10 px-3 flex items-center gap-2 border-b border-line/8">
        <PhasePill phase={phase} />
        <span className="hidden sm:inline text-2xs text-ink-subtle font-mono tracking-tightish">
          {modelMeta.id}
        </span>
        {error && (
          <span className="text-2xs text-danger font-medium">{error}</span>
        )}
        <div className="flex-1" />
        <Button
          variant="ghost"
          size="sm"
          className="h-7"
          onClick={() => runInference()}
          disabled={isStreaming || !playgroundPrompt.trim()}
        >
          <RotateCw className="h-3 w-3" />
          <span className="text-xs">Re-run</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-7"
          onClick={copy}
          disabled={!hasOutput}
        >
          {copied ? (
            <Check className="h-3 w-3 text-ok" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
          <span className="text-xs">{copied ? "Copied" : "Copy"}</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-7"
          onClick={shareLink}
          disabled={!playgroundPrompt.trim()}
          title="Copy share link"
        >
          <Link2 className="h-3 w-3" />
          <span className="text-xs hidden md:inline">Share</span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7"
              disabled={!hasOutput}
              title="Export"
            >
              <Download className="h-3 w-3" />
              <span className="text-xs hidden md:inline">Export</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuLabel>Export response</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={exportMarkdown}>
              <FileText className="h-3.5 w-3.5" />
              <span>Markdown (.md)</span>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={exportJson}>
              <FileJson className="h-3.5 w-3.5" />
              <span>JSON (.json)</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          variant="ghost"
          size="sm"
          className="h-7"
          onClick={compareWithB}
          disabled={!hasOutput}
        >
          <GitCompare className="h-3 w-3" />
          <span className="text-xs hidden md:inline">Compare</span>
        </Button>
      </div>

      <div className="flex-1 min-h-0 relative">
        <div
          ref={scrollerRef}
          onScroll={onScroll}
          className="absolute inset-0 overflow-auto px-6 py-5"
        >
          {playgroundPrompt.trim() && (
            <div className="mb-5 pb-4 border-b border-line/8">
              <div className="hx-eyebrow mb-1.5">Prompt</div>
              <p className="text-[13px] leading-relaxed text-ink-muted whitespace-pre-wrap line-clamp-4">
                {playgroundPrompt}
              </p>
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="mb-4 rounded-md border border-warn/30 bg-warn/10 px-3 py-2 text-xs text-warn"
            >
              <span className="font-semibold">Stream interrupted.</span>{" "}
              Partial output below is preserved exactly as it arrived.{" "}
              <button
                type="button"
                onClick={() => runInference()}
                className="underline underline-offset-2 hover:opacity-80"
              >
                Retry from the same prompt
              </button>
              .
            </div>
          )}

          {!hasOutput && phase === "idle" ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="hx-eyebrow text-ink-dim flex items-center gap-3">
                <span aria-hidden className="inline-block h-px w-6 bg-ink/30" />
                <span>Ready to stream</span>
                <span aria-hidden className="inline-block h-px w-6 bg-ink/30" />
              </div>
            </div>
          ) : (
            <>
              <div className="hx-eyebrow mb-2">
                {phase === "done"
                  ? "Response"
                  : isStreaming
                  ? "Streaming"
                  : "Response"}
              </div>
              <output
                aria-live="polite"
                aria-busy={isStreaming}
                className="token block whitespace-pre-wrap text-ink"
              >
                <span
                  className={cn(
                    "token text-ink",
                    reduced ? "" : "transition-opacity duration-150",
                  )}
                >
                  {output}
                </span>
                {isStreaming && <span className="caret" aria-hidden />}
              </output>
            </>
          )}
        </div>

        {isStreaming && !autoScroll && hasOutput && (
          <button
            type="button"
            onClick={() => {
              setAutoScroll(true);
              scrollerRef.current?.scrollTo({
                top: scrollerRef.current.scrollHeight,
                behavior: reduced ? "auto" : "smooth",
              });
            }}
            className={cn(
              "absolute bottom-3 left-1/2 -translate-x-1/2 z-10",
              "inline-flex items-center gap-1.5",
              "h-7 px-3 rounded-full text-xs font-medium",
              "bg-bg-elevated border border-accent/30 text-accent shadow-glow-accent",
              "animate-fade-in",
            )}
          >
            <ArrowDownToLine className="h-3 w-3" />
            Jump to live
          </button>
        )}
      </div>
    </section>
  );
}
