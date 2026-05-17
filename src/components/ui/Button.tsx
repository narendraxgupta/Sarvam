import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 select-none whitespace-nowrap",
    "rounded-lg font-medium tracking-tightish",
    "transition-all duration-200 ease-out",
    "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
    "active:scale-[0.98]",
  ].join(" "),
  {
    variants: {
      variant: {
        primary: [
          "bg-ink text-bg",
          "hover:opacity-90",
        ].join(" "),
        accent: [
          "sheen text-accent-ink",
          "bg-accent",
          "shadow-glow-accent",
          "hover:brightness-110 hover:shadow-blue-glow",
        ].join(" "),
        ghost:
          "bg-transparent text-ink-muted hover:text-ink hover:bg-ink/[0.04]",
        outline: [
          "text-ink border border-line/12",
          "bg-transparent",
          "hover:border-accent/25 hover:bg-accent/[0.04]",
        ].join(" "),
        subtle:
          "bg-bg-elevated text-ink border border-line/8 hover:bg-bg-elevated/80",
        secondary:
          "bg-bg-elevated text-ink border border-line/8 hover:bg-bg-elevated/80",
        danger: [
          "text-danger border border-danger/30",
          "bg-danger/10",
          "hover:bg-danger/20 hover:border-danger/50",
        ].join(" "),
      },
      size: {
        sm: "h-8 px-3 text-[13px]",
        md: "h-9 px-3.5 text-sm",
        lg: "h-10 px-4 text-sm",
        icon: "h-9 w-9",
        "icon-sm": "h-7 w-7",
      },
    },
    defaultVariants: { variant: "outline", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild, type, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    const resolvedType = asChild ? type : (type ?? "button");
    return (
      <Comp
        ref={ref}
        type={resolvedType}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

// eslint-disable-next-line react-refresh/only-export-components
export { buttonVariants };
