import { create } from "zustand";

export interface CoachmarkStep {
  id: string;
  target: string;
  side: "top" | "bottom" | "left" | "right";
  title: string;
  body: string;
  route?: string;
}

interface CoachmarkState {
  open: boolean;
  step: number;
  steps: CoachmarkStep[];
  start: (steps?: CoachmarkStep[]) => void;
  next: () => void;
  back: () => void;
  close: () => void;
}

const DEFAULT_STEPS: CoachmarkStep[] = [
  {
    id: "sidebar",
    target: "[data-tour-id=sidebar]",
    side: "right",
    title: "Workspace · sidebar",
    body: "Every console surface lives one click away. Try `g p` to jump to Playground, `g o` for Observability, `g l` for your prompt Library.",
  },
  {
    id: "command-palette",
    target: "[data-tour-id=command-palette]",
    side: "bottom",
    title: "Command palette",
    body: "Press ⌘K from anywhere. Fuzzy-search every action, run a sample prompt, or just hop between pages — it's the fastest way through Helix.",
  },
  {
    id: "topbar-bell",
    target: "[data-tour-id=changelog]",
    side: "bottom",
    title: "What's new",
    body: "Read every release note here. A glowing dot means we shipped something since you last checked.",
  },
  {
    id: "input-dock",
    target: "[data-tour-id=input-dock]",
    side: "top",
    title: "Run a prompt",
    body: "Type, tweak parameters, hit ⌘↵. The output streams token-by-token while metrics live on the right.",
    route: "/playground",
  },
];

export const useCoachmarkStore = create<CoachmarkState>((set) => ({
  open: false,
  step: 0,
  steps: DEFAULT_STEPS,
  start: (steps) =>
    set({ open: true, step: 0, steps: steps ?? DEFAULT_STEPS }),
  next: () =>
    set((s) => {
      if (s.step >= s.steps.length - 1) return { open: false, step: 0 };
      return { step: s.step + 1 };
    }),
  back: () => set((s) => ({ step: Math.max(0, s.step - 1) })),
  close: () => set({ open: false }),
}));
