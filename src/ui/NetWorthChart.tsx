import { fmtAxisUsd, fmtUsd } from "../state/format";

export function NetWorthChart({ points }: { points: number[] }) {
  const pts = points.length > 200 ? points.slice(-200) : points; // alpha-0.1 has 48 points; guard only
  const W = 320, H = 180, L = 56, B = 22, T = 8;
  const max = Math.max(1, ...pts), min = Math.min(0, ...pts);
  const x = (i: number) => L + (i * (W - L - 4)) / Math.max(1, pts.length - 1);
  const y = (v: number) => T + ((max - v) * (H - T - B)) / (max - min || 1);
  const line = pts.map((v, i) => `${x(i)},${y(v)}`).join(" ");
  const last = pts[pts.length - 1];
  return (
    <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img"
         aria-label={`Net worth from age 18 to 65, ending at ${fmtUsd(last)}`}>
      <line x1={L} x2={W - 4} y1={y(0)} y2={y(0)} stroke="#2a3350" />
      <text x={L - 4} y={y(max) + 4} textAnchor="end" className="ax">{fmtAxisUsd(max)}</text>
      <text x={L - 4} y={y(0) + 4} textAnchor="end" className="ax">$0</text>
      <text x={L} y={H - 4} className="ax">18</text>
      <text x={W - 4} y={H - 4} textAnchor="end" className="ax">65</text>
      <polyline points={line} fill="none" stroke="#E8B64C" strokeWidth="2.5" />
    </svg>
  );
}
