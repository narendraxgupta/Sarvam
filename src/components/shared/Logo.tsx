import { cn } from "@/lib/utils";

export function Logo({
  className,
  showWordmark = true,
}: {
  className?: string;
  showWordmark?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <svg
        viewBox="0 0 24 24"
        className="h-6 w-6 shrink-0"
        aria-hidden
      >
        <rect width="24" height="24" rx="5" fill="rgb(var(--accent))" />
        <rect x="6" y="6" width="2.4" height="12" fill="rgb(var(--bg))" />
        <rect x="15.6" y="6" width="2.4" height="12" fill="rgb(var(--bg))" />
        <rect x="6" y="10.8" width="12" height="2.4" fill="rgb(var(--bg))" />
      </svg>
      {showWordmark && (
        <div className="flex items-baseline gap-2 leading-none">
          <span
            className="font-display text-[17px] font-bold text-ink"
            style={{ letterSpacing: "-0.03em" }}
          >
            Helix
          </span>
          <span
            className="font-mono text-[9px] text-ink-dim uppercase tracking-[0.22em]"
            aria-hidden
          >
            v0.1
          </span>
        </div>
      )}
    </div>
  );
}
