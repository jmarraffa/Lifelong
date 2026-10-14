import { useEffect, useState } from "react";
import { BUILD_ID, BUILD_LABEL, SAVE_KEY } from "../build";
import type { Career } from "../sim/config";
import { LifeState, netWorth, age } from "../sim/systems";
import { isDone } from "../sim/tick";
import { startLife, advance } from "../state/driver";
import { loadSave, SAVE_SCHEMA, PathChoice } from "../state/path";
import { sampleHistory } from "../state/sample";
import { fmtUsd } from "../state/format";
import { WhatsNewCard } from "./WhatsNewCard";
import { NetWorthChart } from "./NetWorthChart";
import { Choice18Screen } from "./Choice18Screen";
import { PromotionToast, PromoEvent } from "./PromotionToast";

const SPEED_MS: Record<number, number> = { 1: 600, 3: 200 };

const CAREER_LABEL: Record<Career, string> = {
  service: "Service & Retail", trades: "Skilled Trades", office: "Office & Admin", health: "Healthcare",
  tech: "Tech", finance: "Finance & Business", education: "Education & Public Service",
};
// Level titles from UI Copy Sheet v2 §3.3
const LEVEL_TITLES: Record<Career, string[]> = {
  service: ["Cashier", "Sales Associate", "Shift Lead", "Assistant Manager", "Store Manager"],
  trades: ["Apprentice", "Journeyman", "Licensed Tradesperson", "Crew Foreman", "Master Tradesperson"],
  office: ["Office Assistant", "Admin Coordinator", "Executive Assistant", "Office Manager", "Operations Manager"],
  health: ["Staff Nurse", "Senior Nurse", "Charge Nurse", "Nurse Manager", "Nurse Practitioner"],
  tech: ["Junior Developer", "Developer", "Senior Developer", "Staff Engineer", "Principal Engineer"],
  finance: ["Financial Analyst", "Senior Analyst", "Finance Manager", "Senior Manager", "Finance Director"],
  education: ["Teacher", "Senior Teacher", "Department Head", "Assistant Principal", "Principal"],
};
const MAJOR_LABEL: Record<string, string> = { tech: "Tech", business: "Business", health: "Health", general: "General Studies" };

function initialState(): { life: LifeState | null; notice: boolean } {
  const env = loadSave(SAVE_KEY);
  if (env) return { life: env.life, notice: false };
  let had = false;
  try { had = localStorage.getItem(SAVE_KEY) !== null; if (had) localStorage.removeItem(SAVE_KEY); } catch { /* ignore */ }
  return { life: null, notice: had };
}

function jobLine(s: LifeState): string {
  if (s.eduMonthsLeft > 0 && s.major) return `Studying ${MAJOR_LABEL[s.major]}: year ${Math.min(4, Math.floor((48 - s.eduMonthsLeft) / 12) + 1)} of 4`;
  if (s.career) return `${LEVEL_TITLES[s.career][s.level]} · ${CAREER_LABEL[s.career]} L${s.level + 1} · ${fmtUsd(s.salary)}/yr`;
  return "Between jobs";
}

export default function App() {
  const init = useState(initialState)[0];
  const [life, setLife] = useState<LifeState | null>(init.life);
  const [notice, setNotice] = useState(init.notice);
  const [choosing, setChoosing] = useState(false);
  const [speed, setSpeed] = useState(0); // 0 = paused
  const [copied, setCopied] = useState("");
  const [promos, setPromos] = useState<PromoEvent[]>([]);
  const [seen, setSeen] = useState<{ career: Career | null; level: number }>({ career: init.life?.career ?? null, level: init.life?.level ?? 0 });

  const addPromo = (e: PromoEvent) => setPromos((p) => [...p, e].slice(-3)); // cap 3 here
  const dropPromo = (id: string) => setPromos((p) => p.filter((x) => x.id !== id));

  useEffect(() => {
    if (!life) return;
    try { localStorage.setItem(SAVE_KEY, JSON.stringify({ schema: SAVE_SCHEMA, life })); } catch { /* ignore */ }
  }, [life]);

  // Promotion toasts: a level rise within the same career
  useEffect(() => {
    if (!life || !life.career) return;
    if (life.career !== seen.career) { setSeen({ career: life.career, level: life.level }); return; }
    if (life.level > seen.level) {
      addPromo({ id: `${age(life)}-${life.career}-L${life.level + 1}`, text: `Promoted: ${LEVEL_TITLES[life.career][life.level]} (L${life.level + 1})` });
      setSeen({ career: life.career, level: life.level });
    }
  }, [life?.career, life?.level]); // eslint-disable-line react-hooks/exhaustive-deps

  const finished = !!life && isDone(life);
  const running = !!life && !finished && speed > 0;
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setLife((p) => (p ? advance(p) : p)), SPEED_MS[speed]);
    return () => clearInterval(id);
  }, [running, speed]);

  function begin(choice: PathChoice) {
    const seed = Math.floor(Math.random() * 2147483646) + 1; // Math.random lives only in the UI
    const s = startLife(seed, choice);
    setSeen({ career: s.career, level: s.level });
    setPromos([]); setNotice(false); setChoosing(false);
    setLife(s); setSpeed(1);
  }
  function copyText(s: LifeState): string {
    return [`Lifelong ${BUILD_ID}`, `seed ${s.seed}`, `choices ${JSON.stringify(s.choiceLog)}`,
      `age ${age(s)}`, `net worth ${fmtUsd(netWorth(s))}`].join(" | ");
  }
  async function copyRun() {
    if (!life) return;
    const text = copyText(life);
    try { await navigator.clipboard.writeText(text); setCopied("Copied. Paste it in a message."); }
    catch { window.prompt("Copy this:", text); }
  }
  function playAgain() {
    try { localStorage.removeItem(SAVE_KEY); } catch { /* ignore */ }
    setLife(null); setSpeed(0); setCopied(""); setPromos([]); setChoosing(true);
  }

  if (!life && choosing) {
    return (<>
      <Choice18Screen onBegin={begin} />
    </>);
  }

  return (
    <>
      <main>
        <h1>Lifelong</h1>

        {!life && (
          <section className="start">
            {notice && <p className="notice" role="status"><strong>New build, new life.</strong> Your old saved life was reset.</p>}
            <WhatsNewCard />
            <p className="sub">Live a whole life, 18 to 65. Pick a path, then watch your career and money play out.</p>
            <button type="button" className="primary cta" onClick={() => setChoosing(true)}>Begin at 18</button>
          </section>
        )}

        {life && !finished && (
          <section>
            <p className="sub">Age {age(life)} · {jobLine(life)}</p>
            <p className="big">{fmtUsd(netWorth(life))}</p>
            <p className="sub">net worth</p>
            <dl>
              <div><dt>Cash</dt><dd>{fmtUsd(life.cash)}</dd></div>
              {life.loan > 0 && <div><dt>Student loan</dt><dd>{fmtUsd(-life.loan)}</dd></div>}
            </dl>
            {life.rescue && <p className="sub">Money Rescue: you ran short, so spending dropped to Frugal + Room share until cash is positive again.</p>}
            <div className="row speed" role="group" aria-label="Speed">
              {[0, 1, 3].map((v) => (
                <button key={v} type="button" aria-pressed={speed === v} className={speed === v ? "on" : ""} onClick={() => setSpeed(v)}>
                  {v === 0 ? "Pause" : `${v}×`}
                </button>
              ))}
            </div>
          </section>
        )}

        {life && finished && (
          <section>
            <p className="sub">Age 65 · {life.career ? `${LEVEL_TITLES[life.career][life.level]}, ${CAREER_LABEL[life.career]}` : ""}</p>
            <p className="big">{fmtUsd(netWorth(life))}</p>
            <p className="sub">final net worth</p>
            <NetWorthChart points={sampleHistory(life.history)} />
            {life.downshifts > 0 && <p className="sub">You ran short {life.downshifts} time{life.downshifts > 1 ? "s" : ""}, so spending dropped to Frugal + Room share until cash was positive again.</p>}
            {life.writeOffs > 0 && <p className="sub">{fmtUsd(life.writeOffs)} of overdraft debt was forgiven.</p>}
            <p className="sub">Economy only; no investing yet (alpha).</p>
            <div className="row">
              <button type="button" className="primary" onClick={copyRun}>Copy my run</button>
              <button type="button" onClick={playAgain}>Play again, new life</button>
            </div>
            {copied && <p className="sub" role="status">{copied}</p>}
          </section>
        )}
      </main>
      <PromotionToast queue={promos} onShown={dropPromo} />
      <footer className="build-label">{BUILD_LABEL}</footer>
    </>
  );
}
