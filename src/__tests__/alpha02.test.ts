// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from "vitest";
import { startLife, advance } from "../state/driver";
import { replay, isDone } from "../sim/tick";
import { netWorth } from "../sim/systems";
import { CONFIG } from "../sim/config";
import { sampleHistory } from "../state/sample";
import { loadSave, SAVE_SCHEMA, type PathChoice } from "../state/path";
import { BUILD_ID, SAVE_KEY } from "../build";
import { currentEntry } from "../content/changelog";

const CHOICES: PathChoice[] = [{ path: "work" }, ...(["tech", "business", "health", "general"] as const).map((major) => ({ path: "college" as const, major }))];
const run = (seed: number, c: PathChoice) => { let s = startLife(seed, c); while (!isDone(s)) s = advance(s); return s; };

describe("alpha-0.2 driver", () => {
  for (const c of CHOICES) {
    it(`${JSON.stringify(c)}: reaches 65, has a career, replay matches, band holds`, () => {
      const s = run(3, c);
      expect(s.month).toBe(564);
      expect(s.career).not.toBeNull();
      expect(replay(3, s.choiceLog)).toEqual(s);
      expect(netWorth(s)).toBeGreaterThan(-100_000);
      expect(netWorth(s)).toBeLessThan(20_000_000);
    });
  }
  it("sampleHistory returns <= 200 points and keeps the last one", () => {
    const h = Array.from({ length: 564 }, (_, i) => i);
    const o = sampleHistory(h);
    expect(o.length).toBeLessThanOrEqual(200);
    expect(o[o.length - 1]).toBe(563);
  });
  it("Tech graduates reach L5 by 65 in most lives (soft check: report, don't weaken)", () => {
    let l5 = 0, grads = 0;
    for (let seed = 1; seed <= 200; seed++) {
      const s = run(seed, { path: "college", major: "tech" });
      if (s.career === "tech") { grads++; if (s.level === 4) l5++; }
    }
    expect(grads).toBeGreaterThan(0);
    expect(l5 / grads).toBeGreaterThanOrEqual(0.8);
  });
  it("every career ladder has 5 levels with strictly rising pay", () => {
    for (const lad of Object.values(CONFIG.career.ladders)) {
      expect(lad.steps.length).toBe(5);
      for (let i = 1; i < 5; i++) expect(lad.steps[i]).toBeGreaterThan(lad.steps[i - 1]);
    }
  });
});

describe("alpha-0.2 build and save", () => {
  beforeEach(() => localStorage.clear());
  it("changelog has an entry for this build with 2-3 bullets of at most 70 chars", () => {
    const e = currentEntry(BUILD_ID);
    expect(e).toBeDefined();
    expect(e!.bullets.length).toBeGreaterThanOrEqual(2);
    expect(e!.bullets.length).toBeLessThanOrEqual(3);
    for (const b of e!.bullets) expect(b.length).toBeLessThanOrEqual(70);
  });
  it("loadSave returns null for an alpha-0.1 save and for corrupt JSON, without throwing", () => {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ schema: "a1", month: 3, history: [] }));
    expect(loadSave(SAVE_KEY)).toBeNull();
    localStorage.setItem(SAVE_KEY, "{bad");
    expect(loadSave(SAVE_KEY)).toBeNull();
  });
  it("loadSave round-trips an a2 envelope", () => {
    const life = startLife(9, { path: "work" });
    localStorage.setItem(SAVE_KEY, JSON.stringify({ schema: SAVE_SCHEMA, life }));
    expect(loadSave(SAVE_KEY)?.life).toEqual(life);
  });
  it("src/sim stays pure: no Math.random, React or DOM", () => {
    const files = import.meta.glob(["../sim/*.ts", "!../sim/*.test.ts"], { query: "?raw", import: "default", eager: true }) as Record<string, string>;
    expect(Object.keys(files).length).toBeGreaterThan(5);
    for (const [f, src] of Object.entries(files)) {
      const code = src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
      expect(code, f).not.toMatch(/Math\.random|from ["']react|document\.|window\./);
    }
  });
});
