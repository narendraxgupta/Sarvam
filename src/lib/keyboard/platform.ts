const isMac =
  typeof navigator !== "undefined" &&
  /Mac|iPhone|iPad/i.test(navigator.platform);

export const IS_MAC = isMac;

export const MOD_LABEL = isMac ? "⌘" : "Ctrl";

export const ALT_LABEL = isMac ? "⌥" : "Alt";

export const SHIFT_LABEL = isMac ? "⇧" : "Shift";

export const ENTER_LABEL = isMac ? "↵" : "Enter";

export const ESC_LABEL = isMac ? "esc" : "Esc";

export function combo(key: string): string {
  const k =
    key === "enter"
      ? ENTER_LABEL
      : key === "esc" || key === "escape"
      ? ESC_LABEL
      : key.toUpperCase();
  return isMac ? `${MOD_LABEL}${k}` : `${MOD_LABEL}+${k}`;
}
