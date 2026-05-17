interface InferenceExport {
  prompt: string;
  model: string;
  output: string;
  metrics?: {
    tokens?: number;
    ttft?: number | null;
    durationMs?: number;
    tokensPerSec?: number;
  };
  createdAt?: number;
}

export function inferenceToMarkdown(run: InferenceExport): string {
  const ts = run.createdAt
    ? new Date(run.createdAt).toISOString()
    : new Date().toISOString();
  const m = run.metrics ?? {};
  const lines = [
    `# Helix inference`,
    ``,
    `- **Model**: \`${run.model}\``,
    `- **Generated**: ${ts}`,
  ];
  if (m.tokens !== undefined) lines.push(`- **Tokens**: ${m.tokens}`);
  if (m.ttft !== undefined && m.ttft !== null)
    lines.push(`- **TTFT**: ${Math.round(m.ttft)}ms`);
  if (m.durationMs !== undefined)
    lines.push(`- **Duration**: ${(m.durationMs / 1000).toFixed(2)}s`);
  if (m.tokensPerSec !== undefined)
    lines.push(`- **Throughput**: ${m.tokensPerSec.toFixed(1)} t/s`);

  lines.push(``, `## Prompt`, ``, `> ${run.prompt.split("\n").join("\n> ")}`);
  lines.push(``, `## Response`, ``, run.output);
  return lines.join("\n");
}

export function inferenceToJSON(run: InferenceExport): string {
  return JSON.stringify(run, null, 2);
}

interface DiffExport {
  prompt: string;
  outputA: string;
  outputB: string;
  modelA: string;
  modelB: string;
}

export function diffToMarkdown(d: DiffExport): string {
  return [
    `# Helix diff`,
    ``,
    `- **A**: \`${d.modelA}\``,
    `- **B**: \`${d.modelB}\``,
    ``,
    `## Prompt`,
    ``,
    `> ${d.prompt.split("\n").join("\n> ")}`,
    ``,
    `## ${d.modelA}`,
    ``,
    "```",
    d.outputA,
    "```",
    ``,
    `## ${d.modelB}`,
    ``,
    "```",
    d.outputB,
    "```",
  ].join("\n");
}

export function diffToJSON(d: DiffExport): string {
  return JSON.stringify(d, null, 2);
}

export function downloadFile(
  content: string,
  filename: string,
  mime = "text/plain",
): void {
  if (typeof document === "undefined") return;
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function exportTimestamp(): string {
  return new Date()
    .toISOString()
    .replace(/[:T]/g, "-")
    .replace(/\.\d+Z$/, "Z");
}

interface ConversationTurnExport {
  role: "user" | "assistant" | "system";
  content: string;
  createdAt?: number;
  model?: string;
}

interface ConversationExport {
  title: string;
  model?: string;
  createdAt?: number;
  turns: ConversationTurnExport[];
}

const ROLE_BADGE: Record<ConversationTurnExport["role"], string> = {
  user: "👤 User",
  assistant: "🤖 Assistant",
  system: "⚙️ System",
};

export function conversationToMarkdown(c: ConversationExport): string {
  const ts = c.createdAt
    ? new Date(c.createdAt).toISOString()
    : new Date().toISOString();
  const lines = [
    `# ${c.title || "Helix conversation"}`,
    ``,
    `- **Exported**: ${ts}`,
  ];
  if (c.model) lines.push(`- **Model**: \`${c.model}\``);
  lines.push(`- **Turns**: ${c.turns.length}`);
  lines.push(``, `---`, ``);

  for (const turn of c.turns) {
    const badge = ROLE_BADGE[turn.role] ?? turn.role;
    const turnTs = turn.createdAt
      ? ` · ${new Date(turn.createdAt).toLocaleString()}`
      : "";
    lines.push(`## ${badge}${turnTs}`);
    lines.push(``);
    const body = turn.content.trim();
    if (body.includes("\n") && (turn.role === "assistant" || turn.role === "system")) {
      lines.push(body);
    } else {
      lines.push(body || "_(empty)_");
    }
    lines.push(``);
  }

  return lines.join("\n");
}

export function conversationToJSON(c: ConversationExport): string {
  return JSON.stringify(c, null, 2);
}

export function printToPdf(opts?: { regionId?: string; title?: string }): void {
  if (typeof window === "undefined") return;
  const body = document.body;
  const previousTitle = document.title;
  if (opts?.title) document.title = opts.title;

  if (opts?.regionId) {
    const el = document.getElementById(opts.regionId);
    el?.scrollIntoView({ behavior: "auto", block: "start" });
  }

  body.classList.add("printing");
  const cleanup = () => {
    body.classList.remove("printing");
    if (opts?.title) document.title = previousTitle;
    window.removeEventListener("afterprint", cleanup);
  };
  window.addEventListener("afterprint", cleanup);

  setTimeout(() => {
    try {
      window.print();
    } finally {
      setTimeout(cleanup, 500);
    }
  }, 50);
}
