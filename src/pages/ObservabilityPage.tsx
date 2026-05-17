import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Activity, Pause, Play, Printer, RotateCcw } from "lucide-react";
import { printToPdf } from "@/lib/export";
import { Button } from "@/components/ui/Button";
import { LatencyChart } from "@/components/observability/LatencyChart";
import { ErrorRateGauge } from "@/components/observability/ErrorRateGauge";
import { RequestExplorer } from "@/components/observability/RequestExplorer";
import { RequestDetailPanel } from "@/components/observability/RequestDetailPanel";
import { HistogramBars } from "@/components/observability/HistogramBars";
import {
  buildHistogram,
  useObservabilityStore,
} from "@/store/observabilityStore";
import { useReducedMotion } from "@/lib/a11y/useReducedMotion";

const stagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};
const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

export function ObservabilityPage() {
  const samples = useObservabilityStore((s) => s.samples);
  const requests = useObservabilityStore((s) => s.requests);
  const selectedId = useObservabilityStore((s) => s.selectedRequestId);
  const select = useObservabilityStore((s) => s.select);
  const running = useObservabilityStore((s) => s.running);
  const start = useObservabilityStore((s) => s.start);
  const stop = useObservabilityStore((s) => s.stop);
  const reset = useObservabilityStore((s) => s.reset);
  const totalRequests = useObservabilityStore((s) => s.totalRequests);
  const totalErrors = useObservabilityStore((s) => s.totalErrors);
  const reduced = useReducedMotion();

  useEffect(() => {
    start();
    return () => stop();
  }, [start, stop]);

  const [wallTick, setWallTick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setWallTick((t) => t + 1), 1000);
    return () => window.clearInterval(id);
  }, []);

  const selected = useMemo(
    () => requests.find((r) => r.id === selectedId) ?? null,
    [requests, selectedId],
  );

  const last60sRequests = useMemo(
    () => {

      void wallTick;
      return requests.filter((r) => Date.now() - r.startedAt < 60_000);
    },
    [requests, wallTick],
  );

  const histogram = useMemo(
    () => buildHistogram(last60sRequests.map((r) => r.latencyMs)),
    [last60sRequests],
  );

  const last60sErrorRate = useMemo(() => {
    if (last60sRequests.length === 0) return 0;
    return (
      last60sRequests.filter((r) => r.status !== "ok").length /
      last60sRequests.length
    );
  }, [last60sRequests]);

  const currentRps = samples.length > 0 ? samples[samples.length - 1].rps : 0;

  return (
    <motion.div
      id="observability-printable"
      data-printable
      data-print-region="observability"
      className="min-w-0 px-5 lg:px-8 pt-6 pb-16 max-w-[1400px] mx-auto"
      initial={reduced ? "visible" : "hidden"}
      animate="visible"
      variants={stagger}
    >
      <motion.header className="mb-8" variants={fadeUp}>
        <div className="flex items-center gap-3 mb-4">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent/20 bg-accent/5 text-xs text-accent font-medium">
            <Activity className="h-3 w-3" />
            Observability
          </span>
          <span className="text-2xs text-ink-subtle font-mono">
            real-time telemetry · last 60s
          </span>
        </div>
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div className="flex-1 min-w-0">
            <h1 className="text-[44px] sm:text-[56px] leading-[0.98] font-serif tracking-tightish text-ink">
              Inside every <span className="italic text-accent">request</span>.
            </h1>
            <p className="mt-3 text-[15px] text-ink-muted max-w-2xl leading-relaxed">
              Streamed straight from the inference layer — p50/p95/p99
              latency, per-request traces, and a live error budget that
              never blinks.
            </p>
          </div>
          <div className="flex items-center gap-2 pt-3 shrink-0">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => (running ? stop() : start())}
              className="gap-1.5"
            >
              {running ? (
                <>
                  <Pause className="h-3 w-3" /> Pause stream
                </>
              ) : (
                <>
                  <Play className="h-3 w-3" /> Resume stream
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => reset()}
              className="gap-1.5"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </Button>
            <Button
              size="sm"
              variant="ghost"
              data-print-hide
              onClick={() =>
                printToPdf({
                  regionId: "observability-printable",
                  title: "Helix observability",
                })
              }
              className="gap-1.5"
            >
              <Printer className="h-3 w-3" />
              Print / PDF
            </Button>
          </div>
        </div>
      </motion.header>

      <motion.section
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6"
        variants={fadeUp}
      >
        <Kpi label="RPS" value={`${currentRps}`} unit="req/s" tone="accent" />
        <Kpi
          label="p95 latency"
          value={
            samples.length
              ? samples[samples.length - 1].p95 >= 1000
                ? `${(samples[samples.length - 1].p95 / 1000).toFixed(2)}`
                : `${Math.round(samples[samples.length - 1].p95)}`
              : "—"
          }
          unit={samples.length && samples[samples.length - 1].p95 >= 1000 ? "s" : "ms"}
        />
        <Kpi
          label="Error rate"
          value={(last60sErrorRate * 100).toFixed(2)}
          unit="%"
          tone={
            last60sErrorRate < 0.02
              ? "ok"
              : last60sErrorRate < 0.06
              ? "warn"
              : "danger"
          }
        />
        <Kpi
          label="Total · session"
          value={totalRequests.toLocaleString()}
          unit={`/ ${totalErrors} err`}
        />
      </motion.section>

      <motion.section
        className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4 mb-6"
        variants={fadeUp}
      >
        <div className="hx-surface p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="hx-eyebrow text-accent">Latency</div>
              <div className="text-[13px] text-ink-muted">
                p50 · p95 · p99 over the last 60 seconds
              </div>
            </div>
          </div>
          <LatencyChart samples={samples} />
        </div>
        <div className="hx-surface p-5 flex flex-col items-center justify-center">
          <div className="hx-eyebrow mb-2 text-accent self-start">Error rate</div>
          <ErrorRateGauge rate={last60sErrorRate} />
          <div className="mt-3 text-[11.5px] text-ink-subtle text-center">
            Rolling 60-second error budget across all endpoints.
          </div>
        </div>
      </motion.section>

      <motion.section
        className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4 mb-6"
        variants={fadeUp}
      >
        <div className="hx-surface p-5">
          <div className="mb-3">
            <div className="hx-eyebrow text-accent">Latency distribution</div>
            <div className="text-[13px] text-ink-muted">
              How requests fan out across response-time buckets
            </div>
          </div>
          <HistogramBars buckets={histogram} />
        </div>
        <div className="hx-surface p-5 flex flex-col gap-3">
          <div>
            <div className="hx-eyebrow text-accent">Health</div>
            <div className="text-[13px] text-ink-muted">
              60s window across {last60sRequests.length} reqs
            </div>
          </div>
          <ul className="flex flex-col gap-1 text-[12px] text-ink-muted">
            <HealthRow
              dot="bg-ok"
              label="200 OK"
              value={last60sRequests.filter((r) => r.status === "ok").length}
            />
            <HealthRow
              dot="bg-warn"
              label="4xx Client"
              value={last60sRequests.filter((r) => r.status === "client-error").length}
            />
            <HealthRow
              dot="bg-danger"
              label="5xx Server"
              value={last60sRequests.filter((r) => r.status === "server-error").length}
            />
            <HealthRow
              dot="bg-danger"
              label="Timeout"
              value={last60sRequests.filter((r) => r.status === "timeout").length}
            />
          </ul>
        </div>
      </motion.section>

      <motion.section
        className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4"
        variants={fadeUp}
      >
        <div className="hx-surface flex flex-col h-[520px]">
          <div className="px-5 pt-4 pb-3 border-b border-line/8">
            <div className="hx-eyebrow text-accent">Request explorer</div>
            <div className="text-[13px] text-ink-muted">
              Click any row to drill into its stream timeline
            </div>
          </div>
          <RequestExplorer
            requests={requests}
            selectedId={selectedId}
            onSelect={select}
          />
        </div>
        <div className="h-[520px]">
          {selected ? (
            <RequestDetailPanel request={selected} onClose={() => select(null)} />
          ) : (
            <div className="hx-surface h-full flex items-center justify-center p-6 text-center">
              <div>
                <div className="hx-eyebrow text-ink-dim mb-2">No request selected</div>
                <p className="text-[12.5px] text-ink-subtle max-w-[240px] leading-relaxed">
                  Pick any row in the explorer to see its full SSE event timeline,
                  latency breakdown, and error context.
                </p>
              </div>
            </div>
          )}
        </div>
      </motion.section>
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
      <div className="mt-1.5 flex items-baseline gap-1">
        <span
          className={`text-[26px] font-semibold tabular-nums leading-none ${
            tone ? toneCls[tone] : "text-ink"
          }`}
        >
          {value}
        </span>
        {unit && <span className="text-[11px] text-ink-subtle">{unit}</span>}
      </div>
    </div>
  );
}

function HealthRow({
  dot,
  label,
  value,
}: {
  dot: string;
  label: string;
  value: number;
}) {
  return (
    <li className="flex items-center gap-2 py-1.5 border-b border-line/6 last:border-b-0">
      <span className={`h-2 w-2 rounded-full ${dot}`} />
      <span className="flex-1 text-ink">{label}</span>
      <span className="font-mono tabular-nums text-ink-muted">{value}</span>
    </li>
  );
}
