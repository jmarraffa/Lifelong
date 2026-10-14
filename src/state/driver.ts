import { Career, Major } from "../sim/config";
import { LifeState, newLife, applyChoice } from "../sim/systems";
import { tick, isDone } from "../sim/tick";
import type { PathChoice } from "./path";

// [A] first job after school; Job Board (v0.4) replaces this
const MAJOR_CAREER: Record<Major, Career> = { tech: "tech", business: "finance", health: "health", general: "office" };

export function startLife(seed: number, c: PathChoice): LifeState {
  const s = newLife(seed);
  return c.path === "college" ? applyChoice(s, "edu", c.major) : applyChoice(s, "career", "service"); // Work = Service & Retail L1 [A]
}

/** One month. Picks the first job on the birthday school ends, then ticks. All choices go into choiceLog, so replay() matches. */
export function advance(s: LifeState): LifeState {
  if (isDone(s)) return s;
  let n = s;
  if (n.month % 12 === 0 && n.eduMonthsLeft === 0 && !n.career) {
    n = applyChoice(n, "career", n.major ? MAJOR_CAREER[n.major] : "service");
    if (!n.career) n = applyChoice(n, "career", "service");
  }
  return tick(n);
}
