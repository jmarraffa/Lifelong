import { CFG } from "./config";

export const SHOW_SCHEMA = 2;
export interface ShowChoice { id: string; month: number }
export interface ShowState {
  schemaVersion: number; name: string; seed: number;
  month: number; cash: number; index: number;
  history: number[];            // net worth at month 0 and every 12th month (48 points)
  choiceLog: ShowChoice[];      // empty in v0.1; kept so Copy my run stays stable
  finished: boolean;
}
export const MAX_MONTHS = (CFG.endAge - CFG.startAge) * 12; // 564
export const ageAt = (month: number) => CFG.startAge + Math.floor(month / 12);
export const netWorth = (s: ShowState) => s.cash + s.index;

export function salaryAt(age: number): number {
  for (const b of CFG.ladder) if (age <= b.maxAge) return b.salary;
  return CFG.ladder[CFG.ladder.length - 1].salary;
}

export function parseSeed(text: string): number | null {
  const t = text.trim();
  if (!/^\d{1,10}$/.test(t)) return null;
  return Number(t) % 2147483647;
}

export function newShowLife(name: string, seed: number): ShowState {
  return { schemaVersion: SHOW_SCHEMA, name: name.trim() || "You", seed, month: 0,
    cash: CFG.startCash, index: 0, history: [CFG.startCash], choiceLog: [], finished: false };
}

// One month. Pure and deterministic. No RNG is drawn in v0.1 (no volatility), so the seed is stored for later builds.
export function stepMonth(s: ShowState): ShowState {
  if (s.finished) return s;
  const gross = Math.round(salaryAt(ageAt(s.month)) / 12);
  const net = Math.round((gross * (10000 - CFG.taxBps)) / 10000);
  const save = Math.round((net * CFG.autoSaveBps) / 10000);
  const growth = Math.round((s.index * CFG.indexRealBps) / 120000);
  const month = s.month + 1;
  const next: ShowState = { ...s, month,
    cash: s.cash + net - save - CFG.livingCostMonthly,
    index: s.index + growth + save };
  const history = month % 12 === 0 ? [...s.history, netWorth(next)] : s.history;
  return { ...next, history, finished: month >= MAX_MONTHS };
}

export function runToEnd(s: ShowState): ShowState {
  let x = s;
  while (!x.finished) x = stepMonth(x);
  return x;
}

export function copyRunText(s: ShowState): string {
  return [`Lifelong ${CFG.build}`, `seed ${s.seed}`, `choices ${JSON.stringify(s.choiceLog)}`,
    `age ${ageAt(s.month)}`, `net worth $${netWorth(s).toLocaleString("en-US")}`].join(" | ");
}

export function fmtUsd(n: number): string {
  return (n < 0 ? "-$" : "$") + Math.abs(n).toLocaleString("en-US");
}
export function fmtAxisUsd(n: number): string {
  const a = Math.abs(n);
  if (a >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (a >= 1e3) return `$${Math.round(n / 1e3)}k`;
  return `$${n}`;
}
