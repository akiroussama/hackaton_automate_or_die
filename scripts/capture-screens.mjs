// Replays the full CableTwin browser journey in headless Edge via the Chrome
// DevTools Protocol (no npm dependency; requires Node >= 22 for global WebSocket)
// and captures the evidence screenshots used by the data room, deck and video.
//
// Usage: node scripts/serve.mjs   (in another terminal)
//        node scripts/capture-screens.mjs
//
// Outputs: docs/data-room/evidence/screenshots/*.png
//          docs/data-room/evidence/screenshots/ui-metrics.json

import { spawn } from "node:child_process";
import { mkdir, writeFile, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = resolve(projectRoot, "docs/data-room/evidence/screenshots");
const appUrl = process.env.APP_URL ?? "http://127.0.0.1:4173/";
const debugPort = 9223;

const edgeCandidates = [
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  `${process.env.LOCALAPPDATA}\\Microsoft\\Edge\\Application\\msedge.exe`,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
];
const edgePath = edgeCandidates.find((p) => existsSync(p));
if (!edgePath) {
  console.error("No Chromium-based browser (Edge or Chrome) found in the standard locations.");
  process.exit(1);
}

const profileDir = resolve(tmpdir(), `cabletwin-capture-${Date.now()}`);
const browser = spawn(edgePath, [
  "--headless=new",
  `--remote-debugging-port=${debugPort}`,
  `--user-data-dir=${profileDir}`,
  "--no-first-run",
  "--force-prefers-reduced-motion",
  "--window-size=1920,1080",
  "--hide-scrollbars",
  "about:blank",
], { stdio: "ignore" });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitForEndpoint() {
  for (let i = 0; i < 50; i += 1) {
    try {
      const res = await fetch(`http://127.0.0.1:${debugPort}/json/version`);
      return (await res.json()).webSocketDebuggerUrl;
    } catch {
      await sleep(200);
    }
  }
  throw new Error("Edge DevTools endpoint did not come up");
}

let messageId = 0;
const pending = new Map();
const externalRequests = [];
let ws;

function send(method, params = {}, sessionId) {
  messageId += 1;
  const id = messageId;
  return new Promise((resolvePromise, rejectPromise) => {
    pending.set(id, { resolvePromise, rejectPromise, method });
    ws.send(JSON.stringify({ id, method, params, sessionId }));
  });
}

function onMessage(raw) {
  const msg = JSON.parse(raw);
  if (msg.id && pending.has(msg.id)) {
    const { resolvePromise, rejectPromise, method } = pending.get(msg.id);
    pending.delete(msg.id);
    if (msg.error) rejectPromise(new Error(`${method}: ${msg.error.message}`));
    else resolvePromise(msg.result);
    return;
  }
  if (msg.method === "Network.requestWillBeSent") {
    const url = msg.params.request.url;
    if (!url.startsWith("http://127.0.0.1") && !url.startsWith("data:")) {
      externalRequests.push(url);
    }
  }
}

async function evaluate(sessionId, expression) {
  const { result, exceptionDetails } = await send(
    "Runtime.evaluate",
    { expression, returnByValue: true, awaitPromise: true },
    sessionId,
  );
  if (exceptionDetails) throw new Error(`evaluate failed: ${exceptionDetails.text}`);
  return result.value;
}

async function waitFor(sessionId, expression, label, timeoutMs = 5000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (await evaluate(sessionId, expression)) return;
    await sleep(100);
  }
  throw new Error(`Timed out waiting for: ${label}`);
}

async function shot(sessionId, name, scrollSelector, fullPage = false) {
  if (scrollSelector) {
    await evaluate(
      sessionId,
      `document.querySelector(${JSON.stringify(scrollSelector)}).scrollIntoView({block:"start"}); true`,
    );
    await sleep(250);
  }
  const { data } = await send(
    "Page.captureScreenshot",
    { format: "png", captureBeyondViewport: fullPage },
    sessionId,
  );
  await writeFile(resolve(outDir, `${name}.png`), Buffer.from(data, "base64"));
  console.log(`captured ${name}.png`);
}

async function click(sessionId, selector) {
  await evaluate(sessionId, `document.querySelector(${JSON.stringify(selector)}).click(); true`);
  await sleep(300);
}

try {
  await mkdir(outDir, { recursive: true });
  ws = new WebSocket(await waitForEndpoint());
  await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
  ws.onmessage = (event) => onMessage(event.data);

  const { targetId } = await send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });

  await send("Page.enable", {}, sessionId);
  await send("Runtime.enable", {}, sessionId);
  await send("Network.enable", {}, sessionId);
  await send("Emulation.setDeviceMetricsOverride", {
    width: 1920, height: 1080, deviceScaleFactor: 1, mobile: false,
  }, sessionId);

  await send("Page.navigate", { url: appUrl }, sessionId);
  await waitFor(
    sessionId,
    `document.readyState === "complete" && document.querySelectorAll("#gantt .gantt-row, #gantt [class*='gantt']").length > 0
      && !document.querySelector(".gantt-loading")`,
    "app loaded and Gantt rendered",
  );

  // 1. Nominal state
  await shot(sessionId, "01-hero-nominal", "#top");
  await shot(sessionId, "02-factory-nominal", "#situation");
  await shot(sessionId, "00-full-nominal", null, true);

  // 2. Incident
  await click(sessionId, "[data-simulate-trigger]");
  await waitFor(sessionId, `document.body.dataset.simulationState === "incident"`, "incident state");
  await shot(sessionId, "03-incident-kpis", "#situation");
  await shot(sessionId, "04-strategies", "#strategies");

  const metricsAfterIncident = await evaluate(sessionId, `(() => {
    const kpi = {};
    for (const card of document.querySelectorAll(".kpi-card")) {
      kpi[card.dataset.kpi] = {
        value: card.querySelector("[data-kpi-value]").textContent.trim(),
        change: card.querySelector("[data-kpi-change]").textContent.trim(),
      };
    }
    const strategies = {};
    for (const card of document.querySelectorAll("[data-strategy-card]")) {
      const m = {};
      for (const dd of card.querySelectorAll("[data-metric]")) m[dd.dataset.metric] = dd.textContent.trim();
      strategies[card.dataset.strategyCard] = m;
    }
    return { kpi, strategies, status: document.querySelector("#simulation-status").textContent.trim() };
  })()`);

  // 3. Preview the Service strategy
  await click(sessionId, `button[data-strategy="service"]`);
  await waitFor(sessionId, `document.body.dataset.simulationState === "incident"
    && document.querySelector("#approve-button").disabled === false`, "service preview");
  await shot(sessionId, "05-preview-service-gantt", "#situation");
  await shot(sessionId, "06-decision-preview", "#decision");

  // 4. Approve
  await click(sessionId, "#approve-button");
  await waitFor(sessionId, `document.body.dataset.simulationState === "resolved"`, "approved state");
  await shot(sessionId, "07-approved-audit", "#decision");
  await shot(sessionId, "08-full-resolved", null, true);

  const auditAfterApproval = await evaluate(sessionId, `(() => ({
    audit: [...document.querySelectorAll("#audit-log li")].map((li) => li.textContent.replace(/\\s+/g, " ").trim()),
    status: document.querySelector("#simulation-status").textContent.trim(),
    selected: document.querySelector("[data-selected-strategy]").textContent.replace(/\\s+/g, " ").trim(),
  }))()`);

  // 5. Reset
  await click(sessionId, "#reset-button");
  await waitFor(sessionId, `document.body.dataset.simulationState === "baseline"
    && document.querySelector('[data-kpi="on-time-orders"] [data-kpi-value]').textContent.trim() === "10 / 10"`, "reset to baseline");
  await shot(sessionId, "09-reset-nominal", "#top");

  const record = {
    capturedAt: new Date().toISOString(),
    appUrl,
    viewport: "1920x1080",
    afterIncident: metricsAfterIncident,
    afterApproval: auditAfterApproval,
    externalNetworkRequests: externalRequests,
  };
  await writeFile(resolve(outDir, "ui-metrics.json"), `${JSON.stringify(record, null, 2)}\n`);
  console.log(`\nexternal network requests: ${externalRequests.length === 0 ? "none (offline-safe)" : externalRequests.join(", ")}`);
  console.log("ui-metrics.json written");
} finally {
  browser.kill();
  await sleep(300);
  await rm(profileDir, { recursive: true, force: true }).catch(() => {});
}
