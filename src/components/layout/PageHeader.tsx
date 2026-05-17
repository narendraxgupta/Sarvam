import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  trailing?: ReactNode;
  leading?: ReactNode;
  className?: string;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  trailing,
  leading,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn("relative flex flex-col gap-4 pb-8 pt-2", className)}
    >
      <div className="flex items-center justify-between gap-6">
        <div className="hx-eyebrow flex items-center gap-3">
          <span
            aria-hidden
            className="inline-block h-2 w-2 rounded-full bg-accent shrink-0"
          />
          <span aria-hidden className="inline-block h-px w-6 bg-accent/30" />
          <span>{eyebrow}</span>
        </div>
        {trailing ? (
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {trailing}
          </div>
        ) : null}
      </div>

      <div className="flex items-end justify-between gap-6 flex-wrap">
        <div className="min-w-0">
          {leading ? (
            <div className="mb-3 flex items-center gap-2">{leading}</div>
          ) : null}
          <h1 className="hx-display-lg max-w-[22ch] text-ink">{title}</h1>
          {description ? (
            <p className="mt-4 max-w-[58ch] text-[14px] font-light leading-[1.6] text-ink-muted">
              {description}
            </p>
          ) : null}
        </div>
      </div>
    </header>
  );
}
