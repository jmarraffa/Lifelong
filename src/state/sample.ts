// Part A v2 history has 564 points; the chart takes at most 200
export function sampleHistory(h: number[], max = 200): number[] {
  if (h.length <= max) return h;
  const out: number[] = [];
  for (let i = 0; i < max - 1; i++) out.push(h[Math.round((i * (h.length - 1)) / (max - 1))]);
  out.push(h[h.length - 1]);
  return out;
}
