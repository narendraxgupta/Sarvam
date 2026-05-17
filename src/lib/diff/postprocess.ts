import type { DiffOp, Token } from "@/types";
import type { MyersOp } from "./myers";

export function postprocess(
  ops: MyersOp[],
  a: Token[],
  b: Token[],
): DiffOp[] {
  const materialized: DiffOp[] = ops.map((o) => {
    if (o.op === "eq") {
      return {
        kind: "eq",
        tokensA: a.slice(o.a, o.a + o.len),
        tokensB: b.slice(o.b, o.b + o.len),
      };
    }
    if (o.op === "ins") {
      return { kind: "ins", tokens: b.slice(o.b, o.b + o.len) };
    }
    return { kind: "del", tokens: a.slice(o.a, o.a + o.len) };
  });

  const collapsed: DiffOp[] = [];
  for (let i = 0; i < materialized.length; i++) {
    const cur = materialized[i];
    const next = materialized[i + 1];
    if (
      next &&
      ((cur.kind === "del" && next.kind === "ins") ||
        (cur.kind === "ins" && next.kind === "del"))
    ) {
      const from = cur.kind === "del" ? cur.tokens : next.kind === "del" ? next.tokens : [];
      const to = cur.kind === "ins" ? cur.tokens : next.kind === "ins" ? next.tokens : [];
      collapsed.push({ kind: "rep", from, to });
      i += 1;
    } else {
      collapsed.push(cur);
    }
  }

  return collapsed.filter((op) => {
    if (op.kind === "rep") {
      const allWsFrom = op.from.every((t) => t.kind === "whitespace");
      const allWsTo = op.to.every((t) => t.kind === "whitespace");
      return !(allWsFrom && allWsTo);
    }
    return true;
  });
}

export function buildPairs(ops: MyersOp[]): Array<{
  aIndex: number;
  bIndex: number;
}> {
  const pairs: Array<{ aIndex: number; bIndex: number }> = [];
  for (const op of ops) {
    if (op.op === "eq") {
      for (let i = 0; i < op.len; i++) {
        pairs.push({ aIndex: op.a + i, bIndex: op.b + i });
      }
    }
  }
  return pairs;
}

export function countChanges(ops: DiffOp[]): number {
  return ops.filter((o) => o.kind !== "eq").length;
}
