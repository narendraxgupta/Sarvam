# 3-Minute Demo Walkthrough — Helix

> Target length: **3:00**. The pacing below assumes a relaxed delivery with no edits — leave 10 seconds of buffer for natural pauses.

---

## 0:00 – 0:20 · Cold open & identity (20s)

- Open the deployed Vercel URL. Cursor on `/playground`, the gradient hero empty state visible.
- **VO:** "This is Helix — an AI-native inference and deployment console. Everything you see is React, TypeScript, Tailwind, and Framer Motion, with a hand-rolled Myers diff and a real Fetch + ReadableStream pipeline. Let me show you."
- Hover the topbar; let the gradient nav indicator slide as you click between routes.

## 0:20 – 0:50 · Playground · text mode (30s)

- Press `Ctrl+K` (`⌘K` on macOS). Run the **"Generate a streaming React hook"** sample.
- Watch tokens stream in. Point out:
  - "Tokens render the moment they arrive — no waiting for completion."
  - The Live Metrics rail on the right.
  - The phase pill in the stream header transitioning Connecting → Streaming → Done.
  - The diagnostics panel showing `connect → first-byte → chunk → close` like a deploy log.
- **VO:** "TTFT lands around 180 milliseconds. Tokens-per-second is computed as an EMA — no jitter."

## 0:50 – 1:10 · Audio mode (20s)

- Toggle to **Audio**. Show the animated tab morph.
- Press Record briefly. Show the live waveform reacting to your voice.
- Stop. Click **Transcribe with Echo**.
- **VO:** "Live ASR-style transcription. In production this would call the Echo model; here it returns a curated English snippet."
- The transcript appears as a new prompt; auto-switches back to text mode.

## 1:10 – 1:40 · Failure modes & resilience (30s)

- From the **Fault** dropdown, select **Mid-stream 500**.
- Press `Ctrl+Enter` to re-run.
- Watch tokens stream for a few seconds, then the stream errors.
- **VO:** "The screen never goes blank. The partial output is preserved exactly as it arrived. The banner offers retry. The diagnostics panel shows the failure with a relative timestamp."
- Click the banner's **Retry from the same prompt**. Stream completes cleanly.
- **VO:** "This is the headline error-handling guarantee — no resets, no losses."

## 1:40 – 2:20 · Diff view (40s)

- Press `g d`.
- **VO:** "Side-by-side comparison of two model outputs on the same prompt. The diff is computed by my from-scratch Myers algorithm — note the toolbar shows the edit distance, the computation time, and the token counts."
- Press `j` a few times to step through changes — the focused change rings in azure and the minimap tick animates.
- Hover a `rep` token: tooltip says "Replaced".
- Toggle **Only changes**. Highlight clusters compress; context collapses to ellipses.
- **VO:** "Myers minimises the edit script — exactly what reviewers want when comparing model regressions. I rejected LCS because of its quadratic memory, and line-diff because it discards the very signal we care about: one adjective changing inside a sentence."
- Click **Swap A ↔ B**. Whole pane mirrors and recomputes.

## 2:20 – 2:45 · Deploy console (25s)

- Press `g f`.
- **VO:** "The third pillar — deployment. Global fleet topology — six regions across North America, Europe, South America, and Asia-Pacific, peered to the primary, with latency-aware coloring."
- Select **Helix-M** in the registry.
- Drag the canary slider to 25%. Click **Deploy**. A new entry appears in the activity feed instantly and transitions Queued → Building → Rolling-out → Healthy.
- **VO:** "Optimistic UI — actions reflect immediately, reconcile on success. Rollback opens a confirm dialog so we never accidentally yank traffic."

## 2:45 – 3:00 · Accessibility & close (15s)

- Press `Tab` from the address bar; the **Skip to main content** link appears.
- Toggle **Reduce motion** in the sidebar footer. The route indicator stops sliding.
- Press `Ctrl+K`; navigate via arrow keys only.
- **VO:** "Full keyboard navigation, aria-live regions on the stream and metrics, reduced-motion honored two ways. Everything I demoed is in the repo and the deployed link below. Thank you."

---

## Recording tips

- 1440 × 900 viewport at 100 % zoom — keeps text crisp on YouTube.
- Hide bookmarks bar, OS clock, and any personal notifications.
- Use the system text-cursor (no third-party highlighter) so reviewers focus on the app.
- Record at 60 fps if your tool supports it — the Framer Motion microinteractions read much better at 60 than 30.
- Light keyboard sounds at low volume are fine; loud mechanical clicks distract.
