import { motion } from "framer-motion";
import { Pin, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SavedPrompt } from "@/types/library";

interface Props {
  prompts: SavedPrompt[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onTogglePin: (id: string) => void;
}

function relativeTime(ts: number): string {
  const delta = Date.now() - ts;
  const m = Math.floor(delta / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function PromptGrid({ prompts, selectedId, onSelect, onTogglePin }: Props) {
  if (prompts.length === 0) {
    return (
      <div className="hx-surface p-10 text-center">
        <Sparkles className="h-5 w-5 text-ink-dim mx-auto mb-3" />
        <div className="hx-eyebrow text-ink-dim mb-1">Nothing matches</div>
        <p className="text-[12.5px] text-ink-subtle max-w-md mx-auto leading-relaxed">
          Adjust the filters or clear the search — your saved prompts will
          reappear instantly.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
      {prompts.map((p, i) => {
        const active = p.id === selectedId;
        return (
          <motion.article
            key={p.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.32,
              delay: Math.min(i * 0.04, 0.32),
              ease: [0.16, 1, 0.3, 1],
            }}
            className={cn(
              "group relative hx-surface p-4 rounded-xl transition-all",
              "hover:border-line/20 hover:shadow-elev",
              active && "border-accent/30 shadow-ring-soft",
            )}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3
                role="button"
                tabIndex={0}
                onClick={() => onSelect(p.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelect(p.id);
                  }
                }}
                aria-pressed={active}
                aria-label={`Open prompt: ${p.title}`}
                className={cn(
                  "text-[14px] font-medium text-ink leading-tight truncate cursor-pointer",
                  "outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm",
                )}
              >
                {p.title}
              </h3>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onTogglePin(p.id);
                }}
                className={cn(
                  "h-6 w-6 grid place-items-center rounded transition-colors",
                  "outline-none focus-visible:ring-2 focus-visible:ring-accent",
                  p.pinned
                    ? "text-accent"
                    : "text-ink-dim opacity-0 group-hover:opacity-100 hover:text-ink focus-visible:opacity-100",
                )}
                aria-label={p.pinned ? "Unpin prompt" : "Pin prompt"}
                aria-pressed={!!p.pinned}
              >
                <Pin
                  className={cn("h-3.5 w-3.5", p.pinned && "fill-current")}
                />
              </button>
            </div>
            <div
              onClick={() => onSelect(p.id)}
              className="cursor-pointer"
              aria-hidden
            >
              <p className="text-[12px] text-ink-muted leading-relaxed line-clamp-3 mb-3">
                {p.body}
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                {p.tags.slice(0, 4).map((t) => (
                  <span
                    key={t}
                    className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-bg-elevated border border-line/8 text-ink-subtle"
                  >
                    {t}
                  </span>
                ))}
                <span className="ml-auto text-[10px] text-ink-dim font-mono">
                  {p.versions.length}v · {relativeTime(p.updatedAt)}
                </span>
              </div>
            </div>
          </motion.article>
        );
      })}
    </div>
  );
}
