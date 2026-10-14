import { CONFIG, Career, Home, Lifestyle, Major } from "./config";
import { annualNet } from "./tax";
import { usd, bpsOf } from "./money";

export type ChoiceKind = "edu" | "career" | "lifestyle" | "home";
export interface Choice { month: number; kind: ChoiceKind; value: string }

export interface LifeState {
  schemaVersion: 3; seed: number; rngState: number;
  month: number;                                  // 0..564; 564 = age 65, done
  cash: number; loan: number; loanPayment: number;
  education: "none" | "bachelor"; major: Major | null; eduMonthsLeft: number;
  career: Career | null; level: number;           // level 0..4 = L1..L5
  salary: number; monthsInLevel: number; monthsInTrack: number;
  lifestyle: Lifestyle; home: Home;
  history: number[];                              // net worth after each month
  choiceLog: Choice[];
  writeOffs: number;    // total overdraft debt forgiven, whole USD
  downshifts: number;   // Money Rescue episodes
  rescue: boolean;      // true from the forced downshift until cash >= 0
}

const has = (o: object, k: string) => Object.prototype.hasOwnProperty.call(o, k);
export const age = (s: LifeState) => CONFIG.startAge + Math.floor(s.month / 12);
export const netWorth = (s: LifeState) => s.cash - s.loan;

export function amortPayment(principal: number, bps: number, n: number): number {
  const r = bps / 10000 / 12;
  return usd(Math.round((principal * r) / (1 - Math.pow(1 + r, -n))));
}

export function newLife(seed: number): LifeState {
  return {
    schemaVersion: 3, seed, rngState: seed >>> 0, month: 0,
    cash: CONFIG.startCash, loan: 0, loanPayment: 0,
    education: "none", major: null, eduMonthsLeft: 0,
    career: null, level: 0, salary: 0, monthsInLevel: 0, monthsInTrack: 0,
    lifestyle: "standard", home: "family", history: [], choiceLog: [], writeOffs: 0, downshifts: 0, rescue: false,
  };
}

export function canHold(s: LifeState, c: Career): boolean {
  const need = CONFIG.career.ladders[c].needs;
  if (need === null) return true;
  if (s.education !== "bachelor") return false;
  return need === "bachelor" || s.major === need;
}

/** Commitments happen on birthdays only (month % 12 === 0). Invalid choices are ignored and NOT logged. */
export function applyChoice(s: LifeState, kind: ChoiceKind, value: string): LifeState {
  if (s.month % 12 !== 0) return s;
  const entry: Choice = { month: s.month, kind, value };
  const logged = (n: LifeState): LifeState => ({ ...n, choiceLog: [...n.choiceLog, entry] });
  switch (kind) {
    case "edu":
      if (s.month !== 0) return s;
      if (value === "none") return logged(s);
      if (!has(CONFIG.education.majors, value)) return s;
      return logged({ ...s, major: value as Major, eduMonthsLeft: CONFIG.education.years * 12 });
    case "career": {
      if (!has(CONFIG.career.ladders, value) || s.eduMonthsLeft > 0) return s;
      const c = value as Career;
      if (!canHold(s, c) || s.career === c) return s;
      return logged({ ...s, career: c, level: 0, salary: CONFIG.career.ladders[c].steps[0], monthsInLevel: 0, monthsInTrack: 0 });
    }
    case "lifestyle":
      return has(CONFIG.cashflow.lifestyle, value) ? logged({ ...s, lifestyle: value as Lifestyle }) : s;
    case "home":
      return has(CONFIG.housing.rentTiers, value) && value !== "family" ? logged({ ...s, home: value as Home }) : s;
  }
}

/** At 22 the free family home ends. */
export function housingSystem(s: LifeState): LifeState {
  if (s.home === "family" && age(s) >= CONFIG.housing.familyFreeUntilAge && s.month % 12 === 0) {
    return { ...s, home: CONFIG.housing.afterFamily };
  }
  return s;
}

/** Tuition is added to the loan each September-equivalent; interest starts after school; dropout roll in month 11 of a year. */
export function educationSystem(s: LifeState, u: number[]): LifeState {
  if (s.eduMonthsLeft <= 0) return s;
  const E = CONFIG.education;
  let loan = s.loan;
  if (s.month % 12 === 0) loan += E.tuitionPerYear;
  let left = s.eduMonthsLeft - 1;
  let education = s.education, major = s.major, dropped = false;
  const dropBps = s.major ? E.majors[s.major].dropoutPerYearBps : 0;
  if (left > 0 && s.month % 12 === 11 && u[CONFIG.slots.eduRoll] * 10000 < dropBps) {
    left = 0; major = null; dropped = true;
  }
  if (left === 0 && !dropped) education = "bachelor";
  const loanPayment = left === 0 ? amortPayment(loan, E.loanRateBps, E.loanTermMonths) : s.loanPayment;
  return { ...s, loan, eduMonthsLeft: left, education, major, loanPayment };
}

/** Raise or promotion on each birthday after the first year in a track. Uses slot 59 only. */
export function careerSystem(s: LifeState, u: number[]): LifeState {
  if (!s.career || s.eduMonthsLeft > 0) return s;
  const C = CONFIG.career, lad = C.ladders[s.career];
  let n = { ...s };
  if (s.month > 0 && s.month % 12 === 0 && s.monthsInTrack >= 12) {
    let promoted = false;
    const next = s.level + 1;
    if (next < lad.steps.length) {
      const min = C.promoMinMonths[s.level];
      const l5ok = next < 4 || !lad.l5NeedsMasterOr15y || s.monthsInTrack >= C.l5ExperienceMonths;
      if (s.monthsInLevel >= min && l5ok) {
        const p = Math.min(C.promoCapBps, C.promoBaseBps + C.promoStepBps * Math.floor((s.monthsInLevel - min) / 12));
        if (u[CONFIG.slots.careerRoll] * 10000 < p) {
          n = { ...n, level: next, salary: lad.steps[next], monthsInLevel: 0 };
          promoted = true;
        }
      }
    }
    if (!promoted) n = { ...n, salary: s.salary + bpsOf(s.salary, C.raiseBps) };
  }
  return { ...n, monthsInLevel: n.monthsInLevel + 1, monthsInTrack: n.monthsInTrack + 1 };
}

/** Monthly cashflow. living = max(floor, share x take-home) + rent. Cash may go negative (overdraft interest). */
export function cashflowSystem(s: LifeState, studying: boolean): LifeState {
  const E = CONFIG.education, CF = CONFIG.cashflow;
  const net = usd(annualNet(studying ? 0 : s.salary) / 12);
  const lv = CF.lifestyle[s.lifestyle];
  const living = studying ? E.studentLivingMonthly : Math.max(lv.floor, bpsOf(net, lv.shareBps));
  const rent = CONFIG.housing.rentTiers[s.home];
  const owes = !studying && s.loan > 0;
  const interest = owes ? usd((s.loan * E.loanRateBps) / 10000 / 12) : 0;
  const pay = owes ? Math.min(s.loanPayment, s.loan + interest) : 0;
  const cashInterest = s.cash > 0
    ? usd((s.cash * CF.savingsRealBps) / 10000 / 12)
    : -usd((-s.cash * CF.overdraftRealBps) / 10000 / 12);
  return {
    ...s,
    cash: s.cash + net - living - rent - pay + cashInterest,
    loan: owes ? s.loan + interest - pay : s.loan,
  };
}

/** Any month. Not studying and cash <= -limit: force Frugal, and Room share unless still with family. Once per episode. */
export function moneyTroubleSystem(s: LifeState): LifeState {
  const CF = CONFIG.cashflow;
  if (s.rescue && s.cash >= 0) return { ...s, rescue: false };      // episode over; no auto-restore
  if (s.rescue || s.eduMonthsLeft > 0 || s.cash > -CF.overdraftLimit) return s;
  const home: Home = s.home === "family" ? "family" : "room";
  return { ...s, lifestyle: "frugal", home, rescue: true, downshifts: s.downshifts + 1 };
}

/** After each month's cashflow: cash below -cap is forgiven up to the cap. s.loan is never touched. */
export function overdraftCapSystem(s: LifeState): LifeState {
  const cap = CONFIG.cashflow.overdraftHardCap;
  if (s.cash >= -cap) return s;
  return { ...s, writeOffs: s.writeOffs + (-cap - s.cash), cash: -cap };
}
