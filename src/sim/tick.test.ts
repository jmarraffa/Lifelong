import { describe, it, expect } from "vitest";
import { newLife, advance, applyChoice, MAX_MONTHS, createRng } from "./index";

describe("determinism", () => {
  it("same seed + same choices => identical result", () => {
    const run = (seed: number) => {
      let s = newLife(seed);
      s = advance(s, 12);
      s = applyChoice(s, "go-to-college");
      return advance(s, 100);
    };
    expect(run(42)).toEqual(run(42));
  });
  it("different seeds diverge", () => {
    expect(advance(newLife(1), 120).cash).not.toBe(advance(newLife(2), 120).cash);
  });
  it("advancing 12 then 12 equals 24 at once", () => {
    const s = newLife(7);
    expect(advance(advance(s, 12), 12)).toEqual(advance(s, 24));
  });
  it("save/resume mid-life matches uninterrupted run", () => {
    const mid = JSON.parse(JSON.stringify(advance(newLife(9), 50)));
    expect(advance(mid, 50)).toEqual(advance(newLife(9), 100));
  });
  it("life ends at 564 months", () => {
    const s = advance(newLife(3), 10000);
    expect(s.month).toBe(MAX_MONTHS);
    expect(s.finished).toBe(true);
  });
  it("rng is reproducible", () => {
    const a = createRng(5), b = createRng(5);
    expect([a.next(), a.next()]).toEqual([b.next(), b.next()]);
  });
});
