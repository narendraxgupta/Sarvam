import { motion } from "framer-motion";
import { GitCommit, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { SavedPrompt } from "@/types/library";
import { useLibraryStore } from "@/store/libraryStore";
import { toast } from "@/lib/toast";

interface Props {
  prompt: SavedPrompt;
}

function relative(ts: number): string {
  const m = Math.floor((Date.now() - ts) / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export function VersionTimeline({ prompt }: Props) {
  const updatePrompt = useLibraryStore((s) => s.updatePrompt);

  const revert = (idx: number) => {
    const v = prompt.versions[idx];
    if (!v) return;
    updatePrompt(prompt.id, { body: v.body });
    toast.info("Reverted to earlier version", "Body restored. Save to commit.");
  };

  // Newest first
  const ordered = [...prompt.versions].reverse();

  return (
    <section className="hx-surface flex flex-col h-full overflow-hidden">
      <header className="px-5 pt-4 pb-3 border-b border-line/8">
        <div className="hx-eyebrow text-accent">Version history</div>
        <div className="text-[12.5px] text-ink-muted">
          Every save snapshots an immutable copy
        </div>
      </header>
      <div className="flex-1 min-h-0 overflow-auto scrollbar-thin">
        <ol className="px-5 py-4 flex flex-col">
          {ordered.map((v, i) => {
            const isHead = i === 0;
            return (
              <motion.li
                key={v.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, delay: Math.min(i * 0.04, 0.2) }}
                className="grid grid-cols-[18px_1fr] gap-3 pb-4 last:pb-0 relative"
              >
                {i < ordered.length - 1 && (
                  <span
                    aria-hidden
                    className="absolute left-[8px] top-5 bottom-0 w-px bg-line/30"
                  />
                )}
                <div className="pt-1.5">
                  <span
                    className={`grid place-items-center h-4 w-4 rounded-full border ${
                      isHead
                        ? "border-accent/40 bg-accent/15 text-accent"
                        : "border-line/20 bg-bg-elevated text-ink-subtle"
                    }`}
                  >
                    <GitCommit className="h-2.5 w-2.5" />
                  </span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[12.5px] font-medium text-ink">
                      {isHead ? "HEAD" : `v${prompt.versions.length - i}`}
                    </span>
                    <span className="text-[10.5px] text-ink-subtle font-mono">
                      {relative(v.createdAt)}
                    </span>
                    {!isHead && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="ml-auto h-6 gap-1"
                        onClick={() => revert(prompt.versions.length - 1 - i)}
                      >
                        <RotateCcw className="h-3 w-3" />
                        <span className="text-[11px]">Revert</span>
                      </Button>
                    )}
                  </div>
                  {v.message && (
                    <div className="text-[12px] text-ink-muted italic mb-1.5">
                      {v.message}
                    </div>
                  )}
                  <pre className="text-[11.5px] font-mono text-ink-muted whitespace-pre-wrap line-clamp-4 bg-bg-elevated/40 border border-line/8 rounded p-2 leading-relaxed">
{v.body}
                  </pre>
                </div>
              </motion.li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
