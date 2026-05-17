import type { Model } from "@/types";

export const MODELS: Model[] = [
  {
    id: "helix-m",
    name: "Helix-M",
    family: "helix",
    description:
      "Flagship 24B reasoning model. Long-context, instruction-tuned, and the default for production chat and agent workloads.",
    parameters: "24B",
    contextLength: 32_768,
    modalities: ["text", "multilingual"],
    languages: ["en"],
    badge: "stable",
  },
  {
    id: "helix-1",
    name: "Helix-1",
    family: "helix",
    description:
      "Compact 2B foundation model. Edge-deployable, optimised for low-latency generation and high throughput per dollar.",
    parameters: "2B",
    contextLength: 8_192,
    modalities: ["text"],
    languages: ["en"],
    badge: "stable",
  },
  {
    id: "echo-v2",
    name: "Echo v2",
    family: "echo",
    description:
      "Speech-to-text model with real-time transcription and translation. Tuned for noisy, conversational audio.",
    parameters: "1.5B",
    contextLength: 4_096,
    modalities: ["audio"],
    languages: ["en"],
    badge: "preview",
  },
  {
    id: "lyra-translate",
    name: "Lyra",
    family: "lyra",
    description:
      "Encoder-decoder translation model with formality control and document-level coherence preservation.",
    parameters: "1.1B",
    contextLength: 4_096,
    modalities: ["text"],
    languages: ["en"],
    badge: "new",
  },
];

export function getModel(id: string): Model {
  return MODELS.find((m) => m.id === id) ?? MODELS[0];
}
