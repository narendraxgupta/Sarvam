import { useCallback, useEffect, useRef } from "react";

export function useAnnouncer() {
  const regionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let el = document.getElementById("hx-announcer") as HTMLDivElement | null;
    if (!el) {
      el = document.createElement("div");
      el.id = "hx-announcer";
      el.setAttribute("role", "status");
      el.setAttribute("aria-live", "polite");
      el.setAttribute("aria-atomic", "true");
      el.style.position = "absolute";
      el.style.width = "1px";
      el.style.height = "1px";
      el.style.padding = "0";
      el.style.margin = "-1px";
      el.style.overflow = "hidden";
      el.style.clip = "rect(0,0,0,0)";
      el.style.whiteSpace = "nowrap";
      el.style.border = "0";
      document.body.appendChild(el);
    }
    regionRef.current = el;
  }, []);

  const announce = useCallback((message: string) => {
    if (!regionRef.current) return;
    // Toggle text to force re-announce of identical messages.
    regionRef.current.textContent = "";
    requestAnimationFrame(() => {
      if (regionRef.current) regionRef.current.textContent = message;
    });
  }, []);

  return announce;
}
