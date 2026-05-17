import {
  Toast,
  ToastAction,
  ToastProvider,
  ToastViewport,
} from "@/components/ui/Toast";
import { useToast } from "@/lib/toast";

export function Toaster() {
  const { toasts, dismiss } = useToast();
  return (
    <ToastProvider swipeDirection="right" duration={4200}>
      {toasts.map((t) => (
        <Toast
          key={t.id}
          variant={t.variant}
          title={t.title}
          description={t.description}
          duration={t.duration ?? 4200}
          onOpenChange={(open) => {
            if (!open) dismiss(t.id);
          }}
          action={
            t.action ? (
              <ToastAction
                altText={t.action.label}
                onClick={t.action.onClick}
              >
                {t.action.label}
              </ToastAction>
            ) : undefined
          }
        />
      ))}
      <ToastViewport />
    </ToastProvider>
  );
}
