import { ChevronDown, Activity, Bell, Search, Globe2, Compass } from "lucide-react";
import { motion } from "framer-motion";
import { MODELS } from "@/data/models";
import { usePlaygroundStore } from "@/store/playgroundStore";
import { useUiStore } from "@/store/uiStore";
import { useOnboardingStore } from "@/store/onboardingStore";
import { CHANGELOG } from "@/data/changelog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { Button } from "@/components/ui/Button";
import { Kbd } from "@/components/shared/Kbd";
import { MOD_LABEL } from "@/lib/keyboard/platform";
import { StatusDot } from "@/components/shared/StatusDot";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { cn } from "@/lib/utils";

export function Topbar() {
  const model = usePlaygroundStore((s) => s.model);
  const setModel = usePlaygroundStore((s) => s.setModel);
  const setPaletteOpen = useUiStore((s) => s.setPaletteOpen);
  const setChangelogOpen = useUiStore((s) => s.setChangelogOpen);
  const changelogSeen = useUiStore((s) => s.changelogSeen);
  const markChangelogSeen = useUiStore((s) => s.markChangelogSeen);
  const online = useUiStore((s) => s.online);
  const startTour = useOnboardingStore((s) => s.start);

  const activeModel = MODELS.find((m) => m.id === model) ?? MODELS[0];
  const latestVersion = CHANGELOG[0]?.version ?? "";
  const hasNewChangelog = latestVersion && changelogSeen !== latestVersion;

  const openChangelog = () => {
    setChangelogOpen(true);
    if (latestVersion) markChangelogSeen(latestVersion);
  };

  return (
    <header
      className="sticky top-0 z-30 h-14 shrink-0 flex items-center px-4 gap-3 min-w-0
                 border-b border-line/7 bg-bg/70 backdrop-blur-2xl"
      role="banner"
    >
      <div className="flex items-center gap-3 min-w-0 shrink overflow-hidden">
        <div className="flex items-center gap-1.5 text-xs text-ink-muted shrink-0">
          <Globe2 className="h-3.5 w-3.5 text-accent shrink-0" />
          <span className="font-mono">us-east-1</span>
          <span className="text-ink-dim">·</span>
          <span className="font-mono text-ink-subtle">edge · v1.4.0</span>
        </div>
        <div className="hidden md:block hx-divider-y h-5 shrink-0" />
        <div className="hidden md:flex items-center gap-1.5 text-xs text-ink-muted min-w-0">
          <StatusDot health={online ? "healthy" : "degraded"} pulse={false} />
          <span className="font-medium truncate">
            Inference fleet ·{" "}
            <span className={online ? "text-ok" : "text-warn"}>
              {online ? "healthy" : "limited"}
            </span>
          </span>
        </div>
      </div>

      <div className="flex-1" />

      <button
        type="button"
        data-tour-id="command-palette"
        onClick={() => setPaletteOpen(true)}
        className={cn(
          "group flex items-center gap-2 h-8 px-2.5 rounded-md shrink-0",
          "border border-line/8 bg-bg-elevated/70 text-xs text-ink-muted",
          "hover:border-accent/20 hover:text-ink hover:bg-bg-elevated",
          "transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
          "w-[220px] lg:w-[300px]",
        )}
        aria-label="Open command palette"
      >
        <Search className="h-3.5 w-3.5 shrink-0" />
        <span className="flex-1 text-left truncate">
          <span className="hidden lg:inline">Search · run command · jump…</span>
          <span className="lg:hidden">Search</span>
        </span>
        <span className="flex items-center gap-1 opacity-80 shrink-0">
          <Kbd>{MOD_LABEL}</Kbd>
          <Kbd>K</Kbd>
        </span>
      </button>

      <button
        type="button"
        onClick={() => startTour()}
        aria-label="Open product tour"
        className={cn(
          "inline-flex items-center gap-1.5 h-8 px-2.5 shrink-0 rounded-md",
          "border border-line/8 bg-bg-elevated text-xs text-ink-muted",
          "hover:text-ink hover:border-accent/20 transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
        )}
      >
        <Compass className="h-3.5 w-3.5" />
        <span className="hidden lg:inline">Tour</span>
      </button>

      <button
        data-tour-id="changelog"
        type="button"
        onClick={openChangelog}
        aria-label="What's new"
        className={cn(
          "relative inline-flex items-center justify-center h-8 w-8 shrink-0 rounded-md",
          "border border-line/8 bg-bg-elevated text-ink-muted",
          "hover:text-ink hover:border-accent/20 transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
        )}
      >
        <Bell className="h-3.5 w-3.5" />
        {hasNewChangelog && (
          <motion.span
            aria-hidden
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-accent shadow-[0_0_6px_rgb(var(--accent))]"
          />
        )}
      </button>

      <ThemeToggle className="shrink-0" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 shrink-0"
          >
            <Activity className="h-3.5 w-3.5 text-accent" />
            <span className="font-medium">{activeModel.name}</span>
            <span className="hidden lg:inline text-ink-subtle font-mono text-2xs">
              · {activeModel.parameters}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-ink-subtle" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-72">
          <DropdownMenuLabel>Active model</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup
            value={model}
            onValueChange={(v) => setModel(v as typeof model)}
          >
            {MODELS.map((m) => (
              <DropdownMenuRadioItem key={m.id} value={m.id}>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-ink font-medium">{m.name}</span>
                    {m.badge && (
                      <span className="hx-chip h-4 px-1 text-[9px]">
                        {m.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-2xs text-ink-subtle font-mono">
                    {m.parameters} · {m.contextLength.toLocaleString()} ctx ·{" "}
                    {m.modalities.join(" + ")}
                  </span>
                </div>
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
