import { useState } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Send } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { useUiStore } from "@/store/uiStore";
import { useReducedMotion } from "@/lib/a11y/useReducedMotion";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

type Category = "idea" | "bug" | "kudos" | "other";

const CATEGORIES: { id: Category; label: string; tone: string }[] = [
  { id: "idea", label: "💡 Idea", tone: "border-accent/25 text-accent" },
  { id: "bug", label: "🐞 Bug", tone: "border-warn/25 text-warn" },
  { id: "kudos", label: "✨ Kudos", tone: "border-ok/25 text-ok" },
  { id: "other", label: "Something else", tone: "border-line/20 text-ink-muted" },
];

const BACK_TRIGGER_INSET = 24;
const BACK_TRIGGER_SIZE = 56;
const GAP = 12;
const PILL_HEIGHT = 40;

export function FeedbackWidget() {
  const open = useUiStore((s) => s.feedbackOpen);
  const setOpen = useUiStore((s) => s.setFeedbackOpen);
  const reduced = useReducedMotion();
  const [category, setCategory] = useState<Category>("idea");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const rightPx = BACK_TRIGGER_INSET + BACK_TRIGGER_SIZE + GAP;
  const bottomPx =
    BACK_TRIGGER_INSET + Math.round((BACK_TRIGGER_SIZE - PILL_HEIGHT) / 2);

  const submit = async () => {
    if (!message.trim()) return;
    setSubmitting(true);
    // Mock submission — a real integration would POST to a feedback service.
    console.info("[helix.feedback]", { category, message });
    await new Promise((r) => setTimeout(r, 320));
    setSubmitting(false);
    setOpen(false);
    setMessage("");
    setCategory("idea");
    toast.success("Thanks for the feedback", "We read every note.");
  };

  return (
    <>

      <motion.button
        type="button"
        aria-label="Send feedback"
        onClick={() => setOpen(true)}
        initial={reduced ? false : { opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={
          reduced ? { duration: 0 } : { duration: 0.4, delay: 0.6 }
        }
        whileHover={reduced ? undefined : { scale: 1.04 }}
        whileTap={reduced ? undefined : { scale: 0.97 }}
        style={{ right: rightPx, bottom: bottomPx, height: PILL_HEIGHT }}
        className={cn(
          "fixed z-40 inline-flex items-center gap-2",
          "px-3.5 rounded-full text-[12.5px] font-medium",
          "bg-bg-elevated/95 border border-line/15 text-ink",
          "shadow-elev backdrop-blur-xl",
          "hover:border-accent/30 hover:text-accent transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
        )}
      >
        <MessageCircle className="h-4 w-4" />
        <span className="hidden sm:inline">Feedback</span>
      </motion.button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md" aria-describedby={undefined}>
          <div className="mb-4">
            <DialogTitle className="text-[15px] font-semibold">
              Tell us what's on your mind
            </DialogTitle>
            <DialogDescription className="mt-1 text-[12.5px]">
              Goes straight to the team. We respond to every actionable note.
            </DialogDescription>
          </div>

          <div className="hx-eyebrow mb-2 text-ink-subtle">Category</div>
          <div className="flex items-center gap-1.5 flex-wrap mb-4">
            {CATEGORIES.map((c) => {
              const active = c.id === category;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategory(c.id)}
                  className={cn(
                    "h-8 px-3 rounded-full border text-[11.5px] font-medium transition-all",
                    active ? `bg-accent/[0.06] ${c.tone}` : "border-line/10 text-ink-muted hover:text-ink",
                  )}
                >
                  {c.label}
                </button>
              );
            })}
          </div>

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={6}
            placeholder="What did you try? What did you expect to happen?"
            className={cn(
              "w-full bg-bg-elevated/40 border border-line/10 rounded-md p-3",
              "text-[13px] text-ink leading-relaxed resize-y outline-none",
              "focus:border-accent/30 focus:ring-1 focus:ring-accent/30",
            )}
          />

          <div className="mt-4 flex items-center justify-between gap-3">
            <span className="text-[11px] text-ink-subtle">
              {message.length} chars · enter sends nothing — be deliberate
            </span>
            <Button
              variant="accent"
              size="sm"
              disabled={!message.trim() || submitting}
              onClick={submit}
              className="gap-1.5"
            >
              <Send className="h-3.5 w-3.5" />
              {submitting ? "Sending…" : "Send feedback"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
