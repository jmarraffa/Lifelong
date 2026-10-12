import { it, expect } from "vitest";
import { save, load } from "./storage";
import { newLife, advance } from "../sim";
const fake = (): Storage => { const m = new Map<string,string>(); return {
  getItem: k => m.get(k) ?? null, setItem: (k,v) => void m.set(k,v), removeItem: k => void m.delete(k),
  clear: () => m.clear(), key: () => null, get length() { return m.size; } } as Storage; };

it("round-trips", () => { const st = fake(); const s = advance(newLife(1), 12); save(s, st); expect(load(st)).toEqual(s); });
it("rejects corrupt and future saves", () => {
  const st = fake(); st.setItem("lifelong.save", "{bad"); expect(load(st)).toBeNull();
  st.setItem("lifelong.save", JSON.stringify({ schemaVersion: 999 })); expect(load(st)).toBeNull();
});
