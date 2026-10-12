import { LifeState, SCHEMA_VERSION } from "../sim";
export function migrate(data: any): LifeState | null {
  if (!data || typeof data.schemaVersion !== "number") return null;
  if (data.schemaVersion > SCHEMA_VERSION) return null; // saved by a newer build
  // while (data.schemaVersion < SCHEMA_VERSION) { data = MIGRATIONS[data.schemaVersion](data); }
  return data as LifeState;
}
