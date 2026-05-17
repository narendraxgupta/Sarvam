export interface ChangelogEntry {
  version: string;
  date: string;
  tag: "release" | "improvement" | "fix";
  title: string;
  highlights: string[];
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: "0.6.0",
    date: "2026-05-17",
    tag: "release",
    title: "Phase 5 — The everything release",
    highlights: [
      "Brand-new Observability, Eval Harness, Library, and API Explorer surfaces — all keyboard-navigable, all instrumented.",
      "Premium polish kit: global toast system, keyboard shortcut overlay (press `?`), command palette with recents and quick actions.",
      "Share-via-URL for Playground and Diff, plus Markdown/JSON exports for every output.",
      "Conversation mode — turn any saved prompt into a multi-turn chat with one click.",
    ],
  },
  {
    version: "0.5.2",
    date: "2026-05-15",
    tag: "improvement",
    title: "Editorial Deploy console",
    highlights: [
      "Reimagined Deploy page with a large fleet map, animated KPI tiles, and a calmer rollout controls panel.",
      "Region tooltips relocated below the map so they never hide what they're describing.",
      "Live deployment feed now animates in with framer-motion staggers.",
    ],
  },
  {
    version: "0.5.0",
    date: "2026-05-12",
    tag: "release",
    title: "Light-blue gradient theme",
    highlights: [
      "Refreshed accent palette and surface elevations across light + dark modes.",
      "Welcome page rebuilt with editorial typography and an interactive Rubik's cube hero.",
      "Playground hero is now uniquely staged — no more generic cards.",
    ],
  },
  {
    version: "0.4.1",
    date: "2026-05-09",
    tag: "fix",
    title: "Token diff stability",
    highlights: [
      "Resolved drift between the change navigator and the actual diff op pointer when filters were active.",
      "Diff Myers post-processor now coalesces zero-width replace ops.",
    ],
  },
  {
    version: "0.4.0",
    date: "2026-05-04",
    tag: "release",
    title: "Streaming refresh",
    highlights: [
      "Token-by-token streaming with backpressure-aware rendering.",
      "Fault injection menu in the Playground for connect timeouts, mid-stream 500s, slow tokens, and more.",
      "Diagnostic panel now records every SSE event with relative offsets.",
    ],
  },
];
