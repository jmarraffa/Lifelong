import { describe, it, expect } from "vitest";
import { newShowLife, stepMonth, runToEnd, MAX_MONTHS, parseSeed, copyRunText, fmtAxisUsd, netWorth, salaryAt } from "./show";

describe("show sim", () => {
  it("ends at 564 months with 48 history points", () => {
    const s = runToEnd(newShowLife("A", 1));
    expect(s.month).toBe(MAX_MONTHS);
    expect(s.finished).toBe(true);
    expect(s.history.length).toBe(48);
  });
  it("is deterministic and mid-life resume matches", () => {
    let a = newShowLife("A", 5);
    for (let i = 0; i < 100; i++) a = stepMonth(a);
    const resumed = JSON.parse(JSON.stringify(a));
    expect(runToEnd(resumed)).toEqual(runToEnd(newShowLife("A", 5)));
  });
  it("all money stays whole dollars", () => {
    let s = newShowLife("A", 1);
    for (let i = 0; i < 564; i++) { s = stepMonth(s); expect(Number.isInteger(s.cash)).toBe(true); expect(Number.isInteger(s.index)).toBe(true); }
  });
  it("net worth grows over a life", () => {
    const s = runToEnd(newShowLife("A", 1));
    expect(netWorth(s)).toBeGreaterThan(s.history[0]);
    expect(s.history[47]).toBe(netWorth(s));
  });
  it("salary ladder bands", () => {
    expect(salaryAt(18)).toBe(30000);
    expect(salaryAt(30)).toBe(58000);
    expect(salaryAt(65)).toBe(82000);
  });
  it("seed parsing", () => {
    expect(parseSeed("123")).toBe(123);
    expect(parseSeed("")).toBeNull();
    expect(parseSeed("abc")).toBeNull();
  });
  it("copy text has build, seed and choices", () => {
    const t = copyRunText(newShowLife("A", 77));
    expect(t).toContain("v0.1-show");
    expect(t).toContain("seed 77");
    expect(t).toContain("choices []");
  });
  it("axis labels", () => {
    expect(fmtAxisUsd(1200000)).toBe("$1.2M");
    expect(fmtAxisUsd(45000)).toBe("$45k");
  });
});
