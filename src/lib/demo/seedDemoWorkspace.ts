import { useLibraryStore } from "@/store/libraryStore";
import { usePlaygroundStore } from "@/store/playgroundStore";
import { useDiffStore } from "@/store/diffStore";
import { useEvalsStore } from "@/store/evalsStore";
import { useObservabilityStore } from "@/store/observabilityStore";
import { toast } from "@/lib/toast";

const DEMO_PROMPTS = [
  {
    title: "Onboarding email · weekly digest",
    body:
      "Write a friendly 4-paragraph weekly digest email summarising the highlights below. " +
      "Tone: warm but specific. Include a call to action at the end.\n\nHighlights:\n- <stat 1>\n- <stat 2>\n- <stat 3>",
    tags: ["writing", "email", "demo"],
  },
  {
    title: "Architecture critique",
    body:
      "Critique the architecture description below as a senior engineer. " +
      "Focus on failure modes, blast radius, and operational ergonomics. End with the single change you would prioritise.\n\nArchitecture:\n<paste here>",
    tags: ["engineering", "review", "demo"],
  },
  {
    title: "RAG pipeline outline",
    body:
      "Outline a RAG pipeline for a customer support knowledge base. " +
      "List the stages, the data each stage produces, and the failure mode you'd guard against.",
    tags: ["rag", "architecture", "demo"],
  },
];

const DEMO_DIFF = {
  prompt: "Explain HTTP/2 server-push for an audience of senior engineers.",
  outputA:
    "HTTP/2 server push lets the server speculatively send subresources before the client requests them, " +
    "reducing round trips. In practice browsers have moved away from it because cache invalidation and ownership " +
    "are tricky; most setups prefer Link rel=preload over server push today.",
  outputB:
    "HTTP/2 server push allows the server to proactively send subresources before the client asks for them, " +
    "which can cut round-trips. Modern browsers have effectively retired it: cache logic is hard, the client " +
    "may already have the asset, and rel=preload covers most real-world wins with less coordination cost.",
};

export function seedDemoWorkspace() {
  const pg = usePlaygroundStore.getState();
  pg.setPrompt(
    "Summarise the trade-offs of HTTP/2 multiplexing for retrieval-augmented generation in two short paragraphs.",
  );
  pg.setModel("helix-m");
  pg.setTemperature(0.45);
  pg.setMaxTokens(1024);

  const diff = useDiffStore.getState();
  diff.setPrompt(DEMO_DIFF.prompt);
  diff.setOutputA(DEMO_DIFF.outputA);
  diff.setOutputB(DEMO_DIFF.outputB);
  diff.setModelA("helix-m");
  diff.setModelB("helix-1");

  const lib = useLibraryStore.getState();
  for (const p of DEMO_PROMPTS) {
    lib.createPrompt({ title: p.title, body: p.body, tags: p.tags, model: "helix-m" });
  }

  const ev = useEvalsStore.getState();
  ev.setSelectedSuite("code");
  ev.setModels(["helix-m", "helix-1"]);

  useObservabilityStore.getState().reset();

  toast.success(
    "Demo workspace loaded",
    "Playground, Diff, Library, Evals and Observability are seeded.",
  );
}
