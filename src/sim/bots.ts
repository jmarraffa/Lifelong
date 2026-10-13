// bots.ts: scripted players for tests, the harness and calibration. Pure, no Math.random.
import { Career, Home, Lifestyle, Major } from "./config";
import { LifeState, newLife, applyChoice } from "./systems";
import { tick, isDone } from "./tick";

export interface Bot { name: string; major: Major | "none"; career: Career; lifestyle: Lifestyle; homeAt22: Home }
export const BOTS: Bot[] = [
  { name: "college-tech",          major: "tech",     career: "tech",     lifestyle: "standard", homeAt22: "studio" },
  { name: "college-finance",       major: "business", career: "finance",  lifestyle: "standard", homeAt22: "studio" },
  { name: "college-health",        major: "health",   career: "health",   lifestyle: "standard", homeAt22: "studio" },
  { name: "college-general-office", major: "general", career: "office",   lifestyle: "standard", homeAt22: "studio" },
  { name: "work-trades",           major: "none",     career: "trades",   lifestyle: "standard", homeAt22: "studio" },
  { name: "work-service-standard", major: "none",     career: "service",  lifestyle: "standard", homeAt22: "studio" },
  { name: "work-service-frugal-room", major: "none",  career: "service",  lifestyle: "frugal",   homeAt22: "room" },
];

export function playBot(seed: number, b: Bot): LifeState {
  let s = newLife(seed);
  while (!isDone(s)) {
    if (s.month % 12 === 0) {
      if (s.month === 0) {
        s = applyChoice(s, "edu", b.major);
        s = applyChoice(s, "lifestyle", b.lifestyle);
      }
      if (s.home === "family" && s.month === 48) s = applyChoice(s, "home", b.homeAt22);
      if (s.eduMonthsLeft === 0 && !s.career) {
        const before = s.career;
        s = applyChoice(s, "career", b.career);
        if (s.career === before) s = applyChoice(s, "career", "service"); // dropout or gate: fall back
      }
    }
    s = tick(s);
  }
  return s;
}
