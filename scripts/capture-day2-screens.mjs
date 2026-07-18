// Capture the enhanced Day-2 CableTwin journey without modifying the accepted
// Phase-2 evidence set. Uses the Chrome DevTools Protocol directly, so the
// repository keeps zero application dependencies.
//
// Usage:
//   PORT=4174 node scripts/serve.mjs
//   APP_URL=http://127.0.0.1:4174/#twin node scripts/capture-day2-screens.mjs
//
// Outputs:
//   day2-final/evidence/screenshots/*.png
//   day2-final/evidence/screenshots/day2-ui-evidence.json

import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = resolve(projectRoot, "day2-final/evidence/screenshots");
const appUrl = process.env.APP_URL ?? "http://127.0.0.1:4174/#twin";
const debugPort = Number.parseInt(process.env.CDP_PORT ?? "9234", 10);

const browserCandidates = [
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  `${process.env.LOCALAPPDATA}\\Microsoft\\Edge\\Application\\msedge.exe`,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
];
const browserPath = browserCandidates.find((candidate) => existsSync(candidate));
if (!browserPath) {
  throw new Error("No Chromium-based browser found in the standard locations.");
}

const profileRoot = process.env.DAY2_TMP_DIR ?? tmpdir();
const profileDir = resolve(profileRoot, `cabletwin-day2-capture-${Date.now()}`);
const browser = spawn(browserPath, [
  "--headless=new",
  `--remote-debugging-port=${debugPort}`,
  `--user-data-dir=${profileDir}`,
  "--no-first-run",
  "--disable-features=Translate",
  "--hide-scrollbars",
  "--window-size=1920,1080",
  "about:blank",
], { stdio: "ignore" });

const sleep = (milliseconds) => new Promise((resolvePromise) => {
  setTimeout(resolvePromise, milliseconds);
});

async function waitForEndpoint() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${debugPort}/json/version`);
      return (await response.json()).webSocketDebuggerUrl;
    } catch {
      await sleep(200);
    }
  }
  throw new Error("Chromium DevTools endpoint did not become ready.");
}

let messageId = 0;
const pending = new Map();
const externalRequests = [];
const consoleErrors = [];
let websocket;

function send(method, params = {}, sessionId) {
  messageId += 1;
  const id = messageId;
  return new Promise((resolvePromise, rejectPromise) => {
    pending.set(id, { resolvePromise, rejectPromise, method });
    websocket.send(JSON.stringify({ id, method, params, sessionId }));
  });
}

function onMessage(raw) {
  const message = JSON.parse(raw);
  if (message.id && pending.has(message.id)) {
    const { resolvePromise, rejectPromise, method } = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) rejectPromise(new Error(`${method}: ${message.error.message}`));
    else resolvePromise(message.result);
    return;
  }
  if (message.method === "Network.requestWillBeSent") {
    const url = message.params.request.url;
    if (!url.startsWith("http://127.0.0.1") && !url.startsWith("data:")) {
      externalRequests.push(url);
    }
  }
  if (message.method === "Runtime.consoleAPICalled" && message.params.type === "error") {
    consoleErrors.push(message.params.args.map((arg) => arg.value ?? arg.description ?? "").join(" "));
  }
  if (message.method === "Runtime.exceptionThrown") {
    consoleErrors.push(message.params.exceptionDetails?.text ?? "Runtime exception");
  }
}

async function evaluate(sessionId, expression) {
  const { result, exceptionDetails } = await send(
    "Runtime.evaluate",
    { expression, returnByValue: true, awaitPromise: true },
    sessionId,
  );
  if (exceptionDetails) throw new Error(`Evaluation failed: ${exceptionDetails.text}`);
  return result.value;
}

async function waitFor(sessionId, expression, label, timeoutMs = 8000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    if (await evaluate(sessionId, expression)) return;
    await sleep(100);
  }
  throw new Error(`Timed out waiting for ${label}.`);
}

async function click(sessionId, selector) {
  const clicked = await evaluate(
    sessionId,
    `(() => {
      const selector = ${JSON.stringify(selector)};
      const node = document.querySelector(selector);
      if (!node) return false;
      node.click();
      return true;
    })()`,
  );
  if (!clicked) throw new Error(`Missing selector: ${selector}`);
}

async function screenshot(sessionId, name) {
  const { data } = await send(
    "Page.captureScreenshot",
    { format: "png", fromSurface: true, captureBeyondViewport: false },
    sessionId,
  );
  await writeFile(resolve(outDir, `${name}.png`), Buffer.from(data, "base64"));
  console.log(`captured ${name}.png`);
}

try {
  await mkdir(outDir, { recursive: true });
  websocket = new WebSocket(await waitForEndpoint());
  await new Promise((resolvePromise, rejectPromise) => {
    websocket.onopen = resolvePromise;
    websocket.onerror = rejectPromise;
  });
  websocket.onmessage = (event) => onMessage(event.data);

  const { targetId } = await send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
  await send("Page.enable", {}, sessionId);
  await send("Runtime.enable", {}, sessionId);
  await send("Network.enable", {}, sessionId);
  await send("Emulation.setDeviceMetricsOverride", {
    width: 1920,
    height: 1080,
    deviceScaleFactor: 1,
    mobile: false,
  }, sessionId);

  await send("Page.navigate", { url: appUrl }, sessionId);
  await waitFor(
    sessionId,
    `document.readyState === "complete"
      && document.body.dataset.view === "factory"
      && document.querySelector('[data-ft-action="simulate"]')`,
    "factory twin baseline",
  );
  await screenshot(sessionId, "00-twin-baseline");

  await click(sessionId, '[data-ft-action="simulate"]');
  await waitFor(
    sessionId,
    `document.querySelector("#factory-twin").dataset.calc === "running"`,
    "recomputation overlay",
  );
  await sleep(1550);
  await screenshot(sessionId, "01-twin-recompute");

  await waitFor(
    sessionId,
    `document.querySelector("#factory-twin").dataset.calc !== "running"
      && document.querySelector('[data-ft-strategy="cost"]').getAttribute("aria-pressed") === "true"`,
    "ML Cost suggestion",
    10000,
  );
  await screenshot(sessionId, "02-twin-ml-cost");

  await click(sessionId, '[data-ft-strategy="service"]');
  await waitFor(
    sessionId,
    `document.querySelector('[data-ft-strategy="service"]').getAttribute("aria-pressed") === "true"`,
    "manual Service selection",
  );
  await screenshot(sessionId, "03-twin-human-service");

  await click(sessionId, '[data-ft-action="approve"]');
  await waitFor(
    sessionId,
    `document.body.dataset.simulationState === "resolved"`,
    "approved plan",
  );
  await screenshot(sessionId, "04-twin-approved");

  const evidence = await evaluate(sessionId, `(() => {
    const root = document.querySelector("#factory-twin");
    const visibleText = (selector) =>
      document.querySelector(selector)?.textContent.replace(/\\s+/g, " ").trim() ?? null;
    return {
      url: location.href,
      viewport: { width: innerWidth, height: innerHeight },
      state: {
        view: document.body.dataset.view,
        simulation: document.body.dataset.simulationState,
        factoryPhase: root.dataset.phase,
        selectedStrategy: root.dataset.strategy,
      },
      summary: {
        onTime: visibleText('[data-kpi="on-time"] strong'),
        exposed: visibleText('[data-kpi="at-risk"] strong'),
        delay: visibleText('[data-kpi="delay"] strong'),
        moves: visibleText('[data-kpi="moves"] strong'),
        cost: visibleText('[data-kpi="cost"] strong'),
        recommendation: visibleText(".ft-cherry-body"),
        inspector: visibleText(".ft-inspector-body"),
      },
      disclosure: visibleText(".ft-title small"),
      footerBoundary: visibleText(".ft-controls-note"),
    };
  })()`);

  const record = {
    capturedAt: new Date().toISOString(),
    appUrl,
    evidence,
    externalNetworkRequests: [...new Set(externalRequests)],
    consoleErrors,
  };
  await writeFile(
    resolve(outDir, "day2-ui-evidence.json"),
    `${JSON.stringify(record, null, 2)}\n`,
  );

  if (record.externalNetworkRequests.length) {
    throw new Error(`External requests detected: ${record.externalNetworkRequests.join(", ")}`);
  }
  if (consoleErrors.length) {
    throw new Error(`Console errors detected: ${consoleErrors.join(" | ")}`);
  }
  console.log("Day-2 evidence captured with zero external requests and zero console errors.");
} finally {
  if (websocket?.readyState === WebSocket.OPEN) websocket.close();
  browser.kill();
  await sleep(300);
  await rm(profileDir, { recursive: true, force: true }).catch(() => {});
}
