import { useState } from "react";
import { BUILD_ID, SEEN_KEY } from "../build";
import { currentEntry } from "../content/changelog";

function readSeen(): string | null {
  try { return localStorage.getItem(SEEN_KEY); } catch { return null; }
}

export function WhatsNewCard() {
  const entry = currentEntry(BUILD_ID);
  const [seen, setSeen] = useState<string | null>(readSeen());
  if (!entry || seen === BUILD_ID) return null;
  const dismiss = () => {
    try { localStorage.setItem(SEEN_KEY, BUILD_ID); } catch { /* private mode: ignore */ }
    setSeen(BUILD_ID);
  };
  return (
    <section className="card whatsnew" aria-label="What's new">
      <h2>{entry.title}</h2>
      <ul>{entry.bullets.map((b) => <li key={b}>{b}</li>)}</ul>
      <button type="button" className="primary" onClick={dismiss}>Got it</button>
    </section>
  );
}
