// CableTwin dress-rehearsal flight recorder — HUMAN-IN-THE-LOOP, observation only.
//
// The recorder ATTACHES FIRST, then the operator reloads the page, then ARMS
// the audience clock from the terminal immediately before the first spoken
// word. It observes through CDP and never sends clicks, selections, keyboard
// input or approval commands to the application.
//
// Audience clock (monotonic, performance.now):
//   armed  -> first spoken word of the approved narration
//            (deck/outline.md lines 202-210, copied in phase3/demo-runbook.md)
//   stop   -> resolved SERVICE audit visibly complete
//   gate   -> elapsed <= 75.0 s
// Reset to 10/10 is verified AFTER the report, outside the audience clock.
//
// Strategy-specific checkpoints (a Cost or Stability journey must FAIL):
//   armed baseline    10 / 10
//   incident          7 / 10 · "10 h 20 min" · exactly 3 exposed orders
//   comparison        Service 8/10 +838 DT 3 · Cost 8/10 +799 DT 2 ·
//                     Stability 7/10 +2 729 DT 0
//   service preview   button[data-strategy="service"][aria-pressed="true"],
//                     approval enabled, Service values unchanged
//   resolved          Service still selected, state resolved, exactly 3
//                     non-pending audit rows, final row contains 10:07,
//                     "Priorité service" and 8/10
//
// Errors fail closed: every Runtime.exceptionThrown, console error, HTTP>=400
// and Network.loadingFailed from attach through report completion is recorded;
// any error, WebSocket loss, evaluation failure, malformed snapshot or
// inactivity timeout produces a persisted FAIL/INCOMPLETE report and a
// non-zero exit.
//
// Provenance: --provenance human (default) | machine-smoke. Machine smoke
// reports use a separate filename/schema and can never satisfy the human
// streak. Human reports require operator attestation and a pointer to the
// continuous screen+microphone recording.
//
// Reports: phase3/evidence/iteration-02/human-rehearsal-NN.json
//          phase3/evidence/iteration-02/machine-smoke-NN.json
//          phase3/evidence/iteration-02/session-summary.json
// Index NN = parsed max + 1; overwrite refused (wx).
//
// Usage: node phase3/rehearse-demo.mjs
//          [--provenance human|machine-smoke] [--port 9230]
//          [--package-root <dir>] [--inactivity <s>]
//          [--summarize-only [--evidence-dir <dir>]]

import { mkdir, writeFile, readdir, readFile } from "node:fs/promises";
import { existsSync, openSync, writeSync, closeSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createInterface } from "node:readline";
import { createHash } from "node:crypto";
import { execSync } from "node:child_process";
import { performance } from "node:perf_hooks";

const args = process.argv.slice(2);
const opt = (name, dflt) => {
  const i = args.indexOf(`--${name}`);
  return i !== -1 && args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : dflt;
};
const PROVENANCE = opt("provenance", "human");
const PORT = Number.parseInt(opt("port", "9230"), 10);
const INACTIVITY_S = Number.parseFloat(opt("inactivity", "240"));
const BUDGET_S = 75.0;
const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const evidenceDir = resolve(opt("evidence-dir", resolve(scriptDir, "evidence", "iteration-02")));

if (!["human", "machine-smoke"].includes(PROVENANCE)) {
  console.error("--provenance must be human or machine-smoke");
  process.exit(2);
}

// ---------------------------------------------------------------- summary
function computeSummary(reports) {
  const human = reports
    .filter((r) => r.provenance === "human")
    .sort((a, b) => a.index - b.index);
  let streak = 0;
  for (let i = human.length - 1; i >= 0; i -= 1) {
    if (human[i].result === "PASS") streak += 1;
    else break;
  }
  return {
    generatedAt: new Date().toISOString(),
    humanAttempts: human.map((r) => ({ index: r.index, result: r.result, elapsedS: r.elapsedS ?? null })),
    machineSmokeCount: reports.filter((r) => r.provenance === "machine-smoke").length,
    trailingConsecutiveHumanPasses: streak,
    acceptanceStreakSatisfied: streak >= 3,
    note: "Only human-provenance reports count; any human FAIL resets the streak.",
  };
}

async function loadReports(dir) {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const f of await readdir(dir)) {
    const m = f.match(/^(human-rehearsal|machine-smoke)-(\d+)\.json$/);
    if (!m) continue;
    try {
      const d = JSON.parse(await readFile(resolve(dir, f), "utf-8"));
      out.push({ index: Number(m[2]), provenance: d.provenance, result: d.result, elapsedS: d.elapsedS });
    } catch { out.push({ index: Number(m[2]), provenance: "unparseable", result: "FAIL" }); }
  }
  return out;
}

async function writeSummary() {
  const summary = computeSummary(await loadReports(evidenceDir));
  await writeFile(resolve(evidenceDir, "session-summary.json"), `${JSON.stringify(summary, null, 2)}\n`);
  return summary;
}

if (args.includes("--summarize-only")) {
  const s = await writeSummary();
  console.log(JSON.stringify(s, null, 2));
  process.exit(0);
}

// ---------------------------------------------------------------- preflight
const pkgRoot = resolve(opt("package-root", resolve(repoRoot, "packaging")));
const mp4 = resolve(pkgRoot, "03_CableTwin_SUPCOM_Demo_2min.mp4");
const pdf = resolve(pkgRoot, "01_CableTwin_SUPCOM_Final.pdf");
async function magicOk(path, magic, offset = 0) {
  try {
    const buf = await readFile(path);
    return buf.length > 1000 && buf.subarray(offset, offset + magic.length).toString("latin1").includes(magic);
  } catch { return false; }
}
if (!(await magicOk(mp4, "ftyp", 4)) || !(await magicOk(pdf, "%PDF"))) {
  console.error(`PREFLIGHT FAIL: fallback assets not resolvable/openable under ${pkgRoot}`);
  console.error("Pass --package-root <dir> pointing at the frozen package (mp4 + deck pdf).");
  process.exit(2);
}

// narration provenance
let narrationHash = "unavailable", narrationRev = "unavailable";
try {
  const outline = await readFile(resolve(repoRoot, "deck", "outline.md"), "utf-8");
  const narration = outline.split("\n").slice(201, 210).join("\n");
  narrationHash = createHash("sha256").update(narration).digest("hex").slice(0, 16);
  narrationRev = execSync("git rev-parse HEAD", { cwd: repoRoot }).toString().trim().slice(0, 12);
} catch { /* recorded as unavailable */ }

// ---------------------------------------------------------------- attach
let target;
try {
  const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
  target = list.find((t) => t.type === "page" && t.url === "http://127.0.0.1:4173/");
} catch {
  console.error(`No browser on CDP port ${PORT}. Run phase3\\start-demo.cmd first.`);
  process.exit(2);
}
if (!target) {
  console.error("Exact demo tab http://127.0.0.1:4173/ not found.");
  process.exit(2);
}

const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });

let id = 0;
const pending = new Map();
const errors = [];               // retained from attach through report completion
let wsAlive = true;
ws.onclose = () => { wsAlive = false; };
ws.onerror = () => { wsAlive = false; };
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) {
    const { res, rej } = pending.get(m.id); pending.delete(m.id);
    m.error ? rej(new Error(m.error.message)) : res(m.result);
    return;
  }
  if (m.method === "Runtime.exceptionThrown") {
    errors.push({ ts: m.params.timestamp ?? null, kind: "exception",
      detail: m.params.exceptionDetails?.exception?.description ?? "exception" });
  }
  if (m.method === "Runtime.consoleAPICalled" && m.params.type === "error") {
    errors.push({ ts: m.params.timestamp ?? null, kind: "console.error",
      detail: m.params.args.map((a) => a.value ?? a.description ?? "").join(" ") });
  }
  if (m.method === "Network.responseReceived" && m.params.response.status >= 400) {
    errors.push({ ts: m.params.timestamp ?? null, kind: "http",
      detail: `HTTP ${m.params.response.status} ${m.params.response.url}` });
  }
  if (m.method === "Network.loadingFailed" && !m.params.canceled) {
    errors.push({ ts: m.params.timestamp ?? null, kind: "loadingFailed",
      detail: m.params.errorText });
  }
};
const send = (method, params = {}) => new Promise((res, rej) => {
  if (!wsAlive) { rej(new Error("CDP connection lost")); return; }
  id += 1; pending.set(id, { res, rej });
  ws.send(JSON.stringify({ id, method, params }));
});
await send("Runtime.enable");
await send("Network.enable");

const ev = async (expr) => {
  const r = await send("Runtime.evaluate", { expression: expr, returnByValue: true });
  if (r?.exceptionDetails) throw new Error(`evaluate failed: ${r.exceptionDetails.text}`);
  return r?.result?.value;
};

const SNAPSHOT_EXPR = `(() => {
  const q = (s) => document.querySelector(s);
  const txt = (s) => q(s)?.textContent.replace(/\\s+/g, " ").trim() ?? null;
  const card = (name) => ({
    onTime: txt('[data-strategy-card="' + name + '"] [data-metric="on-time"]'),
    cost: txt('[data-strategy-card="' + name + '"] [data-metric="cost"]'),
    changes: txt('[data-strategy-card="' + name + '"] [data-metric="changes"]'),
  });
  const rows = [...document.querySelectorAll("#audit-log li:not(.is-pending)")];
  return {
    state: document.body.dataset.simulationState ?? null,
    onTime: txt('[data-kpi="on-time-orders"] [data-kpi-value]'),
    delay: txt('[data-kpi="estimated-delay"] [data-kpi-value]'),
    exposed: txt('[data-kpi="at-risk-orders"] [data-kpi-value]'),
    service: card("service"), cost: card("cost"), stability: card("stability"),
    serviceSelected: !!q('button[data-strategy="service"][aria-pressed="true"]'),
    costSelected: !!q('button[data-strategy="cost"][aria-pressed="true"]'),
    stabilitySelected: !!q('button[data-strategy="stability"][aria-pressed="true"]'),
    approveEnabled: !!q("#approve-button") && !q("#approve-button").disabled,
    auditCount: rows.length,
    lastAudit: rows.length ? rows[rows.length - 1].textContent.replace(/\\s+/g, " ").trim() : null,
  };
})()`;

const serviceCardOk = (s) =>
  s.service.onTime === "8 / 10" && (s.service.cost ?? "").includes("838") && s.service.changes === "3";
const comparisonOk = (s) =>
  serviceCardOk(s) &&
  s.cost.onTime === "8 / 10" && (s.cost.cost ?? "").includes("799") && s.cost.changes === "2" &&
  s.stability.onTime === "7 / 10" && (s.stability.cost ?? "").includes("2 729") && s.stability.changes === "0";

// ---------------------------------------------------------------- report io
await mkdir(evidenceDir, { recursive: true });
async function nextIndex() {
  const reports = await loadReports(evidenceDir);
  return reports.length ? Math.max(...reports.map((r) => r.index)) + 1 : 1;
}
function persistReport(report) {
  const prefix = report.provenance === "human" ? "human-rehearsal" : "machine-smoke";
  const path = resolve(evidenceDir, `${prefix}-${String(report.index).padStart(2, "0")}.json`);
  const fd = openSync(path, "wx");           // refuse overwrite
  writeSync(fd, `${JSON.stringify(report, null, 2)}\n`);
  closeSync(fd);
  return path;
}

const rl = createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((r) => rl.question(q, r));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function failOut(report, reason) {
  report.result = report.result ?? "FAIL";
  report.failureReason = reason;
  report.errors = [...errors];
  try {
    const p = persistReport(report);
    console.error(`\n${report.result}: ${reason}\nreport: ${p}`);
  } catch (e) {
    console.error(`\n${report.result}: ${reason} (report write also failed: ${e.message})`);
  }
  await writeSummary();
  process.exit(1);
}

// ---------------------------------------------------------------- session
console.log(`Flight recorder attached (observation only) — provenance: ${PROVENANCE}`);
console.log(`Fallback preflight OK (package root: ${pkgRoot})`);
console.log(`Narration source: deck/outline.md lines 202-210 @ ${narrationRev} (sha ${narrationHash})`);
console.log("\n1. RELOAD the demo page now (Ctrl+R) so errors are captured from a clean load.");
await ask("2. Press ENTER immediately before your FIRST SPOKEN WORD to arm the audience clock... ");

const index = await nextIndex();
const report = {
  schema: "cabletwin-rehearsal/2",
  provenance: PROVENANCE,
  index,
  armedAt: new Date().toISOString(),
  budgetS: BUDGET_S,
  narrationSource: { file: "deck/outline.md", lines: "202-210", rev: narrationRev, sha256_16: narrationHash },
  packageRoot: pkgRoot,
  transitions: [],
  checkpoints: {
    armedBaseline: false, incident: false, comparison: false,
    servicePreview: false, resolvedServiceAudit: false, resetAfterReport: false,
  },
};

let snap;
try { snap = await ev(SNAPSHOT_EXPR); } catch (e) { await failOut(report, `snapshot failed at arming: ${e.message}`); }
if (!snap || snap.state !== "baseline" || snap.onTime !== "10 / 10") {
  await failOut(report, `armed state is not pristine baseline 10/10 (state=${snap?.state}, onTime=${snap?.onTime})`);
}
report.checkpoints.armedBaseline = true;
const t0 = performance.now();
const mono = () => (performance.now() - t0) / 1000;
console.log(`\n[${PROVENANCE} pass ${index}] ARMED — audience clock running (budget ${BUDGET_S}s)`);

let lastTransition = mono();
let phase = "armed";   // armed -> incident -> preview -> resolved(stop clock)
let elapsedS = null;

while (phase !== "resolved") {
  await sleep(100);
  if (!wsAlive) await failOut({ ...report, result: "INCOMPLETE" }, "CDP connection lost mid-pass");
  if (mono() - lastTransition > INACTIVITY_S) {
    await failOut({ ...report, result: "INCOMPLETE" }, `inactivity timeout (${INACTIVITY_S}s without a state transition)`);
  }
  let s;
  try { s = await ev(SNAPSHOT_EXPR); } catch (e) {
    await failOut({ ...report, result: "INCOMPLETE" }, `snapshot failed mid-pass: ${e.message}`);
  }
  if (!s || typeof s !== "object" || !("state" in s)) {
    await failOut({ ...report, result: "INCOMPLETE" }, "malformed snapshot");
  }

  if (phase === "armed" && s.state === "incident") {
    const ok = s.onTime === "7 / 10" && (s.delay ?? "").includes("10 h 20") && s.exposed === "3";
    report.checkpoints.incident = ok;
    report.checkpoints.comparison = comparisonOk(s);
    report.transitions.push({ atS: +mono().toFixed(2), event: "incident", ok, snapshot: s });
    console.log(`[${mono().toFixed(1)}s] incident ${ok ? "OK" : "MISMATCH"} · comparison ${report.checkpoints.comparison ? "OK" : "MISMATCH"}`);
    phase = "incident"; lastTransition = mono();
    if (!ok || !report.checkpoints.comparison) await failOut(report, "incident/comparison checkpoint mismatch");
  } else if (phase === "incident" && s.approveEnabled) {
    const ok = s.serviceSelected && !s.costSelected && !s.stabilitySelected && serviceCardOk(s);
    report.checkpoints.servicePreview = ok;
    report.transitions.push({ atS: +mono().toFixed(2), event: "preview", ok, snapshot: s });
    console.log(`[${mono().toFixed(1)}s] preview — selected: ${s.serviceSelected ? "Service" : s.costSelected ? "Cost" : s.stabilitySelected ? "Stability" : "none"} ${ok ? "OK" : "FAIL"}`);
    phase = "preview"; lastTransition = mono();
    if (!ok) await failOut(report, "service preview checkpoint failed (wrong strategy selected or values drifted)");
  } else if ((phase === "preview" || phase === "incident") && s.state === "resolved") {
    elapsedS = +mono().toFixed(2);
    const last = s.lastAudit ?? "";
    const ok = s.serviceSelected && s.auditCount === 3 &&
      last.includes("10:07") && last.includes("Priorité service") && last.includes("8/10");
    report.checkpoints.resolvedServiceAudit = ok;
    report.transitions.push({ atS: elapsedS, event: "resolved", ok, snapshot: s });
    console.log(`[${elapsedS}s] resolved — audit "${last.slice(0, 60)}..." ${ok ? "OK" : "FAIL"} — AUDIENCE CLOCK STOPPED`);
    phase = "resolved"; lastTransition = mono();
    if (!ok) await failOut(report, "resolved checkpoint failed (not a Service approval with the canonical audit row)");
  }
}

report.elapsedS = elapsedS;
report.errors = [...errors];
const gates = {
  allCheckpoints: report.checkpoints.armedBaseline && report.checkpoints.incident &&
    report.checkpoints.comparison && report.checkpoints.servicePreview &&
    report.checkpoints.resolvedServiceAudit,
  zeroErrors: errors.length === 0,
  withinBudget: elapsedS <= BUDGET_S,
};
report.gates = gates;
report.result = gates.allCheckpoints && gates.zeroErrors && gates.withinBudget ? "PASS" : "FAIL";

if (PROVENANCE === "human") {
  console.log("\nOperator attestation (required for a human report):");
  report.attestation = {
    operator: (await ask("  Your name: ")).trim(),
    statement: (await ask('  Type "I performed this pass myself, speaking the narration aloud": ')).trim(),
    recordingPointer: (await ask("  Path/URL of the continuous screen+mic recording of this session: ")).trim(),
  };
  if (!report.attestation.operator || !report.attestation.recordingPointer ||
      !/performed this pass myself/i.test(report.attestation.statement)) {
    report.result = "FAIL";
    report.failureReason = "incomplete operator attestation";
  }
}

let reportPath;
try { reportPath = persistReport(report); }
catch (e) { console.error(`report write refused (${e.message}) — index collision, not overwriting`); await writeSummary(); process.exit(1); }

console.log(`\n${report.result} — ${elapsedS}s (budget ${BUDGET_S}s) — errors: ${errors.length}`);
console.log(`report: ${reportPath}`);
console.log("\nAudit stays on screen for Q&A. Reset ONLY when ready for the next pass;");
console.log("the recorder now waits (outside the audience clock) to verify the reset...");

for (;;) {
  await sleep(150);
  if (!wsAlive) { console.error("CDP lost while waiting for reset; reset unverified."); break; }
  let s;
  try { s = await ev(SNAPSHOT_EXPR); } catch { continue; }
  if (s?.state === "baseline") {
    const ok = s.onTime === "10 / 10";
    report.checkpoints.resetAfterReport = ok;
    console.log(`reset verified: ${ok ? "10 / 10 OK" : "MISMATCH"}`);
    break;
  }
}

const summary = await writeSummary();
console.log(`streak: ${summary.trailingConsecutiveHumanPasses} consecutive human PASS(es); acceptance ${summary.acceptanceStreakSatisfied ? "SATISFIED" : "not yet satisfied"}`);
rl.close();
process.exit(report.result === "PASS" ? 0 : 1);
