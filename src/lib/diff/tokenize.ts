import type { Token } from "@/types";

const HAS_SEGMENTER =
  typeof Intl !== "undefined" &&
  typeof Intl.Segmenter === "function";

const WORD_RE = /[\p{L}\p{M}\p{N}_'\u200C\u200D]+/yu;
const WS_RE = /\s+/y;

export function tokenize(input: string): Token[] {
  if (!input) return [];
  if (HAS_SEGMENTER) return tokenizeWithSegmenter(input);
  return tokenizeWithRegex(input);
}

function tokenizeWithSegmenter(input: string): Token[] {
  const tokens: Token[] = [];
  const seg = new Intl.Segmenter(undefined, { granularity: "word" });
  for (const part of seg.segment(input)) {
    const text = part.segment;
    if (!text) continue;
    const start = part.index;
    const end = start + text.length;
    if (/^\s+$/.test(text)) {
      tokens.push({ text, kind: "whitespace", start, end });
    } else if (part.isWordLike) {
      tokens.push({ text, kind: "word", start, end });
    } else {
      // Punctuation, symbols, etc.
      tokens.push({ text, kind: "punct", start, end });
    }
  }
  return tokens;
}

function tokenizeWithRegex(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < input.length) {
    WORD_RE.lastIndex = i;
    WS_RE.lastIndex = i;
    const wm = WORD_RE.exec(input);
    if (wm && wm.index === i) {
      tokens.push({ text: wm[0], kind: "word", start: i, end: i + wm[0].length });
      i += wm[0].length;
      continue;
    }
    const sm = WS_RE.exec(input);
    if (sm && sm.index === i) {
      tokens.push({
        text: sm[0],
        kind: "whitespace",
        start: i,
        end: i + sm[0].length,
      });
      i += sm[0].length;
      continue;
    }
    // Single punctuation/symbol code point (handle surrogate pairs).
    const code = input.codePointAt(i)!;
    const ch = String.fromCodePoint(code);
    tokens.push({ text: ch, kind: "punct", start: i, end: i + ch.length });
    i += ch.length;
  }
  return tokens;
}

export function tokenKey(t: Token): string {
  switch (t.kind) {
    case "word":
      return "w:" + t.text.normalize("NFC").toLowerCase();
    case "whitespace":
      return "s:" + (t.text.includes("\n") ? "nl" : "sp");
    case "punct":
      return "p:" + t.text.normalize("NFC");
  }
}
