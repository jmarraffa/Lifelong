// Every tunable number lives here. All money is whole USD, rates are basis points. PLACEHOLDER values.
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
