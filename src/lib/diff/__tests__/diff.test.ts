import { describe, expect, it } from "vitest";
import { computeDiff } from "@/lib/diff";
import { myersDiff } from "@/lib/diff/myers";
import { tokenize, tokenKey } from "@/lib/diff/tokenize";
import type { Token } from "@/types";

function applyOps(
  a: Token[],
  b: Token[],
  ops: ReturnType<typeof myersDiff<Token>>["ops"],
): Token[] {
  const out: Token[] = [];
  for (const o of ops) {
    if (o.op === "eq") {
      for (let i = 0; i < o.len; i++) out.push(a[o.a + i]);
    } else if (o.op === "ins") {
      for (let i = 0; i < o.len; i++) out.push(b[o.b + i]);
    }
  }
  return out;
}

describe("tokenize", () => {
  it("splits English into words / whitespace / punct", () => {
    const t = tokenize("Hello, world!");
    expect(t.map((x) => x.text)).toEqual(["Hello", ",", " ", "world", "!"]);
    expect(t.map((x) => x.kind)).toEqual([
      "word",
      "punct",
      "whitespace",
      "word",
      "punct",
    ]);
  });

  it("handles non-Latin scripts correctly (Greek)", () => {
    const t = tokenize("καλημέρα κόσμε");
    const words = t.filter((x) => x.kind === "word").map((x) => x.text);
    expect(words).toEqual(["καλημέρα", "κόσμε"]);
  });

  it("handles Cyrillic with diacritics", () => {
    const t = tokenize("привет мир");
    const words = t.filter((x) => x.kind === "word").map((x) => x.text);
    expect(words).toEqual(["привет", "мир"]);
  });

  it("preserves original positions", () => {
    const src = "ab  cd";
    const t = tokenize(src);
    for (const tok of t) {
      expect(src.slice(tok.start, tok.end)).toBe(tok.text);
    }
  });
});

describe("tokenKey (equality)", () => {
  it("makes casing differences surface as inequality", () => {
    const [a] = tokenize("Hello");
    const [b] = tokenize("hello");
    // Same NFC-lowercased word.
    expect(tokenKey(a)).toBe(tokenKey(b));
  });

  it("NFC-normalizes combining marks", () => {
    const composed = "é"; // U+00E9
    const decomposed = "e\u0301"; // e + combining acute
    const [a] = tokenize(composed);
    const [b] = tokenize(decomposed);
    expect(tokenKey(a)).toBe(tokenKey(b));
  });
});

describe("myersDiff", () => {
  it("returns d=0 for identical inputs", () => {
    const a = tokenize("the quick brown fox");
    const b = tokenize("the quick brown fox");
    const r = myersDiff(a, b, tokenKey);
    expect(r.d).toBe(0);
    expect(r.ops.every((o) => o.op === "eq")).toBe(true);
  });

  it("returns only ins for prepend", () => {
    const a = tokenize("brown fox");
    const b = tokenize("the quick brown fox");
    const r = myersDiff(a, b, tokenKey);
    expect(r.ops.some((o) => o.op === "ins")).toBe(true);
    expect(r.ops.some((o) => o.op === "del")).toBe(false);
  });

  it("returns only del for shrink", () => {
    const a = tokenize("the quick brown fox jumps");
    const b = tokenize("the quick fox");
    const r = myersDiff(a, b, tokenKey);
    expect(r.ops.some((o) => o.op === "del")).toBe(true);
    expect(r.ops.some((o) => o.op === "ins")).toBe(false);
  });

  it("produces a script whose application maps A → B", () => {
    const cases = [
      ["", "hello world"],
      ["hello world", ""],
      ["the quick brown fox", "the slow brown fox"],
      ["a b c d e", "a x c y e"],
      ["one two three", "three two one"],
      [
        "Helix-M streams responses token by token.",
        "Helix-M streams responses incrementally, token by token.",
      ],
      ["", ""],
    ];
    for (const [s1, s2] of cases) {
      const a = tokenize(s1);
      const b = tokenize(s2);
      const r = myersDiff(a, b, tokenKey);
      const reconstructed = applyOps(a, b, r.ops)
        .map((t) => t.text)
        .join("");
      expect(reconstructed).toBe(s2);
    }
  });

  it("minimizes edit distance on typical AI-output diffs", () => {

    const a = tokenize("the model runs in Virginia and Oregon data centers");
    const b = tokenize("the model runs in Virginia and Frankfurt data centers");
    const r = myersDiff(a, b, tokenKey);
    expect(r.d).toBe(2);
  });
});

describe("computeDiff (full pipeline)", () => {
  it("collapses adjacent del+ins into rep", () => {
    const r = computeDiff(
      "the fast brown fox",
      "the quick brown fox",
    );
    const repOps = r.ops.filter((o) => o.kind === "rep");
    expect(repOps).toHaveLength(1);
    expect(repOps[0].kind).toBe("rep");
  });

  it("counts changes correctly", () => {
    const r = computeDiff("a b c", "a b c");
    expect(r.changeCount).toBe(0);

    const r2 = computeDiff("a b c", "a x c");
    expect(r2.changeCount).toBe(1);
  });

  it("handles empty inputs", () => {
    const r1 = computeDiff("", "");
    expect(r1.changeCount).toBe(0);

    const r2 = computeDiff("", "hello");
    expect(r2.changeCount).toBeGreaterThan(0);

    const r3 = computeDiff("hello", "");
    expect(r3.changeCount).toBeGreaterThan(0);
  });

  it("isolates a single token swap as one replacement", () => {
    const r = computeDiff(
      "Helix-M runs in the Virginia region",
      "Helix-M runs in the Frankfurt region",
    );
    expect(r.changeCount).toBe(1);
  });

  it("computes quickly on long inputs", () => {
    const long = (s: string) => Array.from({ length: 500 }, () => s).join(" ");
    const a = long("the quick brown fox jumps over the lazy dog");
    const b = long("the quick brown fox jumps over the lazy cat");
    const r = computeDiff(a, b);
    expect(r.ms).toBeLessThan(800);
    expect(r.changeCount).toBeGreaterThan(0);
  });
});
