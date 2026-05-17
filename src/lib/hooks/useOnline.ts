import { useEffect } from "react";
import { useUiStore } from "@/store/uiStore";

export function useOnlineDetector() {
  const setOnline = useUiStore((s) => s.setOnline);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, [setOnline]);
}
