import type { Major } from "../sim/config";
import type { LifeState } from "../sim/systems";

export type { Major };
export type PathChoice = { path: "work" } | { path: "college"; major: Major };

// Save envelope for lifelong.alpha
export const SAVE_SCHEMA = "a2";
export interface SaveEnvelope { schema: typeof SAVE_SCHEMA; life: LifeState }
export function loadSave(key: string): SaveEnvelope | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.schema === SAVE_SCHEMA && parsed.life ? (parsed as SaveEnvelope) : null; // anything else = reset + notice
  } catch { return null; }
}
