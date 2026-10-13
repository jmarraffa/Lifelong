import { useEffect, useState } from "react";
import { CFG } from "../sim/config";
import { ShowState, newShowLife, stepMonth, parseSeed, ageAt, netWorth, copyRunText, fmtUsd, fmtAxisUsd, SHOW_SCHEMA } from "../sim/show";

const KEY = "lifelong.save";

function loadSave(): { s: ShowState | null; notice: string } {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { s: null, notice: "" };
    const d = JSON.parse(raw);
    if (d?.schemaVersion !== SHOW_SCHEMA) {
      localStorage.removeItem(KEY);
      return { s: null, notice: "Lifelong was updated, so your old saved life was reset. Start a new one!" };
    }
    return { s: d as ShowState, notice: "" };
  } catch { return { s: null, notice: "" }; }
}

function Chart({ points }: { points: number[] }) {
  const W = 320, H = 170, L = 52, B = 18, T = 8;
  const max = Math.max(1, ...points), min = Math.min(0, ...points);
  const x = (i: number) => L + (i * (W - L - 4)) / Math.max(1, points.length - 1);
  const y = (v: number) => T + ((max - v) * (H - T - B)) / (max - min || 1);
  const line = points.map((v, i) => `${x(i)},${y(v)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Net worth from age 18 to 65, ending at ${fmtUsd(points[points.length - 1])}`}>
      <line x1={L} x2={W - 4} y1={y(0)} y2={y(0)} stroke="#2a3350" />
      <text x={L - 4} y={y(max) + 4} textAnchor="end" className="ax">{fmtAxisUsd(max)}</text>
      <text x={L - 4} y={y(0) + 4} textAnchor="end" className="ax">$0</text>
      <text x={L} y={H - 4} className="ax">18</text>
      <text x={W - 4} y={H - 4} textAnchor="end" className="ax">65</text>
      <polyline points={line} fill="none" stroke="#E8B64C" strokeWidth="2.5" />
    </svg>
  );
}

export default function App() {
  const init = useState(() => loadSave())[0];
  const [life, setLife] = useState<ShowState | null>(init.s);
  const [notice, setNotice] = useState(init.notice);
  const [speed, setSpeed] = useState(0); // 0 = paused
  const [name, setName] = useState("");
  const [seedText, setSeedText] = useState("");
  const [copied, setCopied] = useState("");

  useEffect(() => { if (life) localStorage.setItem(KEY, JSON.stringify(life)); }, [life]);

  const running = !!life && !life.finished && speed > 0;
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setLife(p => (p ? stepMonth(p) : p)), CFG.speedMs[speed]);
    return () => clearInterval(id);
  }, [running, speed]);

  function start() {
    const seed = parseSeed(seedText) ?? Math.floor(Math.random() * 2147483646) + 1; // Math.random only here, in the UI
    setLife(newShowLife(name, seed)); setNotice(""); setSpeed(1);
  }
  async function copyRun() {
    if (!life) return;
    const text = copyRunText(life);
    try { await navigator.clipboard.writeText(text); setCopied("Copied. Paste it in a message."); }
    catch { window.prompt("Copy this:", text); }
  }
  function again() { localStorage.removeItem(KEY); setLife(null); setSpeed(0); setCopied(""); }

  return (
    <main>
      <h1>Lifelong</h1>
      {notice && <p className="notice" role="status">{notice}</p>}

      {!life && (
        <section>
          <p className="sub">Live a whole life, 18 to 65, and watch it compound.</p>
          <label>Your name<input value={name} maxLength={20} onChange={e => setName(e.target.value)} placeholder="You" /></label>
          <label>Seed (optional)<input value={seedText} inputMode="numeric" onChange={e => setSeedText(e.target.value)} placeholder="blank = random" /></label>
          <button className="primary" onClick={start}>Start a life at 18</button>
        </section>
      )}

      {life && !life.finished && (
        <section>
          <p className="sub">{life.name} · Age {ageAt(life.month)}</p>
          <p className="big">{fmtUsd(netWorth(life))}</p>
          <p className="sub">net worth</p>
          <dl>
            <div><dt>Cash</dt><dd>{fmtUsd(life.cash)}</dd></div>
            <div><dt>Index fund</dt><dd>{fmtUsd(life.index)}</dd></div>
          </dl>
          <div className="row" role="group" aria-label="Speed">
            {[0, 1, 3].map(v => (
              <button key={v} aria-pressed={speed === v} className={speed === v ? "on" : ""} onClick={() => setSpeed(v)}>
                {v === 0 ? "Pause" : `${v}×`}
              </button>
            ))}
          </div>
        </section>
      )}

      {life && life.finished && (
        <section>
          <p className="sub">{life.name} · Age 65</p>
          <p className="big">{fmtUsd(netWorth(life))}</p>
          <p className="sub">final net worth</p>
          <Chart points={life.history} />
          <div className="row">
            <button className="primary" onClick={copyRun}>Copy my run</button>
            <button onClick={again}>New life</button>
          </div>
          {copied && <p className="sub" role="status">{copied}</p>}
        </section>
      )}

      <footer>{CFG.build}</footer>
    </main>
  );
}
