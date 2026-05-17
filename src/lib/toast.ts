import { create } from "zustand";
import { uid } from "@/lib/utils";
import type { ToastVariant } from "@/components/ui/Toast";

export interface ToastItem {
  id: string;
  variant: ToastVariant;
  title?: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastState {
  toasts: ToastItem[];
  push: (toast: Omit<ToastItem, "id">) => string;
  dismiss: (id: string) => void;
  clear: () => void;
}

const MAX_TOASTS = 4;

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (toast) => {
    const id = uid();
    set((s) => {
      const next = [...s.toasts, { id, ...toast }];

      return {
        toasts:
          next.length > MAX_TOASTS ? next.slice(next.length - MAX_TOASTS) : next,
      };
    });
    return id;
  },
  dismiss: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  clear: () => set({ toasts: [] }),
}));

export const toast = {
  show: (toast: Omit<ToastItem, "id">) => useToastStore.getState().push(toast),
  info: (title: string, description?: string) =>
    useToastStore.getState().push({ variant: "info", title, description }),
  success: (title: string, description?: string) =>
    useToastStore.getState().push({ variant: "success", title, description }),
  warn: (title: string, description?: string) =>
    useToastStore.getState().push({ variant: "warn", title, description }),
  danger: (title: string, description?: string) =>
    useToastStore.getState().push({ variant: "danger", title, description }),
  dismiss: (id: string) => useToastStore.getState().dismiss(id),
  clear: () => useToastStore.getState().clear(),
};

export function useToast() {
  return {
    toast,
    toasts: useToastStore((s) => s.toasts),
    dismiss: useToastStore((s) => s.dismiss),
  };
}
