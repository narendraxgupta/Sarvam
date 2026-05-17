import * as ToastPrimitive from "@radix-ui/react-toast";
import { forwardRef } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastVariant = "info" | "success" | "warn" | "danger";

export const ToastProvider = ToastPrimitive.Provider;

export const ToastViewport = forwardRef<
  React.ElementRef<typeof ToastPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Viewport
    ref={ref}
    className={cn(
      "fixed bottom-4 right-4 z-[60] flex max-h-screen w-full max-w-[380px] flex-col gap-2 outline-none",
      className,
    )}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitive.Viewport.displayName;

const VARIANT_META: Record<
  ToastVariant,
  {
    icon: React.ComponentType<{ className?: string }>;
    iconCls: string;
    accent: string;
  }
> = {
  info: {
    icon: Info,
    iconCls: "text-accent",
    accent: "before:bg-accent",
  },
  success: {
    icon: CheckCircle2,
    iconCls: "text-ok",
    accent: "before:bg-ok",
  },
  warn: {
    icon: AlertTriangle,
    iconCls: "text-warn",
    accent: "before:bg-warn",
  },
  danger: {
    icon: XCircle,
    iconCls: "text-danger",
    accent: "before:bg-danger",
  },
};

interface ToastProps
  extends React.ComponentPropsWithoutRef<typeof ToastPrimitive.Root> {
  variant?: ToastVariant;
  title?: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
}

export const Toast = forwardRef<
  React.ElementRef<typeof ToastPrimitive.Root>,
  ToastProps
>(({ variant = "info", title, description, action, className, ...props }, ref) => {
  const meta = VARIANT_META[variant];
  const Icon = meta.icon;
  return (
    <ToastPrimitive.Root
      ref={ref}
      className={cn(
        "group pointer-events-auto relative w-full overflow-hidden",
        "rounded-xl border border-line/8 bg-bg-elevated/95 backdrop-blur-xl",
        "shadow-elev p-3.5 pl-4",
        "before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px]",
        meta.accent,
        "data-[state=open]:animate-in data-[state=open]:slide-in-from-right-4",
        "data-[state=closed]:animate-out data-[state=closed]:fade-out-80",
        "data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]",
        "data-[swipe=cancel]:translate-x-0 data-[swipe=cancel]:transition-transform",
        "data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=end]:animate-out",
        "transition-all duration-200",
        className,
      )}
      {...props}
    >
      <div className="flex items-start gap-3 pr-6">
        <Icon className={cn("h-4 w-4 mt-0.5 shrink-0", meta.iconCls)} />
        <div className="flex-1 min-w-0">
          {title && (
            <ToastPrimitive.Title className="text-[13px] font-semibold text-ink leading-tight">
              {title}
            </ToastPrimitive.Title>
          )}
          {description && (
            <ToastPrimitive.Description
              className={cn(
                "text-[12px] text-ink-muted leading-relaxed",
                title && "mt-1",
              )}
            >
              {description}
            </ToastPrimitive.Description>
          )}
          {action && <div className="mt-2">{action}</div>}
        </div>
        <ToastPrimitive.Close
          aria-label="Dismiss"
          className={cn(
            "absolute right-2 top-2 inline-flex h-6 w-6 items-center justify-center",
            "rounded-md text-ink-dim hover:text-ink hover:bg-ink/[0.06]",
            "transition-colors",
          )}
        >
          <X className="h-3.5 w-3.5" />
        </ToastPrimitive.Close>
      </div>
    </ToastPrimitive.Root>
  );
});
Toast.displayName = ToastPrimitive.Root.displayName;

export const ToastAction = forwardRef<
  React.ElementRef<typeof ToastPrimitive.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Action
    ref={ref}
    className={cn(
      "inline-flex h-7 items-center px-2.5 rounded-md text-[11px] font-semibold",
      "border border-line/15 bg-bg-surface/60 text-ink",
      "hover:bg-ink/[0.04] hover:border-line/25 transition-colors",
      className,
    )}
    {...props}
  />
));
ToastAction.displayName = ToastPrimitive.Action.displayName;
