import { LifeState, SCHEMA_VERSION } from "../sim";
import { migrate } from "./migrate";
const KEY = "lifelong.save";

export function save(s: LifeState, store: Storage = localStorage): void {
  store.setItem(KEY, JSON.stringify(s));
}
export function load(store: Storage = localStorage): LifeState | null {
  try {
    const raw = store.getItem(KEY);
    if (!raw) return null;
    return migrate(JSON.parse(raw));
  } catch { return null; } // corrupt save => treated as no save
}
export function clear(store: Storage = localStorage) { store.removeItem(KEY); }
export { SCHEMA_VERSION };
