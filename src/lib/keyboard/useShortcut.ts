import { useEffect, useRef } from "react";

export interface Shortcut {

  mod?: boolean;
  shift?: boolean;
  key: string;
  handler: (e: KeyboardEvent) => void;
  allowInInputs?: boolean;
}

const isMac =
  typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  if (target.isContentEditable) return true;
  if (target.closest('[role="textbox"], [role="searchbox"], [role="combobox"]')) {
    return true;
  }
  return false;
}

export function useShortcut(shortcuts: Shortcut[]) {
  const ref = useRef(shortcuts);
  ref.current = shortcuts;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      for (const s of ref.current) {
        const modOk = !!s.mod === (isMac ? e.metaKey : e.ctrlKey);
        const shiftOk = !!s.shift === e.shiftKey;
        const keyOk = e.key.toLowerCase() === s.key.toLowerCase();
        if (!modOk || !shiftOk || !keyOk) continue;
        if (!s.allowInInputs && isTypingTarget(e.target)) continue;
        e.preventDefault();
        s.handler(e);
        return;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
}

export function useLeaderSequence(
  leader: string,
  bindings: Record<string, () => void>,
  timeoutMs = 700,
) {
  const bindingsRef = useRef(bindings);
  bindingsRef.current = bindings;

  useEffect(() => {
    let active = false;
    let timer: number | null = null;
    const onKey = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (!active) {
        if (e.key.toLowerCase() === leader.toLowerCase()) {
          active = true;
          timer = window.setTimeout(() => {
            active = false;
            timer = null;
          }, timeoutMs);
          e.preventDefault();
        }
        return;
      }
      const k = e.key.toLowerCase();
      const fn = bindingsRef.current[k];
      if (fn) {
        e.preventDefault();
        fn();
      }
      active = false;
      if (timer) {
        window.clearTimeout(timer);
        timer = null;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      if (timer) window.clearTimeout(timer);
    };
  }, [leader, timeoutMs]);
}
