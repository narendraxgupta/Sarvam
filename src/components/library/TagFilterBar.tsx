import { Tag, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  allTags: string[];
  activeTags: string[];
  onToggle: (tag: string) => void;
  onClear: () => void;
}

export function TagFilterBar({ allTags, activeTags, onToggle, onClear }: Props) {
  if (allTags.length === 0) return null;
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Tag className="h-3.5 w-3.5 text-ink-subtle" />
      {allTags.map((t) => {
        const active = activeTags.includes(t);
        return (
          <button
            key={t}
            type="button"
            onClick={() => onToggle(t)}
            className={cn(
              "h-7 px-2.5 rounded-full text-[11px] font-mono border transition-all",
              active
                ? "bg-accent/15 text-accent border-accent/30"
                : "border-line/10 text-ink-muted hover:text-ink hover:border-line/20",
            )}
          >
            {t}
          </button>
        );
      })}
      {activeTags.length > 0 && (
        <button
          type="button"
          onClick={onClear}
          className="h-7 px-2 rounded-full text-[11px] text-ink-dim hover:text-ink inline-flex items-center gap-1"
        >
          <X className="h-3 w-3" /> clear
        </button>
      )}
    </div>
  );
}
