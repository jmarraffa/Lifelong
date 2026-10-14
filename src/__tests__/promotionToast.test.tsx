// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, cleanup } from '@testing-library/react';
import { useState } from 'react';
import { PromotionToast, TOAST_MS, type PromoEvent } from '../ui/PromotionToast';

beforeEach(() => vi.useFakeTimers());
afterEach(() => { cleanup(); vi.useRealTimers(); });

describe('PromotionToast', () => {
  it('shows, then dismisses after 4 s and calls onShown once', () => {
    const onShown = vi.fn();
    render(<PromotionToast queue={[{ id: 'a', text: 'Promoted to L2' }]} onShown={onShown} />);
    expect(screen.getByRole('status').textContent).toBe('Promoted to L2');
    act(() => { vi.advanceTimersByTime(TOAST_MS - 1); });
    expect(screen.queryByRole('status')).not.toBeNull();       // not early
    act(() => { vi.advanceTimersByTime(1); });
    expect(onShown).toHaveBeenCalledTimes(1);
    expect(onShown).toHaveBeenCalledWith('a');
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('survives parent re-renders (the P0 regression) and walks a queue of 3', () => {
    const shown: string[] = [];
    const initial: PromoEvent[] = [1, 2, 3].map(n => ({ id: `p${n}`, text: `Promo ${n}` }));
    function Host() {
      const [q, setQ] = useState(initial);
      const [, bump] = useState(0);
      (globalThis as any).__bump = () => bump(n => n + 1);
      return <PromotionToast queue={q} onShown={id => { shown.push(id); setQ(x => x.filter(e => e.id !== id)); }} />;
    }
    render(<Host />);
    for (let i = 0; i < 3; i++) {
      act(() => { (globalThis as any).__bump(); });             // forced re-render mid-toast
      act(() => { vi.advanceTimersByTime(2000); });
      act(() => { (globalThis as any).__bump(); });
      act(() => { vi.advanceTimersByTime(2000); });
    }
    expect(shown).toEqual(['p1', 'p2', 'p3']);
    expect(screen.queryByRole('status')).toBeNull();
  });
});
