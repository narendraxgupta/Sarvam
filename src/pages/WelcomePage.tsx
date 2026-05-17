import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  GitCompare,
  Rocket,
  Sparkles,
  Zap,
  ShieldCheck,
  Layers,
  Compass,
  Globe2,
} from "lucide-react";
import { Logo } from "@/components/shared/Logo";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { AuthorCredit } from "@/components/shared/AuthorCredit";
import { seedDemoWorkspace } from "@/lib/demo/seedDemoWorkspace";
import { Sparkle } from "lucide-react";
import { IsoStream } from "@/components/illustrations/IsoStream";
import { IsoDiff } from "@/components/illustrations/IsoDiff";
import { IsoFleet } from "@/components/illustrations/IsoFleet";
import { IsoKeyboard } from "@/components/illustrations/IsoKeyboard";
import { IsoFigure } from "@/components/illustrations/IsoFigure";
import { RubiksCube } from "@/components/illustrations/RubiksCube";
import {
  MouseTextEffect,
  TypewriterEffect,
  SlideInButton,
  TacticalGlobe3D,
  BarGraph,
  LineCube,
  BackTrigger,
} from "@/components/framer";
import { Toaster } from "@/components/layout/Toaster";
import { useOnboardingStore } from "@/store/onboardingStore";
import { useReducedMotion } from "@/lib/a11y/useReducedMotion";
import { MOD_LABEL } from "@/lib/keyboard/platform";
import { cn } from "@/lib/utils";

export function WelcomePage() {
  const navigate = useNavigate();
  const complete = useOnboardingStore((s) => s.complete);
  const reduced = useReducedMotion();

  const enter = (path: string = "/playground") => {
    complete();
    navigate(path);
  };

  const fadeUp = reduced
    ? {}
    : {
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-60px" },
        transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
      };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden">
      <div
        aria-hidden
        className="fixed inset-0 pointer-events-none bg-hero-glow"
      />

      <header className="sticky top-0 z-30 bg-bg/70 backdrop-blur-2xl border-b border-line/8">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-14">
          <button
            type="button"
            onClick={() => enter("/playground")}
            className="hover:opacity-80 transition-opacity"
            aria-label="Helix · home"
          >
            <Logo />
          </button>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              className="h-8"
              onClick={() => enter("/playground")}
            >
              Skip
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </header>

      <section className="relative max-w-7xl mx-auto px-6 pt-20 pb-28">
        <div className="grid md:grid-cols-[1.1fr_minmax(0,1fr)] gap-12 items-center">
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="hx-eyebrow flex items-center gap-3 mb-8">
              <span aria-hidden className="inline-block h-2 w-2 rounded-full bg-accent" />
              <span aria-hidden className="inline-block h-px w-8 bg-accent/30" />
              <span>Welcome · v0.1 · Public preview</span>
            </div>

            <h1 className="hx-display-xl text-ink max-w-[14ch]">
              The inference console{" "}
              <em className="text-grad-accent">
                <MouseTextEffect radius={120} lift={14}>
                  you&apos;ve been missing.
                </MouseTextEffect>
              </em>
            </h1>

            <p className="mt-8 max-w-[58ch] text-[16px] font-light leading-[1.65] text-ink-muted">
              Helix puts the live behaviour of large-model serving in front of
              you.{" "}
              <span className="font-medium text-ink">
                <TypewriterEffect
                  strings={[
                    "Token-level streaming.",
                    "Fault-injectable retries.",
                    "Token-by-token A/B diffs.",
                    "Multi-region rollouts.",
                  ]}
                  typingSpeed={36}
                  deletingSpeed={20}
                  holdMs={1600}
                />
              </span>{" "}
              One console, one mental model, zero friction.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              <SlideInButton
                tone="accent"
                size="lg"
                direction="left"
                onClick={() => enter("/playground")}
              >
                Enter the console
              </SlideInButton>
              <SlideInButton
                tone="outline"
                size="lg"
                direction="bottom"
                onClick={() => enter("/diff")}
                icon={<GitCompare className="h-3.5 w-3.5" />}
              >
                Compare two models
              </SlideInButton>
              <span className="hx-eyebrow ml-1">
                or press{" "}
                <span className="hx-kbd">{MOD_LABEL}</span>{" "}
                <span className="hx-kbd">K</span>
              </span>
            </div>

            <div className="mt-5">
              <button
                type="button"
                onClick={() => {
                  seedDemoWorkspace();
                  enter("/playground");
                }}
                className={cn(
                  "inline-flex items-center gap-2 text-[12.5px] text-ink-muted hover:text-accent transition-colors",
                  "rounded-md px-1 -mx-1 focus:outline-none",
                  "focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
                )}
              >
                <Sparkle className="h-3.5 w-3.5 text-accent" />
                Or load a demo workspace — pre-seeded prompts, diff,
                conversations &amp; telemetry.
              </button>
            </div>

            <div className="mt-14 grid grid-cols-4 gap-5 max-w-xl">
              <Stat fig="A" value="< 250" unit="ms TTFB" />
              <Stat fig="B" value="42" unit="t/s peak" />
              <Stat fig="C" value="3" unit="regions" />
              <Stat fig="D" value="31" unit="tests green" />
            </div>
          </motion.div>

          <motion.div
            className="relative grid place-items-center min-h-[420px]"
            initial={reduced ? false : { opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          >
            <div className="absolute inset-0 rounded-full bg-accent/5 blur-[80px]" aria-hidden />
            <RubiksCube size={360} />
            <div className="absolute -bottom-2 -right-2 md:right-0">
              <LineCube size={140} spinY={26} spinX={6} />
            </div>
          </motion.div>
        </div>
      </section>

      <section className="relative max-w-7xl mx-auto px-6 py-20">
        <motion.div className="mb-14" {...fadeUp}>
          <div className="hx-eyebrow flex items-center gap-3 mb-4">
            <span aria-hidden className="inline-block h-2 w-2 rounded-full bg-accent" />
            <span aria-hidden className="inline-block h-px w-6 bg-accent/30" />
            <span>Capabilities · 03</span>
          </div>
          <h2 className="hx-display-md text-ink max-w-[26ch]">
            Three surfaces, <em>one mental model.</em>
          </h2>
        </motion.div>

        <div className="border-t border-line/8">
          <CapabilityRow
            num="01"
            icon={<Sparkles className="h-4 w-4" />}
            label="Stream"
            title="Built for streaming"
            body="Tokens arrive over HTTP/2 SSE with backpressure-aware framing. Every byte observable end-to-end."
            illustration={<IsoStream />}
            onClick={() => enter("/playground")}
            fadeUp={fadeUp}
          />
          <CapabilityRow
            num="02"
            icon={<GitCompare className="h-4 w-4" />}
            label="Diff"
            title="Diff-aware by default"
            body="Myers O(ND) diff renders semantic deltas — additions, removals, replacements — annotated per token."
            illustration={<IsoDiff />}
            onClick={() => enter("/diff")}
            fadeUp={fadeUp}
          />
          <CapabilityRow
            num="03"
            icon={<Rocket className="h-4 w-4" />}
            label="Deploy"
            title="Multi-region rollouts"
            body="Coordinate canaries across active-active regions. Promote, pause, or roll back in seconds."
            illustration={<IsoFleet />}
            onClick={() => enter("/deploy")}
            fadeUp={fadeUp}
            last
          />
        </div>
      </section>

      <section className="relative max-w-7xl mx-auto px-6 py-20">
        <motion.div className="mb-12" {...fadeUp}>
          <div className="hx-eyebrow flex items-center gap-3 mb-4">
            <span aria-hidden className="inline-block h-2 w-2 rounded-full bg-accent" />
            <span aria-hidden className="inline-block h-px w-6 bg-accent/30" />
            <span>Live telemetry · 02</span>
          </div>
          <h2 className="hx-display-md text-ink max-w-[26ch]">
            Every request, <em>fully observable.</em>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-[1fr_1.2fr] gap-8 items-stretch">
          <motion.div className="flex flex-col justify-between" {...fadeUp}>
            <div>
              <h3
                className="font-display text-[22px] font-semibold text-ink"
                style={{ letterSpacing: "-0.02em" }}
              >
                Tokens-per-second, region by region.
              </h3>
              <p className="mt-4 text-[14px] font-light leading-[1.65] text-ink-muted max-w-[48ch]">
                Hover any bar to reveal context. The peak region is marked in
                accent. Bars rise on mount with a 45ms stagger so the chart reads
                as motion first, data second.
              </p>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <span className="hx-chip">live · 60s window</span>
              <span className="hx-chip text-ok border-ok/30 bg-ok/10">
                <span className="h-1.5 w-1.5 rounded-full bg-ok" />
                healthy
              </span>
            </div>
          </motion.div>

          <motion.div
            className="rounded-xl border border-line/8 bg-bg-elevated/30 p-6"
            {...fadeUp}
          >
            <BarGraph
              data={[
                { label: "SFO", value: 38, hint: "us-west-2 · 38 t/s p50" },
                { label: "IAD", value: 32, hint: "us-east-1 · 32 t/s p50" },
                { label: "LHR", value: 41, hint: "eu-west-2 · 41 t/s p50" },
                { label: "FRA", value: 28, hint: "eu-central-1 · 28 t/s p50" },
                { label: "BOM", value: 35, hint: "ap-south-1 · 35 t/s p50" },
                { label: "NRT", value: 33, hint: "ap-northeast-1 · 33 t/s p50" },
                { label: "SYD", value: 27, hint: "ap-southeast-2 · 27 t/s p50" },
              ]}
              height={220}
              unit=" t/s"
            />
          </motion.div>
        </div>
      </section>

      <section className="relative max-w-7xl mx-auto px-6 py-20">
        <motion.div className="mb-12" {...fadeUp}>
          <div className="hx-eyebrow flex items-center gap-3 mb-4">
            <span aria-hidden className="inline-block h-2 w-2 rounded-full bg-accent" />
            <span aria-hidden className="inline-block h-px w-6 bg-accent/30" />
            <span>Infrastructure · 03</span>
          </div>
          <h2 className="hx-display-md text-ink max-w-[26ch]">
            Provider-agnostic. <em>Global by default.</em>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-[minmax(0,1fr)_1fr] gap-10 items-center">
          <motion.div {...fadeUp}>
            <div className="relative aspect-square max-w-[420px] mx-auto grid place-items-center">
              <TacticalGlobe3D size={340} />
            </div>
          </motion.div>

          <motion.div {...fadeUp}>
            <div className="space-y-6">
              {[
                {
                  icon: <Zap className="h-4 w-4" />,
                  title: "Fastest TTFB",
                  body: "HTTP/2 SSE with prefetched DNS and warm pools. Single-digit ms framing overhead.",
                },
                {
                  icon: <ShieldCheck className="h-4 w-4" />,
                  title: "Audited every change",
                  body: "Structured event feed for every promotion, rollback, and config flip. SOC-2 friendly.",
                },
                {
                  icon: <Layers className="h-4 w-4" />,
                  title: "A/B without flags",
                  body: "Token-level diff between any two models or versions. j/k walks every change.",
                },
                {
                  icon: <Compass className="h-4 w-4" />,
                  title: "Keyboard-first",
                  body: "One palette, leader sequences, every action one fuzzy match away.",
                },
              ].map((item) => (
                <div key={item.title} className="flex gap-4 group">
                  <div className="shrink-0 mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-accent/8 text-accent border border-accent/12">
                    {item.icon}
                  </div>
                  <div>
                    <div className="font-display text-[15px] font-semibold text-ink" style={{ letterSpacing: "-0.018em" }}>
                      {item.title}
                    </div>
                    <p className="mt-1 text-[13px] font-light leading-[1.55] text-ink-muted">
                      {item.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="relative max-w-7xl mx-auto px-6 py-16">
        <motion.div className="mb-12" {...fadeUp}>
          <div className="hx-eyebrow flex items-center gap-3 mb-4">
            <span aria-hidden className="inline-block h-2 w-2 rounded-full bg-accent" />
            <span aria-hidden className="inline-block h-px w-6 bg-accent/30" />
            <span>Keyboard · 05</span>
          </div>
          <h2 className="hx-display-md text-ink max-w-[26ch]">
            Fastest from the <em>keyboard, first.</em>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-[1.1fr_minmax(0,1fr)] gap-8 items-center">
          <motion.div {...fadeUp}>
            <p className="text-[15px] font-light leading-[1.65] text-ink-muted max-w-[52ch]">
              Helix is built for operators who never reach for the mouse.
              Press <span className="hx-kbd">{MOD_LABEL}</span>{" "}
              <span className="hx-kbd">K</span> from anywhere to open the
              command palette — every action is one fuzzy match away.
            </p>
            <ul className="mt-7 divide-y divide-line/8 border-y border-line/8 max-w-md">
              {[
                { keys: [MOD_LABEL, "K"], label: "Command palette" },
                { keys: [MOD_LABEL, "↵"], label: "Run inference" },
                { keys: [MOD_LABEL, "."], label: "Abort stream" },
                { keys: ["G", "P"], label: "Go to Playground" },
                { keys: ["J", "/", "K"], label: "Walk diff changes" },
              ].map((s) => (
                <li
                  key={s.label}
                  className="flex items-center justify-between py-3 text-[13px]"
                >
                  <span className="text-ink">{s.label}</span>
                  <span className="flex items-center gap-1">
                    {s.keys.map((k, i) => (
                      <span key={i} className="hx-kbd">
                        {k}
                      </span>
                    ))}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div {...fadeUp}>
            <IsoFigure
              fig="FIG_KBD"
              caption="Command-K"
              className="bg-bg-sunken/40"
              ratio="16:9"
            >
              <IsoKeyboard />
            </IsoFigure>
          </motion.div>
        </div>
      </section>

      <section className="relative max-w-7xl mx-auto px-6 pt-8 pb-28">
        <motion.div
          className={cn(
            "relative overflow-hidden rounded-2xl hx-elevated",
            "p-10 md:p-14",
          )}
          {...fadeUp}
        >
          <div
            aria-hidden
            className="absolute -right-20 -top-20 w-[420px] h-[420px] rounded-full opacity-40"
            style={{
              background:
                "radial-gradient(closest-side, rgb(var(--grad-2) / 0.45), rgb(var(--grad-3) / 0.20) 55%, transparent 75%)",
              filter: "blur(30px)",
            }}
          />
          <div className="relative grid md:grid-cols-[1.4fr_minmax(0,1fr)] gap-8 items-center">
            <div>
              <div className="hx-eyebrow mb-4">Ready · 06</div>
              <h2 className="hx-display-lg text-ink max-w-[20ch]">
                Stop guessing.<br />
                <em>
                  <MouseTextEffect radius={140} lift={14}>
                    Start watching tokens.
                  </MouseTextEffect>
                </em>
              </h2>
              <p className="mt-5 max-w-[56ch] text-[14.5px] font-light leading-[1.65] text-ink-muted">
                Your console is one click away. We&apos;ve pre-loaded three
                streaming prompts so you can see Helix in action without
                writing a single line.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <SlideInButton
                  tone="accent"
                  size="lg"
                  direction="left"
                  onClick={() => enter("/playground")}
                >
                  Open the console
                </SlideInButton>
                <SlideInButton
                  tone="outline"
                  size="lg"
                  direction="bottom"
                  onClick={() => enter("/deploy")}
                  icon={<Globe2 className="h-3.5 w-3.5" />}
                >
                  See the fleet map first
                </SlideInButton>
              </div>
            </div>

            <div className="relative grid place-items-center min-h-[200px]">
              <RubiksCube size={220} />
            </div>
          </div>
        </motion.div>

        <div className="mt-12 pt-6 border-t border-line/6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <span className="text-2xs hx-mono-tab text-ink-dim">
            helix · v0.1.0 · build {new Date().getFullYear()}
          </span>
          <AuthorCredit variant="compact" />
        </div>
      </section>

      <BackTrigger threshold={520} label="Top" />
      <Toaster />
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
      <div className="hx-eyebrow text-ink-dim mb-1.5">FIG_{fig}</div>
      <div
        className="hx-mono-tab text-[24px] sm:text-[28px] font-light text-ink leading-none"
        style={{ letterSpacing: "-0.03em" }}
      >
        {value}
      </div>
      <div className="hx-eyebrow mt-1.5">{unit}</div>
    </div>
  );
}

function CapabilityRow({
  num,
  icon,
  label,
  title,
  body,
  illustration,
  onClick,
  fadeUp,
  last,
}: {
  num: string;
  icon: React.ReactNode;
  label: string;
  title: string;
  body: string;
  illustration: React.ReactNode;
  onClick: () => void;
  fadeUp: Record<string, unknown>;
  last?: boolean;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      className={cn(
        "group w-full text-left py-8 grid gap-8 rounded-md px-2 -mx-2",
        "grid-cols-[60px_minmax(0,1fr)_200px_32px]",
        "items-center",
        !last && "border-b border-line/8",
        "transition-all duration-300",
        "hover:bg-accent/[0.02]",
        "focus:outline-none focus-visible:outline-none",
        "focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
      )}
      {...fadeUp}
    >
      <div
        className="hx-mono-tab text-[36px] font-light text-ink/[0.08] group-hover:text-accent/30 transition-colors"
        style={{ letterSpacing: "-0.04em" }}
      >
        {num}
      </div>

      <div className="min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-accent">{icon}</span>
          <span className="hx-eyebrow text-accent">{label}</span>
        </div>
        <div
          className="font-display text-[18px] font-semibold text-ink leading-snug"
          style={{ letterSpacing: "-0.02em" }}
        >
          {title}
        </div>
        <p className="mt-1.5 text-[13px] font-light leading-[1.55] text-ink-muted max-w-[50ch]">
          {body}
        </p>
      </div>

      <div className="hidden md:block h-[120px] rounded-lg border border-line/6 bg-bg-sunken/20 overflow-hidden relative">
        {illustration}
      </div>

      <ArrowRight className="h-4 w-4 text-ink-dim group-hover:text-accent group-hover:translate-x-1 transition-all" />
    </motion.button>
  );
}
