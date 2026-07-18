// CableTwin rehearsal flight recorder — HUMAN-IN-THE-LOOP, observation only.
//
// Attaches to the demo browser opened by phase3/start-demo.cmd (CDP port 9230)
// and OBSERVES while the operator speaks and clicks. It never clicks, selects
// or validates on the operator's behalf.
//
// Per pass it records timestamped state transitions, canonical checkpoint
// values, console/runtime/network errors and the elapsed time from the
// incident click to the completed reset. A pass is PASS when the exact
// sequence baseline 10/10 -> incident 7/10 + "10 h 20 min" -> Service preview
// 8/10 + 838 DT -> resolved with 3 audit events -> reset 10/10 is observed
// with zero errors in <= 75 seconds.
//
// Reports: phase3/evidence/iteration-02/rehearsal-<n>.json
// Stop with Ctrl+C. Usage: node phase3/rehearse-demo.mjs [cdp-port]

import { mkdir, writeFile, readdir } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const port = Number.parseInt(process.argv[2] ?? "9230", 10);
const outDir = resolve(dirname(fileURLToPath(import.meta.url)), "evidence", "iteration-02");
const BUDGET_S = 75;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let target;
try {
  const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  target = list.find((t) => t.type === "page" && t.url.includes("127.0.0.1:4173"));
} catch {
  console.error(`No browser on CDP port ${port}. Run phase3\\start-demo.cmd first.`);
  process.exit(2);
}
if (!target) {
  console.error("Demo tab (127.0.0.1:4173) not found in the demo browser.");
  process.exit(2);
}

const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });

let id = 0;
const pending = new Map();
const errors = [];
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) {
    const { res, rej } = pending.get(m.id); pending.delete(m.id);
    m.error ? rej(new Error(m.error.message)) : res(m.result);
    return;
  }
  if (m.method === "Runtime.exceptionThrown") {
    errors.push({ t: Date.now(), kind: "exception",
      detail: m.params.exceptionDetails?.exception?.description ?? "exception" });
  }
  if (m.method === "Runtime.consoleAPICalled" && m.params.type === "error") {
    errors.push({ t: Date.now(), kind: "console.error",
      detail: m.params.args.map((a) => a.value ?? a.description ?? "").join(" ") });
  }
  if (m.method === "Network.responseReceived" && m.params.response.status >= 400) {
    errors.push({ t: Date.now(), kind: "http",
      detail: `HTTP ${m.params.response.status} ${m.params.response.url}` });
  }
};
const send = (method, params = {}) => new Promise((res, rej) => {
  id += 1; pending.set(id, { res, rej });
  ws.send(JSON.stringify({ id, method, params }));
});
await send("Runtime.enable");
await send("Network.enable");

const ev = async (expr) => {
  const r = await send("Runtime.evaluate", { expression: expr, returnByValue: true });
  return r.result?.value;
};

const snapshot = () => ev(`(() => ({
  state: document.body.dataset.simulationState,
  phasePreview: !!document.querySelector("#approve-button") && !document.querySelector("#approve-button").disabled,
  onTime: document.querySelector('[data-kpi="on-time-orders"] [data-kpi-value]')?.textContent.trim(),
  delay: document.querySelector('[data-kpi="estimated-delay"] [data-kpi-value]')?.textContent.replace(/\\s+/g, " ").trim(),
  serviceOnTime: document.querySelector('[data-strategy-card="service"] [data-metric="on-time"]')?.textContent.trim(),
  serviceCost: document.querySelector('[data-strategy-card="service"] [data-metric="cost"]')?.textContent.replace(/\\s+/g, " ").trim(),
  auditEvents: document.querySelectorAll("#audit-log li:not(.is-pending)").length,
}))()`);

await mkdir(outDir, { recursive: true });
const existing = (await readdir(outDir)).filter((f) => f.startsWith("rehearsal-")).length;
let passIndex = existing;

console.log("Flight recorder attached — OBSERVATION ONLY, it will never click.");
console.log(`Budget per pass: ${BUDGET_S}s (incident click -> completed reset).`);
console.log("Perform the journey; Ctrl+C to stop.\n");

let phase = "waiting";           // waiting -> running -> (report) -> waiting
let passLog = null;
let last = await snapshot();

const fmt = (ms) => `${(ms / 1000).toFixed(1)}s`;

for (;;) {
  await sleep(120);
  let cur;
  try { cur = await snapshot(); } catch { continue; }
  if (!cur) continue;

  if (phase === "waiting" && last?.state === "baseline" && cur.state === "incident") {
    passIndex += 1;
    errors.length = 0;
    passLog = {
      pass: passIndex, startedAt: new Date().toISOString(), t0: Date.now(),
      transitions: [{ at: 0, event: "incident", snapshot: cur }],
      checkpoints: {
        baselineOnTime: last.onTime === "10 / 10",
        incidentOnTime: cur.onTime === "7 / 10",
        incidentDelay: (cur.delay ?? "").includes("10 h 20"),
        servicePreview: false, resolvedAudit: false, resetOnTime: false,
      },
    };
    phase = "running";
    console.log(`\n[pass ${passIndex}] incident detected — timer started`);
  } else if (phase === "running") {
    const t = Date.now() - passLog.t0;
    if (cur.phasePreview && !passLog.checkpoints.servicePreview && cur.state === "incident") {
      passLog.checkpoints.servicePreview =
        cur.serviceOnTime === "8 / 10" && (cur.serviceCost ?? "").includes("838");
      passLog.transitions.push({ at: t, event: "service-preview", snapshot: cur });
      console.log(`[pass ${passIndex}] ${fmt(t)} service preview`);
    }
    if (cur.state === "resolved" && !passLog.checkpoints.resolvedAudit) {
      passLog.checkpoints.resolvedAudit = cur.auditEvents === 3;
      passLog.transitions.push({ at: t, event: "resolved", snapshot: cur });
      console.log(`[pass ${passIndex}] ${fmt(t)} approved (${cur.auditEvents} audit events)`);
    }
    if (cur.state === "baseline" && last?.state !== "baseline") {
      passLog.checkpoints.resetOnTime = cur.onTime === "10 / 10";
      passLog.transitions.push({ at: t, event: "reset", snapshot: cur });
      passLog.elapsedS = t / 1000;
      passLog.errors = [...errors];
      passLog.pass_result =
        Object.values(passLog.checkpoints).every(Boolean) &&
        passLog.errors.length === 0 &&
        passLog.elapsedS <= BUDGET_S ? "PASS" : "FAIL";
      const file = resolve(outDir, `rehearsal-${String(passIndex).padStart(2, "0")}.json`);
      await writeFile(file, `${JSON.stringify(passLog, null, 2)}\n`);
      console.log(`[pass ${passIndex}] ${fmt(t)} reset — ${passLog.pass_result}`
        + (passLog.pass_result === "FAIL"
          ? ` (checkpoints: ${JSON.stringify(passLog.checkpoints)}, errors: ${passLog.errors.length}, budget: ${BUDGET_S}s)`
          : " — report written"));
      phase = "waiting";
      passLog = null;
    }
  }
  last = cur;
}
