import { motion } from "framer-motion";
import { ModelRegistry } from "@/components/deploy/ModelRegistry";
import { FleetMap } from "@/components/deploy/FleetMap";
import { RolloutControls } from "@/components/deploy/RolloutControls";
import { DeploymentFeed } from "@/components/deploy/DeploymentFeed";
import { useReducedMotion } from "@/lib/a11y/useReducedMotion";
import { REGIONS } from "@/data/regions";

const stagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

export function DeployPage() {
  const healthy = REGIONS.filter((r) => r.health === "healthy").length;
  const total = REGIONS.length;
  const reduced = useReducedMotion();

  return (
    <motion.div
      className="min-w-0 px-5 lg:px-8 pt-6 pb-16 max-w-[1400px] mx-auto"
      initial={reduced ? "visible" : "hidden"}
      animate="visible"
      variants={stagger}
    >
      <motion.header className="mb-8" variants={fadeUp}>
        <div className="flex items-center gap-3 mb-4">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-ok/20 bg-ok/5 text-xs text-ok font-medium">
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-ok">
              <span className="absolute inset-0 rounded-full bg-ok animate-ping opacity-60" />
            </span>
            Fleet healthy
          </span>
          <span className="hx-eyebrow text-ink-subtle">Deploy · Fleet console</span>
        </div>

        <div className="flex items-end justify-between gap-6 flex-wrap">
          <div>
            <h1 className="hx-display-lg text-ink max-w-[22ch]">
              Many regions,<br />
              <em>zero drift.</em>
            </h1>
            <p className="mt-3 max-w-[52ch] text-[14px] font-light leading-[1.6] text-ink-muted">
              Coordinate canary rollouts across active-active regions. Promote,
              pause, or roll back any model in seconds.
            </p>
          </div>

          <div className="text-right">
            <div className="hx-eyebrow mb-1">Regions online</div>
            <div className="flex items-baseline gap-1">
              <span
                className="hx-mono-tab text-[48px] leading-none font-light text-ok"
                style={{ letterSpacing: "-0.04em" }}
              >
                {healthy}
              </span>
              <span className="hx-mono-tab text-[24px] font-light text-ink-dim" style={{ letterSpacing: "-0.04em" }}>
                /{total}
              </span>
            </div>
          </div>
        </div>
      </motion.header>

      <motion.div className="mb-6" variants={fadeUp}>
        <FleetMap />
      </motion.div>

      <motion.div className="mb-8" variants={fadeUp}>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {REGIONS.map((r) => (
            <RegionStat key={r.id} region={r} />
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr_1fr] gap-5">
        <motion.div variants={fadeUp}>
          <ModelRegistry />
        </motion.div>
        <motion.div variants={fadeUp}>
          <DeploymentFeed />
        </motion.div>
        <motion.div variants={fadeUp}>
          <RolloutControls />
        </motion.div>
      </div>
    </motion.div>
  );
}

function RegionStat({ region }: { region: (typeof REGIONS)[number] }) {
  const isHealthy = region.health === "healthy";
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-line/8 bg-bg-surface/50 transition-all duration-200 hover:border-accent/15 hover:bg-accent/[0.02]">
      <span
        className={`h-2 w-2 rounded-full shrink-0 ${
          isHealthy ? "bg-ok" : region.health === "degraded" ? "bg-warn" : "bg-danger"
        }`}
      />
      <div className="min-w-0 flex-1">
        <div className="font-mono text-[12px] font-semibold text-ink truncate tracking-tight">
          {region.city}
        </div>
        <div className="text-[11px] text-ink-subtle font-mono tabular-nums">
          {region.latencyMs}ms · {region.code}
        </div>
      </div>
    </div>
  );
}
