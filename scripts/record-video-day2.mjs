// Day 2 demo-video visual track: title card -> LIVE FACTORY TWIN journey
// (war-room recompute + ML recommendation + human override + audit) ->
// decision-view traceability beat -> end card, as timestamped screencast
// frames. Self-contained: spawns its own server and browser. Animations are
// kept ALIVE (no forced reduced motion) — they are the show.
//
// Output: tmp/video-frames-day2/frame-<n>.jpg + meta.json
// Usage : node scripts/record-video-day2.mjs

import { spawn } from "node:child_process";
import { mkdir, writeFile, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { tmpdir } from "node:os";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = resolve(projectRoot, "tmp", "video-frames-day2");
const appUrl = "http://127.0.0.1:4173/";
const debugPort = 9228;

const browserPath = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
].find((p) => existsSync(p));
if (!browserPath) throw new Error("Chrome not found.");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Own the local server for the whole capture.
const server = spawn("node", ["scripts/serve.mjs"], { cwd: projectRoot, stdio: "ignore" });
let up = false;
for (let i = 0; i < 40 && !up; i += 1) {
  try { up = (await fetch(appUrl)).status === 200; } catch { await sleep(200); }
}
if (!up) { server.kill(); throw new Error("server did not start on 4173"); }

const profileDir = resolve(tmpdir(), `video-day2-${Date.now()}`);
const browser = spawn(browserPath, [
  "--headless=new", `--remote-debugging-port=${debugPort}`,
  `--user-data-dir=${profileDir}`, "--no-first-run", "--hide-scrollbars",
  "--window-size=1920,1080", "about:blank",
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
    const { data, sessionId: frameSession } = m.params;
    ws.send(JSON.stringify({
      id: ++id, method: "Page.screencastFrameAck",
      params: { sessionId: frameSession }, sessionId: m.sessionId,
    }));
    if (recording) {
      const t = Date.now() - t0; // arrival clock, no CDP drift
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

async function waitUntil(expr, label, timeoutMs = 10000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const { result } = await ev(expr);
    if (result.value) return;
    await sleep(100);
  }
  throw new Error(`timeout: ${label}`);
}

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

  // Warm the app (fonts, layout, twin scene), then start on the title card.
  await send("Page.navigate", { url: `${appUrl}#twin` }, sessionId);
  await waitUntil(`document.readyState === "complete" && document.body.dataset.view === "factory"`, "app warm");
  await sleep(1500);
  await send("Page.navigate",
    { url: pathToFileURL(resolve(projectRoot, "video", "titlecard-day2.html")).href }, sessionId);
  await sleep(900);

  await send("Page.startScreencast",
    { format: "jpeg", quality: 88, everyNthFrame: 1 }, sessionId);
  recording = true;
  t0 = Date.now();

  // 0:00-0:08 title card
  await holdUntil(7600);

  // 0:08-0:26 the living factory twin, nominal
  await send("Page.navigate", { url: `${appUrl}#twin` }, sessionId);
  await waitUntil(`document.readyState === "complete" && document.body.dataset.view === "factory"`, "twin loaded");
  await holdUntil(26000);

  // 0:26-0:30 simulate -> war-room recompute overlay (full sequence, no skip)
  await ev(`document.querySelector('[data-ft-action="simulate"]').click()`);
  await waitUntil(`document.querySelector("#factory-twin")?.dataset.calc === "done"`, "recompute done", 12000);

  // ~0:30-0:52 auto-previewed ML pick (Cost): alarm, arcs, inspector panel
  await holdUntil(52000);

  // 0:52-1:07 the human overrides: Service route (arcs, crews, KPIs)
  await ev(`document.querySelector('[data-ft-strategy="service"]').click()`);
  await waitUntil(`document.querySelector('[data-ft-strategy="service"]').getAttribute("aria-pressed") === "true"`, "service previewed");
  await holdUntil(67000);

  // 1:07-1:19 approve -> audit stamp 10:07, planned restart 14:00
  await ev(`document.querySelector('[data-ft-action="approve"]').click()`);
  await waitUntil(`document.querySelector("#factory-twin")?.dataset.phase === "resolved"`, "approved");
  await holdUntil(79000);

  // 1:19-1:34 decision view: revised Gantt + audit trail (traceability beat)
  await ev(`document.querySelector('[data-view-tab="decision"]').click()`);
  await sleep(700);
  await scrollTo("#situation", 1400);
  await holdUntil(87500);
  await scrollTo("#decision", 1200);
  await holdUntil(94000);

  // 1:34-1:52 end card (live URL)
  await send("Page.navigate",
    { url: pathToFileURL(resolve(projectRoot, "video", "endcard-day2.html")).href }, sessionId);
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
  server.kill();
  await sleep(300);
  await rm(profileDir, { recursive: true, force: true }).catch(() => {});
}
