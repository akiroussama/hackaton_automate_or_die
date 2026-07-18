// Critical Restart Lab — browser QA capture (specification gates 3-4, 18-22).
// Self-contained: spawns the local server and a headless Chromium, drives the
// expert journey at 1920x1080, times the accelerated replay (must complete in
// <= 30 s on the same state machine), re-checks 1366x768, records every
// network request (must all be local) and fails on any console error.
//
// Output: tmp/critical-restart-qa/*.png + qa-report.json
// Usage : node scripts/capture-critical-restart.mjs

import { spawn } from "node:child_process";
import { mkdir, writeFile, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = resolve(projectRoot, "tmp", "critical-restart-qa");
const base = "http://127.0.0.1:4173";
const debugPort = 9231;

const browserPath = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
].find((p) => existsSync(p));
if (!browserPath) throw new Error("Chrome not found.");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const server = spawn("node", ["scripts/serve.mjs"], { cwd: projectRoot, stdio: "ignore" });
let up = false;
for (let i = 0; i < 40 && !up; i += 1) {
  try { up = (await fetch(`${base}/`)).status === 200; } catch { await sleep(200); }
}
if (!up) { server.kill(); throw new Error("server did not start"); }

// Gate 3 — the three routes return HTTP 200.
const routes = {};
for (const route of ["/", "/#twin", "/critical-restart/"]) {
  const url = route === "/#twin" ? `${base}/` : `${base}${route}`;
  routes[route] = (await fetch(url)).status;
}

const profile = resolve(tmpdir(), `crlab-qa-${Date.now()}`);
const browser = spawn(browserPath, [
  "--headless=new", `--remote-debugging-port=${debugPort}`,
  `--user-data-dir=${profile}`, "--no-first-run", "--hide-scrollbars", "about:blank",
], { stdio: "ignore" });

let wsUrl;
for (let i = 0; i < 50 && !wsUrl; i += 1) {
  try { wsUrl = (await (await fetch(`http://127.0.0.1:${debugPort}/json/version`)).json()).webSocketDebuggerUrl; }
  catch { await sleep(200); }
}
const ws = new WebSocket(wsUrl);
await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });

let id = 0;
const pending = new Map();
const consoleErrors = [];
const requests = [];
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) {
    const { res, rej } = pending.get(m.id);
    pending.delete(m.id);
    m.error ? rej(new Error(m.error.message)) : res(m.result);
    return;
  }
  if (m.method === "Runtime.exceptionThrown") {
    consoleErrors.push(`EXCEPTION: ${m.params.exceptionDetails?.exception?.description ?? "unknown"}`);
  }
  if (m.method === "Runtime.consoleAPICalled" && m.params.type === "error") {
    consoleErrors.push(`CONSOLE: ${m.params.args?.map((a) => a.value ?? a.description).join(" ")}`);
  }
  if (m.method === "Network.requestWillBeSent") {
    requests.push(m.params.request.url);
  }
};
const send = (method, params = {}, sessionId) => new Promise((res, rej) => {
  id += 1; pending.set(id, { res, rej });
  ws.send(JSON.stringify({ id, method, params, sessionId }));
});

try {
  await rm(outDir, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });

  const { targetId } = await send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
  await send("Page.enable", {}, sessionId);
  await send("Runtime.enable", {}, sessionId);
  await send("Network.enable", {}, sessionId);

  const shot = async (name) => {
    const { data } = await send("Page.captureScreenshot", { format: "png" }, sessionId);
    await writeFile(resolve(outDir, name), Buffer.from(data, "base64"));
    console.log("shot", name);
  };
  const evaluate = async (expression) =>
    (await send("Runtime.evaluate", { expression, returnByValue: true }, sessionId)).result.value;
  const click = (selector) => evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);
  const stepOf = () => evaluate("document.body.dataset.step");

  // ---------------- expert journey at 1920x1080 ----------------
  await send("Emulation.setDeviceMetricsOverride", { width: 1920, height: 1080, deviceScaleFactor: 1, mobile: false }, sessionId);
  await send("Page.navigate", { url: `${base}/critical-restart/` }, sessionId);
  await sleep(1500);
  await shot("expert-1-briefing.png");

  for (const [name, wait] of [["historical_frame", 900], ["rewind_to_gate", 700], ["ml_memory", 900], ["twin_reconciliation", 800], ["branch_comparison", 1000]]) {
    await click("#cta");
    await sleep(wait);
    if ((await stepOf()) !== name) throw new Error(`state machine mismatch: expected ${name}`);
    await shot(`expert-2-${name}.png`);
  }
  await click("#sign-ops");
  await sleep(500);
  await click("#sign-safety");
  await sleep(500);
  await shot("expert-3-signed.png");
  await click("#finalize");
  await sleep(700);
  if ((await stepOf()) !== "recommendation_finalized") throw new Error("finalization did not complete");
  await shot("expert-4-finalized.png");

  // ---------------- accelerated replay, timed ----------------
  await click("#reset");
  await sleep(500);
  const t0 = Date.now();
  await click("#auto");
  let autoSeconds = null;
  for (let i = 0; i < 350; i += 1) {
    await sleep(100);
    if ((await stepOf()) === "recommendation_finalized") { autoSeconds = (Date.now() - t0) / 1000; break; }
  }
  if (autoSeconds === null) throw new Error("accelerated replay did not finish");
  await shot("auto-finalized.png");
  console.log(`accelerated replay completed in ${autoSeconds.toFixed(1)}s`);

  // ---------------- 1366x768 ----------------
  await send("Emulation.setDeviceMetricsOverride", { width: 1366, height: 768, deviceScaleFactor: 1, mobile: false }, sessionId);
  await send("Page.navigate", { url: `${base}/critical-restart/` }, sessionId);
  await sleep(1400);
  await shot("hd-1-briefing.png");
  for (let i = 0; i < 5; i += 1) { await click("#cta"); await sleep(350); }
  await shot("hd-2-branches.png");

  // ---------------- network + console verdicts ----------------
  const external = requests.filter((url) => !url.startsWith(base) && !url.startsWith("data:"));
  const report = {
    routes,
    externalRequests: external,
    totalRequests: requests.length,
    consoleErrors,
    acceleratedSeconds: autoSeconds,
    acceleratedWithinLimit: autoSeconds <= 30,
  };
  await writeFile(resolve(outDir, "qa-report.json"), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));

  if (external.length) throw new Error("external network requests detected");
  if (consoleErrors.length) throw new Error(`console errors: ${consoleErrors.join(" | ")}`);
  if (routes["/"] !== 200 || routes["/#twin"] !== 200 || routes["/critical-restart/"] !== 200) {
    throw new Error("route check failed");
  }
  if (autoSeconds > 30) throw new Error("accelerated replay exceeded 30 s");
  console.log("QA PASS");
} finally {
  browser.kill();
  server.kill();
  await sleep(300);
  await rm(profile, { recursive: true, force: true }).catch(() => {});
}
