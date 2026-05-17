import { toast } from "@/lib/toast";

let registered = false;
let inFlight: Promise<void> | null = null;

export async function registerServiceWorker(): Promise<void> {
  if (registered) return;
  if (typeof window === "undefined") return;
  if (!("serviceWorker" in navigator)) return;
  if (import.meta.env.DEV) return;

  if (inFlight) return inFlight;

  inFlight = (async () => {
    try {
      const mod = await import("virtual:pwa-register");

      const update = mod.registerSW({
        onNeedRefresh() {
          toast.show({
            title: "Update available",
            description: "A new version of Helix is ready. Reload to apply.",
            variant: "info",
            duration: 9000,
            action: {
              label: "Reload",
              onClick: () => update(true),
            },
          });
        },
        onOfflineReady() {
          toast.show({
            title: "Offline ready",
            description: "Helix is now installed and works without a connection.",
            variant: "success",
          });
        },
      });
      registered = true;
    } catch {
    } finally {
      inFlight = null;
    }
  })();
  return inFlight;
}
