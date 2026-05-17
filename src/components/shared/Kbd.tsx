import { cn } from "@/lib/utils";

export function Kbd({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <kbd className={cn("hx-kbd", className)} aria-hidden>
      {children}
    </kbd>
  );
}
