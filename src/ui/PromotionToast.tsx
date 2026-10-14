import { useEffect, useRef, useState } from 'react';

export interface PromoEvent { id: string; text: string }
export const TOAST_MS = 4000;

export function PromotionToast({ queue, onShown }: { queue: PromoEvent[]; onShown: (id: string) => void }) {
  const [current, setCurrent] = useState<PromoEvent | null>(null);
  const shownRef = useRef(onShown);
  shownRef.current = onShown;
  const doneRef = useRef(new Set<string>());         // ids already shown: never re-show one, even if the caller is slow to drop it
  const head = queue.find((e) => !doneRef.current.has(e.id)) ?? null;   // caller caps queue at 3 when adding

  // 1) pick the next toast when idle
  useEffect(() => { if (!current && head) setCurrent(head); }, [current, head]);

  // 2) timer keyed to the toast id only
  useEffect(() => {
    if (!current) return;
    const id = current.id;
    const t = setTimeout(() => { doneRef.current.add(id); setCurrent(null); shownRef.current(id); }, TOAST_MS);
    return () => clearTimeout(t);
  }, [current?.id]);                                 // eslint-disable-line react-hooks/exhaustive-deps

  if (!current) return null;
  return <div className="toast" role="status" aria-live="polite">{current.text}</div>;
}
