import { describe, it, expect } from "vitest";
import { CONFIG } from "./config";
import { incomeTax, payrollTax, annualNet } from "./tax";
import { newLife, amortPayment, applyChoice, cashflowSystem, canHold, netWorth, LifeState } from "./systems";
import { tick, replay, isDone } from "./tick";
import { BOTS, playBot } from "./bots";

const base = (o: Partial<LifeState>): LifeState => ({ ...newLife(1), cash: 0, ...o });

describe("tax spot-checks (2026 single filer)", () => {
  it("$60k: income tax $5,020, payroll $4,590, net $50,390", () => {
    expect(incomeTax(60000)).toBe(5020);   // 10% x 12,400 + 12% x 31,500 on 43,900 taxable
    expect(payrollTax(60000)).toBe(4590);  // 6.2% + 1.45%
    expect(annualNet(60000)).toBe(50390);
  });
  it("$32k: income tax $1,660, payroll $2,448", () => {
    expect(incomeTax(32000)).toBe(1660);
    expect(payrollTax(32000)).toBe(2448);
  });
  it("income under the deduction pays no income tax", () => expect(incomeTax(16000)).toBe(0));
  it("Social Security stops at the wage base", () => {
    expect(payrollTax(300000)).toBe(11439 + 4350); // 6.2% x 184,500 + 1.45% x 300,000
  });
});

describe("cashflow: rent is on top of lifestyle [hand figures from copy sheet v2]", () => {
  const worker = (o: Partial<LifeState>) => base({ career: "service", salary: 32000, ...o });
  it("$60k, Standard, Studio, $475 loan = -$5 a month", () => {
    const s = base({ career: "finance", salary: 60000, home: "studio", loan: 48000, loanPayment: 475 });
    expect(cashflowSystem(s, false).cash).toBe(-5 - 0 + 0 - 140 + 140 - 0 + 0); // interest is added to the loan, not cash
  });
  it("$32k Service: Standard+Studio -776, Frugal+Studio -176, Frugal+Room +224", () => {
    expect(cashflowSystem(worker({ home: "studio" }), false).cash).toBe(-776);
    expect(cashflowSystem(worker({ home: "studio", lifestyle: "frugal" }), false).cash).toBe(-176);
    expect(cashflowSystem(worker({ home: "room", lifestyle: "frugal" }), false).cash).toBe(224);
  });
  it("family home costs no rent", () => {
    expect(cashflowSystem(worker({ home: "family", lifestyle: "frugal" }), false).cash).toBe(2324 - 1500);
  });
});

describe("education and gates", () => {
  it("loan payment on $48k at 350 bps over 120 months is about $475", () => {
    const p = amortPayment(48000, 350, 120);
    expect(p).toBeGreaterThanOrEqual(473); expect(p).toBeLessThanOrEqual(477);
  });
  it("degree gate: no tech job without a tech degree", () => {
    const s = applyChoice(newLife(1), "career", "tech");
    expect(s.career).toBeNull();
    expect(canHold(newLife(1), "service")).toBe(true);
  });
  it("commitments only on birthdays", () => {
    const s = { ...newLife(1), month: 5 };
    expect(applyChoice(s, "lifestyle", "frugal")).toBe(s);
  });
  it("RNG slots used by systems are distinct and inside 58-61", () => {
    const { eduRoll, careerRoll } = CONFIG.slots;
    expect(eduRoll).not.toBe(careerRoll);
    for (const x of [eduRoll, careerRoll]) { expect(x).toBeGreaterThanOrEqual(58); expect(x).toBeLessThanOrEqual(61); }
  });
});

describe("determinism", () => {
  for (const b of BOTS) {
    it(`${b.name}: same seed + choiceLog gives identical state at 65`, () => {
      const a = playBot(42, b);
      expect(a.month).toBe(564);
      expect(replay(42, a.choiceLog)).toEqual(a);
      expect(playBot(42, b)).toEqual(a);
    });
  }
  it("different seeds differ", () => {
    const b = BOTS[0];
    expect(playBot(1, b).rngState).not.toBe(playBot(2, b).rngState);
  });
});

describe("no crash on negative cash", () => {
  it("worst case: Service worker, Comfortable, Nice apartment runs all 564 months", () => {
    const worst = { name: "worst", major: "none" as const, career: "service" as const, lifestyle: "comfortable" as const, homeAt22: "nice" as const };
    const s = playBot(5, worst);
    expect(isDone(s)).toBe(true);
    expect(s.history.length).toBe(564);
    expect(s.history.every((x) => Number.isFinite(x) && Number.isInteger(x))).toBe(true);
    expect(s.cash).toBeLessThan(0); // overdraft debt, never a crash or early end
  });
  it("every bot: integer money, finite net worth, student loan cleared by 65", () => {
    for (const b of BOTS) {
      const s = playBot(7, b);
      expect(s.history.every(Number.isInteger)).toBe(true);
      expect(Number.isFinite(netWorth(s))).toBe(true);
      expect(s.loan).toBe(0);
    }
  });
});
