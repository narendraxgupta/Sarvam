import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { safeStorage } from "@/lib/persist/storage";

interface UiState {
  sidebarCollapsed: boolean;
  reducedMotion: boolean;
  paletteOpen: boolean;
  kbdOverlayOpen: boolean;
  changelogOpen: boolean;
  feedbackOpen: boolean;
  online: boolean;
  recentCommands: string[];
  changelogSeen: string;
  toggleSidebar: () => void;
  setReducedMotion: (v: boolean) => void;
  setPaletteOpen: (v: boolean) => void;
  setKbdOverlayOpen: (v: boolean) => void;
  setChangelogOpen: (v: boolean) => void;
  setFeedbackOpen: (v: boolean) => void;
  setOnline: (v: boolean) => void;
  pushRecentCommand: (id: string) => void;
  markChangelogSeen: (version: string) => void;
}

const RECENT_MAX = 8;

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      reducedMotion: false,
      paletteOpen: false,
      kbdOverlayOpen: false,
      changelogOpen: false,
      feedbackOpen: false,
      online: typeof navigator !== "undefined" ? navigator.onLine : true,
      recentCommands: [],
      changelogSeen: "",
      toggleSidebar: () =>
        set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setReducedMotion: (reducedMotion) => set({ reducedMotion }),
      setPaletteOpen: (paletteOpen) => set({ paletteOpen }),
      setKbdOverlayOpen: (kbdOverlayOpen) => set({ kbdOverlayOpen }),
      setChangelogOpen: (changelogOpen) => set({ changelogOpen }),
      setFeedbackOpen: (feedbackOpen) => set({ feedbackOpen }),
      setOnline: (online) => set({ online }),
      pushRecentCommand: (id) =>
        set((s) => ({
          recentCommands: [id, ...s.recentCommands.filter((x) => x !== id)].slice(
            0,
            RECENT_MAX,
          ),
        })),
      markChangelogSeen: (version) => set({ changelogSeen: version }),
    }),
    {
      name: "hx-ui",
      storage: createJSONStorage(() => safeStorage),
      partialize: (s) => ({
        sidebarCollapsed: s.sidebarCollapsed,
        reducedMotion: s.reducedMotion,
        recentCommands: s.recentCommands,
        changelogSeen: s.changelogSeen,
      }),
    },
  ),
);
