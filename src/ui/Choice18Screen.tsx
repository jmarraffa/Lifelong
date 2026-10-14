import { useState } from 'react';
import type { PathChoice, Major } from '../state/path';

const MAJORS: { id: Major; label: string; hint: string }[] = [
  { id: 'tech', label: 'Tech', hint: 'Build software and systems. The highest pay, and it shows.' },
  { id: 'business', label: 'Business', hint: 'Money, markets and management. Opens finance careers.' },
  { id: 'health', label: 'Health', hint: 'Care for people. Steady work and low layoff risk.' },
  { id: 'general', label: 'General Studies', hint: 'Broad and flexible. Opens office and teaching careers.' },
];

export function Choice18Screen({ onBegin }: { onBegin: (c: PathChoice) => void }) {
  const [path, setPath] = useState<'work' | 'college' | null>(null);
  const [major, setMajor] = useState<Major | null>(null);
  const ready = path === 'work' || (path === 'college' && major !== null);
  const hint = !path ? 'Pick Work or College'
    : path === 'college' && !major ? 'Pick a major to continue' : '';
  return (
    <main className="screen">
      <h2>You're 18. What now?</h2>
      <p className="sub">This shapes your first years.</p>
      <div role="radiogroup" aria-label="Your path at 18" style={{ display: 'contents' }}>
        <button role="radio" aria-checked={path === 'work'} className={`card ${path === 'work' ? 'selected' : ''}`}
                onClick={() => { setPath('work'); setMajor(null); }}>
          <strong>Start working</strong><span>Earn from day one and stay debt-free. Fewer jobs, slower pay.</span>
        </button>
        <button role="radio" aria-checked={path === 'college'} className={`card ${path === 'college' ? 'selected' : ''}`}
                onClick={() => setPath('college')}>
          <strong>Go to college</strong><span>Four years of study and student loans. Better-paying jobs open up after.</span>
        </button>
      </div>
      {path === 'college' && (
        <div role="radiogroup" aria-label="Major" style={{ display: 'contents' }}>
          <h2>Pick your major</h2>
          <p className="sub">Tuition is about $12,000 a year, added to your student loan.</p>
          {MAJORS.map(m => (
            <button key={m.id} role="radio" aria-checked={major === m.id}
                    className={`card ${major === m.id ? 'selected' : ''}`} onClick={() => setMajor(m.id)}>
              <strong>{m.label}</strong><span>{m.hint}</span>
            </button>))}
        </div>)}
      <footer className="footer-cta">
        {hint && <p className="hint">{hint}</p>}
        <button className="btn-primary" disabled={!ready}
          onClick={() => onBegin(path === 'work' ? { path: 'work' } : { path: 'college', major: major! })}>
          Begin at 18
        </button>
      </footer>
    </main>);
}
