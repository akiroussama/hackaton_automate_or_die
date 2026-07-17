// Records the demo-video visual track as timestamped screencast frames.
// Drives title card -> full CableTwin journey -> end card on the timeline of
// video/script.md via CDP (headless Edge/Chrome, no npm dependency, Node >= 22).
//
// Prereq: node scripts/serve.mjs  (app served on 127.0.0.1:4173)
// Output: tmp/video-frames/frame-<n>.jpg + tmp/video-frames/meta.json
//
// Usage: node scripts/record-video.mjs

import { spawn } from "node:child_process";
import { mkdir, writeFile, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { tmpdir } from "node:os";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = resolve(projectRoot, "tmp", "video-frames");
const appUrl = "http://127.0.0.1:4173/";
const debugPort = 9226;

const browserPath = [
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  `${process.env.LOCALAPPDATA}\\Microsoft\\Edge\\Application\\msedge.exe`,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
].find((p) => existsSync(p));
if (!browserPath) throw new Error("No Chromium-based browser found.");

const profileDir = resolve(tmpdir(), `video-rec-${Date.now()}`);
const browser = spawn(browserPath, [
  "--headless=new", `--remote-debugging-port=${debugPort}`,
  `--user-data-dir=${profileDir}`, "--no-first-run", "--hide-scrollbars",
  "--force-prefers-reduced-motion", "--allow-file-access-from-files",
  "--window-size=1920,1080", "about:blank",
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
const frames = [];
let recording = false;
let t0 = 0;
let sessionIdGlobal = null;

ws.onmessage = async (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) {
    const { res, rej } = pending.get(m.id);
    pending.delete(m.id);
    m.error ? rej(new Error(m.error.message)) : res(m.result);
    return;
  }
  if (m.method === "Page.screencastFrame") {
    const { data, sessionId: frameSession, metadata } = m.params;
    ws.send(JSON.stringify({
      id: ++id, method: "Page.screencastFrameAck",
      params: { sessionId: frameSession }, sessionId: m.sessionId,
    }));
    if (recording) {
      // Arrival-clock timestamps: same clock as t0, no CDP-clock drift.
      const t = Date.now() - t0;
      const n = frames.length;
      frames.push({ n, t: Math.max(0, t) });
      await writeFile(resolve(outDir, `frame-${String(n).padStart(5, "0")}.jpg`),
        Buffer.from(data, "base64"));
    }
  }
};
const send = (method, params = {}, sessionId) => new Promise((res, rej) => {
  id += 1; pending.set(id, { res, rej });
  ws.send(JSON.stringify({ id, method, params, sessionId }));
});

const ev = (expr) => send("Runtime.evaluate",
  { expression: expr, returnByValue: true, awaitPromise: true }, sessionIdGlobal);

async function waitUntil(expr, label, timeoutMs = 8000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const { result } = await ev(expr);
    if (result.value) return;
    await sleep(100);
  }
  throw new Error(`timeout: ${label}`);
}

// Smooth programmatic scroll so the motion is visible in the recording.
async function scrollTo(selector, ms = 1200) {
  await ev(`(async () => {
    const el = document.querySelector(${JSON.stringify(selector)});
    const target = el.getBoundingClientRect().top + window.scrollY - 24;
    const from = window.scrollY, steps = ${Math.round(ms / 33)};
    for (let i = 1; i <= steps; i += 1) {
      const k = 0.5 - 0.5 * Math.cos(Math.PI * i / steps);
      window.scrollTo(0, from + (target - from) * k);
      await new Promise((r) => setTimeout(r, 33));
    }
  })()`);
}

const clock = () => Date.now() - t0;
async function holdUntil(ms) {
  const remaining = ms - clock();
  if (remaining > 0) await sleep(remaining);
}

try {
  await rm(outDir, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });

  const { targetId } = await send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
  sessionIdGlobal = sessionId;
  await send("Page.enable", {}, sessionId);
  await send("Runtime.enable", {}, sessionId);
  await send("Emulation.setDeviceMetricsOverride",
    { width: 1920, height: 1080, deviceScaleFactor: 1, mobile: false }, sessionId);

  // Preload the app once so fonts/layout are warm, then start on the title card.
  await send("Page.navigate", { url: appUrl }, sessionId);
  await waitUntil(`document.readyState === "complete" && !document.querySelector(".gantt-loading")`, "app warm");
  await send("Page.navigate",
    { url: pathToFileURL(resolve(projectRoot, "video", "titlecard.html")).href }, sessionId);
  await sleep(900);

  await send("Page.startScreencast",
    { format: "jpeg", quality: 88, everyNthFrame: 1 }, sessionId);
  recording = true;
  t0 = Date.now();

  // 0:00-0:10 title card
  await holdUntil(9600);

  // 0:10-0:25 nominal factory
  await send("Page.navigate", { url: appUrl }, sessionId);
  await waitUntil(`document.readyState === "complete" && !document.querySelector(".gantt-loading")`, "app loaded");
  await sleep(1400);
  await scrollTo("#situation", 1500);
  await holdUntil(24600);

  // 0:25-0:40 incident
  await scrollTo("#incident", 900);
  await sleep(500);
  await ev(`document.querySelector("[data-simulate-trigger]").click()`);
  await waitUntil(`document.body.dataset.simulationState === "incident"`, "incident");
  await sleep(300);
  await scrollTo("#situation", 1000);
  await holdUntil(39600);

  // 0:40-1:05 three strategies
  await scrollTo("#strategies", 1200);
  await holdUntil(64600);

  // 1:05-1:30 select Service, revised Gantt + KPI
  await ev(`document.querySelector('button[data-strategy="service"]').click()`);
  await waitUntil(`document.querySelector("#approve-button").disabled === false`, "service selected");
  await sleep(400);
  await scrollTo("#situation", 1200);
  await holdUntil(89600);

  // 1:30-1:45 approve + audit
  await scrollTo("#decision", 1000);
  await sleep(1200);
  await ev(`document.querySelector("#approve-button").click()`);
  await waitUntil(`document.body.dataset.simulationState === "resolved"`, "approved");
  await holdUntil(104600);

  // 1:45-1:55 end card
  await send("Page.navigate",
    { url: pathToFileURL(resolve(projectRoot, "video", "endcard.html")).href }, sessionId);
  await holdUntil(112000);

  recording = false;
  await send("Page.stopScreencast", {}, sessionId);
  await sleep(400);

  await writeFile(resolve(outDir, "meta.json"), JSON.stringify({
    recordedAt: new Date().toISOString(),
    totalMs: 112000,
    frameCount: frames.length,
    frames,
  }, null, 2));
  console.log(`recorded ${frames.length} frames over 112s -> ${outDir}`);
} finally {
  browser.kill();
  await sleep(300);
  await rm(profileDir, { recursive: true, force: true }).catch(() => {});
}
