// Every tunable lives here. Money = whole USD, constant real dollars. Rates = basis points (bps).
// [S] sourced (GDD v0.1/v0.3, Caleb-verified), [A] planning value, change freely.
export type Major = "tech" | "business" | "health" | "general";
export type Career = "service" | "trades" | "office" | "health" | "tech" | "finance" | "education";
export type Home = "family" | "room" | "studio" | "apartment" | "nice";
export type Lifestyle = "frugal" | "standard" | "comfortable";
export interface Ladder {
  needs: null | "bachelor" | Major; // degree gate
  l5NeedsMasterOr15y: boolean;      // L5 gate; no master's exists yet, so 15 years in track
  steps: readonly number[];         // gross annual salary at the start of L1..L5
}

export const CONFIG = {
  startAge: 18, endAge: 65, draws: 64,
  startCash: 1500,                                    // [S] GDD §2
  slots: { eduRoll: 58, careerRoll: 59 },             // [S] GDD v0.2 §12: 58-61 are birthday rolls
  education: {
    years: 4, tuitionPerYear: 12000,                  // [S] 4 x 12k = $48k loan
    studentLivingMonthly: 300,                        // [A] Felix to confirm
    loanRateBps: 350, loanTermMonths: 120,            // [S] 350 bps real, about $475/mo on $48k
    majors: {
      tech: { dropoutPerYearBps: 600 }, business: { dropoutPerYearBps: 300 },
      health: { dropoutPerYearBps: 500 }, general: { dropoutPerYearBps: 400 },
    } as Record<Major, { dropoutPerYearBps: number }>, // [A]
  },
  career: {
    ladders: {
      service:   { needs: null,       l5NeedsMasterOr15y: false, steps: [32000, 36000, 42000, 50000, 58000] },
      trades:    { needs: null,       l5NeedsMasterOr15y: false, steps: [40000, 50000, 62000, 76000, 90000] },
      office:    { needs: "bachelor", l5NeedsMasterOr15y: false, steps: [40000, 48000, 58000, 70000, 84000] },
      health:    { needs: "health",   l5NeedsMasterOr15y: true,  steps: [56000, 68000, 82000, 98000, 118000] },
      tech:      { needs: "tech",     l5NeedsMasterOr15y: true,  steps: [78000, 98000, 125000, 160000, 200000] },
      finance:   { needs: "business", l5NeedsMasterOr15y: true,  steps: [62000, 80000, 105000, 140000, 190000] },
      education: { needs: "bachelor", l5NeedsMasterOr15y: true,  steps: [46000, 54000, 63000, 72000, 82000] },
    } as Record<Career, Ladder>,
    promoMinMonths: [24, 36, 48, 60],                 // months in level before the next step is possible [A]
    promoBaseBps: 2000, promoStepBps: 500, promoCapBps: 4500, // [A]
    l5ExperienceMonths: 180,                          // 15 years in track
    raiseBps: 75,                                     // yearly real raise when not promoted [A]
  },
  housing: {
    rentTiers: { family: 0, room: 600, studio: 1000, apartment: 1500, nice: 2100 } as Record<Home, number>,
    familyFreeUntilAge: 22,
    afterFamily: "studio" as Home,                    // default move at 22 unless the player chose otherwise
  },
  cashflow: {
    lifestyle: {                                      // living = max(floor, share x take-home); rent is separate
      frugal:      { floor: 1500, shareBps: 5000 },
      standard:    { floor: 2100, shareBps: 6000 },   // 60%, CEO-approved 10-13
      comfortable: { floor: 3000, shareBps: 8500 },
    } as Record<Lifestyle, { floor: number; shareBps: number }>,
    savingsRealBps: 100,                              // placeholder until the Market system (v0.5)
    overdraftRealBps: 1200,      // 12% real/yr on negative cash only [A] Felix 10-13
    overdraftLimit: 10000,       // [A] at/over this, forced Frugal + Room (Money Rescue)
    overdraftHardCap: 25000,     // [A] cash never below -this; excess forgiven. Student loan is never forgiven
  },
  tax: {                                              // 2026 single filer, federal only
    standardDeduction: 16100,
    brackets: [
      [12400, 1000], [50400, 1200], [105700, 2200], [201775, 2400],
      [256225, 3200], [640600, 3500], [Infinity, 3700],
    ] as ReadonlyArray<readonly [number, number]>,
    ssRateBps: 620, ssWageBase: 184500, medicareBps: 145,
  },
};

// ---- Show build v0.1 settings (used by show.ts and the current screens until M1 Part B) ----
export const CFG = {
  build: "v0.1-show",
  startAge: 18,
  endAge: 65,
  startCash: 1000,
  // placeholder gross salary ladder: first band whose maxAge >= age applies
  ladder: [
    { maxAge: 21, salary: 30000 },
    { maxAge: 29, salary: 42000 },
    { maxAge: 39, salary: 58000 },
    { maxAge: 54, salary: 75000 },
    { maxAge: 65, salary: 82000 },
  ],
  taxBps: 2200,            // flat placeholder tax; real brackets come in alpha-0.2
  livingCostMonthly: 1800, // fixed placeholder
  autoSaveBps: 1500,       // 15% of take-home goes to the index fund
  indexRealBps: 500,       // 5% real per year, no volatility
  speedMs: { 1: 600, 3: 200 } as Record<number, number>,
};
