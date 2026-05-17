import { useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, GitCompare, Rocket, Terminal } from "lucide-react";
import { usePlaygroundStore, getModelMeta } from "@/store/playgroundStore";
import { cn } from "@/lib/utils";
import { ENTER_LABEL, MOD_LABEL } from "@/lib/keyboard/platform";
import { SAMPLE_PROMPTS } from "@/data/samplePrompts";
import { RubiksCube } from "@/components/illustrations/RubiksCube";
import {
  TypewriterEffect,
  MouseTextEffect,
} from "@/components/framer";
import { useReducedMotion } from "@/lib/a11y/useReducedMotion";
import { InputDock } from "@/components/playground/InputDock";

export function PlaygroundHero() {
  const setPrompt = usePlaygroundStore((s) => s.setPrompt);
  const runInference = usePlaygroundStore((s) => s.runInference);
  const model = usePlaygroundStore((s) => s.model);
  const modelMeta = getModelMeta(model);
  const navigate = useNavigate();
  const reduced = useReducedMotion();

  const samples = useMemo(() => SAMPLE_PROMPTS.slice(0, 3), []);

  const pendingRunRef = useRef<number | null>(null);
  useEffect(() => {
    return () => {
      if (pendingRunRef.current !== null) {
        window.clearTimeout(pendingRunRef.current);
        pendingRunRef.current = null;
      }
    };
  }, []);

  const tryAndRun = (prompt: string) => {
    setPrompt(prompt);
    if (pendingRunRef.current !== null) {
      window.clearTimeout(pendingRunRef.current);
    }
    pendingRunRef.current = window.setTimeout(() => {
      pendingRunRef.current = null;
      runInference();
    }, 30);
  };

  const fadeUp = reduced
    ? {}
    : {
        initial: { opacity: 0, y: 16 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
      };

  return (
    <div className="relative w-full min-h-[calc(100vh-var(--topbar-h,56px))]">
      <div
        aria-hidden
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgb(var(--grad-2) / 0.08), transparent 70%)",
        }}
      />

      <div className="max-w-6xl mx-auto px-6 pt-12 lg:pt-20">
        <div className="grid lg:grid-cols-[1.2fr_1fr] gap-12 items-center">
          <motion.div {...fadeUp}>
            <div className="flex items-center gap-3 mb-6">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent/20 bg-accent/5 text-xs text-accent font-medium">
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-ok">
                  <span className="absolute inset-0 rounded-full bg-ok animate-ping opacity-60" />
                </span>
                Online · {modelMeta.name}
              </span>
            </div>

            <h1 className="hx-display-xl text-ink leading-[1.05]">
              Stream a prompt,
              <br />
              <em className="text-grad-accent">
                <MouseTextEffect radius={130} lift={14}>
                  watch tokens land.
                </MouseTextEffect>
              </em>
            </h1>

            <p className="mt-6 max-w-[52ch] text-[15px] font-light leading-[1.65] text-ink-muted">
              Helix streams tokens the instant they arrive — over real HTTP/2 SSE
              with backpressure-aware framing.{" "}
              <span className="font-medium text-ink">
                <TypewriterEffect
                  strings={[
                    "Write a prompt.",
                    `Press ${MOD_LABEL} ${ENTER_LABEL} to run.`,
                    "Watch every byte land.",
                    "Inject a fault — retries on tap.",
                  ]}
                  typingSpeed={34}
                  deletingSpeed={20}
                  holdMs={1500}
                />
              </span>
            </p>

            <div className="mt-8 flex items-center gap-6">
              {[
                { value: "< 250", unit: "ms TTFB" },
                { value: "42", unit: "t/s peak" },
                { value: "3", unit: "regions" },
              ].map((s) => (
                <div key={s.unit} className="flex items-baseline gap-1.5">
                  <span className="hx-mono-tab text-[20px] font-light text-ink" style={{ letterSpacing: "-0.03em" }}>
                    {s.value}
                  </span>
                  <span className="hx-eyebrow text-ink-dim">{s.unit}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="hidden lg:flex justify-center items-center"
            initial={reduced ? false : { opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <RubiksCube size={320} interactive hint />
          </motion.div>
        </div>
      </div>

      <motion.div
        className="max-w-4xl mx-auto px-6 mt-10"
        initial={reduced ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
      >
        <InputDock />
      </motion.div>

      <motion.div
        className="max-w-5xl mx-auto px-6 mt-14"
        initial={reduced ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="flex items-center gap-3 mb-5">
          <Terminal className="h-3.5 w-3.5 text-accent" />
          <span className="hx-eyebrow">Try a prompt</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {samples.map((s, idx) => (
            <button
              key={s.id}
              type="button"
              // NOTE: previously this also fired `setPrompt` on mouse-enter,
              // which silently destroyed any in-progress prompt the user
              // had typed just by hovering over a sample card. The prompt
              // is now only adopted on explicit click.
              onClick={() => tryAndRun(s.prompt)}
              className={cn(
                "group text-left p-5 rounded-xl",
                "border border-line/8 bg-bg-elevated/40",
                "transition-all duration-300",
                "hover:border-accent/20 hover:bg-accent/[0.03] hover:shadow-blue-glow",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
              )}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="hx-eyebrow text-accent">{s.langLabel}</span>
                <span
                  className="hx-mono-tab text-[32px] font-light text-ink/[0.06] group-hover:text-accent/20 transition-colors"
                  style={{ letterSpacing: "-0.04em" }}
                >
                  {String(idx + 1).padStart(2, "0")}
                </span>
              </div>
              <div
                className="font-display text-[15px] font-semibold text-ink leading-snug mb-2"
                style={{ letterSpacing: "-0.018em" }}
              >
                {s.title}
              </div>
              <div className="text-[12px] font-light leading-[1.5] text-ink-subtle line-clamp-2">
                {s.prompt}
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-[11px] text-ink-dim group-hover:text-accent transition-colors">
                <span>Click to run</span>
                <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div
        className="max-w-5xl mx-auto px-6 mt-16 mb-16"
        initial={reduced ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="border-t border-line/8 pt-8">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <CapabilityPill
              icon={<Sparkles className="h-3 w-3" />}
              label="Live streaming"
              desc="HTTP/2 SSE with backpressure"
            />
            <CapabilityPill
              icon={<GitCompare className="h-3 w-3" />}
              label="Token-level diffs"
              desc="Myers O(ND) algorithm"
              onClick={() => navigate("/diff")}
            />
            <CapabilityPill
              icon={<Rocket className="h-3 w-3" />}
              label="Multi-region deploy"
              desc="Canary rollouts"
              onClick={() => navigate("/deploy")}
            />
          </div>

          <div className="flex flex-wrap items-center gap-x-8 gap-y-2 text-2xs hx-mono-tab text-ink-dim">
            <span>
              <span className="hx-eyebrow mr-2">Model</span>
              <span className="text-ink-muted">{modelMeta.id}</span>
            </span>
            <span>
              <span className="hx-eyebrow mr-2">Context</span>
              <span className="text-ink-muted">
                {(modelMeta.contextLength / 1024).toFixed(0)}k
              </span>
            </span>
            <span>
              <span className="hx-eyebrow mr-2">Transport</span>
              <span className="text-ink-muted">HTTP/2 · SSE</span>
            </span>
            <span>
              <span className="hx-eyebrow mr-2">Region</span>
              <span className="text-ink-muted">us-east-1 / eu-west-1</span>
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function CapabilityPill({
  icon,
  label,
  desc,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  desc: string;
  onClick?: () => void;
}) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full",
        "border border-line/10 bg-bg-elevated/50",
        "text-xs text-ink-muted",
        "transition-all duration-200",
        onClick && "hover:border-accent/20 hover:text-accent hover:bg-accent/[0.04] cursor-pointer",
      )}
      type={onClick ? "button" : undefined}
    >
      <span className="text-accent">{icon}</span>
      <span className="font-medium text-ink text-[13px]">{label}</span>
      <span className="hidden sm:inline text-ink-dim">·</span>
      <span className="hidden sm:inline">{desc}</span>
      {onClick && (
        <ArrowRight className="h-3 w-3 text-ink-dim" />
      )}
    </Tag>
  );
}
