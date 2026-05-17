import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { safeStorage } from "@/lib/persist/storage";

interface OnboardingState {

  open: boolean;
  step: number;
  hasCompleted: boolean;
  start: () => void;
  close: () => void;
  next: () => void;
  back: () => void;
  goTo: (step: number) => void;
  complete: () => void;
  totalSteps: number;
}

const TOTAL_STEPS = 4;

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      open: false,
      step: 0,
      hasCompleted: false,
      totalSteps: TOTAL_STEPS,
      start: () => set({ open: true, step: 0 }),
      close: () => set({ open: false }),
      next: () => {
        const { step } = get();
        if (step >= TOTAL_STEPS - 1) {
          set({ open: false, hasCompleted: true });
          return;
        }
        set({ step: step + 1 });
      },
      back: () => {
        const { step } = get();
        set({ step: Math.max(0, step - 1) });
      },
      goTo: (step) =>
        set({ step: Math.max(0, Math.min(TOTAL_STEPS - 1, step)) }),
      complete: () => set({ open: false, hasCompleted: true }),
    }),
    {
      name: "hx-onboarding-store",
      storage: createJSONStorage(() => safeStorage),
      partialize: (s) => ({ hasCompleted: s.hasCompleted }),
    },
  ),
);
