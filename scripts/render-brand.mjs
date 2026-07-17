// Renders the brand SVG/HTML sources to PNG via headless Edge/Chrome CDP.
// No npm dependency; requires Node >= 22. Usage: node scripts/render-brand.mjs

import { spawn } from "node:child_process";
import { writeFile, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { tmpdir } from "node:os";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const debugPort = 9225;

const browserPath = [
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  `${process.env.LOCALAPPDATA}\\Microsoft\\Edge\\Application\\msedge.exe`,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
].find((p) => existsSync(p));
if (!browserPath) throw new Error("No Chromium-based browser found.");

const jobs = [
  { src: "brand/logo/cabletwin-mark.svg", out: "brand/logo/cabletwin-mark.png", width: 512, height: 512, transparent: true },
  { src: "brand/logo/cabletwin-logo-dark.svg", out: "brand/logo/cabletwin-logo-dark.png", width: 1180, height: 300, transparent: true },
  { src: "brand/logo/cabletwin-logo-light.svg", out: "brand/logo/cabletwin-logo.png", width: 1180, height: 300, transparent: true },
  { src: "brand/social/thumbnail.html", out: "brand/social/cabletwin-demo-thumbnail.png", width: 1280, height: 720, transparent: false },
];

const profileDir = resolve(tmpdir(), `brand-render-${Date.now()}`);
const browser = spawn(browserPath, [
  "--headless=new", `--remote-debugging-port=${debugPort}`,
  `--user-data-dir=${profileDir}`, "--no-first-run",
  "--hide-scrollbars", "--allow-file-access-from-files", "about:blank",
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
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) {
    const { res, rej } = pending.get(m.id);
    pending.delete(m.id);
    m.error ? rej(new Error(m.error.message)) : res(m.result);
  }
};
const send = (method, params = {}, sessionId) => new Promise((res, rej) => {
  id += 1; pending.set(id, { res, rej });
  ws.send(JSON.stringify({ id, method, params, sessionId }));
});

try {
  const { targetId } = await send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
  await send("Page.enable", {}, sessionId);

  for (const job of jobs) {
    await send("Emulation.setDeviceMetricsOverride", {
      width: job.width, height: job.height, deviceScaleFactor: 1, mobile: false,
    }, sessionId);
    if (job.transparent) {
      await send("Emulation.setDefaultBackgroundColorOverride", { color: { r: 0, g: 0, b: 0, a: 0 } }, sessionId);
    } else {
      await send("Emulation.setDefaultBackgroundColorOverride", {}, sessionId);
    }
    await send("Page.navigate", { url: pathToFileURL(resolve(projectRoot, job.src)).href }, sessionId);
    await sleep(700);
    const { data } = await send("Page.captureScreenshot", { format: "png" }, sessionId);
    await writeFile(resolve(projectRoot, job.out), Buffer.from(data, "base64"));
    console.log(`rendered ${job.out}`);
  }
} finally {
  browser.kill();
  await sleep(300);
  await rm(profileDir, { recursive: true, force: true }).catch(() => {});
}
