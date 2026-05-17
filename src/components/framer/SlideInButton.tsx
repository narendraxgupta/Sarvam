import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "accent" | "ink" | "outline";
type Size = "sm" | "md" | "lg";

export type SlideInButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  direction?: "left" | "right" | "bottom" | "top";
  tone?: Tone;
  size?: Size;
  icon?: ReactNode;
  noIcon?: boolean;
};

const SIZE_CLASS: Record<Size, string> = {
  sm: "h-8 px-3 text-[12.5px] gap-2",
  md: "h-10 px-4 text-[13.5px] gap-2.5",
  lg: "h-12 px-6 text-[14px] gap-3",
};

const BASE = [
  "relative isolate inline-flex items-center justify-center select-none whitespace-nowrap",
  "rounded-xl font-medium tracking-tightish overflow-hidden",
  "transition-[color,border-color,box-shadow,transform] duration-200 ease-out-expo",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
  "active:scale-[0.985] group",
].join(" ");

const TONE_REST: Record<Tone, string> = {
  accent:
    "text-ink border border-line/12 bg-transparent hover:border-accent/40 hover:shadow-blue-glow",
  ink: "text-ink border border-line/12 bg-transparent hover:border-line/30",
  outline:
    "text-ink-muted border border-line/12 bg-transparent hover:text-ink hover:border-accent/25",
};

const TONE_FILL: Record<Tone, string> = {
  accent: "bg-accent",
  ink: "bg-ink",
  outline: "bg-ink/[0.06]",
};

const TONE_HOVER_TEXT: Record<Tone, string> = {
  accent: "group-hover:text-accent-ink",
  ink: "group-hover:text-bg",
  outline: "group-hover:text-ink",
};

const ORIGIN: Record<NonNullable<SlideInButtonProps["direction"]>, string> = {
  left: "origin-left",
  right: "origin-right",
  bottom: "origin-bottom",
  top: "origin-top",
};

const FILL_REST: Record<NonNullable<SlideInButtonProps["direction"]>, string> = {
  left: "scale-x-0",
  right: "scale-x-0",
  bottom: "scale-y-0",
  top: "scale-y-0",
};

const FILL_HOVER: Record<NonNullable<SlideInButtonProps["direction"]>, string> =
  {
    left: "group-hover:scale-x-100",
    right: "group-hover:scale-x-100",
    bottom: "group-hover:scale-y-100",
    top: "group-hover:scale-y-100",
  };

export const SlideInButton = forwardRef<HTMLButtonElement, SlideInButtonProps>(
  function SlideInButton(
    {
      children,
      direction = "left",
      tone = "accent",
      size = "md",
      icon,
      noIcon,
      className,
      ...rest
    },
    ref,
  ) {
    const trailing = icon ?? <ArrowRight className="h-3.5 w-3.5" />;

    return (
      <button
        ref={ref}
        className={cn(BASE, SIZE_CLASS[size], TONE_REST[tone], className)}
        {...rest}
      >
        <span
          aria-hidden
          className={cn(
            "absolute inset-0 -z-10 transition-transform duration-[420ms] ease-out-expo",
            ORIGIN[direction],
            FILL_REST[direction],
            FILL_HOVER[direction],
            TONE_FILL[tone],
          )}
        />

        <span
          className={cn(
            "relative z-10 transition-colors duration-200 ease-out-expo",
            TONE_HOVER_TEXT[tone],
          )}
        >
          {children}
        </span>

        {!noIcon && (
          <span
            className={cn(
              "relative z-10 inline-flex items-center justify-center overflow-hidden",
              "h-4 w-4 transition-colors duration-200 ease-out-expo",
              TONE_HOVER_TEXT[tone],
            )}
            aria-hidden
          >
            <span className="absolute inset-0 grid place-items-center transition-transform duration-300 ease-out-expo group-hover:translate-x-4">
              {trailing}
            </span>
            <span className="absolute inset-0 grid place-items-center -translate-x-4 transition-transform duration-300 ease-out-expo group-hover:translate-x-0">
              {trailing}
            </span>
          </span>
        )}
      </button>
    );
  },
);
