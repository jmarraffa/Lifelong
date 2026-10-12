import { LifeState } from "./types";
export function applyChoice(s: LifeState, id: string): LifeState {
  return { ...s, choiceLog: [...s.choiceLog, { id, month: s.month }] }; // effects added with systems
}
