import type { StateStorage } from "zustand/middleware";

const memory = new Map<string, string>();

function getLocalStorage(): Storage | null {
  try {
    if (typeof window === "undefined") return null;
    const ls = window.localStorage;
    const probeKey = "__hx_probe__";
    ls.setItem(probeKey, "1");
    ls.removeItem(probeKey);
    return ls;
  } catch {
    return null;
  }
}

const ls = getLocalStorage();

export const safeStorage: StateStorage = {
  getItem: (name) => {
    try {
      if (ls) return ls.getItem(name);
    } catch {
    }
    return memory.get(name) ?? null;
  },
  setItem: (name, value) => {
    try {
      if (ls) {
        ls.setItem(name, value);
        return;
      }
    } catch {
    }
    memory.set(name, value);
  },
  removeItem: (name) => {
    try {
      if (ls) {
        ls.removeItem(name);
        return;
      }
    } catch {
    }
    memory.delete(name);
  },
};
