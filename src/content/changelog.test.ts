import { describe, it, expect } from "vitest";
import { CHANGELOG, currentEntry } from "./changelog";
import { BUILD_ID } from "../build";

describe("changelog", () => {
  it("has a card for the current build", () => {
    expect(currentEntry(BUILD_ID), `no changelog entry for ${BUILD_ID}`).toBeDefined();
  });
  it("every card has a title and 2-3 bullets of <= 70 chars", () => {
    for (const e of CHANGELOG) {
      expect(e.title.length).toBeGreaterThan(0);
      expect(e.bullets.length).toBeGreaterThanOrEqual(2);
      expect(e.bullets.length).toBeLessThanOrEqual(3);
      for (const b of e.bullets) expect(b.length, b).toBeLessThanOrEqual(70);
    }
  });
});
