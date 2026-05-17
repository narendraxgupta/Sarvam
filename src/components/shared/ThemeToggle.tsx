import { Sun, Moon, MonitorCog } from "lucide-react";
import { useThemeStore, type ThemeMode } from "@/store/themeStore";
import { cn } from "@/lib/utils";

const MODES: { id: ThemeMode; label: string; Icon: typeof Sun }[] = [
  { id: "light", label: "Light", Icon: Sun },
  { id: "system", label: "System", Icon: MonitorCog },
  { id: "dark", label: "Dark", Icon: Moon },
];

export function ThemeToggle({ className }: { className?: string }) {
  const mode = useThemeStore((s) => s.mode);
  const setMode = useThemeStore((s) => s.setMode);

  return (
    <div
      role="group"
      aria-label="Theme"
      className={cn(
        "inline-flex items-center gap-0.5 h-8 px-0.5",
        "rounded-lg border border-line/8 bg-bg-elevated",
        className,
      )}
    >
      {MODES.map(({ id, label, Icon }) => {
        const active = mode === id;
        return (
          <button
            key={id}
            type="button"
            aria-pressed={active}
            aria-label={label}
            title={label}
            onClick={() => setMode(id)}
            className={cn(
              "inline-flex items-center justify-center h-6 w-7 rounded-md",
              "transition-all duration-200",
              "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent",
              active
                ? "bg-bg text-accent shadow-[inset_0_0_0_1px_rgb(var(--accent)/0.15)]"
                : "text-ink-subtle hover:text-ink",
            )}
          >
            <Icon className="h-3.5 w-3.5" />
          </button>
        );
      })}
    </div>
  );
}
