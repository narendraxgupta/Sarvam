import type { DiffResult } from "@/types";
import { myersDiff } from "./myers";
import { buildPairs, countChanges, postprocess } from "./postprocess";
import { tokenize, tokenKey } from "./tokenize";

export { tokenize, tokenKey } from "./tokenize";
export { myersDiff } from "./myers";
export { postprocess, buildPairs, countChanges } from "./postprocess";

export function computeDiff(a: string, b: string): DiffResult {
  const t0 = performance.now();
  const aTokens = tokenize(a);
  const bTokens = tokenize(b);
  const { ops: rawOps, d } = myersDiff(aTokens, bTokens, tokenKey);
  const ops = postprocess(rawOps, aTokens, bTokens);
  const pairs = buildPairs(rawOps);
  const ms = performance.now() - t0;
  return {
    ops,
    a: aTokens,
    b: bTokens,
    changeCount: countChanges(ops),
    pairs,
    d,
    ms,
  };
}
