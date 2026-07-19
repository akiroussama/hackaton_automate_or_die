// CableTwin — Reprise scenario: UI wiring for the dominant Energy × Quality
// decision surface. Renders the 24 km ribbon, the constraint Gantt, the ML
// memory and the authorities from the deterministic engine; plays the shared
// business journal at four speeds; runs the live stress test that flips the
// surface to "Aucun plan faisable"; and recomputes the decision digest on
// every change. Fully offline — every import is a local ES module.

import {
  SCENARIO, DRUMS, FEATURE_NAMES,
} from "../engine/reprise-data.js";
import { retrieveSimilar, ML_MODEL } from "../engine/reprise-ml.js";
import { evaluateAll } from "../engine/reprise-engine.js";
import {
  BUSINESS_JOURNAL, CHECKPOINTS, MODES, JURY_BEATS, buildSchedule,
} from "../engine/reprise-replay.js";
import { defaultIncidentVector } from "../engine/reprise-data.js";

/* ------------------------------------------------------------------ utils */

const $ = (sel) => document.querySelector(sel);
const journalById = new Map(BUSINESS_JOURNAL.map((e) => [e.id, e]));

function el(tag, className, parent, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  if (parent) parent.append(node);
  return node;
}

// French-formatted synthetic numbers (comma decimal).
const fmtMW = (v) => `${v.toFixed(2).replace(".", ",")} MW`;
const fmtNum = (v, d = 3) => v.toFixed(d).replace(".", ",");

const REDUCED = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

let captionEl = null;
let playheadEl = null;

// Per-beat cinematic metadata: the big caption, which panel to spotlight, the
// clock label and any dramatic effect. Text only — no forbidden claims.
const BEAT_META = {
  intro: { clockLabel: "18:40", spot: ".rp-ribbon-panel", caption: "24 km d'engagement client — 8 tourets, le 7ᵉ pris dans la coupure." },
  "risk-window": { clockLabel: "avant 17:42", spot: ".rp-ribbon-panel", caption: "Fenêtre de coupure saisie par l'opérateur — rien n'est prédit." },
  outage: { clockLabel: "17:42 → 18:40", spot: ".rp-ribbon-panel", caption: "17:42 — coupure réseau. 58 minutes sans production.", tick: ["17:42", "18:40"], alert: true },
  reconstruction: { clockLabel: "18:40", spot: ".rp-gantt-panel", caption: "Le jumeau reconstruit l'état — T7 reste HOLD, intervalle à investiguer." },
  "ml-neighbors": { clockLabel: "18:41", spot: ".rp-ml-panel", caption: "Le ML retrouve 3 cas analogues : distances, différences, hors-distribution." },
  "reject-shortcuts": { clockLabel: "18:42", spot: ".rp-gantt-panel", caption: "Deux raccourcis séduisants — bloqués par les règles dures." },
  "compare-bc": { clockLabel: "18:45", spot: ".rp-gantt-panel", caption: "Le jumeau compare quatre reprises sous six contraintes." },
  stress: { clockLabel: "essai", spot: ".rp-gantt-panel", caption: "Puissance réduite… aucun plan faisable. CableTwin sait dire non.", alert: true },
  restore: { clockLabel: "18:46", spot: ".rp-gantt-panel", caption: "Reprise séquencée : l'engagement client est protégé.", good: true },
  governance: { clockLabel: "décision", spot: ".rp-auth-panel", caption: "Le laboratoire libère, les humains décident — le modèle ne signe pas." },
  "logistics-view": { clockLabel: "décision", spot: ".rp-ribbon-panel", caption: "T1–T6 partent · T7 attend le labo · T8 replanifié." },
  audit: { clockLabel: "clôture", spot: null, caption: "Le ML retrouve le passé. Le jumeau compare les futurs. Les règles bloquent l'impossible.", good: true },
};

const clockToMin = (c) => { const [h, m] = c.split(":").map(Number); return h * 60 + m; };
const minToClock = (v) => `${String(Math.floor(v / 60)).padStart(2, "0")}:${String(Math.round(v % 60)).padStart(2, "0")}`;

function tweenNumber(node, from, to, ms, fmt) {
  if (REDUCED || Math.abs(to - from) < 1e-6) { node.textContent = fmt(to); return; }
  const start = performance.now();
  const step = (now) => {
    const t = Math.min(1, (now - start) / ms);
    const eased = 1 - Math.pow(1 - t, 3);
    node.textContent = fmt(from + (to - from) * eased);
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function animateClock(fromClock, toClock, ms) {
  const node = $("#reprise-clock");
  if (REDUCED) { node.textContent = toClock; return; }
  const a = clockToMin(fromClock);
  const b = clockToMin(toClock);
  const start = performance.now();
  const step = (now) => {
    const t = Math.min(1, (now - start) / ms);
    node.textContent = minToClock(a + (b - a) * t);
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function setSpot(selector) {
  const grid = document.querySelector(".rp-grid");
  grid.classList.add("is-playing");
  for (const p of grid.querySelectorAll(".rp-panel")) {
    p.classList.toggle("is-spot", Boolean(selector) && p.matches(selector));
  }
}
function clearSpot() {
  const grid = document.querySelector(".rp-grid");
  grid.classList.remove("is-playing");
  for (const p of grid.querySelectorAll(".rp-panel")) p.classList.remove("is-spot");
}

function showCaption(meta) {
  if (!captionEl) return;
  captionEl.hidden = false;
  captionEl.classList.toggle("is-alert", Boolean(meta.alert));
  captionEl.classList.toggle("is-good", Boolean(meta.good));
  captionEl.querySelector(".rp-caption-clock").textContent = meta.clockLabel ?? "";
  captionEl.querySelector(".rp-caption-text").textContent = meta.caption ?? "";
  if (!REDUCED) { captionEl.style.animation = "none"; void captionEl.offsetWidth; captionEl.style.animation = ""; }
}
function hideCaption() { if (captionEl) captionEl.hidden = true; }

function tweenPower(to, dropping) {
  const node = $("[data-power-available]");
  const from = state.inputs.availablePowerMW;
  state.inputs.availablePowerMW = to;
  node.classList.toggle("is-dropping", Boolean(dropping) && to < SCENARIO.power.minFeasiblePowerMW);
  tweenNumber(node, from, to, 700, fmtMW);
}

/* ------------------------------------------------------------------ state */

const ENVELOPE = SCENARIO.power.internalEnvelopeMW;
const state = {
  mode: "x1",
  inputs: { availablePowerMW: ENVELOPE },
  playing: false,
  userInteracted: false,
  timers: [],
  countdown: null,
};

function clearTimers() {
  for (const t of state.timers) clearTimeout(t);
  state.timers = [];
  if (state.countdown) { clearInterval(state.countdown); state.countdown = null; }
}

/* --------------------------------------------------------------- rendering */

function renderStatic() {
  $("[data-order-km]").textContent = `${SCENARIO.order.totalKm} km · ${DRUMS.length} tourets`;
  $("[data-incident-line]").textContent =
    `Coupure réseau ${SCENARIO.incident.lossClock} → ${SCENARIO.incident.returnClock} · ${SCENARIO.incident.durationMinutes} minutes sans production`;
  $("[data-power-envelope]").textContent = fmtMW(ENVELOPE);
  $("[data-jury-factor]").textContent = ` ×${fmtNum(12.67, 1)}`;
  $("#reprise-clock").textContent = SCENARIO.incident.returnClock;

  renderRibbon();
  renderNeighbors();
  renderAssumptions();
}

function renderRibbon() {
  const env = evaluateAll(state.inputs).investigationEnvelope;
  for (const drum of DRUMS) {
    const node = document.getElementById(`drum-${drum.id}`);
    if (!node) continue;
    const envelope = node.querySelector(".rp-envelope");
    node.querySelectorAll(".rp-drum-id, .rp-drum-km, .rp-drum-status, .rp-lock-badge").forEach((n) => n.remove());
    node.prepend(el("span", "rp-drum-id", null, drum.id));
    el("span", "rp-drum-km", node, `${drum.km} km`);
    el("span", "rp-drum-status", node, drum.status);
    if (drum.id === "T7") {
      node.classList.add("rp-drum-hold");
      node.append(el("span", "rp-lock-badge", null, "🔒"));
      if (envelope) {
        envelope.textContent = `INTERVALLE À INVESTIGUER · ${env.meters} m — SORTIE SYNTHÉTIQUE`;
        node.append(envelope);
      }
    } else if (drum.id === "T8") {
      node.classList.add("rp-drum-idle");
    } else {
      node.classList.add("is-done");
    }
  }
}

function verdictOf(branch, recommendation) {
  if (branch.branchId === recommendation) return { cls: "is-recommended", label: "Recommandé" };
  if (branch.feasible) return { cls: "is-feasible", label: "Faisable" };
  return { cls: "is-rejected", label: "Rejeté" };
}

function renderBranches(result) {
  const host = $("#rp-branches");
  host.replaceChildren();
  for (const id of ["O0", "A", "B", "C"]) {
    const branch = result.branches[id];
    const v = verdictOf(branch, result.recommendation);
    const card = el("article", `rp-branch is-fresh ${v.cls}`, host);
    const head = el("div", "rp-branch-head", card);
    el("span", "rp-branch-id", head, id === "O0" ? "Opt. 0" : `Opt. ${id}`);
    el("span", "rp-branch-verdict", head, v.label);
    el("p", "rp-branch-name", card, branch.branchName);
    if (branch.feasible) {
      el("p", "rp-branch-metric", card, `pic ${fmtMW(branch.peakMW)} · ${branch.materialUsed} kit(s) · ${branch.durationMin} min`);
      if (!branch.logisticsFeasible) {
        el("p", "rp-branch-reason", card, "Premier camion en risque — autorité Qualité mobilisée sur T7.");
      }
    } else {
      el("p", "rp-branch-metric", card, `règle ${branch.firstViolatedRule}`);
      el("p", "rp-branch-reason", card, branch.reason);
    }
  }
}

// One horizontal bar inside a lane track.
function setLane(id, { width, cls, text }) {
  const track = document.querySelector(`#${id} .rp-gantt-track`);
  track.replaceChildren();
  const bar = el("div", `rp-bar is-fresh ${cls}`, track, text);
  bar.style.left = "2px";
  bar.style.width = `calc(${Math.max(6, Math.min(100, width))}% - 4px)`;
}

// Machine lane: the five sequenced steps as segments.
function setMachineLane(feasible) {
  const track = document.querySelector("#gantt-machine .rp-gantt-track");
  track.replaceChildren();
  const steps = SCENARIO.machineGraph.steps;
  const seg = 100 / steps.length;
  steps.forEach((step, i) => {
    const bar = el("div", `rp-bar ${feasible ? "rp-bar-ok" : "rp-bar-ghost"}`, track, step.label.split(" ")[0]);
    bar.style.left = `calc(${i * seg}% + 2px)`;
    bar.style.width = `calc(${seg}% - 4px)`;
    bar.title = step.label;
  });
}

function renderGantt(result) {
  // Show the recommended plan when feasible, otherwise Option C to expose what
  // the constraints demand (and why it is blocked).
  const display = result.branches[result.recommendation] ?? result.branches.C;
  const ceiling = Math.min(ENVELOPE, state.inputs.availablePowerMW);
  const overPower = display.peakMW > ceiling;

  setLane("gantt-energy", {
    width: (display.peakMW / ENVELOPE) * 100,
    cls: overPower ? "rp-bar-block" : "rp-bar-mint",
    text: `pic ${fmtMW(display.peakMW)} / dispo ${fmtMW(ceiling)}`,
  });
  setMachineLane(display.feasible);
  setLane("gantt-human", {
    width: display.logisticsFeasible ? 62 : 88,
    cls: display.logisticsFeasible ? "rp-bar-ok" : "rp-bar-warn",
    text: display.logisticsFeasible ? "1 autorité Qualité · dossiers T1–T6" : "1 autorité Qualité · conflit T7",
  });
  setLane("gantt-material", {
    width: (display.materialUsed / SCENARIO.material.restartKitsAvailable) * 100,
    cls: display.materialUsed <= SCENARIO.material.restartKitsAvailable ? "rp-bar-ok" : "rp-bar-block",
    text: `${display.materialUsed} / ${SCENARIO.material.restartKitsAvailable} kits qualifiés`,
  });
  setLane("gantt-quality", {
    width: 100,
    cls: result.qualityGate.open ? "rp-bar-mint" : "rp-bar-warn",
    text: result.qualityGate.open ? "T7 — porte laboratoire OUVERTE" : "T7 HOLD — porte laboratoire fermée",
  });
  setLane("gantt-logistics", {
    width: display.logisticsFeasible ? 78 : 100,
    cls: display.logisticsFeasible ? "rp-bar-mint" : "rp-bar-warn",
    text: display.logisticsFeasible
      ? `Premier camion ${SCENARIO.logistics.firstTruckClock} — faisable sous hypothèses`
      : `Premier camion ${SCENARIO.logistics.firstTruckClock} — en risque`,
  });
}

function renderNoFeasible(result) {
  const region = $("#no-feasible-plan");
  if (result.anyFeasible) {
    region.hidden = true;
    region.replaceChildren();
    document.body.dataset.feasible = "true";
  } else {
    region.hidden = false;
    region.replaceChildren();
    el("strong", null, region, "Aucun plan faisable sous les contraintes actuelles");
    el("small", null, region, `${result.noFeasibleReason} — CableTwin n'invente pas de solution ; il indique la contrainte bloquante.`);
    document.body.dataset.feasible = "false";
  }
}

function renderAuthorities(result) {
  const host = $("#authorities");
  host.replaceChildren();
  const roleNotes = {
    "Production": "confirme l'état et la capacité",
    "Maintenance / Énergie": "confirme séquence et prérequis",
    "Qualité / Laboratoire": "décide échantillonnage et disposition",
    "Logistique": "confirme séquence et chargement client",
  };
  for (const role of SCENARIO.humans.roles) {
    const card = el("div", "rp-authority", host);
    el("strong", null, card, role);
    el("small", null, card, roleNotes[role] ?? "");
  }
  const gate = $("#lab-gate");
  gate.dataset.open = String(result.qualityGate.open);
  $("[data-lab-title]").textContent = result.qualityGate.open
    ? "Porte laboratoire — OUVERTE (entrée humaine)"
    : "Porte laboratoire — FERMÉE";
  $("[data-lab-missing]").textContent = result.qualityGate.open
    ? `Disposition saisie par ${result.qualityGate.requiredRole}`
    : `Manque : ${result.qualityGate.missingEvidence} · autorité : ${result.qualityGate.requiredRole}`;
}

function renderNeighbors() {
  const res = retrieveSimilar(defaultIncidentVector());
  const host = $("#ml-neighbors");
  host.replaceChildren();
  $("[data-ml-note]").textContent = `k=${res.k} · ${res.similarityNote}`;
  for (const n of res.neighbors) {
    const card = el("article", "rp-neighbor", host);
    const head = el("div", "rp-neighbor-head", card);
    el("span", "rp-neighbor-id", head, n.id);
    el("span", "rp-neighbor-dist", head, `d=${fmtNum(n.distance, 3)}`);
    const shared = el("div", "rp-neighbor-row", card);
    el("span", "rp-neighbor-tag rp-tag-shared", shared, "Commun");
    el("span", "rp-neighbor-feats", shared, n.shared.join(" · "));
    const diff = el("div", "rp-neighbor-row", card);
    el("span", "rp-neighbor-tag rp-tag-diff", diff, "Diff.");
    el("span", "rp-neighbor-feats", diff, n.differences.join(" · "));
  }
  const ood = $("[data-ml-ood]");
  if (res.oodWarning) {
    ood.hidden = false;
    ood.textContent = "⚠ Cas hors-distribution : trop éloigné de la cohorte — à interpréter avec prudence.";
  } else {
    ood.hidden = true;
  }
}

function renderAssumptions() {
  const host = $("[data-assumptions]");
  host.replaceChildren();
  el("p", null, host,
    "Usine tunisienne fictive, câble MT XLPE 12/20 kV. Le contexte de risque de coupures est documenté (source externe) ; toutes les valeurs usine et sorties modèles sont synthétiques et à calibrer.");
  const ul = el("ul", null, host);
  el("li", null, ul, `Commande synthétique : ${DRUMS.length} tourets × 3 km = ${SCENARIO.order.totalKm} km ; T7 dans la ligne CCV, T8 non démarré.`);
  el("li", null, ul, `Jeu de puissance (SYNTHÉTIQUE / À CALIBRER) : enveloppe ${fmtMW(ENVELOPE)} ; pics 1,74 / 1,43 / 1,28 MW.`);
  el("li", null, ul, "ML : recherche de cas synthétiques (distance, ressemblances, différences, hors-distribution) ; aucune probabilité de conformité.");
  el("li", null, ul, "Le laboratoire et les humains restent l'autorité de libération ; le prototype est offline et en lecture seule.");
}

function renderDigest(result) {
  $("#decision-digest").textContent = result.digest;
}

/* ------------------------------------------------------------- recompute */

function recompute() {
  const result = evaluateAll(state.inputs);
  renderBranches(result);
  renderGantt(result);
  renderNoFeasible(result);
  renderAuthorities(result);
  renderDigest(result);
  return result;
}

/* --------------------------------------------------------------- replay */

function setNarration(text) {
  $("#rp-narration").textContent = text;
}

function setMode(mode) {
  state.mode = mode;
  document.body.dataset.mode = mode;
  for (const id of Object.keys(MODES)) {
    const btn = document.getElementById(`mode-${id}`);
    const active = id === mode;
    btn.classList.toggle("is-active", active);
    btn.setAttribute("aria-selected", String(active));
  }
  const timer = $("#jury-timer");
  timer.hidden = mode !== "jury30";
}

function stopReplay() {
  clearTimers();
  state.playing = false;
  $("#btn-play").hidden = false;
  $("#btn-pause").hidden = true;
  $(".rp-gantt-panel").dataset.playing = "false";
  clearSpot();
}

const HELD_MS = 1000; // below this a checkpoint is a fast transition: no caption churn

function applyCheckpoint(checkpointId, displayMs = 9999) {
  const meta = BEAT_META[checkpointId] ?? {};
  const beat = journalById.get(checkpointId);
  const held = displayMs >= HELD_MS;
  if (beat) setNarration(beat.text);
  // Held beats drive the caption, spotlight and clock; flashed transitions stay
  // quiet so JURY 30 S shows only its five readable beats.
  if (held) {
    if (meta.caption) showCaption(meta);
    if ("spot" in meta) setSpot(meta.spot);
    if (meta.tick) animateClock(meta.tick[0], meta.tick[1], 1500);
    else if (meta.clockLabel && /^\d{2}:\d{2}$/.test(meta.clockLabel)) $("#reprise-clock").textContent = meta.clockLabel;
  }

  // The replay itself drives the live stress test / restore so it can play
  // hands-free through the "aucun plan faisable" beat (the manual buttons stay
  // available for interactive Q&A and recompute identically).
  if (checkpointId === "stress") {
    tweenPower(Number((ENVELOPE * 0.65).toFixed(4)), true);
    recompute();
  } else if (checkpointId === "restore") {
    tweenPower(ENVELOPE, false);
    recompute();
  }
}

function playReplay() {
  if (state.playing) return;
  resetInputs();
  recompute();
  state.playing = true;
  $("#btn-play").hidden = true;
  $("#btn-pause").hidden = false;
  $(".rp-gantt-panel").dataset.playing = "true";

  const schedule = buildSchedule(state.mode);
  const total = schedule.reduce((ms, s) => ms + s.displayMs, 0);

  if (state.mode === "jury30") startCountdown(total);

  let elapsed = 0;
  schedule.forEach((step) => {
    state.timers.push(setTimeout(() => applyCheckpoint(step.checkpointId, step.displayMs), elapsed));
    elapsed += step.displayMs;
  });
  state.timers.push(setTimeout(endReplay, elapsed + 250));
}

function endReplay() {
  stopReplay();
  setNarration("Replay terminé — état final affiché. Modifiez la puissance ou relancez.");
  showCaption({ clockLabel: "état final", good: true, caption: "Reprise séquencée — engagement client protégé, T7 en attente du laboratoire." });
}

function startCountdown(totalMs) {
  const started = performance.now();
  const timer = $("#jury-timer");
  timer.hidden = false;
  const tick = () => {
    const left = Math.max(0, 30 - Math.floor((performance.now() - started) / 1000));
    timer.textContent = `00:${String(left).padStart(2, "0")}`;
    if (left <= 0 && state.countdown) { clearInterval(state.countdown); state.countdown = null; }
  };
  tick();
  state.countdown = setInterval(tick, 250);
}

/* ------------------------------------------------------------- controls */

function syncPower() {
  const p = state.inputs.availablePowerMW;
  const node = $("[data-power-available]");
  node.textContent = fmtMW(p);
  node.style.color = p < SCENARIO.power.minFeasiblePowerMW ? "var(--ft-red)" : "var(--ft-cream)";
}

function resetInputs() {
  state.inputs = { availablePowerMW: ENVELOPE };
  syncPower();
}

function stressTest() {
  tweenPower(Number((ENVELOPE * 0.65).toFixed(4)), true);
  const r = recompute();
  const alert = !r.anyFeasible;
  setNarration(alert
    ? "Puissance réduite sous le seuil : aucun plan faisable. CableTwin sait dire non."
    : "Puissance réduite — le moteur recalcule.");
  showCaption({ clockLabel: "essai", alert, caption: alert ? "Aucun plan faisable — la contrainte bloquante est nommée." : "Puissance réduite — recalcul live." });
}

function restore() {
  tweenPower(ENVELOPE, false);
  recompute();
  setNarration("Puissance restaurée — la reprise séquencée (Option C) protège l'engagement client.");
  showCaption({ clockLabel: "18:46", good: true, caption: "Reprise séquencée : l'engagement client est protégé." });
}

function resetDemo() {
  stopReplay();
  hideCaption();
  setMode("x1");
  resetInputs();
  $("#reprise-clock").textContent = SCENARIO.incident.returnClock;
  $("#jury-timer").hidden = true;
  recompute();
  setNarration("Écran de décision post-retour réseau. Choisissez une vitesse et lancez le replay.");
}

/* ---------------------------------------------------------------- init */

function buildChrome() {
  // Playhead that sweeps the Gantt while a replay runs.
  playheadEl = el("div", "rp-playhead", document.querySelector(".rp-gantt"));
  playheadEl.setAttribute("aria-hidden", "true");
  // Cinematic lower-third caption.
  captionEl = el("aside", "rp-caption", document.body);
  captionEl.setAttribute("role", "status");
  captionEl.hidden = true;
  el("div", "rp-caption-clock", captionEl);
  el("div", "rp-caption-text", captionEl);
}

function autoPlay() {
  if (state.userInteracted || state.playing) return;
  setMode("jury30");
  playReplay();
}

function init() {
  buildChrome();
  renderStatic();
  syncPower();
  recompute();
  setNarration("Écran de décision post-retour réseau — la démonstration démarre automatiquement.");

  for (const id of Object.keys(MODES)) {
    document.getElementById(`mode-${id}`).addEventListener("click", () => { stopReplay(); setMode(id); });
  }
  $("#btn-play").addEventListener("click", playReplay);
  $("#btn-pause").addEventListener("click", stopReplay);
  $("#btn-reset").addEventListener("click", resetDemo);
  $("#btn-stress").addEventListener("click", () => { stopReplay(); stressTest(); });
  $("#btn-restore").addEventListener("click", () => { stopReplay(); restore(); });

  // The first interaction anywhere cancels the auto-play (presenter takes over).
  document.addEventListener("pointerdown", () => { state.userInteracted = true; }, { once: true });
  state.timers.push(setTimeout(autoPlay, 900));

  window.addEventListener("pagehide", clearTimers, { once: true });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init, { once: true });
} else {
  init();
}
