// Iteration-1 hard-gate verifier for the public CableTwin Pages deployment.
//
// Usage: node phase3/verify-live-pages.mjs https://<user>.github.io/<repo>/
//
// For desktop 1920x1080 AND mobile 390x844 it runs the complete journey,
// asserts canonical UI metrics, collects console exceptions / page errors /
// failed requests, enforces same-origin traffic, checks horizontal overflow,
// measures the six journey controls (>= 40x40 CSS px hard gate on mobile),
// writes machine-readable results + one screenshot per viewport to
// phase3/evidence/iteration-01/, and exits non-zero on any failed gate.
// Dependency-free; Node >= 22 and a local Chromium-based browser.

import { spawn } from "node:child_process";
import { mkdir, writeFile, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";

const url = process.argv[2];
if (!url || !url.startsWith("https://")) {
  console.error("usage: node phase3/verify-live-pages.mjs <https-pages-url>");
  process.exit(2);
}
const origin = new URL(url).origin;
const outDir = resolve(dirname(fileURLToPath(import.meta.url)), "evidence", "iteration-01");

const browserPath = [
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  `${process.env.LOCALAPPDATA}\\Microsoft\\Edge\\Application\\msedge.exe`,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "/usr/bin/google-chrome", "/usr/bin/chromium-browser",
].find((p) => existsSync(p));
if (!browserPath) { console.error("no Chromium-based browser found"); process.exit(2); }

const debugPort = 9228;
const profileDir = resolve(tmpdir(), `it1-verify-${Date.now()}`);
const browser = spawn(browserPath, [
  "--headless=new", `--remote-debugging-port=${debugPort}`,
  `--user-data-dir=${profileDir}`, "--no-first-run", "--hide-scrollbars",
  "--force-prefers-reduced-motion", "about:blank",
], { stdio: "ignore" });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let wsUrl;
for (let i = 0; i < 50 && !wsUrl; i += 1) {
  try { wsUrl = (await (await fetch(`http://127.0.0.1:${debugPort}/json/version`)).json()).webSocketDebuggerUrl; }
  catch { await sleep(200); }
}
const ws = new WebSocket(wsUrl);
await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });

let id = 0;
const pending = new Map();
const state = { consoleExceptions: [], pageErrors: [], failedRequests: [], requests: [], requestIdToUrl: new Map() };
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) {
    const { res, rej } = pending.get(m.id); pending.delete(m.id);
    m.error ? rej(new Error(m.error.message)) : res(m.result);
    return;
  }
  if (m.method === "Runtime.exceptionThrown") {
    state.consoleExceptions.push(m.params.exceptionDetails?.exception?.description ?? "exception");
  }
  if (m.method === "Log.entryAdded" && m.params.entry.level === "error") {
    state.pageErrors.push(`${m.params.entry.source}: ${m.params.entry.text}`);
  }
  if (m.method === "Network.requestWillBeSent") {
    state.requests.push(m.params.request.url);
    state.requestIdToUrl.set(m.params.requestId, m.params.request.url);
  }
  if (m.method === "Runtime.consoleAPICalled" && m.params.type === "error") {
    state.consoleExceptions.push(
      `console.error: ${m.params.args.map((a) => a.value ?? a.description ?? "").join(" ")}`);
  }
  if (m.method === "Network.loadingFailed" && !m.params.canceled) {
    state.failedRequests.push(`${m.params.errorText} ${state.requestIdToUrl.get(m.params.requestId) ?? ""}`);
  }
  if (m.method === "Network.responseReceived" && m.params.response.status >= 400) {
    state.failedRequests.push(`HTTP ${m.params.response.status} ${m.params.response.url}`);
  }
};
const send = (method, params = {}, sessionId) => new Promise((res, rej) => {
  id += 1; pending.set(id, { res, rej });
  ws.send(JSON.stringify({ id, method, params, sessionId }));
});

const CONTROLS = [
  ["reset", "#reset-button"],
  ["simulate-hero", "#simulate-button"],
  ["strategy-service", 'button[data-strategy="service"]'],
  ["strategy-cost", 'button[data-strategy="cost"]'],
  ["strategy-stability", 'button[data-strategy="stability"]'],
  ["approve", "#approve-button"],
];
// Codex authorization: exactly six controls — reset, ONE [data-simulate-trigger],
// three strategies, approve. #simulate-button and [data-simulate-trigger] both
// exist; the incident-strip trigger is measured as the canonical "simulate".
CONTROLS[1] = ["simulate", "[data-simulate-trigger]"];

async function runViewport(sessionId, width, height, label) {
  const result = { label, width, height, gates: {}, controls: {}, metrics: {} };
  state.consoleExceptions.length = 0; state.pageErrors.length = 0;
  state.failedRequests.length = 0; state.requests.length = 0;
  state.requestIdToUrl.clear();

  await send("Emulation.setDeviceMetricsOverride",
    { width, height, deviceScaleFactor: 1, mobile: width < 800 }, sessionId);
  await send("Page.navigate", { url }, sessionId);

  const ev = async (expr) => {
    const r = await send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true }, sessionId);
    if (r.exceptionDetails) throw new Error(`evaluate: ${r.exceptionDetails.text}`);
    return r.result.value;
  };
  const waitFor = async (expr, lab, ms = 15000) => {
    const start = Date.now();
    while (Date.now() - start < ms) { if (await ev(expr)) return true; await sleep(150); }
    throw new Error(`timeout: ${lab}`);
  };

  await waitFor(`document.readyState === "complete" && !document.querySelector(".gantt-loading") && document.querySelectorAll("#gantt .gantt-row").length === 3`, "load+gantt");

  // control presence and measurement at nominal state
  for (const [name, sel] of CONTROLS) {
    const box = await ev(`(() => { const el = document.querySelector(${JSON.stringify(sel)});
      if (!el) return null; const r = el.getBoundingClientRect();
      return { w: Math.round(r.width), h: Math.round(r.height) }; })()`);
    result.controls[name] = box;
  }
  result.gates.sixControlsPresent = Object.values(result.controls).every(Boolean);
  result.gates.tapTargets = width >= 800 ? true :
    Object.values(result.controls).every((b) => b && b.w >= 40 && b.h >= 40);

  // journey with canonical assertions
  const overflowNow = async () => ev(`document.body.scrollWidth <= window.innerWidth + 1`);
  result.overflowByCheckpoint = {};
  result.metrics.nominalOnTime = await ev(`document.querySelector('[data-kpi="on-time-orders"] [data-kpi-value]').textContent.trim()`);
  result.overflowByCheckpoint.baseline = await overflowNow();
  await ev(`document.querySelector("[data-simulate-trigger]").click()`);
  await waitFor(`document.body.dataset.simulationState === "incident"`, "incident");
  result.metrics.incidentOnTime = await ev(`document.querySelector('[data-kpi="on-time-orders"] [data-kpi-value]').textContent.trim()`);
  result.metrics.incidentDelay = await ev(`document.querySelector('[data-kpi="estimated-delay"] [data-kpi-value]').textContent.replace(/\\s+/g, " ").trim()`);
  result.overflowByCheckpoint.incident = await overflowNow();
  result.metrics.serviceCard = await ev(`(() => { const c = document.querySelector('[data-strategy-card="service"]');
    return { onTime: c.querySelector('[data-metric="on-time"]').textContent.trim(),
             cost: c.querySelector('[data-metric="cost"]').textContent.replace(/\\s+/g, " ").trim() }; })()`);
  await ev(`document.querySelector('button[data-strategy="service"]').click()`);
  await waitFor(`document.querySelector("#approve-button").disabled === false`, "service-selected");
  result.overflowByCheckpoint.servicePreview = await overflowNow();
  await ev(`document.querySelector("#approve-button").click()`);
  await waitFor(`document.body.dataset.simulationState === "resolved"`, "approved");
  result.metrics.auditEvents = await ev(`document.querySelectorAll("#audit-log li:not(.is-pending)").length`);
  result.overflowByCheckpoint.resolved = await overflowNow();
  await ev(`document.querySelector("#reset-button").click()`);
  await waitFor(`document.body.dataset.simulationState === "baseline"`, "reset");
  result.metrics.afterReset = await ev(`document.querySelector('[data-kpi="on-time-orders"] [data-kpi-value]').textContent.trim()`);

  result.gates.journey =
    result.metrics.nominalOnTime === "10 / 10" &&
    result.metrics.incidentOnTime === "7 / 10" &&
    result.metrics.incidentDelay.includes("10 h 20") &&
    result.metrics.serviceCard.onTime === "8 / 10" &&
    result.metrics.serviceCard.cost.includes("838") &&
    result.metrics.auditEvents === 3 &&
    result.metrics.afterReset === "10 / 10";

  result.overflowByCheckpoint.postReset = await overflowNow();
  result.gates.noHorizontalOverflow =
    Object.values(result.overflowByCheckpoint).every((v) => v === true);

  await sleep(400);
  const shot = await send("Page.captureScreenshot", { format: "png" }, sessionId);
  await writeFile(resolve(outDir, `${label}.png`), Buffer.from(shot.data, "base64"));

  const foreign = state.requests.filter((u) => {
    if (u.startsWith("data:") || u.startsWith("blob:")) return false;
    try { return new URL(u).origin !== origin; } catch { return true; }
  });
  result.gates.sameOriginOnly = foreign.length === 0;
  result.foreignRequests = foreign;
  result.gates.noConsoleExceptions = state.consoleExceptions.length === 0;
  result.gates.noPageErrors = state.pageErrors.length === 0;
  result.gates.noFailedRequests = state.failedRequests.length === 0;
  result.consoleExceptions = [...state.consoleExceptions];
  result.pageErrors = [...state.pageErrors];
  result.failedRequests = [...state.failedRequests];
  result.requestCount = state.requests.length;
  result.pass = Object.values(result.gates).every((g) => g === true);
  return result;
}

let exitCode = 1;
try {
  await mkdir(outDir, { recursive: true });
  const { targetId } = await send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
  await send("Page.enable", {}, sessionId);
  await send("Runtime.enable", {}, sessionId);
  await send("Network.enable", {}, sessionId);
  await send("Log.enable", {}, sessionId);

  const desktop = await runViewport(sessionId, 1920, 1080, "desktop");
  const mobile = await runViewport(sessionId, 390, 844, "mobile");

  const report = {
    verifiedAt: new Date().toISOString(),
    url, origin,
    desktop, mobile,
    pass: desktop.pass && mobile.pass,
  };
  await writeFile(resolve(outDir, "result.json"), `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify({ desktopPass: desktop.pass, mobilePass: mobile.pass,
    desktopGates: desktop.gates, mobileGates: mobile.gates,
    mobileControls: mobile.controls }, null, 2));
  exitCode = report.pass ? 0 : 1;
  console.log(report.pass ? "ALL GATES PASS" : "GATE FAILURE");
} catch (err) {
  console.error("verifier error:", err.message);
  exitCode = 1;
} finally {
  browser.kill();
  await sleep(300);
  await rm(profileDir, { recursive: true, force: true }).catch(() => {});
}
process.exit(exitCode);
