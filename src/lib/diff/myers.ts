export type MyersOp =
  | { op: "eq"; a: number; b: number; len: number }
  | { op: "ins"; b: number; len: number }
  | { op: "del"; a: number; len: number };

export interface MyersResult<T> {
  ops: MyersOp[];
  d: number;
  a: T[];
  b: T[];
}

export function myersDiff<T>(
  a: T[],
  b: T[],
  keyOf: (t: T) => string = defaultKey,
): MyersResult<T> {
  let prefix = 0;
  const maxPrefix = Math.min(a.length, b.length);
  while (prefix < maxPrefix && keyOf(a[prefix]) === keyOf(b[prefix])) prefix++;

  let suffix = 0;
  const maxSuffix = Math.min(a.length - prefix, b.length - prefix);
  while (
    suffix < maxSuffix &&
    keyOf(a[a.length - 1 - suffix]) === keyOf(b[b.length - 1 - suffix])
  ) {
    suffix++;
  }

  const aMid = a.slice(prefix, a.length - suffix);
  const bMid = b.slice(prefix, b.length - suffix);
  const aKeys = aMid.map(keyOf);
  const bKeys = bMid.map(keyOf);

  let midOps: MyersOp[];
  let d: number;
  if (aMid.length === 0 && bMid.length === 0) {
    midOps = [];
    d = 0;
  } else if (aMid.length === 0) {
    midOps = [{ op: "ins", b: prefix, len: bMid.length }];
    d = bMid.length;
  } else if (bMid.length === 0) {
    midOps = [{ op: "del", a: prefix, len: aMid.length }];
    d = aMid.length;
  } else {
    const r = runMyers(aKeys, bKeys, prefix);
    midOps = r.ops;
    d = r.d;
  }

  const ops: MyersOp[] = [];
  if (prefix > 0) ops.push({ op: "eq", a: 0, b: 0, len: prefix });
  for (const o of midOps) ops.push(o);
  if (suffix > 0) {
    ops.push({
      op: "eq",
      a: a.length - suffix,
      b: b.length - suffix,
      len: suffix,
    });
  }

  return { ops: coalesce(ops), d, a, b };
}

function runMyers(
  aKeys: string[],
  bKeys: string[],
  offset: number,
): { ops: MyersOp[]; d: number } {
  const n = aKeys.length;
  const m = bKeys.length;
  const max = n + m;
  // V is indexed by k in [-max, max]; we store it shifted by `max`.
  const v = new Int32Array(2 * max + 1);
  const trace: Int32Array[] = [];

  let foundD = -1;
  outer: for (let d = 0; d <= max; d++) {
    for (let k = -d; k <= d; k += 2) {
      let x: number;
      if (k === -d || (k !== d && v[k - 1 + max] < v[k + 1 + max])) {
        x = v[k + 1 + max]; // moved down
      } else {
        x = v[k - 1 + max] + 1; // moved right
      }
      let y = x - k;
      // Snake: greedily follow matching diagonals.
      while (x < n && y < m && aKeys[x] === bKeys[y]) {
        x++;
        y++;
      }
      v[k + max] = x;
      if (x >= n && y >= m) {
        trace.push(new Int32Array(v));
        foundD = d;
        break outer;
      }
    }
    trace.push(new Int32Array(v));
  }

  if (foundD === -1) {
    // Should never happen because d <= max guarantees a path.
    throw new Error("Myers diff failed to converge");
  }

  return { ops: backtrace(trace, n, m, max, offset, aKeys, bKeys), d: foundD };
}

function backtrace(
  trace: Int32Array[],
  n: number,
  m: number,
  max: number,
  offset: number,
  aKeys: string[],
  bKeys: string[],
): MyersOp[] {
  const ops: MyersOp[] = [];
  let x = n;
  let y = m;
  for (let d = trace.length - 1; d > 0; d--) {
    const v = trace[d - 1];
    const k = x - y;
    let prevK: number;
    if (k === -d || (k !== d && v[k - 1 + max] < v[k + 1 + max])) {
      prevK = k + 1;
    } else {
      prevK = k - 1;
    }
    const prevX = v[prevK + max];
    const prevY = prevX - prevK;

    // Snake (eq run) from (prevX,prevY) → (x,y) minus the one edit step.
    while (x > prevX && y > prevY) {
      ops.push({
        op: "eq",
        a: offset + x - 1,
        b: offset + y - 1,
        len: 1,
      });
      x--;
      y--;
    }
    if (d > 0) {
      if (x === prevX) {
        ops.push({ op: "ins", b: offset + y - 1, len: 1 });
        y--;
      } else {
        ops.push({ op: "del", a: offset + x - 1, len: 1 });
        x--;
      }
    }
    // Sanity: avoid unused-var false positives if minifier strips snakes.
    void aKeys;
    void bKeys;
  }
  // Drain any remaining snake at d=0.
  while (x > 0 && y > 0) {
    ops.push({
      op: "eq",
      a: offset + x - 1,
      b: offset + y - 1,
      len: 1,
    });
    x--;
    y--;
  }
  return ops.reverse();
}

function coalesce(ops: MyersOp[]): MyersOp[] {
  if (ops.length <= 1) return ops;
  const out: MyersOp[] = [];
  let cur = { ...ops[0] };
  for (let i = 1; i < ops.length; i++) {
    const next = ops[i];
    if (cur.op === "eq" && next.op === "eq") {
      if (cur.a + cur.len === next.a && cur.b + cur.len === next.b) {
        cur.len += next.len;
        continue;
      }
    } else if (cur.op === "ins" && next.op === "ins") {
      if (cur.b + cur.len === next.b) {
        cur.len += next.len;
        continue;
      }
    } else if (cur.op === "del" && next.op === "del") {
      if (cur.a + cur.len === next.a) {
        cur.len += next.len;
        continue;
      }
    }
    out.push(cur);
    cur = { ...next };
  }
  out.push(cur);
  return out;
}

function defaultKey<T>(t: T): string {
  return String(t);
}
