export function mulberry32(state: number): { next(): number; state(): number } {
  let a = state >>> 0;
  return {
    next() {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    },
    state: () => a,
  };
}
/** Draw all 64 uniforms for a month, always, so replay is identical regardless of branching. */
export function drawMonth(rngState: number, n: number): { u: number[]; rngState: number } {
  const r = mulberry32(rngState);
  const u: number[] = [];
  for (let i = 0; i < n; i++) u.push(r.next());
  return { u, rngState: r.state() };
}
