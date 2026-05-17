import {
  PanelGroup,
  Panel,
  PanelResizeHandle,
  type PanelGroupProps,
  type PanelProps,
  type PanelResizeHandleProps,
} from "react-resizable-panels";
import { cn } from "@/lib/utils";

export function ResizablePanelGroup({
  className,
  ...props
}: PanelGroupProps) {
  return (
    <PanelGroup
      className={cn(
        "flex h-full w-full",
        props.direction === "vertical" && "flex-col",
        className,
      )}
      {...props}
    />
  );
}

export function ResizablePanel({ className, ...props }: PanelProps) {
  return (
    <Panel
      className={cn("min-w-0 min-h-0 flex flex-col", className)}
      {...props}
    />
  );
}

interface ResizableHandleProps extends PanelResizeHandleProps {

  direction?: "horizontal" | "vertical";
}

export function ResizableHandle({
  className,
  direction = "horizontal",
  ...props
}: ResizableHandleProps) {
  const orientationClass =
    direction === "horizontal" ? "hx-resize-x" : "hx-resize-y";

  return (
    <PanelResizeHandle
      className={cn(
        orientationClass,
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
        className,
      )}
      {...props}
    />
  );
}
