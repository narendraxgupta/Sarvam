export interface VitalMetric {
  id: string;
  name: "CLS" | "FCP" | "INP" | "LCP" | "TTFB";
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  delta: number;
}

type Reporter = (metric: VitalMetric) => void;

const subscribers = new Set<Reporter>();

export function onWebVital(reporter: Reporter): () => void {
  subscribers.add(reporter);
  return () => subscribers.delete(reporter);
}

function emit(metric: VitalMetric) {
  for (const sub of subscribers) {
    try {
      sub(metric);
    } catch {
    }
  }
}

const defaultLogger: Reporter = (m) => {
  const tag =
    m.rating === "good" ? "✓" : m.rating === "needs-improvement" ? "~" : "!";
  console.info(
    `[web-vitals] ${tag} ${m.name} = ${m.value.toFixed(1)} (${m.rating})`,
  );
};

let started = false;
let starting: Promise<void> | null = null;

export async function reportWebVitals(opts?: { log?: boolean }): Promise<void> {
  if (started) return;
  if (typeof window === "undefined") return;

  if (starting) return starting;

  starting = (async () => {
    if (opts?.log ?? import.meta.env.DEV) {
      subscribers.add(defaultLogger);
    }
    try {
      const wv = await import("web-vitals");
      const wrap = (metric: {
        id: string;
        name: string;
        value: number;
        rating: string;
        delta: number;
      }) => {
        emit({
          id: metric.id,
          name: metric.name as VitalMetric["name"],
          value: metric.value,
          rating: metric.rating as VitalMetric["rating"],
          delta: metric.delta,
        });
      };
      wv.onCLS(wrap);
      wv.onFCP(wrap);
      wv.onINP(wrap);
      wv.onLCP(wrap);
      wv.onTTFB(wrap);
      started = true;
    } catch {
    } finally {
      starting = null;
    }
  })();
  return starting;
}
