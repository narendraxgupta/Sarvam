import type { SavedPrompt } from "@/types/library";

const NOW = (() => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
})();

export const SEED_LIBRARY: SavedPrompt[] = [
  {
    id: "seed-summariser",
    title: "Article TL;DR",
    body:
      "You are a precise summariser. Read the article below and produce: " +
      "(1) a one-sentence headline, (2) three crisp bullet points, " +
      "(3) one quote that captures the angle. Keep it under 80 words total.\n\n" +
      "Article:\n<paste the article here>",
    tags: ["summary", "writing"],
    model: "helix-m",
    createdAt: NOW - 86_400_000 * 6,
    updatedAt: NOW - 86_400_000 * 6,
    pinned: true,
    versions: [
      {
        id: "seed-summariser-v1",
        body:
          "You are a precise summariser. Read the article below and produce: " +
          "(1) a one-sentence headline, (2) three crisp bullet points, " +
          "(3) one quote that captures the angle. Keep it under 80 words total.\n\n" +
          "Article:\n<paste the article here>",
        message: "initial draft",
        createdAt: NOW - 86_400_000 * 6,
      },
    ],
  },
  {
    id: "seed-codereview",
    title: "Senior code reviewer",
    body:
      "Act as a senior engineer reviewing the diff below. " +
      "Call out: correctness issues, edge cases the author missed, naming, and one improvement " +
      "you'd love to see in a follow-up. Be direct but kind. Quote exact lines you reference.\n\nDiff:\n```\n<paste diff>\n```",
    tags: ["code", "review"],
    model: "helix-m",
    createdAt: NOW - 86_400_000 * 3,
    updatedAt: NOW - 86_400_000 * 1,
    versions: [
      {
        id: "seed-codereview-v1",
        body: "Review this code:\n```\n<paste>\n```",
        message: "initial",
        createdAt: NOW - 86_400_000 * 3,
      },
      {
        id: "seed-codereview-v2",
        body:
          "Act as a senior engineer reviewing the diff below. " +
          "Call out: correctness issues, edge cases the author missed, naming, and one improvement " +
          "you'd love to see in a follow-up. Be direct but kind. Quote exact lines you reference.\n\nDiff:\n```\n<paste diff>\n```",
        message: "tightened framing + format",
        createdAt: NOW - 86_400_000 * 1,
      },
    ],
  },
  {
    id: "seed-onboarding-email",
    title: "Welcome email · SaaS",
    body:
      "Write a 5-line welcome email for a new user of <product>. Warm, no fluff. " +
      "End with a single call to action linking to the quickstart.",
    tags: ["writing", "email"],
    model: "helix-1",
    createdAt: NOW - 86_400_000 * 12,
    updatedAt: NOW - 86_400_000 * 12,
    versions: [
      {
        id: "seed-onboarding-email-v1",
        body:
          "Write a 5-line welcome email for a new user of <product>. Warm, no fluff. " +
          "End with a single call to action linking to the quickstart.",
        createdAt: NOW - 86_400_000 * 12,
      },
    ],
  },
  {
    id: "seed-sql-translator",
    title: "Natural language → SQL",
    body:
      "Translate the request below into a single PostgreSQL query. " +
      "Schema:\n  users(id, email, created_at)\n  orders(id, user_id, amount, paid_at)\n\n" +
      "Output only the SQL, no commentary.\n\nRequest:\n<your question here>",
    tags: ["sql", "data"],
    model: "helix-m",
    createdAt: NOW - 86_400_000 * 1,
    updatedAt: NOW - 86_400_000 * 1,
    pinned: true,
    versions: [
      {
        id: "seed-sql-translator-v1",
        body:
          "Translate the request below into a single PostgreSQL query. " +
          "Schema:\n  users(id, email, created_at)\n  orders(id, user_id, amount, paid_at)\n\n" +
          "Output only the SQL, no commentary.\n\nRequest:\n<your question here>",
        createdAt: NOW - 86_400_000 * 1,
      },
    ],
  },
  {
    id: "seed-tech-spec",
    title: "Tech spec scaffold",
    body:
      "Draft a one-page tech spec for the feature described below. Sections: " +
      "Problem · Approach · Trade-offs · Rollout · Open questions. " +
      "Use short paragraphs and bullet points. Be opinionated.\n\nFeature:\n<describe the feature>",
    tags: ["writing", "engineering"],
    model: "helix-m",
    createdAt: NOW - 86_400_000 * 8,
    updatedAt: NOW - 86_400_000 * 8,
    versions: [
      {
        id: "seed-tech-spec-v1",
        body:
          "Draft a one-page tech spec for the feature described below. Sections: " +
          "Problem · Approach · Trade-offs · Rollout · Open questions. " +
          "Use short paragraphs and bullet points. Be opinionated.\n\nFeature:\n<describe the feature>",
        createdAt: NOW - 86_400_000 * 8,
      },
    ],
  },
  {
    id: "seed-rubber-duck",
    title: "Rubber duck debugger",
    body:
      "I'm going to describe a bug. Ask me one question at a time to narrow it down. " +
      "Don't propose a fix until you're confident. Keep questions short.",
    tags: ["debug", "code"],
    model: "helix-1",
    createdAt: NOW - 86_400_000 * 2,
    updatedAt: NOW - 86_400_000 * 2,
    versions: [
      {
        id: "seed-rubber-duck-v1",
        body:
          "I'm going to describe a bug. Ask me one question at a time to narrow it down. " +
          "Don't propose a fix until you're confident. Keep questions short.",
        createdAt: NOW - 86_400_000 * 2,
      },
    ],
  },
];
