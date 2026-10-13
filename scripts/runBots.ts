// scripts/runBots.ts
import { BOTS, playBot } from "../src/sim/bots";
import { netWorth } from "../src/sim/systems";

const pct = (a: number[], p: number) => a[Math.floor((a.length - 1) * p)];
export function summarize(lives: number) {
  const bots: Record<string, any> = {};
  for (const b of BOTS) {
    const nw: number[] = []; let negative = 0, dropouts = 0;
    for (let seed = 1; seed <= lives; seed++) {
      const s = playBot(seed, b);
      const v = netWorth(s);
      nw.push(v);
      if (v < 0) negative++;
      if (b.major !== "none" && s.education === "none") dropouts++;
    }
    nw.sort((x, y) => x - y);
    bots[b.name] = {
      p5: pct(nw, 0.05), p50: pct(nw, 0.5), p95: pct(nw, 0.95),
      wentNegativeCash: negative,            // lives ending with net worth below $0 at 65
      dropoutPct: b.major === "none" ? null : Math.round((dropouts * 1000) / lives) / 10,
    };
  }
  return bots;
}
