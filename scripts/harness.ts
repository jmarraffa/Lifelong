// scripts/harness.ts: fast check used on every push (1,000 lives x 7 bots)
import { mkdirSync, writeFileSync } from "node:fs";
import { BOTS, playBot } from "../src/sim/bots";
import { replay } from "../src/sim/tick";
import { summarize } from "./runBots";

const lives = Number(process.argv[2] ?? 1000);
let determinismOk = true;
for (const b of BOTS) {
  const a = playBot(1, b);
  if (JSON.stringify(replay(1, a.choiceLog)) !== JSON.stringify(a)) determinismOk = false;
}
const out = { generatedAt: new Date().toISOString(), lives, determinismOk, bots: summarize(lives) };
mkdirSync("report", { recursive: true });
writeFileSync("report/harness.json", JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));
if (!determinismOk) process.exit(1);
