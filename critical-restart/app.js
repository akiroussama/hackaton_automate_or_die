// CableTwin Critical Restart Lab — UI state machine and rendering.
// One deterministic state machine drives BOTH the expert mode (manual CTA)
// and the accelerated ≤30 s replay (same actions, same model, no separate
// outcome path). No network request, no machine command (CR-06).

import {
  CSB_FACTS,
  SOURCES,
  SOURCE_LABELS,
  CONSTRAINTS,
  EVIDENCE_CLASSES,
  defaultIncidentVector,
} from "../engine/critical-restart-data.js";
import { retrieveSimilar, ML_MODEL } from "../engine/critical-restart-ml.js";
import { runAllBranches, SIMULATOR_MODEL } from "../engine/critical-restart-simulator.js";

const STATES = [
  "briefing",
  "historical_frame",
  "rewind_to_gate",
  "ml_memory",
  "twin_reconciliation",
  "branch_comparison",
  "operations_signed",
  "safety_signed",
  "recommendation_finalized",
];

const CTA_LABELS = {
  briefing: "Begin the replay",
  historical_frame: "Show the 1:04 p.m. evidence frame",
  rewind_to_gate: "Rewind to the pre-start decision gate",
  ml_memory: "Ask the ML historian",
  twin_reconciliation: "Let the twin reconcile the balance",
  branch_comparison: "Rehearse the three futures",
  operations_signed: "Operations lead signs",
  safety_signed: "Process safety lead signs",
  recommendation_finalized: "Finalize the recommendation",
};

// After clicking the CTA while in state[i], we move to state[i+1]. The CTA
// therefore shows the label of the NEXT state.
const el = (id) => document.getElementById(id);

const state = {
  index: 0,
  auto: false,
  paused: false,
  autoTimer: 0,
  signatures: { ops: false, safety: false },
  run: null,
  ml: null,
};

/* ------------------------------ audit trail ------------------------------ */

function audit(text, key = false, detail = null) {
  const item = document.createElement("li");
  if (key) item.classList.add("is-key");
  item.textContent = `${String(el("audit-list").childElementCount + 1).padStart(2, "0")} · ${text}`;
  if (detail) {
    const pre = document.createElement("pre");
    pre.textContent = detail;
    item.append(pre);
  }
  el("audit-list").append(item);
  el("audit-list").scrollTop = el("audit-list").scrollHeight;
}

/* ------------------------------ static facts (rendered once) ------------ */

// Every historical number in the UI is set HERE, from CSB_FACTS — never
// duplicated as a second hardcoded literal in index.html (adversarial-review
// finding: single source of truth makes drift structurally impossible,
// rather than merely tested for after the fact).
function renderFacts() {
  const f = CSB_FACTS;
  el("fact-place-date").textContent = `${f.incident.place} — ${f.incident.date}`;
  el("fact-casualties").textContent = `${f.incident.deaths} workers killed · ${f.incident.injured} injured`;
  el("fact-report-version").textContent = `Source: ${f.reportVersion}`;

  el("hist-19").textContent = f.startupHistory.startupsAnalyzed;
  el("hist-1").textContent = f.startupHistory.startupsWithinBoundaries;
  el("hist-14").textContent = f.startupHistory.startupsWithMajorLevelSwings;
  el("hist-74").textContent = f.startupHistory.levelAlarmActivations;
  el("hist-65").textContent = f.startupHistory.highLevelSetPointExceedances;
  el("hist-15").textContent = f.startupHistory.startupsExceedingTransmitterRange;
  el("hist-8").textContent = f.startupHistory.startupsOutOfRangeOverOneHour;

  el("tower-title-ft").textContent = `RAFFINATE SPLITTER · ${f.evidenceFrame.towerHeightFeet} FT`;
  el("grad-top").textContent = String(f.evidenceFrame.towerHeightFeet);
  el("span-indicated").textContent =
    `INDICATED: ${f.evidenceFrame.indicatedPercentOfSpan}% OF SENSOR SPAN = ${f.evidenceFrame.indicatedFeet} FT`;
  el("estimate-label").textContent = `POST-INCIDENT ESTIMATE: ${f.evidenceFrame.postIncidentEstimateFeet} FT`;
  el("tower-callout-text").textContent =
    `${f.evidenceFrame.explanation} The control system indicated ${f.evidenceFrame.indicatedFeet} ft while the ` +
    `post-incident material-balance estimate was ${f.evidenceFrame.postIncidentEstimateFeet} ft.`;

  // CSB distinguishes the transmitter-associated alarm (active, acknowledged)
  // from the separate redundant hardwired alarm (did not sound) — never
  // conflate the two into one generic "unavailable" claim.
  el("alarm-line-1").textContent = `TRANSMITTER ${f.evidenceFrame.transmitterAlarmPercentOfSpan}% ALARM`;
  el("alarm-line-2").textContent = `✓ ${f.evidenceFrame.transmitterAlarmStatus.toUpperCase()}`;
  el("alarm-line-3").textContent = "⚠ REDUNDANT HARDWIRED ALARM";
  el("alarm-line-4").textContent = f.evidenceFrame.redundantHardwiredAlarmStatus.toUpperCase();

  const links = el("source-links");
  links.replaceChildren();
  for (const [key, url] of Object.entries(SOURCES)) {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = url;
    a.textContent = SOURCE_LABELS[key] ?? key;
    a.rel = "noopener";
    li.append(a);
    links.append(li);
  }
}

/* ------------------------------ rendering ------------------------------ */

function renderSteps() {
  const items = el("steps").querySelectorAll("li");
  items.forEach((item) => {
    const idx = STATES.indexOf(item.dataset.s);
    item.classList.toggle("is-done", idx < state.index);
    item.classList.toggle("is-now", idx === state.index);
  });
}

function renderReveals() {
  const current = state.index;
  document.querySelectorAll(".reveal, .reveal-svg").forEach((node) => {
    const at = STATES.indexOf(node.dataset.reveal);
    node.classList.toggle("is-open", at >= 0 && current >= at);
  });
}

function renderMl() {
  if (!state.ml) return;
  el("ml-family").textContent = state.ml.patternFamily;
  el("ml-score").textContent =
    `similarity ${state.ml.similarityScore.toFixed(2)} — not a probability`;
  const list = el("neighbors");
  list.replaceChildren();
  for (const n of state.ml.neighbors) {
    const li = document.createElement("li");
    const contrib = n.topContributions.map((c) => c.feature).join(" · ");
    li.innerHTML = `<b>${n.id}</b> — ${n.family} · distance ${n.distance.toFixed(3)}` +
      `<span class="contrib">drivers: ${contrib}</span>` +
      `<span class="contrib">${n.evidenceClass} · constrained by the CSB aggregate history</span>`;
    const linkSpan = document.createElement("span");
    linkSpan.className = "contrib";
    const link = document.createElement("a");
    link.href = SOURCES.csbFinalReport;
    link.rel = "noopener";
    link.textContent = `${SOURCE_LABELS.csbFinalReport} — startup-history aggregates (pp. 72-75)`;
    linkSpan.append(link);
    li.append(linkSpan);
    list.append(li);
  }
  el("ml-meta").textContent =
    `${state.ml.label} · model ${state.ml.modelVersion} · k=${state.ml.k} · seed ${state.ml.seed}`;
}

function sparkline(result) {
  const svgNs = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNs, "svg");
  svg.setAttribute("viewBox", "0 0 220 42");
  svg.setAttribute("class", "spark");
  svg.setAttribute("aria-hidden", "true");
  const max = 1.05;
  const points = result.series
    .map((v, i) => `${(i / Math.max(1, SIMULATOR_MODEL.horizonSteps)) * 220},${40 - (v / max) * 38}`)
    .join(" ");
  const precursorY = 40 - (SIMULATOR_MODEL.initialState.releasePrecursorAt / max) * 38;
  const line = document.createElementNS(svgNs, "line");
  line.setAttribute("x1", "0"); line.setAttribute("x2", "220");
  line.setAttribute("y1", String(precursorY)); line.setAttribute("y2", String(precursorY));
  line.setAttribute("class", "precursor");
  svg.append(line);
  const poly = document.createElementNS(svgNs, "polyline");
  poly.setAttribute("points", points);
  svg.append(poly);
  if (result.releasePrecursorReached) {
    const label = document.createElementNS(svgNs, "text");
    const labelY = precursorY < 12 ? precursorY + 10 : precursorY - 3;
    label.setAttribute("x", "60"); label.setAttribute("y", String(labelY));
    label.textContent = "RELEASE PRECURSOR REACHED — frozen";
    svg.append(label);
  }
  return svg;
}

function branchStatusText(r) {
  if (r.approvable) return "✓ approved — both signatures recorded";
  if (r.eligibleForHumanReview) return "◐ eligible for human review — awaiting signatures (CR-05)";
  return "✗ not approvable";
}

function branchStatusClass(r) {
  if (r.approvable) return "is-approved";
  if (r.eligibleForHumanReview) return "is-eligible";
  return "is-blocked";
}

function renderBranches() {
  if (!state.run) return;
  const wrap = el("branches");
  wrap.replaceChildren();
  for (const id of ["A", "B", "C"]) {
    const r = state.run.branches[id];
    const card = document.createElement("article");
    card.className = `branch ${branchStatusClass(r)}`;
    const head = document.createElement("div");
    head.className = "branch-head";
    head.innerHTML = `<b>Branch ${r.branchId} — ${r.branchName}</b>` +
      `<span class="branch-tag">${branchStatusText(r)}</span>`;
    card.append(head);
    const actions = document.createElement("ul");
    actions.className = "branch-actions";
    for (const action of r.actions) {
      const li = document.createElement("li");
      li.textContent = action;
      actions.append(li);
    }
    card.append(actions, sparkline(r));
    const reason = document.createElement("p");
    reason.className = "branch-reason";
    reason.textContent = r.humanReadableReason;
    card.append(reason);
    if (r.constraintViolations.length) {
      const viol = document.createElement("p");
      viol.className = "branch-viol";
      viol.textContent = `hard constraints violated: ${r.constraintViolations.join(" · ")}`;
      card.append(viol);
    }
    wrap.append(card);
  }
  const violated = new Set([
    ...state.run.branches.A.constraintViolations,
    ...state.run.branches.B.constraintViolations,
  ]);
  const crList = el("cr-list");
  crList.replaceChildren();
  for (const constraint of CONSTRAINTS) {
    const li = document.createElement("li");
    li.innerHTML = `<span class="cr-id">${constraint.id}</span><span>${constraint.name} — ${constraint.rule}</span>`;
    if (violated.has(constraint.id)) li.classList.add("is-violated");
    crList.append(li);
  }
}

function renderApprovals() {
  const opsReady = state.index >= STATES.indexOf("branch_comparison");
  el("sign-ops").disabled = !opsReady || state.signatures.ops;
  el("sign-safety").disabled = !state.signatures.ops || state.signatures.safety;
  el("role-ops").classList.toggle("is-signed", state.signatures.ops);
  el("role-safety").classList.toggle("is-signed", state.signatures.safety);
  el("sign-ops").textContent = state.signatures.ops ? "Signed ✓" : "Sign";
  el("sign-safety").textContent = state.signatures.safety ? "Signed ✓" : "Sign";
  el("finalize").disabled = !(state.signatures.ops && state.signatures.safety) ||
    state.index >= STATES.indexOf("recommendation_finalized");
}

function renderCta() {
  const next = STATES[state.index + 1];
  const cta = el("cta");
  if (!next) {
    cta.disabled = true;
    cta.textContent = "Replay complete — inspect the audit or Reset";
    return;
  }
  // The two signature states and finalization are driven by their own
  // dedicated controls; the big CTA pauses there in expert mode.
  if (["operations_signed", "safety_signed", "recommendation_finalized"].includes(next)) {
    cta.disabled = true;
    cta.textContent = next === "recommendation_finalized"
      ? "Awaiting dual signatures below"
      : "Awaiting the role signature below";
    return;
  }
  cta.disabled = false;
  cta.textContent = CTA_LABELS[next];
}

function apply() {
  document.body.dataset.step = STATES[state.index];
  renderSteps();
  renderReveals();
  renderMl();
  renderBranches();
  renderApprovals();
  renderCta();
}

/* ------------------------------ transitions ------------------------------ */

const STEP_AUDIT = {
  historical_frame: () => audit(
    `${EVIDENCE_CLASSES.FACT} — 1:04 p.m.: indicated ${CSB_FACTS.evidenceFrame.indicatedPercentOfSpan}% of span ` +
    `(${CSB_FACTS.evidenceFrame.indicatedFeet} ft); post-incident estimate ${CSB_FACTS.evidenceFrame.postIncidentEstimateFeet} ft ` +
    `of ${CSB_FACTS.evidenceFrame.towerHeightFeet} ft; transmitter ${CSB_FACTS.evidenceFrame.transmitterAlarmPercentOfSpan}% alarm ` +
    `${CSB_FACTS.evidenceFrame.transmitterAlarmStatus}; redundant hardwired alarm ${CSB_FACTS.evidenceFrame.redundantHardwiredAlarmStatus}.`),
  rewind_to_gate: () => audit(
    `${EVIDENCE_CLASSES.RECONSTRUCTION} — replay rewound to the pre-start decision gate (teaching checkpoint).`),
  ml_memory: () => {
    const m = state.ml;
    audit(`${EVIDENCE_CLASSES.SYNTHETIC} — ML historian retrieved "${m.patternFamily}" (similarity ${m.similarityScore.toFixed(2)}, not a probability). Model ${m.modelVersion}, k=${m.k}, seed ${m.seed}.`);
  },
  twin_reconciliation: () => audit(
    `${EVIDENCE_CLASSES.SYNTHETIC} — material balance contradicts the sensor: inferred inventory above the valid range; restart has unknown inventory.`),
  branch_comparison: () => {
    audit(`${EVIDENCE_CLASSES.SYNTHETIC} — three futures rehearsed from one initial state. A: precursor reached (frozen). B: delayed, unknown inventory. C: within the bounded envelope, pending both signatures (CR-05).`, true);
    audit(`rejected alternatives recorded: Branch A (violations ${state.run.branches.A.constraintViolations.join(",")}), Branch B (violations ${state.run.branches.B.constraintViolations.join(",")}).`);
  },
  operations_signed: () => audit(
    "APPROVAL — Operations lead: accepts the operational delay; confirms no physical command has been sent.", true),
  safety_signed: () => audit(
    "APPROVAL — Process safety lead: confirms barrier verification and exposure-zone clearance.", true),
  recommendation_finalized: () => {
    audit("RECOMMENDATION APPROVED — NO MACHINE COMMAND SENT", true);
    audit("final audit snapshot", false, buildAuditSnapshot());
  },
};

function advance() {
  if (state.index >= STATES.length - 1) return;
  state.index += 1;
  const stepName = STATES[state.index];
  STEP_AUDIT[stepName]?.();
  if (stepName === "recommendation_finalized") {
    el("final-status").textContent = "RECOMMENDATION APPROVED — NO MACHINE COMMAND SENT";
  }
  apply();
}

function buildAuditSnapshot() {
  const m = state.ml;
  return JSON.stringify({
    csbSource: { ...SOURCES, reportVersion: CSB_FACTS.reportVersion },
    disclosure: "model-generated outputs are synthetic; historical displayed values are CSB-sourced",
    input: { vector: defaultIncidentVector(), evidenceClass: EVIDENCE_CLASSES.RECONSTRUCTION },
    model: { version: m.modelVersion, k: m.k, weights: m.weights, seed: m.seed },
    simulator: SIMULATOR_MODEL.version,
    simulationOutputHash: state.run.simulationOutputHash,
    branches: Object.fromEntries(Object.entries(state.run.branches).map(([id, b]) => [id, {
      actions: b.actions,
      eligibleForHumanReview: b.eligibleForHumanReview,
      approvable: b.approvable,
      releasePrecursorReached: b.releasePrecursorReached,
      constraintViolations: b.constraintViolations,
    }])),
    approvals: {
      operationsLead: {
        signed: state.signatures.ops,
        rationale: "accepts the operational delay and confirms that no physical command has been sent",
      },
      processSafetyLead: {
        signed: state.signatures.safety,
        rationale: "confirms barrier verification and exposure-zone clearance",
      },
      note: "roles, not personal names",
    },
    machineCommandSent: false,
  }, null, 1);
}

// Re-derives all three branches with the CURRENT signature state. `approvable`
// is only ever true here once both flags are true (engine-side CR-05 gate);
// the simulationOutputHash payload excludes approvals, so it never changes.
async function refreshBranches() {
  state.run = await runAllBranches({
    approvals: { operations: state.signatures.ops, safety: state.signatures.safety },
  });
  el("hash-line").textContent = `simulation output hash: ${state.run.simulationOutputHash.slice(0, 16)}…`;
}

async function sign(role) {
  if (role === "ops" && !state.signatures.ops && state.index >= STATES.indexOf("branch_comparison")) {
    state.signatures.ops = true;
    await refreshBranches();
    advance(); // -> operations_signed
  } else if (role === "safety" && state.signatures.ops && !state.signatures.safety) {
    state.signatures.safety = true;
    await refreshBranches();
    advance(); // -> safety_signed
  }
}

function finalize() {
  if (state.signatures.ops && state.signatures.safety &&
      state.index === STATES.indexOf("safety_signed")) {
    advance(); // -> recommendation_finalized
  }
}

// Shared by boot() and reset() so a fresh load and a Reset are BYTE-IDENTICAL
// by construction: same ML call, same branch simulation (approvals cleared),
// same two audit lines, same hash. This is what makes gate 12 (exact Reset)
// hold — not a second hand-maintained code path that can drift.
async function primeReplay() {
  state.index = 0;
  state.signatures = { ops: false, safety: false };
  state.ml = retrieveSimilar(defaultIncidentVector());
  await refreshBranches();
  el("audit-list").replaceChildren();
  el("final-status").textContent = "";
  audit(`${EVIDENCE_CLASSES.FACT} — briefing loaded from the U.S. CSB record (${CSB_FACTS.incident.date}).`);
  audit(`${ML_MODEL.name} ready · deterministic seed ${ML_MODEL.seed} · no network, no machine interface (CR-06).`);
}

async function reset() {
  stopAuto();
  await primeReplay();
  apply();
}

/* ------------------------------ accelerated mode ------------------------ */

// Same state machine, same actions. Nine states -> eight transitions; the
// schedule below totals 28.4 s < 30 s. A visible pause button regains control.
const AUTO_DELAYS_MS = [1800, 4200, 3400, 4200, 3600, 4600, 2200, 2200, 2200];

function stopAuto() {
  state.auto = false;
  state.paused = false;
  window.clearTimeout(state.autoTimer);
  document.body.dataset.mode = "idle";
  el("pause").hidden = true;
  el("auto").hidden = false;
}

async function autoStep() {
  if (!state.auto || state.paused) return;
  const next = STATES[state.index + 1];
  if (!next) { stopAuto(); return; }
  if (next === "operations_signed") await sign("ops");
  else if (next === "safety_signed") await sign("safety");
  else if (next === "recommendation_finalized") finalize();
  else advance();
  const delay = AUTO_DELAYS_MS[state.index] ?? 2200;
  if (state.index < STATES.length - 1) {
    state.autoTimer = window.setTimeout(autoStep, delay);
  } else {
    stopAuto();
  }
}

async function startAuto() {
  await reset();
  state.auto = true;
  document.body.dataset.mode = "auto";
  el("pause").hidden = false;
  el("auto").hidden = true;
  audit("accelerated replay started (same state machine, same model — no separate outcome path).");
  state.autoTimer = window.setTimeout(autoStep, AUTO_DELAYS_MS[0]);
}

function togglePause() {
  if (!state.auto) return;
  state.paused = !state.paused;
  el("pause").textContent = state.paused ? "▶ Resume" : "⏸ Pause";
  if (!state.paused) state.autoTimer = window.setTimeout(autoStep, 700);
}

/* ------------------------------ sources dialog: focus management -------- */

function openDrawer() {
  el("drawer").hidden = false;
  el("close-sources").focus();
}

function closeDrawer() {
  el("drawer").hidden = true;
  el("open-sources").focus();
}

function drawerFocusables() {
  return [...el("drawer").querySelectorAll("a[href], button:not([disabled])")];
}

function trapDrawerFocus(event) {
  if (el("drawer").hidden || event.key !== "Tab") return;
  const list = drawerFocusables();
  if (!list.length) return;
  const first = list[0];
  const last = list[list.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

/* ------------------------------ boot ------------------------------ */

async function boot() {
  renderFacts();
  await primeReplay();

  el("cta").addEventListener("click", advance);
  el("auto").addEventListener("click", startAuto);
  el("pause").addEventListener("click", togglePause);
  el("reset").addEventListener("click", reset);
  el("sign-ops").addEventListener("click", () => sign("ops"));
  el("sign-safety").addEventListener("click", () => sign("safety"));
  el("finalize").addEventListener("click", finalize);
  el("open-sources").addEventListener("click", openDrawer);
  el("close-sources").addEventListener("click", closeDrawer);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !el("drawer").hidden) {
      closeDrawer();
      return;
    }
    trapDrawerFocus(event);
  });

  apply();
}

boot();
