// tick.ts
import { CONFIG } from "./config";
import { drawMonth } from "./rng";
import { LifeState, Choice, newLife, applyChoice, housingSystem, educationSystem, careerSystem, cashflowSystem, netWorth } from "./systems";

export const isDone = (s: LifeState) => s.month >= (CONFIG.endAge - CONFIG.startAge) * 12; // 564

/** Fixed order: housing, education, career, cashflow. All 64 uniforms are drawn every month. */
export function tick(s: LifeState): LifeState {
  if (isDone(s)) return s;
  const studying = s.eduMonthsLeft > 0;
  const { u, rngState } = drawMonth(s.rngState, CONFIG.draws);
  let n: LifeState = { ...s, rngState };
  n = housingSystem(n);
  n = educationSystem(n, u);
  n = careerSystem(n, u);
  n = cashflowSystem(n, studying);
  return { ...n, month: n.month + 1, history: n.history.concat(netWorth(n)) };
}

/** Rebuild a life from a seed and its choiceLog. Same inputs, identical state. */
export function replay(seed: number, log: Choice[]): LifeState {
  let s = newLife(seed), i = 0;
  while (!isDone(s)) {
    while (i < log.length && log[i].month === s.month) { s = applyChoice(s, log[i].kind, log[i].value); i++; }
    s = tick(s);
  }
  return s;
}
