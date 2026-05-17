import { motion } from "framer-motion";
import { useReducedMotion } from "@/lib/a11y/useReducedMotion";

export function IsoCache() {
  const reduced = useReducedMotion();

  const lines: { text: string; tone?: "ok" | "accent" | "muted" }[] = [
    { text: "$ helix stream --provider claude --model sonnet-4", tone: "muted" },
    { text: "→ connecting · ttfb=128ms · region=us-east-1", tone: "ok" },
    { text: "→ stream open · tokens/s≈42 · bytes=1.2k", tone: "accent" },
    { text: "✓ done · tokens=384 · cost=$0.0021", tone: "ok" },
  ];

  return (
    <div className="absolute inset-0 grid place-items-center p-6">
      <div
        className="relative w-full max-w-[360px] rounded-md overflow-hidden"
        style={{
          background:
            "linear-gradient(180deg, rgb(var(--bg-elevated)) 0%, rgb(var(--bg-sunken)) 100%)",
          boxShadow:
            "0 16px 50px -16px rgb(0 0 0 / 0.55), inset 0 1px 0 rgb(var(--highlight) / 0.05)",
          border: "1px solid rgb(var(--line) / 0.10)",
        }}
      >
        <div className="flex items-center gap-1.5 px-3 h-7 border-b border-line/10">
          <span className="h-2 w-2 rounded-full bg-ink/20" />
          <span className="h-2 w-2 rounded-full bg-ink/20" />
          <span className="h-2 w-2 rounded-full bg-ink/20" />
          <span className="ml-2 hx-eyebrow">helix · stream</span>
        </div>

        <div className="p-3 font-mono text-[11.5px] leading-[1.55] tabular-nums">
          {lines.map((l, i) => (
            <motion.div
              key={i}
              initial={reduced ? false : { opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={
                reduced
                  ? undefined
                  : {
                      duration: 0.35,
                      delay: 0.4 + i * 0.18,
                      ease: [0.16, 1, 0.3, 1],
                    }
              }
              className={
                l.tone === "ok"
                  ? "text-ok"
                  : l.tone === "accent"
                  ? "text-accent"
                  : "text-ink-muted"
              }
            >
              {l.text}
            </motion.div>
          ))}
          {!reduced && (
            <motion.span
              className="inline-block h-[1em] w-[7px] align-middle bg-accent ml-0.5"
              animate={{ opacity: [1, 0.2, 1] }}
              transition={{ duration: 1.1, repeat: Infinity }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
