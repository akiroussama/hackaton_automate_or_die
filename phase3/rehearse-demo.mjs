// CableTwin dress-rehearsal flight recorder v3 — HUMAN-IN-THE-LOOP, observation only.
// Schema cabletwin-rehearsal/3. See phase3/demo-runbook.md for the protocol.
//
// Modes:
//   --mode normal    audience clock: arm -> resolved Service audit (<=75.0s raw);
//                    a verified baseline reset within the post-clock deadline is
//                    REQUIRED before the report can be persisted as PASS.
//   --mode final     same clock; the resolved audit is revalidated immediately
//                    before persistence and LEFT VISIBLE (no reset wait).
//   --mode fallback  forced live-to-slide rehearsal timer: arm -> operator
//                    presses ENTER when the narration ends on slide 5
//                    (<=90.0s raw). Never counts toward the normal streak.
//
// Observation-only guarantee: terminal input arms/finishes human timing; the
// recorder never sends clicks, selections, keyboard input or approvals.
//
// Fail-closed: post-attach exact-root reload must be OBSERVED before arming;
// every CDP request has a finite timeout; WebSocket close rejects all pending
// requests; reload/evaluation/transition/reset/finalization timeouts persist
// INCOMPLETE and exit non-zero; every Network.loadingFailed is recorded with
// its cancelled flag (cancelled events are recorded but, explicitly, only
// non-cancelled ones fail the zeroErrors gate); errors are collected through
// attestation and the terminal state; gates and result are decided immediately
// before the single exclusive-create persistence.
//
// Human-evidence validation (summary): filename/body agreement, schema, index,
// all gates/checkpoints, raw elapsed, zero errors, exact narration revision,
// the exact attestation sentence and a resolvable recording pointer. Corrupt
// or invalid human reports are streak-breaking FAILs. Machine evidence never
// counts. A valid streak = two normal PASSes with verified resets followed by
// one final-mode PASS with the audit left visible.
//
// Usage: node phase3/rehearse-demo.mjs [--provenance human|machine-smoke]
//   [--mode normal|final|fallback] [--port 9230] [--package-root <dir>]
//   [--inactivity <s>] [--summarize-only [--evidence-dir <dir>]]

import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { existsSync, openSync, writeSync, closeSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createInterface } from "node:readline";
import { createHash } from "node:crypto";
import { execSync } from "node:child_process";
import { performance } from "node:perf_hooks";

const SCHEMA = "cabletwin-rehearsal/3";
const ATTESTATION_SENTENCE = "I performed this pass myself, speaking the narration aloud";
const NORMAL_BUDGET_S = 75.0;
const FALLBACK_BUDGET_S = 90.0;
// --reload-deadline exists for bounded adversarial testing; default 120 s.
const RESET_DEADLINE_S = 120;
const CDP_TIMEOUT_MS = 10000;
const APP_URL = "http://127.0.0.1:4173/";

const args = process.argv.slice(2);
const opt = (name, dflt) => {
  const i = args.indexOf(`--${name}`);
  return i !== -1 && args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : dflt;
};
const PROVENANCE = opt("provenance", "human");
const MODE = opt("mode", "normal");
const PORT = Number.parseInt(opt("port", "9230"), 10);
const INACTIVITY_S = Number.parseFloat(opt("inactivity", "240"));
const RELOAD_DEADLINE_S = Number.parseFloat(opt("reload-deadline", "120"));
const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const evidenceDir = resolve(opt("evidence-dir", resolve(scriptDir, "evidence", "iteration-02")));

if (!["human", "machine-smoke"].includes(PROVENANCE) || !["normal", "final", "fallback"].includes(MODE)) {
  console.error("invalid --provenance or --mode");
  process.exit(2);
}

// ------------------------------------------------------------ validation
const isValidPointer = (p) => {
  if (!p) return false;
  if (existsSync(p)) return true;
  try { const u = new URL(p); return ["http:", "https:", "file:"].includes(u.protocol); }
  catch { return false; }
};

function validateHumanReport(d, expectedIndex) {
  const problems = [];
  const req = (cond, label) => { if (!cond) problems.push(label); };
  req(d && typeof d === "object", "not an object");
  if (!d || typeof d !== "object") return { valid: false, problems };
  req(d.schema === SCHEMA, "schema");
  req(d.provenance === "human", "provenance-body");
  req(d.index === expectedIndex, "index-mismatch");
  req(["normal", "final", "fallback"].includes(d.mode), "mode");
  req(typeof d.elapsedRawS === "number" && Number.isFinite(d.elapsedRawS), "elapsedRawS");
  req(Array.isArray(d.errors), "errors-array");
  req(d.result === "PASS" || d.result === "FAIL" || d.result === "INCOMPLETE", "result");
  if (d.result === "PASS") {
    req(Array.isArray(d.errors) && d.errors.length === 0, "errors-nonzero");
    req(d.gates && Object.values(d.gates).every((g) => g === true), "gates");
    req(d.narrationSource && d.narrationSource.rev && d.narrationSource.rev !== "unavailable"
        && d.narrationSource.sha256_16 && d.narrationSource.sha256_16 !== "unavailable", "narration-provenance");
    req(d.attestation && d.attestation.statement === ATTESTATION_SENTENCE, "attestation-sentence");
    req(d.attestation && d.attestation.operator && d.attestation.operator.trim().length > 1, "attestation-operator");
    req(d.attestation && isValidPointer(d.attestation.recordingPointer), "recording-pointer");
    if (d.mode === "fallback") {
      req(d.elapsedRawS <= FALLBACK_BUDGET_S, "fallback-budget");
    } else {
      req(d.elapsedRawS <= NORMAL_BUDGET_S, "budget");
      req(d.checkpoints && d.checkpoints.armedBaseline === true && d.checkpoints.incident === true
          && d.checkpoints.comparison === true && d.checkpoints.servicePreview === true
          && d.checkpoints.resolvedServiceAudit === true, "checkpoints");
      if (d.mode === "normal") req(d.checkpoints.resetVerified === true, "reset-not-verified");
      if (d.mode === "final") req(d.checkpoints.finalAuditRevalidated === true && d.finalAuditLeftVisible === true, "final-audit");
    }
  }
  return { valid: problems.length === 0, problems };
}

async function loadAttempts(dir) {
  const attempts = { human: [], machine: [], fallback: [] };
  if (!existsSync(dir)) return attempts;
  for (const f of await readdir(dir)) {
    const m = f.match(/^(human-rehearsal|machine-smoke|fallback-rehearsal)-(\d+)\.json$/);
    if (!m) continue;
    const index = Number(m[2]);
    let d = null, parseOk = true;
    try { d = JSON.parse(await readFile(resolve(dir, f), "utf-8")); } catch { parseOk = false; }
    if (m[1] === "machine-smoke") {
      attempts.machine.push({ file: f, index, bodyClaimsHuman: d?.provenance === "human" });
      continue;
    }
    const bucket = m[1] === "human-rehearsal" ? attempts.human : attempts.fallback;
    if (!parseOk || d?.provenance !== "human") {
      bucket.push({ file: f, index, effective: "FAIL", mode: d?.mode ?? "unknown",
        invalid: true, problems: parseOk ? ["provenance-body"] : ["unparseable"] });
      continue;
    }
    const v = validateHumanReport(d, index);
    bucket.push({ file: f, index, mode: d.mode, elapsedRawS: d.elapsedRawS,
      declared: d.result, invalid: !v.valid, problems: v.problems,
      effective: v.valid && d.result === "PASS" ? "PASS" : "FAIL" });
  }
  attempts.human.sort((a, b) => a.index - b.index);
  attempts.fallback.sort((a, b) => a.index - b.index);
  return attempts;
}

function computeSummary(attempts) {
  const h = attempts.human;
  let streakOk = false;
  const tail = h.slice(-3);
  if (tail.length === 3 && tail.every((a) => a.effective === "PASS")) {
    streakOk = tail[0].mode === "normal" && tail[1].mode === "normal" && tail[2].mode === "final";
  }
  const fallbackOk = attempts.fallback.some((a) => a.effective === "PASS");
  return {
    schema: `${SCHEMA}/summary`,
    generatedAt: new Date().toISOString(),
    humanAttempts: h.map((a) => ({ file: a.file, mode: a.mode, effective: a.effective,
      elapsedRawS: a.elapsedRawS ?? null, problems: a.problems ?? [] })),
    fallbackAttempts: attempts.fallback.map((a) => ({ file: a.file, effective: a.effective,
      elapsedRawS: a.elapsedRawS ?? null, problems: a.problems ?? [] })),
    machineSmokeCount: attempts.machine.length,
    machineBodiesClaimingHuman: attempts.machine.filter((a) => a.bodyClaimsHuman).map((a) => a.file),
    normalStreakSatisfied: streakOk,
    fallbackPassSatisfied: fallbackOk,
    allHumanGatesSatisfied: streakOk && fallbackOk,
    rule: "streak = trailing normal+normal(with verified resets)+final PASSes; any invalid or FAIL human attempt breaks it; machine evidence never counts",
  };
}

async function writeSummary() {
  const summary = computeSummary(await loadAttempts(evidenceDir));
  await writeFile(resolve(evidenceDir, "session-summary.json"), `${JSON.stringify(summary, null, 2)}\n`);
  return summary;
}

if (args.includes("--summarize-only")) {
  console.log(JSON.stringify(await writeSummary(), null, 2));
  process.exit(0);
}

// ------------------------------------------------------------ preflight
const pkgRoot = resolve(opt("package-root", resolve(repoRoot, "packaging")));
async function shaOk(name) {
  try {
    const sums = (await readFile(resolve(pkgRoot, "SHA256SUMS.txt"), "utf-8")).replace(/^﻿/, "");
    const line = sums.split(/\r?\n/).find((l) => l.trim().endsWith(name));
    if (!line) return false;
    const expected = line.trim().split(/\s+/)[0].toLowerCase();
    const actual = createHash("sha256").update(await readFile(resolve(pkgRoot, name))).digest("hex");
    return actual === expected;
  } catch { return false; }
}
if (!(await shaOk("03_CableTwin_SUPCOM_Demo_2min.mp4")) || !(await shaOk("01_CableTwin_SUPCOM_Final.pdf"))) {
  console.error(`PREFLIGHT FAIL: fallback MP4/deck do not match the frozen SHA256SUMS under ${pkgRoot}`);
  console.error("Pass --package-root <dir> pointing at the accepted frozen package.");
  process.exit(2);
}

let narrationHash = "unavailable", narrationRev = "unavailable";
try {
  const outline = await readFile(resolve(repoRoot, "deck", "outline.md"), "utf-8");
  narrationHash = createHash("sha256").update(outline.split("\n").slice(201, 210).join("\n")).digest("hex").slice(0, 16);
  narrationRev = execSync("git rev-parse HEAD", { cwd: repoRoot }).toString().trim().slice(0, 12);
} catch { /* stays unavailable; a human PASS then fails validation */ }

// ------------------------------------------------------------ CDP
let target;
try {
  const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
  target = list.find((t) => t.type === "page" && t.url === APP_URL);
} catch {
  console.error(`No browser on CDP port ${PORT}. Run phase3\\start-demo.cmd first.`);
  process.exit(2);
}
if (!target) { console.error(`Exact demo tab ${APP_URL} not found.`); process.exit(2); }

const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });

let id = 0;
const pending = new Map();
const errors = [];
const cancelledLoads = [];       // recorded, explicitly non-failing
let reloadSeen = false;
let wsAlive = true;
function rejectAllPending(reason) {
  for (const [, p] of pending) { clearTimeout(p.timer); p.rej(new Error(reason)); }
  pending.clear();
}
ws.onclose = () => { wsAlive = false; rejectAllPending("CDP connection closed"); };
ws.onerror = () => { wsAlive = false; rejectAllPending("CDP connection error"); };
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) {
    const p = pending.get(m.id); pending.delete(m.id); clearTimeout(p.timer);
    m.error ? p.rej(new Error(m.error.message)) : p.res(m.result);
    return;
  }
  if (m.method === "Page.loadEventFired") reloadSeen = true;
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
  if (m.method === "Network.loadingFailed") {
    const rec = { ts: m.params.timestamp ?? null, kind: "loadingFailed",
      cancelled: !!m.params.canceled, detail: m.params.errorText };
    if (m.params.canceled) cancelledLoads.push(rec); else errors.push(rec);
  }
};
const send = (method, params = {}) => new Promise((res, rej) => {
  if (!wsAlive) { rej(new Error("CDP connection lost")); return; }
  id += 1;
  const timer = setTimeout(() => {
    if (pending.has(id)) { pending.delete(id); rej(new Error(`CDP timeout: ${method}`)); }
  }, CDP_TIMEOUT_MS);
  pending.set(id, { res, rej, timer });
  ws.send(JSON.stringify({ id, method, params }));
});
await send("Runtime.enable");
await send("Network.enable");
await send("Page.enable");

const ev = async (expr) => {
  const r = await send("Runtime.evaluate", { expression: expr, returnByValue: true });
  if (r?.exceptionDetails) throw new Error(`evaluate failed: ${r.exceptionDetails.text}`);
  return r?.result?.value;
};

const SNAPSHOT_EXPR = `(() => {
  const q = (s) => document.querySelector(s);
  const txt = (s) => q(s)?.textContent.replace(/[\\s\\u00A0\\u202F]+/g, " ").trim() ?? null;
  const card = (name) => ({
    onTime: txt('[data-strategy-card="' + name + '"] [data-metric="on-time"]'),
    cost: txt('[data-strategy-card="' + name + '"] [data-metric="cost"]'),
    changes: txt('[data-strategy-card="' + name + '"] [data-metric="changes"]'),
  });
  const rows = [...document.querySelectorAll("#audit-log li:not(.is-pending)")];
  return {
    href: location.href,
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
    lastAudit: rows.length ? rows[rows.length - 1].textContent.replace(/[\\s\\u00A0\\u202F]+/g, " ").trim() : null,
  };
})()`;

// exact-value checks (normalized full-string equality / token boundaries)
const cardExact = (c, onTime, cost, changes) =>
  c.onTime === onTime && c.cost === cost && c.changes === changes;
const serviceExact = (s) => cardExact(s.service, "8 / 10", "+ 838 DT", "3");
const comparisonExact = (s) => serviceExact(s)
  && cardExact(s.cost, "8 / 10", "+ 799 DT", "2")
  && cardExact(s.stability, "7 / 10", "+ 2 729 DT", "0");
const incidentExact = (s) => s.onTime === "7 / 10" && s.delay === "10 h 20 min" && s.exposed === "3";
const auditExact = (last) => !!last
  && /(^|[^0-9:])10:07([^0-9]|$)/.test(last)
  && last.includes("Option « Priorité service » validée")
  && /(^|[^0-9])8\/10([^0-9]|$)/.test(last);

// ------------------------------------------------------------ report io
await mkdir(evidenceDir, { recursive: true });
async function nextIndex(prefix) {
  const files = existsSync(evidenceDir) ? await readdir(evidenceDir) : [];
  const idxs = files.map((f) => f.match(new RegExp(`^${prefix}-(\\d+)\\.json$`)))
    .filter(Boolean).map((m) => Number(m[1]));
  return idxs.length ? Math.max(...idxs) + 1 : 1;
}
function persistOnce(report) {
  const prefix = report.provenance === "human"
    ? (report.mode === "fallback" ? "fallback-rehearsal" : "human-rehearsal")
    : "machine-smoke";
  const path = resolve(evidenceDir, `${prefix}-${String(report.index).padStart(2, "0")}.json`);
  const fd = openSync(path, "wx");
  writeSync(fd, `${JSON.stringify(report, null, 2)}\n`);
  closeSync(fd);
  return path;
}

const rl = PROVENANCE === "human"
  ? createInterface({ input: process.stdin, output: process.stdout })
  : null;
// machine-smoke runs are driver-driven: prompts auto-resolve (no stdin needed)
const ask = (q) => rl
  ? new Promise((r) => rl.question(q, r))
  : (console.log(`${q}[auto: machine-smoke]`), Promise.resolve(""));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const report = {
  schema: SCHEMA, provenance: PROVENANCE, mode: MODE, index: null,
  armedAt: null, budgetS: MODE === "fallback" ? FALLBACK_BUDGET_S : NORMAL_BUDGET_S,
  narrationSource: { file: "deck/outline.md", lines: "202-210", rev: narrationRev, sha256_16: narrationHash },
  packageRoot: pkgRoot, transitions: [], checkpoints: {}, cancelledLoads: [],
};

async function finalize(result, failureReason) {
  report.result = result;
  if (failureReason) report.failureReason = failureReason;
  report.errors = [...errors];
  report.cancelledLoads = [...cancelledLoads];
  if (report.result === "PASS") {
    const g = report.gates ?? {};
    g.zeroErrors = errors.length === 0;
    report.gates = g;
    if (!Object.values(g).every((x) => x === true)) {
      report.result = "FAIL";
      report.failureReason = report.failureReason ?? "gate recomputation failed at persistence";
    }
  }
  report.index = await nextIndex(report.provenance === "human"
    ? (MODE === "fallback" ? "fallback-rehearsal" : "human-rehearsal") : "machine-smoke");
  let path = null;
  try { path = persistOnce(report); }
  catch (e) { console.error(`report write refused: ${e.message}`); await writeSummary(); rl?.close(); process.exit(1); }
  console.log(`\n${report.result}${failureReason ? `: ${failureReason}` : ""} — report: ${path}`);
  const summary = await writeSummary();
  console.log(`streak(normal,normal,final): ${summary.normalStreakSatisfied} · fallback pass: ${summary.fallbackPassSatisfied}`);
  rl?.close();
  process.exit(report.result === "PASS" ? 0 : 1);
}

// ------------------------------------------------------------ session
console.log(`Flight recorder v3 — observation only · provenance=${PROVENANCE} · mode=${MODE}`);
console.log(`Fallback assets SHA-verified against frozen SHA256SUMS (${pkgRoot})`);
console.log(`Narration: deck/outline.md 202-210 @ ${narrationRev} (${narrationHash})`);

// observed post-attach reload of the exact root
console.log(`\n1. RELOAD the demo page now (Ctrl+R). Waiting for the observed load event (max ${RELOAD_DEADLINE_S}s)...`);
{
  const t = performance.now();
  while (!reloadSeen) {
    if (!wsAlive) await finalize("INCOMPLETE", "CDP lost while waiting for the reload");
    if ((performance.now() - t) / 1000 > RELOAD_DEADLINE_S) {
      await finalize("INCOMPLETE", "required post-attach reload was not observed in time");
    }
    await sleep(100);
  }
  let s;
  try { s = await ev(SNAPSHOT_EXPR); } catch (e) { await finalize("INCOMPLETE", `post-reload snapshot failed: ${e.message}`); }
  if (s.href !== APP_URL) await finalize("INCOMPLETE", `reload landed on ${s.href}, expected ${APP_URL}`);
  report.checkpoints.observedReload = true;
  console.log("   reload observed.");
}

let t0;
if (MODE === "fallback") {
  await ask("2. Press ENTER immediately before your FIRST SPOKEN WORD (fallback rehearsal)... ");
  t0 = performance.now();                        // set before any I/O
  report.armedAt = new Date().toISOString();
  console.log("ARMED — perform the live start, force the switch to deck slide 5, finish the narration there.");
  await ask("3. Press ENTER at your LAST SPOKEN WORD... ");
  const raw = (performance.now() - t0) / 1000;
  report.elapsedRawS = raw;
  report.elapsedDisplayS = +raw.toFixed(2);
  report.checkpoints.liveStartObserved = true;   // journey state at switch time is free-form by design
  report.gates = { withinBudget: raw <= FALLBACK_BUDGET_S };
  console.log(`elapsed raw ${raw}s (budget ${FALLBACK_BUDGET_S}s)`);
  report.attestation = {
    operator: (await ask("  Operator name: ")).trim(),
    statement: (await ask(`  Type exactly: ${ATTESTATION_SENTENCE}\n  > `)).trim(),
    recordingPointer: (await ask("  Continuous screen+mic recording path/URL: ")).trim(),
  };
  const attOk = report.attestation.statement === ATTESTATION_SENTENCE
    && report.attestation.operator.length > 1 && isValidPointer(report.attestation.recordingPointer);
  report.gates.attestation = PROVENANCE === "human" ? attOk : true;
  await finalize(Object.values(report.gates).every(Boolean) ? "PASS" : "FAIL",
    Object.values(report.gates).every(Boolean) ? undefined : "fallback gate failed");
}

await ask("2. Press ENTER immediately before your FIRST SPOKEN WORD to arm the audience clock... ");
t0 = performance.now();                          // FIRST statement after arm
report.armedAt = new Date().toISOString();
const mono = () => (performance.now() - t0) / 1000;

let snap;
try { snap = await ev(SNAPSHOT_EXPR); } catch (e) { await finalize("INCOMPLETE", `snapshot failed at arming: ${e.message}`); }
if (!snap || snap.state !== "baseline" || snap.onTime !== "10 / 10") {
  await finalize("FAIL", `armed state is not pristine baseline 10/10 (state=${snap?.state}, onTime=${snap?.onTime})`);
}
report.checkpoints.armedBaseline = true;
console.log(`\nARMED — audience clock running (budget ${report.budgetS}s, raw-value gate)`);

let lastTransition = mono();
let phase = "armed";
while (phase !== "resolved") {
  await sleep(100);
  if (!wsAlive) await finalize("INCOMPLETE", "CDP connection lost mid-pass");
  if (mono() - lastTransition > INACTIVITY_S) await finalize("INCOMPLETE", `inactivity timeout (${INACTIVITY_S}s)`);
  let s;
  try { s = await ev(SNAPSHOT_EXPR); } catch (e) { await finalize("INCOMPLETE", `snapshot failed mid-pass: ${e.message}`); }
  if (!s || typeof s !== "object" || !("state" in s)) await finalize("INCOMPLETE", "malformed snapshot");

  if (phase === "armed" && s.state === "incident") {
    report.checkpoints.incident = incidentExact(s);
    report.checkpoints.comparison = comparisonExact(s);
    report.transitions.push({ atRawS: mono(), event: "incident", snapshot: s });
    console.log(`[${mono().toFixed(1)}s] incident ${report.checkpoints.incident ? "OK" : "MISMATCH"} · comparison ${report.checkpoints.comparison ? "OK" : "MISMATCH"}`);
    phase = "incident"; lastTransition = mono();
    if (!report.checkpoints.incident || !report.checkpoints.comparison) {
      await finalize("FAIL", "incident/comparison exact-value checkpoint failed");
    }
  } else if (phase === "incident" && s.approveEnabled) {
    const ok = s.serviceSelected && !s.costSelected && !s.stabilitySelected && serviceExact(s);
    report.checkpoints.servicePreview = ok;
    report.transitions.push({ atRawS: mono(), event: "preview", snapshot: s });
    console.log(`[${mono().toFixed(1)}s] preview — selected: ${s.serviceSelected ? "Service" : s.costSelected ? "Cost" : s.stabilitySelected ? "Stability" : "none"} ${ok ? "OK" : "FAIL"}`);
    phase = "preview"; lastTransition = mono();
    if (!ok) await finalize("FAIL", "service preview checkpoint failed (wrong strategy or non-exact values)");
  } else if ((phase === "preview") && s.state === "resolved") {
    const raw = mono();
    report.elapsedRawS = raw;
    report.elapsedDisplayS = +raw.toFixed(2);
    const ok = s.serviceSelected && s.auditCount === 3 && auditExact(s.lastAudit);
    report.checkpoints.resolvedServiceAudit = ok;
    report.transitions.push({ atRawS: raw, event: "resolved", snapshot: s });
    console.log(`[${raw.toFixed(1)}s] resolved ${ok ? "OK" : "FAIL"} — AUDIENCE CLOCK STOPPED (raw ${raw}s)`);
    phase = "resolved"; lastTransition = mono();
    if (!ok) await finalize("FAIL", "resolved checkpoint failed (not the exact Service audit)");
  }
}

report.gates = { allCheckpoints: true, withinBudget: report.elapsedRawS <= NORMAL_BUDGET_S };
console.log(`provisional: ${report.gates.withinBudget ? "within budget" : "OVER budget"} (raw ${report.elapsedRawS}s vs ${NORMAL_BUDGET_S}s) — result is decided at persistence`);

if (MODE === "normal") {
  console.log(`Now click Recommencer — verifying the baseline reset (max ${RESET_DEADLINE_S}s, outside the audience clock)...`);
  const tReset = performance.now();
  for (;;) {
    await sleep(120);
    if (!wsAlive) await finalize("INCOMPLETE", "CDP lost while verifying the reset");
    if ((performance.now() - tReset) / 1000 > RESET_DEADLINE_S) {
      await finalize("FAIL", "reset was not verified within the post-clock deadline");
    }
    let s;
    try { s = await ev(SNAPSHOT_EXPR); } catch (e) { await finalize("INCOMPLETE", `snapshot failed during reset wait: ${e.message}`); }
    if (s?.state === "baseline") {
      report.checkpoints.resetVerified = s.onTime === "10 / 10";
      if (!report.checkpoints.resetVerified) await finalize("FAIL", "reset did not restore 10/10");
      console.log("reset verified: 10 / 10.");
      break;
    }
  }
  report.gates.resetVerified = true;
} else { // final mode
  let s;
  try { s = await ev(SNAPSHOT_EXPR); } catch (e) { await finalize("INCOMPLETE", `final revalidation snapshot failed: ${e.message}`); }
  const still = s?.state === "resolved" && s.serviceSelected && s.auditCount === 3 && auditExact(s.lastAudit);
  report.checkpoints.finalAuditRevalidated = still;
  report.finalAuditLeftVisible = true;
  if (!still) await finalize("FAIL", "final-mode revalidation failed: resolved Service audit no longer visible");
  console.log("final mode: resolved audit revalidated and LEFT VISIBLE for Q&A (no reset wait).");
}

if (PROVENANCE === "human") {
  console.log("\nOperator attestation:");
  report.attestation = {
    operator: (await ask("  Operator name: ")).trim(),
    statement: (await ask(`  Type exactly: ${ATTESTATION_SENTENCE}\n  > `)).trim(),
    recordingPointer: (await ask("  Continuous screen+mic recording path/URL: ")).trim(),
  };
  report.gates.attestation = report.attestation.statement === ATTESTATION_SENTENCE
    && report.attestation.operator.length > 1 && isValidPointer(report.attestation.recordingPointer);
} else {
  report.gates.attestation = true;
}

await finalize(Object.values(report.gates).every(Boolean) && errors.length === 0 ? "PASS" : "FAIL",
  undefined);
