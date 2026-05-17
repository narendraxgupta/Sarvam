export type HttpMethod = "GET" | "POST" | "DELETE";
export type ParamLoc = "header" | "body" | "query";

export interface EndpointParam {
  name: string;
  loc: ParamLoc;
  type: "string" | "number" | "boolean" | "enum" | "json";
  description: string;
  required?: boolean;
  defaultValue?: string | number | boolean;
  options?: string[];
}

export interface EndpointDoc {
  id: string;
  method: HttpMethod;
  path: string;
  group: "Inference" | "Models" | "Workspace";
  title: string;
  tagline: string;
  description: string;
  streaming?: boolean;
  params: EndpointParam[];
  exampleResponse?: unknown;
  exampleEvents?: { t: number; event: string; data: string }[];
}

export const ENDPOINTS: EndpointDoc[] = [
  {
    id: "inference",
    method: "POST",
    path: "/v1/inference",
    group: "Inference",
    title: "Run inference",
    tagline: "Stream a completion from any Helix model in real-time.",
    description:
      "Server-sent events delivered over HTTP/2. The connection stays open " +
      "until the model emits `[DONE]` or the client aborts. Each token arrives as a " +
      "separate `data:` frame so partial output can be rendered instantly.",
    streaming: true,
    params: [
      {
        name: "Authorization",
        loc: "header",
        type: "string",
        description: "Bearer token. `Bearer hx_live_…`",
        required: true,
        defaultValue: "Bearer hx_live_REDACTED",
      },
      {
        name: "Content-Type",
        loc: "header",
        type: "string",
        description: "Always `application/json`",
        required: true,
        defaultValue: "application/json",
      },
      {
        name: "model",
        loc: "body",
        type: "enum",
        description: "Model id. See GET /v1/models for the live list.",
        required: true,
        defaultValue: "helix-m",
        options: ["helix-m", "helix-1", "echo-v2", "lyra-translate"],
      },
      {
        name: "prompt",
        loc: "body",
        type: "string",
        description: "User-visible prompt body. Markdown supported.",
        required: true,
        defaultValue: "Explain HTTP/2 multiplexing in two sentences.",
      },
      {
        name: "temperature",
        loc: "body",
        type: "number",
        description: "0.0 (deterministic) → 1.0 (creative). Default 0.4.",
        defaultValue: 0.4,
      },
      {
        name: "max_tokens",
        loc: "body",
        type: "number",
        description: "Hard cap on generated tokens.",
        defaultValue: 256,
      },
      {
        name: "stream",
        loc: "body",
        type: "boolean",
        description: "When true (default), responses arrive as SSE events.",
        defaultValue: true,
      },
    ],
    exampleEvents: [
      { t: 0, event: "open", data: "connection accepted" },
      { t: 78, event: "token", data: '{"text":"HTTP","index":0}' },
      { t: 92, event: "token", data: '{"text":"/2","index":1}' },
      { t: 108, event: "token", data: '{"text":" multiplexes","index":2}' },
      { t: 124, event: "token", data: '{"text":" requests","index":3}' },
      { t: 1480, event: "metric", data: '{"ttft_ms":78,"tps":63}' },
      { t: 1620, event: "done", data: "[DONE]" },
    ],
  },
  {
    id: "chat",
    method: "POST",
    path: "/v1/chat",
    group: "Inference",
    title: "Chat completions",
    tagline: "Multi-turn conversational completions with message history.",
    description:
      "Compatible-ish shape with OpenAI's chat completions, but with `model` ids " +
      "scoped to the Helix family. Stream is the same SSE protocol as `/v1/inference`.",
    streaming: true,
    params: [
      {
        name: "Authorization",
        loc: "header",
        type: "string",
        description: "Bearer token",
        required: true,
        defaultValue: "Bearer hx_live_REDACTED",
      },
      {
        name: "model",
        loc: "body",
        type: "enum",
        description: "Model id",
        required: true,
        defaultValue: "helix-m",
        options: ["helix-m", "helix-1"],
      },
      {
        name: "messages",
        loc: "body",
        type: "json",
        description: "Array of role/content objects.",
        required: true,
        defaultValue: JSON.stringify(
          [
            { role: "system", content: "You are a precise summariser." },
            { role: "user", content: "Summarise SSE in one paragraph." },
          ],
          null,
          2,
        ),
      },
      {
        name: "temperature",
        loc: "body",
        type: "number",
        description: "0.0 → 1.0",
        defaultValue: 0.4,
      },
      {
        name: "stream",
        loc: "body",
        type: "boolean",
        description: "SSE on/off",
        defaultValue: true,
      },
    ],
    exampleResponse: {
      id: "chatcmpl_2c0xR",
      model: "helix-m",
      choices: [
        {
          index: 0,
          message: {
            role: "assistant",
            content:
              "Server-Sent Events is a one-way streaming protocol over plain HTTP …",
          },
          finish_reason: "stop",
        },
      ],
      usage: { prompt_tokens: 18, completion_tokens: 132, total_tokens: 150 },
    },
  },
  {
    id: "embeddings",
    method: "POST",
    path: "/v1/embeddings",
    group: "Inference",
    title: "Generate embeddings",
    tagline: "Compute dense vector representations for one or many inputs.",
    description:
      "Non-streaming; the response is a single JSON document. Use it to index " +
      "knowledge bases or power semantic search.",
    params: [
      {
        name: "Authorization",
        loc: "header",
        type: "string",
        description: "Bearer token",
        required: true,
        defaultValue: "Bearer hx_live_REDACTED",
      },
      {
        name: "model",
        loc: "body",
        type: "enum",
        description: "Embedding model",
        required: true,
        defaultValue: "helix-embed-3",
        options: ["helix-embed-3", "helix-embed-3-lite"],
      },
      {
        name: "input",
        loc: "body",
        type: "json",
        description: "String or array of strings to embed.",
        required: true,
        defaultValue: JSON.stringify(
          ["latency budget", "rollout strategy"],
          null,
          2,
        ),
      },
    ],
    exampleResponse: {
      model: "helix-embed-3",
      data: [
        { object: "embedding", index: 0, embedding: [0.0123, -0.041, "...", 0.084] },
        { object: "embedding", index: 1, embedding: [-0.007, 0.052, "...", -0.018] },
      ],
      usage: { prompt_tokens: 8, total_tokens: 8 },
    },
  },
  {
    id: "models-list",
    method: "GET",
    path: "/v1/models",
    group: "Models",
    title: "List models",
    tagline: "Enumerate every model your workspace can call.",
    description:
      "Returns metadata for each model (parameters, modalities, languages, " +
      "current health). Cache server-side for at least 60 seconds.",
    params: [
      {
        name: "Authorization",
        loc: "header",
        type: "string",
        description: "Bearer token",
        required: true,
        defaultValue: "Bearer hx_live_REDACTED",
      },
      {
        name: "family",
        loc: "query",
        type: "string",
        description: "Filter by model family (e.g. `helix`)",
      },
    ],
    exampleResponse: {
      object: "list",
      data: [
        {
          id: "helix-m",
          object: "model",
          parameters: "24B",
          modalities: ["text", "multilingual"],
          health: "healthy",
        },
        {
          id: "helix-1",
          object: "model",
          parameters: "2B",
          modalities: ["text"],
          health: "healthy",
        },
        {
          id: "echo-v2",
          object: "model",
          parameters: "1.5B",
          modalities: ["audio"],
          health: "healthy",
        },
      ],
    },
  },
  {
    id: "deployments-create",
    method: "POST",
    path: "/v1/deployments",
    group: "Workspace",
    title: "Create deployment",
    tagline: "Roll out a model version to one or more regions with canary control.",
    description:
      "Idempotent on `version`. Use the returned deployment id with " +
      "`GET /v1/deployments/{id}` to poll rollout progress, or open the Deploy console " +
      "for a fleet-wide overview.",
    params: [
      {
        name: "Authorization",
        loc: "header",
        type: "string",
        description: "Bearer token",
        required: true,
        defaultValue: "Bearer hx_live_REDACTED",
      },
      {
        name: "model",
        loc: "body",
        type: "string",
        description: "Model id",
        required: true,
        defaultValue: "helix-m",
      },
      {
        name: "version",
        loc: "body",
        type: "string",
        description: "Build version (semver or sha)",
        required: true,
        defaultValue: "2.4.1",
      },
      {
        name: "env",
        loc: "body",
        type: "enum",
        description: "Target environment",
        required: true,
        defaultValue: "staging",
        options: ["dev", "staging", "prod"],
      },
      {
        name: "canary_pct",
        loc: "body",
        type: "number",
        description: "0-100. Percentage of traffic served by the new build initially.",
        defaultValue: 10,
      },
    ],
    exampleResponse: {
      id: "dep_2x9aFq",
      model: "helix-m",
      version: "2.4.1",
      env: "staging",
      status: "rolling-out",
      canary_pct: 10,
      created_at: "2026-05-17T08:21:43Z",
    },
  },
];

export function getEndpoint(id: string): EndpointDoc | undefined {
  return ENDPOINTS.find((e) => e.id === id);
}
