// scripts/calibrate.ts: larger sample; prints a block the founder pastes back. Usage: npm run calibrate -- 10000
import { mkdirSync, writeFileSync } from "node:fs";
import { summarize } from "./runBots";

const lives = Number(process.argv[2] ?? 3000);
const t0 = Date.now();
const bots = summarize(lives);
const out = { scope: "economy only (education, career, cashflow). Index calibration arrives with the Market system in v0.5.", lives, bots };
mkdirSync("report", { recursive: true });
writeFileSync("report/calibration.json", JSON.stringify(out, null, 2));
console.log("=== PASTE FROM HERE ===");
console.log(`lives per bot: ${lives}, seconds: ${Math.round((Date.now() - t0) / 1000)}`);
console.log("bot | P5 | P50 | P95 | ended below $0 | dropout %");
for (const [k, v] of Object.entries<any>(bots)) {
  console.log(`${k} | ${v.p5} | ${v.p50} | ${v.p95} | ${v.wentNegativeCash} | ${v.dropoutPct ?? "-"}`);
}
console.log("=== TO HERE ===");
