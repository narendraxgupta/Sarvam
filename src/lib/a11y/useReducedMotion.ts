import { useEffect, useState } from "react";
import { useUiStore } from "@/store/uiStore";

export function useReducedMotion(): boolean {
  const override = useUiStore((s) => s.reducedMotion);
  const [system, setSystem] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setSystem(mq.matches);
    const handler = (e: MediaQueryListEvent) => setSystem(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const effective = override || system;

  useEffect(() => {

    document.documentElement.dataset.reducedMotion = effective ? "true" : "false";
  }, [effective]);

  return effective;
}
