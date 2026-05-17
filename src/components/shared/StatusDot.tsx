import { cn } from "@/lib/utils";

type Health = "healthy" | "degraded" | "down" | "critical";

const cls: Record<Health, string> = {
  healthy: "bg-ok shadow-glow-accent",
  degraded: "bg-warn shadow-glow-accent",
  down: "bg-danger",
  critical: "bg-danger",
};

export function StatusDot({
  health,
  className,
  pulse = true,
}: {
  health: Health;
  className?: string;
  pulse?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-2 w-2 rounded-full",
        cls[health],
        pulse && health === "healthy" && "animate-pulse-ring",
        className,
      )}
      aria-hidden
    />
  );
}
