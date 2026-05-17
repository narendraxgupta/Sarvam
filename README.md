# Helix

A streaming inference and deployment console built with React, TypeScript and Vite.

Helix has three main surfaces:

- `/playground` — run prompts against a mock model with a real `fetch` + `ReadableStream` + SSE pipeline. Tokens stream in live with TTFT, tokens/sec, and a diagnostics event log.
- `/diff` — token-level diff of two outputs, using a Myers O(ND) implementation written from scratch.
- `/deploy` — model registry, regional fleet map, canary rollout slider, environment tabs and a deployment activity feed.

Plus an observability page, evals page, prompt library and an API explorer.

## Quickstart

Requires Node 20+.

```bash
npm install
npm run dev
```

The dev server runs at `http://localhost:5173`. If the port is busy, Vite picks the next free one.

Other scripts:

```bash
npm run build      # tsc -b && vite build
npm run preview    # serve the production build
npm run test       # vitest
npm run typecheck  # tsc --noEmit
npm run lint       # eslint
```

## Stack

| Layer | Choice |
|---|---|
| Build | Vite 5, TypeScript 5 strict |
| UI | React 18, Tailwind CSS, Radix UI primitives |
| State | Zustand (3 slices: playground, diff, ui) |
| Animation | Framer Motion with `LazyMotion` |
| Routing | React Router v6 with route-level code splitting |
| Testing | Vitest + Testing Library |
| PWA | `vite-plugin-pwa` with `autoUpdate` |

The diff algorithm and the streaming pipeline are deliberately third-party-free — see `src/lib/diff/` and `src/lib/stream/`.

## Keyboard

| Shortcut | Action |
|---|---|
| `Ctrl/⌘ + K` | Command palette |
| `Ctrl/⌘ + Enter` | Run inference |
| `Ctrl/⌘ + .` | Abort stream |
| `Ctrl/⌘ + \` | Toggle sidebar |
| `g p` / `g d` / `g f` | Go to Playground / Diff / Deploy |
| `j` / `k` | Next / previous change in Diff |
| `?` | Open keyboard help |
| `Esc` | Dismiss palette or dialog |

Shortcuts are disabled while typing in inputs unless explicitly marked otherwise.

## Streaming pipeline

Four small modules, each independently testable:

- `lib/stream/mockStream.ts` — returns a real `Response` whose body is a `ReadableStream<Uint8Array>` emitting `data: <token>\n\n` SSE frames. Five failure modes: network-drop, timeout, malformed-chunk, mid-stream-500, slow-token.
- `lib/stream/parseSSE.ts` — incremental SSE parser that handles chunk-boundary splits and silently drops malformed frames.
- `lib/stream/runStream.ts` — owns the phase state machine (`idle → connecting → streaming → done | partial-error | aborted`), TTFT, tokens/sec EMA, and error normalisation. Never throws; every failure is reported via handlers.
- `store/playgroundStore.ts` — Zustand slice that owns history, partial-output preservation and the live `AbortController`.

Partial output is preserved on every failure path — the screen never goes blank mid-stream.

## Diff

`src/lib/diff/` is a Myers O(ND) implementation with:

- `tokenize.ts` — `Intl.Segmenter` (word granularity) with a Unicode-property fallback for non-Latin scripts.
- `myers.ts` — the algorithm itself, with common prefix/suffix stripping.
- `postprocess.ts` — collapses adjacent `del → ins` into single `replace` ops so the UI can render a single highlighted swap instead of red-then-green.

Time complexity: O((N+M)·D), memory: O(N+M). For nearly-identical outputs (small D), effectively linear.

Tests cover non-Latin scripts, empty inputs, full replacement, and round-trip correctness (apply-script-to-A reproduces B).

## Accessibility

- Skip-to-main-content link first in the tab order.
- `aria-live="polite"` on streaming output, coalesced by sentence completion so screen readers aren't flooded.
- Reduced motion honoured via `prefers-reduced-motion` plus an in-app toggle.
- 2px focus rings, semantic landmarks, color is never the sole signal.
- Primary text 13.1:1 contrast, muted text 5.6:1.

## Project layout

```
src/
  app/                   router, providers, error boundary
  components/
    ui/                  Button, Dialog, Tooltip, Switch, Slider, Tabs, Popover, DropdownMenu
    layout/              AppShell, Sidebar, Topbar, CommandPalette
    playground/          InputDock, AudioRecorder, StreamView, MetricsRail, DiagnosticsPanel
    diff/                DiffControls, DiffPane, DiffMinimap, DiffEditor, DiffLegend
    deploy/              ModelRegistry, FleetMap, RolloutControls, DeploymentFeed
    observability/       RequestExplorer, LatencyChart, HistogramBars, ErrorRateGauge
    library/             PromptGrid, PromptEditor, ConversationView, VersionTimeline
    api/                 EndpointDoc, ResponseViewer, CodeSnippets
    shared/              Logo, Kbd, AuthorCredit, ThemeToggle, LangBadge
  lib/
    diff/                tokenize, myers, postprocess
    stream/              mockStream, parseSSE, runStream, wsStream
    a11y/                useReducedMotion, useAnnouncer
    keyboard/            useShortcut, useLeaderSequence, platform
  store/                 playgroundStore, diffStore, observabilityStore, evalsStore, libraryStore, uiStore, themeStore
  data/                  models, regions, samplePrompts, corpora, endpoints, changelog
  styles/                globals.css, print.css
  types/                 shared TS types
```

## Deployment

`vercel.json` is checked in and configured for a Vite SPA:

```bash
npm install -g vercel
vercel --prod
```

Or import the repo at [vercel.com/new](https://vercel.com/new) — Vite is auto-detected.

No environment variables are required. There is no backend.

## Author

[Narendra Gupta](https://narendraxportfolio.vercel.app) — Software Developer, B.Tech CSE, MNNIT Allahabad (2022–2026).

| | |
|---|---|
| Email | [narendraxwork@gmail.com](mailto:narendraxwork@gmail.com) |
| LinkedIn | [in/narendraxgupta](https://www.linkedin.com/in/narendraxgupta/) |
| GitHub | [@narendraxgupta](https://github.com/narendraxgupta) |
| Portfolio | [narendraxportfolio.vercel.app](https://narendraxportfolio.vercel.app) |

## License

MIT — see [LICENSE](LICENSE).
