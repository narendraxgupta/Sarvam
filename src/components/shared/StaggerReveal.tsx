import type { CSSProperties, ReactNode } from "react";
import { Children, isValidElement, cloneElement } from "react";
import { useReducedMotion } from "@/lib/a11y/useReducedMotion";
import { cn } from "@/lib/utils";

interface StaggerRevealProps {
  children: ReactNode;
  step?: number;
  initial?: number;
  className?: string;
  as?: "div" | "section" | "main";
  id?: string;
  [dataAttr: `data-${string}`]: string | boolean | undefined;
}

export function StaggerReveal({
  children,
  step = 60,
  initial = 0,
  className,
  as = "div",
  ...rest
}: StaggerRevealProps) {
  const reduced = useReducedMotion();
  const Comp = as;

  const items = Children.toArray(children);
  const rendered = items.map((child, i) => {
    if (!isValidElement(child)) return child;
    if (reduced) return child;
    const delayMs = initial + i * step;
    const childProps = child.props as {
      className?: string;
      style?: CSSProperties;
    };
    const existingClass = childProps.className ?? "";
    const existingStyle = childProps.style ?? {};
    return cloneElement(child as React.ReactElement<unknown>, {
      className: cn("hx-reveal", existingClass),
      style: {
        ...existingStyle,
        ["--hx-i" as string]: String(delayMs / 60),
      },
    } as Record<string, unknown>);
  });

  return (
    <Comp className={className} {...(rest as Record<string, unknown>)}>
      {rendered}
    </Comp>
  );
}
