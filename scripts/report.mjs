import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
mkdirSync("report", { recursive: true });
const read = (f) => (existsSync(f) ? JSON.parse(readFileSync(f, "utf8")) : null);
const h = read("report/harness.json"), t = read("report/tests.json"), c = read("report/calibration.json");
const esc = (s) => String(s).replace(/[&<>]/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[m]));
const sha = process.env.GITHUB_SHA?.slice(0, 7) ?? "local";
const rows = h ? Object.entries(h.bots).map(([k, v]) =>
  `<tr><td>${k}</td><td>$${v.p5.toLocaleString()}</td><td>$${v.p50.toLocaleString()}</td><td>$${v.p95.toLocaleString()}</td><td>${v.wentNegativeCash}</td></tr>`).join("") : "";
const html = `<!doctype html><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1">
<title>Lifelong report</title><style>body{font:16px system-ui;background:#0E1320;color:#eee;padding:16px}td,th{padding:4px 10px;border-bottom:1px solid #333}h1,h2{color:#E8B64C}</style>
<h1>Lifelong build report</h1><p>Commit ${sha}, generated ${new Date().toISOString()}</p>
<h2>Unit tests</h2><p>${t ? `${t.numPassedTests}/${t.numTotalTests} passed` : "no data"}</p>
<h2>1,000-life bot harness</h2>${h ? `<p>Determinism: ${h.determinismOk ? "OK" : "FAIL"}</p><table><tr><th>Bot</th><th>P5</th><th>P50</th><th>P95</th><th>Cash&lt;0</th></tr>${rows}</table>` : "<p>no data</p>"}
<h2>10,000-life index calibration</h2><pre>${c ? esc(JSON.stringify(c, null, 2)) : "pending: Market system lands v0.5 (10-31)"}</pre>
<p><a href=harness.json>harness.json</a> · <a href=tests.json>tests.json</a></p>`;
writeFileSync("report/index.html", html);
