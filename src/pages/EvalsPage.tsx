import { useMemo } from "react";
import { motion } from "framer-motion";
import { FlaskConical, Printer } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { printToPdf } from "@/lib/export";
import { SuiteList } from "@/components/evals/SuiteList";
import { RunPanel } from "@/components/evals/RunPanel";
import { ResultsGrid } from "@/components/evals/ResultsGrid";
import { CaseDetail } from "@/components/evals/CaseDetail";
import { RegressionBanner } from "@/components/evals/RegressionBanner";
import { useEvalsStore } from "@/store/evalsStore";
import { getSuite } from "@/data/evalSuites";
import { useReducedMotion } from "@/lib/a11y/useReducedMotion";

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

export function EvalsPage() {
  const suites = useEvalsStore((s) => s.suites);
  const selectedSuiteId = useEvalsStore((s) => s.selectedSuiteId);
  const setSelectedSuite = useEvalsStore((s) => s.setSelectedSuite);
  const models = useEvalsStore((s) => s.models);
  const toggleModel = useEvalsStore((s) => s.toggleModel);
  const activeRun = useEvalsStore((s) => s.activeRun);
  const history = useEvalsStore((s) => s.history);
  const startRun = useEvalsStore((s) => s.startRun);
  const cancelRun = useEvalsStore((s) => s.cancelRun);
  const selectedCaseId = useEvalsStore((s) => s.selectedCaseId);
  const setSelectedCase = useEvalsStore((s) => s.setSelectedCase);
  const reduced = useReducedMotion();

  const suite = getSuite(selectedSuiteId) ?? suites[0];

  const previousRun = useMemo(
    () => (suite ? history.find((h) => h.suiteId === suite.id) : undefined),
    [history, suite],
  );

  const displayRun = activeRun ?? previousRun ?? null;

  const selectedCase = useMemo(() => {
    if (!selectedCaseId || !suite) return null;
    return suite.cases.find((c) => c.id === selectedCaseId) ?? null;
  }, [selectedCaseId, suite]);

  const passCount = useMemo(() => {
    if (!displayRun) return 0;
    return Object.values(displayRun.results).filter(
      (r) => r.status === "pass",
    ).length;
  }, [displayRun]);
  const failCount = useMemo(() => {
    if (!displayRun) return 0;
    return Object.values(displayRun.results).filter(
      (r) => r.status === "fail",
    ).length;
  }, [displayRun]);
  const totalPairs = displayRun ? Object.keys(displayRun.results).length : 0;

  const baselineRun = useMemo(() => {
    if (!suite) return undefined;
    if (activeRun) return previousRun;
    return history.find(
      (h) => h.suiteId === suite.id && h.id !== displayRun?.id,
    );
  }, [activeRun, previousRun, history, suite, displayRun?.id]);

  if (!suite) {
    return (
      <div className="min-h-[50vh] grid place-items-center p-8 text-center">
        <div>
          <div className="hx-eyebrow text-ink-dim mb-2">No suites available</div>
          <p className="text-[13px] text-ink-muted max-w-md">
            The eval catalog is empty. Add a suite under{" "}
            <code className="font-mono text-ink">src/data/evalSuites.ts</code> to get started.
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      id="evals-printable"
      data-printable
      data-print-region="evals"
      className="min-w-0 px-5 lg:px-8 pt-6 pb-16 max-w-[1400px] mx-auto"
      initial={reduced ? "visible" : "hidden"}
      animate="visible"
      variants={stagger}
    >
      <motion.header className="mb-8" variants={fadeUp}>
        <div className="flex items-center gap-3 mb-4">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent/20 bg-accent/5 text-xs text-accent font-medium">
            <FlaskConical className="h-3 w-3" />
            Evaluations
          </span>
          <span className="text-2xs text-ink-subtle font-mono">
            harness · {suites.length} suites · {suite.cases.length} cases live
          </span>
        </div>
        <h1 className="text-[44px] sm:text-[56px] leading-[0.98] font-serif tracking-tightish text-ink">
          Ship with <span className="italic text-accent">confidence</span>.
        </h1>
        <p className="mt-3 text-[15px] text-ink-muted max-w-2xl leading-relaxed">
          Run reproducible suites across every Helix model, compare against
          the canonical answer, and surface regressions the moment they
          appear.
        </p>
        <div className="mt-4 flex justify-end" data-print-hide>
          <Button
            size="sm"
            variant="ghost"
            className="gap-1.5"
            onClick={() =>
              printToPdf({
                regionId: "evals-printable",
                title: `Helix evals · ${suite.id}`,
              })
            }
          >
            <Printer className="h-3 w-3" />
            Print / PDF
          </Button>
        </div>
      </motion.header>

      {displayRun && (
        <motion.section
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6"
          variants={fadeUp}
        >
          <Kpi
            label="Pass"
            value={`${passCount}`}
            tone="ok"
            unit={`/ ${totalPairs}`}
          />
          <Kpi
            label="Fail"
            value={`${failCount}`}
            tone={failCount > 0 ? "danger" : undefined}
            unit={`/ ${totalPairs}`}
          />
          <Kpi
            label="Pass rate"
            value={
              totalPairs > 0
                ? `${Math.round((passCount / totalPairs) * 100)}`
                : "—"
            }
            unit="%"
          />
          <Kpi
            label="Models"
            value={`${displayRun.models.length}`}
            unit={displayRun.models.join(" · ")}
          />
        </motion.section>
      )}

      <motion.div variants={fadeUp} className="mb-4">
        <RegressionBanner
          suite={suite}
          currentRun={displayRun}
          previousRun={baselineRun}
        />
      </motion.div>

      <motion.section
        className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4 mb-6"
        variants={fadeUp}
      >
        <aside>
          <div className="hx-eyebrow mb-3 text-accent">Suites</div>
          <SuiteList
            suites={suites}
            selectedId={suite.id}
            onSelect={setSelectedSuite}
          />
        </aside>
        <div className="flex flex-col gap-4 min-w-0">
          <RunPanel
            suite={suite}
            models={models}
            toggleModel={toggleModel}
            activeRun={activeRun}
            onStart={() => {
              setSelectedCase(null);
              startRun();
            }}
            onCancel={cancelRun}
            lastRunAt={previousRun?.finishedAt ?? undefined}
          />

          <ResultsGrid
            suite={suite}
            run={displayRun}
            selectedCaseId={selectedCaseId}
            onSelectCase={(id) => {
              // Toggle: clicking the same row dismisses the detail.
              setSelectedCase(id === selectedCaseId ? null : id);
            }}
          />
        </div>
      </motion.section>

      {selectedCase && (
        <motion.section variants={fadeUp}>
          <CaseDetail caseObj={selectedCase} run={displayRun} />
        </motion.section>
      )}
    </motion.div>
  );
}

function Kpi({
  label,
  value,
  unit,
  tone,
}: {
  label: string;
  value: string;
  unit?: string;
  tone?: "ok" | "warn" | "danger" | "accent";
}) {
  const toneCls = {
    ok: "text-ok",
    warn: "text-warn",
    danger: "text-danger",
    accent: "text-accent",
  } as const;
  return (
    <div className="hx-surface px-4 py-3.5">
      <div className="hx-eyebrow text-ink-subtle">{label}</div>
      <div className="mt-1.5 flex items-baseline gap-1.5">
        <span
          className={`text-[26px] font-semibold tabular-nums leading-none ${
            tone ? toneCls[tone] : "text-ink"
          }`}
        >
          {value}
        </span>
        {unit && (
          <span className="text-[11px] text-ink-subtle truncate">{unit}</span>
        )}
      </div>
    </div>
  );
}
