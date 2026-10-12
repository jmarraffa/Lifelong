export const SCHEMA_VERSION = 1;
export const START_AGE = 18;
export const END_AGE = 65;
export const MAX_MONTHS = (END_AGE - START_AGE) * 12; // 564

export interface Choice { id: string; month: number; }

export interface LifeState {
  schemaVersion: number;
  seed: number;
  rngState: number;      // RNG position, so saves resume exactly
  month: number;         // months since age 18
  cash: number;          // whole USD
  choiceLog: Choice[];
  finished: boolean;
}
export const ageOf = (s: LifeState) => START_AGE + Math.floor(s.month / 12);
