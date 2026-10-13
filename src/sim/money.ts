// money.ts: the only place numbers become dollars.
export const usd = (n: number): number => Math.trunc(n);                 // toward zero, whole USD
export const bpsOf = (amount: number, bps: number): number => usd((amount * bps) / 10000);
