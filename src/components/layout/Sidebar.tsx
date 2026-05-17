import { NavLink } from "react-router-dom";
import {
  Activity,
  BookMarked,
  Code2,
  FlaskConical,
  GitCompare,
  PanelLeftClose,
  PanelLeftOpen,
  Rocket,
  Sparkles,
  Wifi,
  WifiOff,
  Accessibility,
} from "lucide-react";
import { motion } from "framer-motion";
import { Logo } from "@/components/shared/Logo";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/store/uiStore";
import { useReducedMotion } from "@/lib/a11y/useReducedMotion";
import { Switch } from "@/components/ui/Switch";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/Tooltip";
import { Kbd } from "@/components/shared/Kbd";
import { MOD_LABEL } from "@/lib/keyboard/platform";

const NAV = [
  { to: "/playground", label: "Playground", icon: Sparkles, hotkey: "g p" },
  { to: "/diff", label: "Diff", icon: GitCompare, hotkey: "g d" },
  { to: "/deploy", label: "Deploy", icon: Rocket, hotkey: "g f" },
  { to: "/observability", label: "Observability", icon: Activity, hotkey: "g o" },
  { to: "/evals", label: "Evals", icon: FlaskConical, hotkey: "g e" },
  { to: "/library", label: "Library", icon: BookMarked, hotkey: "g l" },
  { to: "/api", label: "API", icon: Code2, hotkey: "g a" },
] as const;

export function Sidebar() {
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const reducedMotion = useUiStore((s) => s.reducedMotion);
  const setReducedMotion = useUiStore((s) => s.setReducedMotion);
  const online = useUiStore((s) => s.online);
  const reduced = useReducedMotion();

  return (
    <motion.aside
      data-tour-id="sidebar"
      animate={{ width: collapsed ? 68 : 224 }}
      transition={
        reduced ? { duration: 0 } : { duration: 0.28, ease: [0.16, 1, 0.3, 1] }
      }
      className={cn(
        "shrink-0 bg-bg/70 backdrop-blur-2xl border-r border-line/7",
        "flex flex-col relative",
        "sticky top-0 h-screen z-20",
      )}
      aria-label="Primary"
    >
      <div
        className={cn(
          "border-b border-line/7",
          collapsed
            ? "flex flex-col items-center justify-center gap-1.5 px-2 py-2"
            : "h-14 flex items-center px-3",
        )}
      >
        <div className={cn("min-w-0", !collapsed && "flex-1")}>
          <Logo showWordmark={!collapsed} />
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={toggleSidebar}
              className="h-7 w-7 inline-flex items-center justify-center rounded text-ink-subtle hover:text-ink hover:bg-ink/[0.04] transition-colors"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? (
                <PanelLeftOpen className="h-4 w-4" />
              ) : (
                <PanelLeftClose className="h-4 w-4" />
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <div className="flex items-center gap-2">
              {collapsed ? "Expand" : "Collapse"} sidebar
              <Kbd>{MOD_LABEL}</Kbd>
              <Kbd>\</Kbd>
            </div>
          </TooltipContent>
        </Tooltip>
      </div>

      {!collapsed && (
        <div className="px-4 pt-5 pb-2 hx-eyebrow">Workspace</div>
      )}

      <nav className="px-2 py-1 flex flex-col gap-0.5">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}

            aria-label={collapsed ? item.label : undefined}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) =>
              cn(
                "group relative flex items-center gap-3 h-9 px-2.5 rounded",
                "text-[13px] transition-colors outline-none",
                "focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
                isActive
                  ? "text-ink font-medium"
                  : "text-ink-muted hover:text-ink hover:bg-ink/[0.03]",
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span
                    layoutId="nav-indicator"
                    className="absolute left-0 top-1 bottom-1 w-[3px] rounded-r-sm bg-accent"
                    transition={
                      reduced
                        ? { duration: 0 }
                        : { duration: 0.28, ease: [0.16, 1, 0.3, 1] }
                    }
                    aria-hidden
                  />
                )}
                <item.icon
                  className={cn(
                    "h-4 w-4 shrink-0 transition-colors",
                    isActive
                      ? "text-accent"
                      : "text-ink-subtle group-hover:text-ink",
                  )}
                />
                {!collapsed && (
                  <span
                    className="flex-1 truncate tracking-tightish"
                    style={{ letterSpacing: "-0.012em" }}
                  >
                    {item.label}
                  </span>
                )}
                {!collapsed && (
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Kbd className="text-[9px]">{item.hotkey}</Kbd>
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="flex-1" />

      {!collapsed && (
        <div className="px-4 pb-2 hx-eyebrow">Status</div>
      )}

      <div className="border-t border-line/7 p-2 flex flex-col gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                "flex items-center gap-2 h-7 rounded-md text-xs",
                online ? "text-ok" : "text-warn",
                collapsed ? "justify-center px-0" : "px-2",
              )}
              role="status"
              aria-live="polite"
            >
              {online ? (
                <Wifi className="h-3.5 w-3.5" />
              ) : (
                <WifiOff className="h-3.5 w-3.5" />
              )}
              {!collapsed && (
                <span className="font-medium">
                  {online ? "Connected" : "Offline"}
                </span>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent side="right">
            Network · {online ? "all systems normal" : "no signal"}
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                "flex items-center gap-2 h-7 rounded-md",
                collapsed
                  ? "justify-center px-0"
                  : "justify-between px-2",
              )}
            >
              {!collapsed && (
                <div className="flex items-center gap-2 text-xs text-ink-muted">
                  <Accessibility className="h-3.5 w-3.5" />
                  <span>Reduce motion</span>
                </div>
              )}
              <Switch
                checked={reducedMotion}
                onCheckedChange={setReducedMotion}
                aria-label="Reduce motion"
              />
            </div>
          </TooltipTrigger>
          {collapsed && (
            <TooltipContent side="right">Reduce motion</TooltipContent>
          )}
        </Tooltip>
      </div>
    </motion.aside>
  );
}
