import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  AudioLines,
  BookmarkPlus,
  Cable,
  Mic,
  Play,
  Radio,
  Square,
  Settings2,
  Type,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Slider } from "@/components/ui/Slider";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { Kbd } from "@/components/shared/Kbd";
import { combo } from "@/lib/keyboard/platform";
import { useReducedMotion } from "@/lib/a11y/useReducedMotion";
import { usePlaygroundStore } from "@/store/playgroundStore";
import { useLibraryStore } from "@/store/libraryStore";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { SAMPLE_PROMPTS } from "@/data/samplePrompts";
import type { FailureMode } from "@/types";
import { AudioRecorder } from "./AudioRecorder";

const FAILURE_MODES: { id: FailureMode; label: string; desc: string }[] = [
  { id: "none", label: "Normal", desc: "Clean stream, no faults injected." },
  {
    id: "network-drop",
    label: "Network drop",
    desc: "Connection fails before first byte. Tests connect-time recovery.",
  },
  {
    id: "timeout",
    label: "Connect timeout",
    desc: "Server hangs without responding. Aborts after 15s.",
  },
  {
    id: "malformed-chunk",
    label: "Malformed chunk",
    desc: "Junk SSE frame mid-stream. Parser must skip gracefully.",
  },
  {
    id: "slow-token",
    label: "Slow tokens (3x)",
    desc: "Demonstrates backpressure-aware rendering.",
  },
  {
    id: "mid-stream-500",
    label: "Mid-stream 500",
    desc: "Server crashes mid-generation. Partial output is preserved.",
  },
];

const PLACEHOLDERS = [
  `Ask anything · ${combo("Enter")} to run · ${combo("K")} for commands`,
  "Generate a TypeScript hook that consumes an SSE stream…",
  "Explain how speculative decoding cuts time-to-first-token…",
  "Draft a JSON Schema for inference stream events…",
  "Summarize the trade-offs of HTTP/2 multiplexing for RAG…",
];

export function InputDock() {
  const mode = usePlaygroundStore((s) => s.mode);
  const setMode = usePlaygroundStore((s) => s.setMode);
  const prompt = usePlaygroundStore((s) => s.prompt);
  const setPrompt = usePlaygroundStore((s) => s.setPrompt);
  const temperature = usePlaygroundStore((s) => s.temperature);
  const setTemperature = usePlaygroundStore((s) => s.setTemperature);
  const maxTokens = usePlaygroundStore((s) => s.maxTokens);
  const setMaxTokens = usePlaygroundStore((s) => s.setMaxTokens);
  const phase = usePlaygroundStore((s) => s.phase);
  const failureMode = usePlaygroundStore((s) => s.failureMode);
  const setFailureMode = usePlaygroundStore((s) => s.setFailureMode);
  const transport = usePlaygroundStore((s) => s.transport);
  const setTransport = usePlaygroundStore((s) => s.setTransport);
  const runInference = usePlaygroundStore((s) => s.runInference);
  const abort = usePlaygroundStore((s) => s.abort);
  const model = usePlaygroundStore((s) => s.model);
  const createPrompt = useLibraryStore((s) => s.createPrompt);
  const reduced = useReducedMotion();
  const isStreaming = phase === "streaming" || phase === "connecting";

  const savePromptToLibrary = () => {
    if (!prompt.trim()) {
      toast.warn("Nothing to save", "Type a prompt first.");
      return;
    }
    const title = prompt
      .split("\n")[0]
      .replace(/^\s*[#*-]+\s*/, "")
      .slice(0, 60) || "Untitled prompt";
    createPrompt({ title, body: prompt, model });
    toast.success("Saved to Library", "View it under the Library page.");
  };

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [placeholderIdx, setPlaceholderIdx] = useState(0);

  // Rotate placeholders only when textarea is empty.
  useEffect(() => {
    if (prompt) return;
    const id = setInterval(() => {
      setPlaceholderIdx((i) => (i + 1) % PLACEHOLDERS.length);
    }, 3500);
    return () => clearInterval(id);
  }, [prompt]);

  // Auto-grow textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 280) + "px";
  }, [prompt, mode]);

  const tokenEstimate = Math.ceil(prompt.length / 3.4);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 min-w-0">
        <div
          role="tablist"
          aria-label="Input mode"
          className="inline-flex items-center gap-1 rounded-lg border border-line/8 bg-bg-elevated p-1"
        >
          {(["text", "audio"] as const).map((m) => {
            const Icon = m === "text" ? Type : AudioLines;
            const active = mode === m;
            return (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setMode(m)}
                className={cn(
                  "relative flex items-center gap-1.5 h-7 px-2.5 rounded-md text-xs font-medium",
                  "transition-colors",
                  active ? "text-ink" : "text-ink-muted hover:text-ink",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="mode-active"
                    className="absolute inset-0 bg-bg rounded-md border border-line/8"
                    transition={
                      reduced
                        ? { duration: 0 }
                        : { duration: 0.22, ease: [0.16, 1, 0.3, 1] }
                    }
                    aria-hidden
                  />
                )}
                <Icon className="h-3.5 w-3.5 relative" />
                <span className="relative capitalize">{m}</span>
              </button>
            );
          })}
        </div>

        {mode === "audio" && (
          <span className="hx-chip">
            <Mic className="h-3 w-3 text-warn" />
            Echo ASR enabled
          </span>
        )}

        <div className="flex-1" />

        <div
          role="tablist"
          aria-label="Stream transport"
          className="inline-flex items-center gap-0.5 rounded-lg border border-line/8 bg-bg-elevated p-0.5"
          title="Switch between HTTP/2 SSE and WebSocket transport"
        >
          {(
            [
              { id: "http" as const, label: "HTTP", Icon: Cable },
              { id: "ws" as const, label: "WS", Icon: Radio },
            ]
          ).map(({ id, label, Icon }) => {
            const active = transport === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTransport(id)}
                disabled={isStreaming}
                className={cn(
                  "flex items-center gap-1 h-6 px-2 rounded-md text-2xs font-medium uppercase tracking-tightish transition-colors",
                  active
                    ? "bg-bg text-ink border border-line/8"
                    : "text-ink-muted hover:text-ink",
                  isStreaming && "opacity-50 cursor-not-allowed",
                )}
              >
                <Icon className="h-3 w-3" />
                {label}
              </button>
            );
          })}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7">
              <span className="text-2xs uppercase tracking-tightish text-ink-subtle font-semibold">
                Fault
              </span>
              <span
                className={cn(
                  "text-xs font-medium",
                  failureMode === "none"
                    ? "text-ink-muted"
                    : "text-warn",
                )}
              >
                {FAILURE_MODES.find((f) => f.id === failureMode)?.label}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <DropdownMenuLabel>Inject failure mode</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {FAILURE_MODES.map((f) => (
              <DropdownMenuItem
                key={f.id}
                onSelect={() => setFailureMode(f.id)}
                className={cn(
                  "flex-col items-start gap-0.5 py-2",
                  failureMode === f.id && "bg-ivory-soft text-ink",
                )}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "inline-block h-1.5 w-1.5 rounded-full",
                      f.id === "none" ? "bg-ok" : "bg-warn",
                    )}
                  />
                  <span className="font-medium text-ink">{f.label}</span>
                </div>
                <span className="text-2xs text-ink-subtle leading-tight">
                  {f.desc}
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7">
              <Settings2 className="h-3.5 w-3.5" />
              <span className="text-xs">Params</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-72">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-ink-muted">Temperature</label>
                  <span className="font-mono text-xs text-ink tabular-nums">
                    {temperature.toFixed(2)}
                  </span>
                </div>
                <Slider
                  value={[temperature]}
                  min={0}
                  max={1}
                  step={0.05}
                  onValueChange={(v) => setTemperature(v[0] ?? 0.4)}
                  aria-label="Temperature"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-ink-muted">Max tokens</label>
                  <span className="font-mono text-xs text-ink tabular-nums">
                    {maxTokens}
                  </span>
                </div>
                <Slider
                  value={[maxTokens]}
                  min={128}
                  max={4096}
                  step={128}
                  onValueChange={(v) => setMaxTokens(v[0] ?? 1024)}
                  aria-label="Max tokens"
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div
        data-tour-id="input-dock"
        className={cn(
          "hx-surface relative overflow-hidden transition-shadow duration-300",
          prompt.trim() ? "shadow-elev" : "",
          isStreaming
            ? "ring-1 ring-accent/35"
            : "",
        )}
      >
        {mode === "text" ? (
          <div className="flex">
            <div className="shrink-0 w-12 border-r border-line/8 bg-bg-elevated/40 flex flex-col items-center pt-3.5 gap-2">
              <span className="hx-eyebrow text-ink-dim">In</span>
              <span className="font-mono text-[10px] text-ink-dim tabular-nums">
                {String(prompt.split("\n").length).padStart(2, "0")}
              </span>
            </div>
            <div className="flex-1 min-w-0 p-3.5">
              <textarea
                ref={textareaRef}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={PLACEHOLDERS[placeholderIdx]}
                spellCheck={false}
                className={cn(
                  "w-full min-h-[88px] max-h-[280px] resize-none",
                  "bg-transparent text-ink placeholder:text-ink-subtle",
                  "font-sans text-[14.5px] leading-[1.55] tracking-tightish",
                  "outline-none",
                )}
                aria-label="Inference prompt"
              />
              <div className="flex items-center justify-between pt-2.5 mt-1 border-t border-line/8">
                <div className="flex items-center gap-2 text-2xs text-ink-subtle">
                  <span className="font-mono tabular-nums text-ink-muted">
                    ~{tokenEstimate}
                  </span>
                  <span className="uppercase tracking-[0.12em] text-ink-dim">
                    tokens
                  </span>
                  <span className="text-ink-dim mx-0.5">·</span>
                  <span className="uppercase tracking-[0.12em] text-ink-dim">
                    {transport === "ws" ? "WebSocket" : "HTTP/2 SSE"}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={savePromptToLibrary}
                    disabled={!prompt.trim()}
                    title="Save to library"
                  >
                    <BookmarkPlus className="h-3 w-3" />
                    <span className="text-xs hidden lg:inline">Save</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      const random =
                        SAMPLE_PROMPTS[
                          Math.floor(Math.random() * SAMPLE_PROMPTS.length)
                        ];
                      setPrompt(random.prompt);
                    }}
                  >
                    <span className="text-xs">Insert sample</span>
                  </Button>
                  {isStreaming ? (
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => abort()}
                      className="gap-1.5"
                    >
                      <Square className="h-3.5 w-3.5" />
                      <span className="text-xs font-medium">Abort</span>
                      <Kbd className="text-[9px]">{combo(".")}</Kbd>
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="accent"
                      onClick={() => runInference()}
                      disabled={!prompt.trim()}
                      className="gap-1.5 sheen"
                    >
                      <Play className="h-3.5 w-3.5 fill-current" />
                      <span className="text-xs font-medium">Run inference</span>
                      <Kbd className="text-[9px]">{combo("Enter")}</Kbd>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <AudioRecorder
            onTranscribe={(text) => {
              setPrompt(text);
              setMode("text");
            }}
          />
        )}
      </div>
    </div>
  );
}
