import { motion } from "framer-motion";
import { Newspaper, Sparkles, Wrench, Zap } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/Dialog";
import { useUiStore } from "@/store/uiStore";
import { CHANGELOG, type ChangelogEntry } from "@/data/changelog";
import { AuthorCredit } from "@/components/shared/AuthorCredit";
import { cn } from "@/lib/utils";

const TAG_META: Record<
  ChangelogEntry["tag"],
  {
    icon: React.ComponentType<{ className?: string }>;
    tone: string;
    label: string;
  }
> = {
  release: { icon: Sparkles, tone: "text-accent bg-accent/10 border-accent/25", label: "Release" },
  improvement: { icon: Zap, tone: "text-ok bg-ok/10 border-ok/25", label: "Improvement" },
  fix: { icon: Wrench, tone: "text-warn bg-warn/10 border-warn/25", label: "Fix" },
};

export function ChangelogModal() {
  const open = useUiStore((s) => s.changelogOpen);
  const setOpen = useUiStore((s) => s.setChangelogOpen);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl">
        <div className="flex items-center gap-3 mb-5">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-accent/10 border border-accent/20 text-accent">
            <Newspaper className="h-4 w-4" />
          </div>
          <div>
            <DialogTitle className="text-[15px] font-semibold">
              What's new in Helix
            </DialogTitle>
            <div className="text-[12px] text-ink-muted">
              Last {CHANGELOG.length} entries
            </div>
          </div>
        </div>

        <div className="max-h-[60vh] overflow-auto scrollbar-thin pr-2 flex flex-col gap-5 pb-2">
          {CHANGELOG.map((entry, i) => {
            const meta = TAG_META[entry.tag];
            const Icon = meta.icon;
            return (
              <motion.article
                key={entry.version}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="border-l-2 border-line/15 pl-4 relative"
              >
                <div className="absolute -left-[6px] top-0.5 h-2.5 w-2.5 rounded-full bg-bg border-2 border-accent/40" />
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-tightish px-2 h-5 rounded border",
                      meta.tone,
                    )}
                  >
                    <Icon className="h-2.5 w-2.5" />
                    {meta.label}
                  </span>
                  <span className="font-mono text-[11px] text-ink-muted">
                    v{entry.version}
                  </span>
                  <span className="text-[10.5px] text-ink-subtle font-mono">
                    {entry.date}
                  </span>
                </div>
                <h3 className="text-[14.5px] font-medium text-ink leading-snug mb-1.5">
                  {entry.title}
                </h3>
                <ul className="flex flex-col gap-1.5 text-[12.5px] text-ink-muted leading-relaxed">
                  {entry.highlights.map((h, j) => (
                    <li key={j} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1 w-1 rounded-full bg-accent shrink-0" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </motion.article>
            );
          })}
        </div>

        <div className="mt-5 pt-5 border-t border-line/8">
          <AuthorCredit variant="detailed" />
        </div>
      </DialogContent>
    </Dialog>
  );
}
