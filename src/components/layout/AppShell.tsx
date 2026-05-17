import { useEffect, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { CommandPalette } from "./CommandPalette";
import { KeyboardOverlay } from "./KeyboardOverlay";
import { Toaster } from "./Toaster";
import { OnboardingOverlay } from "@/components/onboarding/OnboardingOverlay";
import { CoachmarkTour } from "@/components/onboarding/CoachmarkTour";
import { ChangelogModal } from "@/components/changelog/ChangelogModal";
import { FeedbackWidget } from "@/components/feedback/FeedbackWidget";
import { BackTrigger } from "@/components/framer";
import { useShortcut, useLeaderSequence } from "@/lib/keyboard/useShortcut";
import { useUiStore } from "@/store/uiStore";
import { usePlaygroundStore } from "@/store/playgroundStore";

export function AppShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const setPaletteOpen = useUiStore((s) => s.setPaletteOpen);
  const setKbdOverlayOpen = useUiStore((s) => s.setKbdOverlayOpen);
  const runInference = usePlaygroundStore((s) => s.runInference);
  const abort = usePlaygroundStore((s) => s.abort);

  useShortcut([
    {
      mod: true,
      key: "k",
      handler: () => setPaletteOpen(!useUiStore.getState().paletteOpen),
      allowInInputs: true,
    },
    {
      mod: true,
      key: "Enter",
      handler: () => runInference(),
      allowInInputs: true,
    },
    {
      mod: true,
      key: ".",
      handler: () => abort(),
      allowInInputs: true,
    },
    {
      mod: true,
      key: "\\",
      handler: () => toggleSidebar(),
      allowInInputs: true,
    },
  ]);

  useEffect(() => {
    const isTyping = (t: HTMLElement | null) => {
      if (!t) return false;
      const tag = t.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
      if (t.isContentEditable) return true;
      if (t.closest('[role="textbox"], [role="searchbox"], [role="combobox"]')) {
        return true;
      }
      return false;
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "?") return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (isTyping(e.target as HTMLElement | null)) return;
      e.preventDefault();
      setKbdOverlayOpen(!useUiStore.getState().kbdOverlayOpen);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setKbdOverlayOpen]);

  useLeaderSequence("g", {
    p: () => navigate("/playground"),
    d: () => navigate("/diff"),
    f: () => navigate("/deploy"),
    o: () => navigate("/observability"),
    e: () => navigate("/evals"),
    l: () => navigate("/library"),
    a: () => navigate("/api"),
  });

  return (
    <div className="flex w-full min-h-screen">
      <a
        href="#hx-main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-3 focus:py-1.5 focus:rounded-md focus:bg-bg-elevated focus:text-ink focus:border focus:border-accent focus:shadow-glow-accent"
      >
        Skip to main content
      </a>
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar />
        <main
          id="hx-main"
          className="flex-1 min-w-0"
          tabIndex={-1}
        >
          {children}
        </main>
      </div>
      <CommandPalette />
      <KeyboardOverlay />
      <OnboardingOverlay />
      <CoachmarkTour />
      <ChangelogModal />
      <FeedbackWidget />
      <Toaster />
      <BackTrigger threshold={420} label="Top" />
    </div>
  );
}
