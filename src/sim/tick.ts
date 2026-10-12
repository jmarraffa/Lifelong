import { createRng, Rng } from "./rng";
import { LifeState, MAX_MONTHS, SCHEMA_VERSION } from "./types";

export type System = (s: LifeState, rng: Rng) => LifeState;

// Placeholder system: flat income, flat expenses, small random event. Replaced in weeks 4-8.
const placeholderMoney: System = (s, rng) => {
  const income = 3000;
  const expenses = 2500 + rng.int(0, 400);
  return { ...s, cash: s.cash + income - expenses };
};

export const SYSTEMS: System[] = [placeholderMoney];

export function newLife(seed: number): LifeState {
  return { schemaVersion: SCHEMA_VERSION, seed, rngState: seed >>> 0, month: 0, cash: 1000, choiceLog: [], finished: false };
}

export function tick(state: LifeState, rng: Rng): LifeState {
  if (state.finished) return state;
  let s = state;
  for (const sys of SYSTEMS) s = sys(s, rng);
  const month = s.month + 1;
  return { ...s, month, rngState: rng.state(), finished: month >= MAX_MONTHS };
}

// Convenience: rebuild an RNG from state (RNG state is the seed input), then tick n months.
export function advance(state: LifeState, months: number): LifeState {
  let s = state;
  for (let i = 0; i < months && !s.finished; i++) s = tick(s, createRng(s.rngState));
  return s;
}
