import { useEffect, useState } from "react";
import { Activity, Gauge } from "lucide-react";
import { usePlaygroundStore } from "@/store/playgroundStore";
import { cn, formatMs } from "@/lib/utils";

export function MetricsRail() {
  const metrics = usePlaygroundStore((s) => s.metrics);
  const phase = usePlaygroundStore((s) => s.phase);
  const isLive = phase === "streaming" || phase === "connecting";

  const [samples, setSamples] = useState<number[]>([]);
  useEffect(() => {
    if (!isLive && metrics.tokens === 0) {
      setSamples((prev) => (prev.length === 0 ? prev : []));
      return;
    }
    setSamples((prev) => [...prev.slice(-39), metrics.tokensPerSec]);
  }, [metrics.tokensPerSec, metrics.tokens, isLive]);

  const peak = Math.max(40, ...samples);

  const healthColor =
    metrics.health === "healthy"
      ? "ok"
      : metrics.health === "degraded"
      ? "warn"
      : "danger";

  return (
    <aside
      aria-label="Streaming metrics"
      className="flex flex-col gap-3"
    >

      <div className="hx-surface px-5 pt-4 pb-5">
        <div className="flex items-center justify-between">
          <div className="hx-eyebrow flex items-center gap-1.5">
            <Gauge className="h-3 w-3" />
            <span>Throughput</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                "relative inline-flex h-1.5 w-1.5 rounded-full",
                isLive ? "bg-ok" : "bg-ink-dim",
              )}
            >
              {isLive && (
                <span className="absolute inset-0 rounded-full bg-ok animate-ping opacity-60" />
              )}
            </span>
            <span className="hx-eyebrow">
              {phase === "idle" ? "ready" : phase}
            </span>
          </div>
        </div>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="hx-numeral text-ink">
            {metrics.tokensPerSec.toFixed(1)}
          </span>
          <span className="hx-eyebrow">t/s</span>
        </div>

        <Sparkline samples={samples} peak={peak} active={isLive} />

        <div className="mt-2 flex items-center justify-between hx-mono-tab text-2xs text-ink-dim">
          <span>peak {Math.round(peak)} t/s</span>
          <span>target ≥ 40 t/s</span>
        </div>
      </div>

      <div className="hx-hairline-card divide-y divide-line">
        <StatRow
          label="Tokens"
          value={metrics.tokens.toLocaleString()}
          live={isLive}
        />
        <StatRow
          label="Time to first byte"
          value={metrics.ttft === null ? "—" : formatMs(metrics.ttft)}
          accent={metrics.ttft !== null && metrics.ttft < 250 ? "ok" : undefined}
        />
        <StatRow
          label="Duration"
          value={formatMs(metrics.durationMs)}
          live={isLive}
        />
        <StatRow
          label="Bytes received"
          value={metrics.bytesIn.toLocaleString()}
          unit="B"
        />
        <StatRow
          label="Retries"
          value={String(metrics.retries)}
          accent={metrics.retries > 0 ? "warn" : undefined}
        />
      </div>

      <div
        className={cn(
          "hx-surface px-3.5 py-3 flex items-center gap-3 relative overflow-hidden",
        )}
      >
        <div
          className={cn(
            "grid h-7 w-7 place-items-center rounded shrink-0 border",
            healthColor === "ok" &&
              "border-ok/30 bg-ok/10 text-ok",
            healthColor === "warn" &&
              "border-warn/30 bg-warn/10 text-warn",
            healthColor === "danger" &&
              "border-danger/30 bg-danger/10 text-danger",
          )}
          aria-hidden
        >
          <Activity className="h-3.5 w-3.5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="hx-eyebrow">Stream health</div>
          <div className="font-display text-[15px] text-ink font-semibold capitalize tracking-tightish">
            {metrics.health}
          </div>
        </div>
        <span
          className={cn(
            "hx-eyebrow",
            healthColor === "ok" ? "text-ok" : "text-ink-subtle",
          )}
        >
          {metrics.health === "healthy" ? "OK" : "WATCH"}
        </span>
      </div>
    </aside>
  );
}

function StatRow({
  label,
  value,
  unit,
  live,
  accent,
}: {
  label: string;
  value: string;
  unit?: string;
  live?: boolean;
  accent?: "ok" | "warn";
}) {
  return (
    <div className="flex items-baseline justify-between px-4 py-3">
      <span className="hx-eyebrow">{label}</span>
      <span
        className={cn(
          "hx-mono-tab text-[14px]",
          accent === "ok" && "text-ok",
          accent === "warn" && "text-warn",
          !accent && (live ? "text-ink" : "text-ink-muted"),
        )}
      >
        {value}
        {unit ? (
          <span className="ml-1.5 text-[10px] text-ink-dim uppercase tracking-[0.12em]">
            {unit}
          </span>
        ) : null}
      </span>
    </div>
  );
}

function Sparkline({
  samples,
  peak,
  active,
}: {
  samples: number[];
  peak: number;
  active: boolean;
}) {
  const W = 240;
  const H = 36;
  const pad = 1;

  if (samples.length < 2) {
    return (
      <div className="mt-3 h-9 relative rounded-md border border-line/60 stripes overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center text-2xs uppercase tracking-[0.18em] text-ink-dim">
          awaiting stream
        </div>
      </div>
    );
  }

  const stepX = (W - pad * 2) / Math.max(1, samples.length - 1);
  const points = samples.map((v, i) => {
    const x = pad + i * stepX;
    const y = pad + (1 - v / peak) * (H - pad * 2);
    return [x, y] as const;
  });

  const line = points
    .map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`)
    .join(" ");

  return (
    <svg
      className="mt-3 w-full"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      aria-hidden
      style={{ color: "rgb(var(--accent))" }}
    >
      <path
        d={line}
        fill="none"
        stroke={active ? "currentColor" : "rgb(var(--ink-subtle))"}
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {active && points.length > 0 && (
        <circle
          cx={points[points.length - 1][0]}
          cy={points[points.length - 1][1]}
          r={2.2}
          fill="currentColor"
        />
      )}
    </svg>
  );
}
