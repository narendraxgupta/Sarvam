import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import {
  Dialog,
  DialogPortal,
  DialogOverlay,
} from "@radix-ui/react-dialog";
import { useOnboardingStore } from "@/store/onboardingStore";
import { useReducedMotion } from "@/lib/a11y/useReducedMotion";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/shared/Logo";
import { IsoFigure } from "@/components/illustrations/IsoFigure";
import { IsoStream } from "@/components/illustrations/IsoStream";
import { IsoDiff } from "@/components/illustrations/IsoDiff";
import { IsoFleet } from "@/components/illustrations/IsoFleet";
import { IsoKeyboard } from "@/components/illustrations/IsoKeyboard";
import { RubiksCube } from "@/components/illustrations/RubiksCube";
import { MOD_LABEL } from "@/lib/keyboard/platform";
import { cn } from "@/lib/utils";

export function OnboardingOverlay() {
  const open = useOnboardingStore((s) => s.open);
  const step = useOnboardingStore((s) => s.step);
  const next = useOnboardingStore((s) => s.next);
  const back = useOnboardingStore((s) => s.back);
  const close = useOnboardingStore((s) => s.close);
  const complete = useOnboardingStore((s) => s.complete);
  const goTo = useOnboardingStore((s) => s.goTo);
  const total = useOnboardingStore((s) => s.totalSteps);
  const reduced = useReducedMotion();
  const navigate = useNavigate();

  // Keyboard navigation while the overlay is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        next();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        back();
      } else if (e.key === "Escape") {
        e.preventDefault();
        close();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, next, back, close]);

  const finish = (path: string) => {
    complete();
    navigate(path);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) close();
      }}
    >
      <AnimatePresence>
        {open && (
          <DialogPortal forceMount>
            <DialogOverlay asChild>
              <motion.div
                className="fixed inset-0 z-50 bg-bg-sunken/80 backdrop-blur-2xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={reduced ? { duration: 0 } : { duration: 0.25 }}
                style={{
                  backgroundImage:
                    "radial-gradient(60% 50% at 80% 10%, rgb(var(--grad-2) / 0.15), transparent 60%), radial-gradient(40% 40% at 10% 90%, rgb(var(--grad-3) / 0.10), transparent 60%)",
                }}
              />
            </DialogOverlay>

            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none overflow-y-auto">
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-label={`Helix product tour — ${STEP_LABELS[step] ?? "step"}`}
                className={cn(
                  "relative pointer-events-auto",

                  "w-full max-w-6xl",
                  "hx-glass",
                  "overflow-hidden my-8",
                )}
                initial={{ opacity: 0, y: 16, scale: 0.985 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.99 }}
                transition={
                  reduced
                    ? { duration: 0 }
                    : { duration: 0.42, ease: [0.16, 1, 0.3, 1] }
                }
              >
                <div className="flex items-center justify-between px-6 py-4 border-b border-line/8">
                  <Logo />
                  <div className="hidden md:flex items-center gap-2">
                    {Array.from({ length: total }).map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => goTo(i)}
                        aria-label={`Go to step ${i + 1}`}
                        className={cn(
                          "h-1 rounded-full transition-all duration-300",
                          i === step
                            ? "w-10 bg-accent"
                            : i < step
                            ? "w-6 bg-ink/40"
                            : "w-6 bg-ink/15",
                        )}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="hx-eyebrow hidden sm:inline">
                      {String(step + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
                    </span>
                    <button
                      type="button"
                      onClick={close}
                      aria-label="Skip tour"
                      className="inline-flex h-7 w-7 items-center justify-center rounded text-ink-muted hover:text-ink hover:bg-ink/[0.05]"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div
                  className={cn(
                    "px-6 sm:px-10 py-10",
                    "h-[560px] max-h-[75vh] overflow-y-auto scrollbar-thin",
                  )}
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={step}
                      className="h-full flex flex-col justify-center"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={
                        reduced ? { duration: 0 } : { duration: 0.25 }
                      }
                    >
                      {step === 0 && <StepWelcome />}
                      {step === 1 && <StepCapabilities />}
                      {step === 2 && <StepShortcuts />}
                      {step === 3 && <StepGetStarted onFinish={finish} />}
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="flex items-center justify-between px-6 py-4 border-t border-line/8 bg-bg-sunken/40">
                  <div className="hx-eyebrow">
                    {STEP_LABELS[step]}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={back}
                      disabled={step === 0}
                      className="h-8"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      <span>Back</span>
                    </Button>
                    {step < total - 1 ? (
                      <Button
                        variant="accent"
                        size="sm"
                        onClick={next}
                        className="h-8"
                      >
                        <span>Next</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    ) : (
                      <Button
                        variant="accent"
                        size="sm"
                        onClick={() => finish("/playground")}
                        className="h-8"
                      >
                        <span>Open Playground</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          </DialogPortal>
        )}
      </AnimatePresence>
    </Dialog>
  );
}

const STEP_LABELS = [
  "Welcome",
  "Capabilities",
  "Keyboard",
  "Get started",
];

function StepWelcome() {
  return (
    <div className="grid md:grid-cols-[1.05fr_minmax(0,1fr)] gap-10 items-center">
      <div>
        <div className="hx-eyebrow flex items-center gap-3 mb-6">
          <span aria-hidden className="inline-block h-2 w-2 rounded-full bg-accent" />
          <span aria-hidden className="inline-block h-px w-6 bg-accent/30" />
          <span>Tour · 01</span>
        </div>
        <h2
          id="hx-onboarding-title"
          className="hx-display-lg text-ink"
        >
          A console for{" "}
          <em className="text-grad-accent">streaming inference,</em> built
          with restraint.
        </h2>
        <p className="mt-5 max-w-[52ch] text-[15px] font-light leading-[1.6] text-ink-muted">
          Helix puts the live behaviour of large-model serving in front of
          you: token-by-token output, fault injection, A/B diffs, and
          multi-region rollouts. This short tour covers the three things
          worth knowing before you press <span className="hx-kbd">{MOD_LABEL}</span>{" "}
          <span className="hx-kbd">↵</span>.
        </p>

        <div className="mt-8 grid grid-cols-3 gap-4 max-w-md">
          <Stat fig="FIG_A" value="< 250" unit="ms TTFB" />
          <Stat fig="FIG_B" value="3" unit="regions" />
          <Stat fig="FIG_C" value="31" unit="tests green" />
        </div>
      </div>

      <div className="relative grid place-items-center min-h-[320px]">
        <RubiksCube size={300} />
        <span
          className="absolute top-3 right-3 hx-eyebrow text-ink-subtle"
          aria-hidden
        >
          FIG_00 · cube/hero
        </span>
      </div>
    </div>
  );
}

function Stat({
  fig,
  value,
  unit,
}: {
  fig: string;
  value: string;
  unit: string;
}) {
  return (
    <div>
      <div className="hx-eyebrow text-ink-dim mb-1">{fig}</div>
      <div
        className="hx-mono-tab text-[28px] font-light text-ink leading-none"
        style={{ letterSpacing: "-0.03em" }}
      >
        {value}
      </div>
      <div className="hx-eyebrow mt-1">{unit}</div>
    </div>
  );
}

function StepCapabilities() {
  return (
    <div>
      <div className="hx-eyebrow flex items-center gap-3 mb-6">
        <span aria-hidden className="inline-block h-2 w-2 rounded-full bg-accent" />
        <span aria-hidden className="inline-block h-px w-6 bg-accent/30" />
        <span>Tour · 02</span>
      </div>
      <h2 className="hx-display-md text-ink max-w-[24ch]">
        Three surfaces, <em>one mental model.</em>
      </h2>
      <p className="mt-3 max-w-[58ch] text-[14px] font-light leading-[1.6] text-ink-muted">
        Every screen in Helix is built around the same idea: make the
        live behaviour of inference legible. Each capability gets its own
        focused page.
      </p>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-3">
        <Capability
          fig="FIG_01"
          tag="Playground"
          title="Stream"
          body="Token-by-token streaming with throughput and TTFB measured live. Fault injection is one click away."
          illustration={<IsoStream />}
        />
        <Capability
          fig="FIG_02"
          tag="Diff"
          title="Compare"
          body="Myers O(ND) diff between two model outputs. Walk every changed token with j / k."
          illustration={<IsoDiff />}
        />
        <Capability
          fig="FIG_03"
          tag="Deploy"
          title="Roll out"
          body="Active-active region map with one-click promote, pause, and rollback. Audit-friendly feed."
          illustration={<IsoFleet />}
        />
      </div>
    </div>
  );
}

function Capability({
  fig,
  tag,
  title,
  body,
  illustration,
}: {
  fig: string;
  tag: string;
  title: string;
  body: string;
  illustration: React.ReactNode;
}) {
  return (
    <div className="hx-surface p-4 flex flex-col">
      <IsoFigure fig={fig} caption={tag} borderless className="bg-bg-sunken/30 rounded">
        {illustration}
      </IsoFigure>
      <div className="mt-3">
        <div className="hx-eyebrow text-accent">{tag}</div>
        <div className="mt-1 font-display text-[15px] font-semibold text-ink">
          {title}
        </div>
        <p className="mt-1.5 text-[12.5px] font-light leading-[1.55] text-ink-muted">
          {body}
        </p>
      </div>
    </div>
  );
}

function StepShortcuts() {
  const SHORTCUTS: { keys: string[]; label: string }[] = [
    { keys: [MOD_LABEL, "K"], label: "Open command palette" },
    { keys: [MOD_LABEL, "↵"], label: "Run inference" },
    { keys: [MOD_LABEL, "."], label: "Abort current stream" },
    { keys: [MOD_LABEL, "\\"], label: "Toggle sidebar" },
    { keys: ["G", "P"], label: "Go to Playground" },
    { keys: ["G", "D"], label: "Go to Diff" },
    { keys: ["G", "F"], label: "Go to Deploy (Fleet)" },
    { keys: ["J", "/", "K"], label: "Walk diff changes" },
  ];

  return (
    <div className="grid md:grid-cols-[1fr_1.05fr] gap-10 items-start">
      <div>
        <div className="hx-eyebrow flex items-center gap-3 mb-6">
          <span aria-hidden className="inline-block h-2 w-2 rounded-full bg-accent" />
          <span aria-hidden className="inline-block h-px w-6 bg-accent/30" />
          <span>Tour · 03</span>
        </div>
        <h2 className="hx-display-md text-ink max-w-[20ch]">
          Built for the <em>keyboard, first.</em>
        </h2>
        <p className="mt-3 max-w-[44ch] text-[14px] font-light leading-[1.6] text-ink-muted">
          Helix is fastest from the keyboard. Press{" "}
          <span className="hx-kbd">{MOD_LABEL}</span>{" "}
          <span className="hx-kbd">K</span> from anywhere to open the
          command palette — every action is one fuzzy match away.
        </p>

        <ul className="mt-5 divide-y divide-line/8 border-y border-line/8">
          {SHORTCUTS.map((s) => (
            <li
              key={s.label}
              className="flex items-center justify-between py-2 text-[13px]"
            >
              <span className="text-ink">{s.label}</span>
              <span className="flex items-center gap-1.5">
                {s.keys.map((k, i) => (
                  <span key={i} className="hx-kbd">
                    {k}
                  </span>
                ))}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <IsoFigure
        fig="FIG_KBD"
        caption="Command-K"
        className="bg-bg-sunken/40"
        ratio="16:9"
      >
        <IsoKeyboard />
      </IsoFigure>
    </div>
  );
}

function StepGetStarted({
  onFinish,
}: {
  onFinish: (path: string) => void;
}) {
  return (
    <div className="grid md:grid-cols-[1.05fr_minmax(0,1fr)] gap-10 items-start">
      <div>
        <div className="hx-eyebrow flex items-center gap-3 mb-6">
          <span aria-hidden className="inline-block h-2 w-2 rounded-full bg-accent" />
          <span aria-hidden className="inline-block h-px w-6 bg-accent/30" />
          <span>Tour · 04</span>
        </div>
        <h2 className="hx-display-md text-ink max-w-[22ch]">
          You're set. <em>Pick where to land.</em>
        </h2>
        <p className="mt-3 max-w-[52ch] text-[14px] font-light leading-[1.6] text-ink-muted">
          You can reopen this tour anytime from the topbar. Settings,
          theme toggle, and command palette all live in the header — the
          rest is in the sidebar.
        </p>

        <div className="mt-7 grid grid-cols-1 gap-2">
          <LaunchRow
            num="01"
            title="Run a streaming prompt"
            body="Three sample prompts are pre-loaded. Hover to preview, click to run."
            onClick={() => onFinish("/playground")}
          />
          <LaunchRow
            num="02"
            title="Compare two model outputs"
            body="See semantic deltas annotated per-token."
            onClick={() => onFinish("/diff")}
          />
          <LaunchRow
            num="03"
            title="Promote a canary deployment"
            body="Watch the fleet map react in real time."
            onClick={() => onFinish("/deploy")}
          />
        </div>
      </div>

      <IsoFigure
        fig="FIG_END"
        caption="Ready"
        className="bg-bg-sunken/40"
        ratio="4:3"
      >
        <IsoFleet />
      </IsoFigure>
    </div>
  );
}

function LaunchRow({
  num,
  title,
  body,
  onClick,
}: {
  num: string;
  title: string;
  body: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group grid grid-cols-[44px_1fr_auto] items-center gap-4",
        "text-left py-3 px-2",
        "border-b border-line/8 last:border-b-0",
        "hover:bg-accent/[0.03] transition-colors duration-200",
        "focus-visible:outline-none focus-visible:bg-accent/[0.04]",
      )}
    >
      <span
        className="hx-mono-tab text-[24px] font-light text-ink-dim group-hover:text-accent transition-colors"
        style={{ letterSpacing: "-0.03em" }}
      >
        {num}
      </span>
      <span>
        <span className="block font-display text-[14.5px] font-medium text-ink">
          {title}
        </span>
        <span className="block mt-0.5 text-[12.5px] font-light text-ink-muted leading-[1.5]">
          {body}
        </span>
      </span>
      <ArrowRight className="h-4 w-4 text-ink-dim group-hover:text-accent group-hover:translate-x-1 transition-all" />
    </button>
  );
}
