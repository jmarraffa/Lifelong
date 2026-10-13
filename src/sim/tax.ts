// tax.ts
import { CONFIG } from "./config";
import { bpsOf } from "./money";
const T = CONFIG.tax;

/** Annual federal income tax, single filer. */
export function incomeTax(gross: number): number {
  const taxable = Math.max(0, gross - T.standardDeduction);
  let prev = 0, tax = 0;
  for (const [top, rate] of T.brackets) {
    const slice = Math.min(taxable, top) - prev;
    if (slice <= 0) break;
    tax += bpsOf(slice, rate);
    prev = top;
  }
  return tax;
}
export function payrollTax(gross: number): number {
  return bpsOf(Math.min(gross, T.ssWageBase), T.ssRateBps) + bpsOf(gross, T.medicareBps);
}
export const annualNet = (gross: number): number => gross - incomeTax(gross) - payrollTax(gross);
