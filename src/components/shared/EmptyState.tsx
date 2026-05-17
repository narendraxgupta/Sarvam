import { cn } from "@/lib/utils";

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative w-full h-full flex flex-col items-center justify-center gap-3 p-8 overflow-hidden",
        "rounded-xl border border-line bg-bg-surface/40 stripes",
        className,
      )}
    >
      {icon && (
        <div className="relative grid h-11 w-11 place-items-center rounded-xl border border-line bg-bg-elevated text-accent">
          <span className="relative">{icon}</span>
        </div>
      )}
      <div className="relative text-center max-w-md">
        <div className="font-display text-[15px] font-semibold text-ink tracking-tightish">
          {title}
        </div>
        {description && (
          <div className="mt-1.5 text-[12.5px] text-ink-subtle leading-relaxed">
            {description}
          </div>
        )}
      </div>
      {action && <div className="relative mt-1">{action}</div>}
    </div>
  );
}
