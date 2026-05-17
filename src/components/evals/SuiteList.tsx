import { motion } from "framer-motion";
import { BookOpen, Code2, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EvalCategory, EvalSuite } from "@/types/evals";

interface Props {
  suites: EvalSuite[];
  selectedId: string;
  onSelect: (id: string) => void;
}

const CATEGORY_META: Record<
  EvalCategory,
  {
    icon: React.ComponentType<{ className?: string }>;
    tone: string;
    label: string;
  }
> = {
  factuality: {
    icon: BookOpen,
    tone: "text-accent border-accent/20 bg-accent/5",
    label: "Factuality",
  },
  code: {
    icon: Code2,
    tone: "text-ok border-ok/20 bg-ok/5",
    label: "Code",
  },
  safety: {
    icon: ShieldAlert,
    tone: "text-warn border-warn/20 bg-warn/5",
    label: "Safety",
  },
};

export function SuiteList({ suites, selectedId, onSelect }: Props) {
  return (
    <nav className="flex flex-col gap-1.5" aria-label="Eval suites">
      {suites.map((s, i) => {
        const meta = CATEGORY_META[s.category];
        const Icon = meta.icon;
        const active = s.id === selectedId;
        return (
          <motion.button
            key={s.id}
            type="button"
            onClick={() => onSelect(s.id)}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25, delay: i * 0.04 }}
            className={cn(
              "text-left rounded-lg border p-3 transition-all",
              "hover:bg-ink/[0.03]",
              active
                ? "border-accent/30 bg-accent/[0.04] shadow-ring-soft"
                : "border-line/8",
            )}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className={cn(
                  "grid h-6 w-6 place-items-center rounded border",
                  meta.tone,
                )}
              >
                <Icon className="h-3 w-3" />
              </span>
              <span className="text-[10px] uppercase tracking-[0.16em] font-semibold text-ink-subtle">
                {meta.label}
              </span>
              <span className="ml-auto text-[10.5px] font-mono text-ink-dim">
                {s.cases.length} cases
              </span>
            </div>
            <div
              className={cn(
                "text-[13.5px] font-medium leading-tight",
                active ? "text-ink" : "text-ink-muted",
              )}
            >
              {s.name}
            </div>
            <p className="mt-1 text-[11.5px] text-ink-subtle leading-relaxed line-clamp-2">
              {s.description}
            </p>
          </motion.button>
        );
      })}
    </nav>
  );
}
