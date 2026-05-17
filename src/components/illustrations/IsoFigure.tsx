import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface IsoFigureProps {
  fig: string;
  caption?: string;
  children: ReactNode;
  className?: string;
  ratio?: "4:3" | "16:9" | "1:1";
  tagPosition?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  borderless?: boolean;
}

export function IsoFigure({
  fig,
  caption,
  children,
  className,
  ratio = "4:3",
  tagPosition = "top-left",
  borderless = false,
}: IsoFigureProps) {
  const aspectClass =
    ratio === "16:9"
      ? "aspect-[16/9]"
      : ratio === "1:1"
      ? "aspect-square"
      : "aspect-[4/3]";

  const tagPlacement = {
    "top-left": "top-3 left-3",
    "top-right": "top-3 right-3",
    "bottom-left": "bottom-3 left-3",
    "bottom-right": "bottom-3 right-3",
  }[tagPosition];

  return (
    <figure
      className={cn(
        "relative overflow-hidden",
        !borderless && "border border-line/8 rounded-xl",
        className,
      )}
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(rgb(var(--ink) / 0.10) 1px, transparent 1px)",
          backgroundSize: "12px 12px",
          backgroundPosition: "6px 6px",
        }}
      />

      <span
        className={cn(
          "absolute z-10 hx-mono-tab text-[10px] uppercase tracking-[0.18em] text-ink-subtle",
          tagPlacement,
        )}
        aria-hidden
      >
        {fig}
        {caption ? (
          <span className="ml-2 text-ink-dim normal-case tracking-normal">
            · {caption}
          </span>
        ) : null}
      </span>

      <div className={cn("relative w-full", aspectClass)}>
        {children}
      </div>
    </figure>
  );
}
