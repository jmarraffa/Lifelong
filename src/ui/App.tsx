import { useEffect, useState } from "react";
import { LifeState, newLife, advance, ageOf } from "../sim";
import { load, save, clear } from "../save/storage";

export default function App() {
  const [life, setLife] = useState<LifeState | null>(() => load());
  useEffect(() => { life ? save(life) : undefined; }, [life]);

  if (!life) return (
    <main><h1>Lifelong</h1>
      <button onClick={() => setLife(newLife(Math.floor(Math.random() * 2 ** 31)))}>Start a life at 18</button></main>
  );
  return (
    <main>
      <h1>Lifelong</h1>
      <p>Age {ageOf(life)} · Month {life.month}</p>
      <p className="cash">Cash ${life.cash.toLocaleString("en-US")}</p>
      {life.finished && <p>Life complete.</p>}
      <button disabled={life.finished} onClick={() => setLife(advance(life, 1))}>Advance month</button>
      <button disabled={life.finished} onClick={() => setLife(advance(life, 12))}>Advance year</button>
      <button onClick={() => { clear(); setLife(null); }}>New life</button>
    </main>
  );
}
