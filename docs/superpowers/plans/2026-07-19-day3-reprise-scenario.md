# Day 3 "Reprise" Scenario — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans
> (inline, by Claude) to implement this plan task-by-task. Steps use checkbox
> (`- [ ]`) syntax for tracking. Subagents are NOT used (Oussama did not request
> them; Claude owns execution-heavy repository work).

**Goal:** Ship the approved Day 3 flagship scenario *"58 minutes sans réseau —
24 km d'engagement client"* as a new isolated route with one dominant
Energy × Quality decision screen and four narration speeds
(`EXPERT ×1`, `REPLAY ×5`, `REPLAY ×7`, `JURY 30 S`) driven by one shared
deterministic engine, matching the dark `/#twin` "Jumeau atelier" look & feel.

**Architecture:** Pure deterministic ES-module engine in `engine/reprise-*.js`
(data, ML case-retrieval, constraint engine, replay journal + display
scheduler). A standalone static route in `reprise/` (`index.html` + `app.js` +
`styles.css`) renders every number from the engine via structured DOM ids and
plays the shared business-event journal at four display speeds. The display
scheduler is the ONLY thing that differs between modes; the decision engine
never imports or reads the display mode. Tests live in
`scripts/reprise.test.mjs` (run via `npm run check:reprise`) so the frozen
`tests/` count is untouched.

**Tech Stack:** Vanilla ES modules, `node:test` + `node:assert/strict`, Web
Crypto (`crypto.subtle`) for the live digest, the existing `styles.css` design
tokens, Playwright (via MCP) for browser/offline/timing self-QA. No new runtime
dependencies.

## Global Constraints

Copied verbatim from the approved contract
(`Day3/scenarios/cabletwin-day3-final-consolidated-scenario.md`) and the
coordination lock. Every task's requirements implicitly include this section.

- **Scope isolation:** create a NEW route and NEW files only. Do NOT modify or
  replace the accepted production twin (`app/`, `engine/twin-engine.js`, the ML
  recommender). Do NOT reuse or revive the abandoned `critical-restart/` /
  `engine/critical-restart-*.js`. Do NOT mutate `packaging/`, `phase2-final`,
  `phase2-submission-final`, or any accepted Day 2/Day 3 deliverable.
- **No deployment** until Codex adversarial review returns `ACCEPT`.
- **No new external dependency** unless indispensable. Offline: zero external
  request during the demo.
- **One causal trigger only:** the 17:42 local power loss, 58-minute
  interruption, 18:40 return. No broken X-ray, missing expert, splice, unique
  filter, or secondary catastrophe.
- **Order = 8 continuous drums × 3 km = 24 km.** T1–T6 outside the incident,
  histories intact, normal release flow. T7 in CCV, entire drum `HOLD`. T8
  `NON DÉMARRÉ / REPLANIFIÉ`.
- **Four evidence labels must stay visible:** `FAIT EXTERNE VÉRIFIÉ`,
  `ENTRÉE SCÉNARIO — SYNTHÉTIQUE`, `SORTIE MODÈLE — SYNTHÉTIQUE / À CALIBRER`,
  `ENTRÉE HUMAINE OU LABORATOIRE`.
- **Every plant value and model output is synthetic** and carries its label.
  Power set (badge `SYNTHÉTIQUE / À CALIBRER`): internal recovery envelope
  `1.50 MW`; "restart all" peak `1.74 MW` → rejected; conservative peak
  `1.43 MW` → feasible; sequenced peak `1.28 MW` → feasible; below a
  demo-chosen threshold, NO branch is feasible.
- **Mode identity:** same `scenario_id`, seed, initial state, ordered rule list,
  ordered business journal (minus display timestamps), engine calls, results and
  final decision state across `EXPERT ×1` and `JURY 30 S`. Only the display
  schedule differs. A deterministic digest over those elements is a
  non-drift TEST proof — NOT a cryptographic claim shown to the jury. The
  visible proof is the live recompute and the ability to produce
  `Aucun plan faisable`.
- **JURY 30 S:** the same scenario compacted to ≤30 s, effective avg ×12.67
  (380 s / 30 s). Five business beats readable 4–7 s each; non-critical
  transitions and narration pauses compressed; pausable/inspectable at every
  checkpoint; must not skip the `Aucun plan faisable` passage, load different
  results, use a video as fake live, or mutate a rule/threshold to reach C.
- **Forbidden wording (must be absent from runtime + copy):** `sauvé`,
  `partiellement libéré`, `ship-ready`, `épissé`, `rebut certain`,
  "CableTwin prédit la coupure", "le ML prédit/certifie la conformité",
  "sauve 24 km / 145 m / 90 %", "certainement bonne / certainement rebut",
  "reprise certifiée/légale/prouvée", live STEG/OPC-UA/PLC/Edge connection,
  "réseau neuronal thermique" (not implemented), "données d'une usine réelle",
  "pilote industriel / ROI réel", unverified STEG tariff / avoided cost / OEE /
  annual saving, "48 heures de dégazage" as a universal rule,
  "aucun concurrent ne fait cela", crypto/append-only audit claim,
  personal blame on a named manager.
- **Forbidden result fields (never on any engine result object):** conformity
  probability, `livesSaved`, avoided cost, ROI, OEE, annual gain, certain-scrap
  length, clustering accuracy.
- **Hard rules the engine must enforce:** cannot produce on the backup source;
  cannot start large consumers simultaneously beyond the internal envelope;
  cannot start a step before its prerequisites; cannot use a team/resource twice
  at the same instant; cannot consume absent material; cannot release T7 without
  the required role + evidence; cannot manually reduce the minimum investigation
  envelope. Quality gate changes ONLY via a human/lab input.
- **Language:** all UI copy in French (matches the existing demo).
- **Route token:** `reprise` (route dir `reprise/`, engine prefix
  `engine/reprise-*.js`, tests `scripts/reprise.test.mjs`, npm `check:reprise`).

---

## File Structure

**Engine (pure, deterministic — `engine/`):**

- `engine/reprise-data.js` — single source of truth for all synthetic inputs
  (drums, incident timeline, four evidence labels, power set, machine dependency
  graph + interlocks, restart-material stock, human authorities/roles, quality
  gate state, logistics window, ML synthetic cohort + feature names, branch
  definitions Option 0/A/B/C, constraint catalogue, investigation-envelope
  formula inputs, forbidden-fields list). Values modifiable WITHOUT changing
  engine rules.
- `engine/reprise-ml.js` — deterministic weighted k-NN case retrieval over the
  synthetic cohort: distance, shared features, critical differences, OOD
  warning. Never a conformity probability.
- `engine/reprise-engine.js` — deterministic twin: reconstructs state + minimum
  investigation envelope; keeps T7 `HOLD`; enumerates bounded recovery
  sequences; computes peak power, duration, material, human conflicts, logistics
  feasibility; rejects rule-violating sequences with the FIRST violated rule;
  returns `Aucun plan faisable` when power < minimum need; computes the
  deterministic decision digest (excludes display timing). Exposes
  `SCENARIO_ID`, `SEED`, `INITIAL_STATE`, `RULES` (ordered, id'd),
  `evaluateAll(inputs)`.
- `engine/reprise-replay.js` — ordered business-event journal (simulated-time
  stamps, NOT display time), checkpoints, `computeDecisionDigest(engineResult)`,
  `buildSchedule(mode)` → per-checkpoint display durations for ×1/×5/×7/JURY.
  Imports engine outputs but NEVER exposes the display mode to the engine.

**Route (presentation — `reprise/`):**

- `reprise/index.html` — the dominant WOW screen skeleton with structured DOM
  ids (all numbers injected by app.js; no hardcoded literals), the mode player
  controls, the STRESS TEST / RESTAURER controls, the four evidence labels, the
  `Aucun plan faisable` region, the four authorities + closed lab gate, the
  permanent footer, an audit/assumptions drawer.
- `reprise/styles.css` — the dark `/#twin` aesthetic built on the shared design
  tokens; `:focus-visible`; `@media (prefers-reduced-motion: reduce)`;
  responsive at 1920×1080 and 1366×768.
- `reprise/app.js` — wires engine + ml + replay to the DOM: renders ribbon /
  Gantt / ML / authorities from data; runs the replay scheduler per mode;
  STRESS TEST (−35 % power) → live recompute → `Aucun plan faisable`;
  RESTAURER → recompute C; pause/inspect at checkpoints; exact reset; keyboard /
  focus; offline; live digest via Web Crypto.

**Tests / scripts:**

- `scripts/reprise.test.mjs` — the acceptance-gate unit suite.
- `package.json` — add `"check:reprise": "node --test scripts/reprise.test.mjs"`.
- (self-QA only, not committed unless useful) Playwright MCP session for
  browser render / offline / 30-s timing / responsive evidence.

---

## Task 1: Scenario data module

**Files:**
- Create: `engine/reprise-data.js`
- Test: `scripts/reprise.test.mjs`

**Interfaces:**
- Produces: `EVIDENCE_CLASSES` (`{ EXTERNAL_FACT, SYNTHETIC_INPUT,
  SYNTHETIC_OUTPUT, HUMAN_LAB }` string constants matching the four labels);
  `SCENARIO` (`{ id, seed, order: { drums: [...8] }, incident, power,
  machineGraph, material, humans, quality, logistics }`); `DRUMS` (8 objects
  `{ id: "T1".."T8", km: 3, status, inIncident }`); `CONSTRAINTS` (array of
  `{ id, domain, label }` covering energy/machine/material/human/quality/
  logistics); `BRANCHES` (Option 0/A/B/C definitions with encoded sim inputs);
  `FEATURE_NAMES` + `FEATURE_COUNT`; `COHORT_SEED`;
  `buildSyntheticCohort(seed?)` → deterministic rows
  `{ id, features:[...], label, differences }`; `FORBIDDEN_RESULT_FIELDS`;
  `defaultIncidentVector()`.

- [ ] **Step 1: Write the failing test** (append to `scripts/reprise.test.mjs`)

```js
import test from "node:test";
import assert from "node:assert/strict";
import {
  EVIDENCE_CLASSES, SCENARIO, DRUMS, CONSTRAINTS, BRANCHES,
  FEATURE_COUNT, buildSyntheticCohort, FORBIDDEN_RESULT_FIELDS,
} from "../engine/reprise-data.js";

test("scenario data is synthetic, 24 km over 8 drums, T7 HOLD, T8 not started", () => {
  assert.equal(SCENARIO.id, "reprise-58min-24km");
  assert.equal(DRUMS.length, 8);
  assert.equal(DRUMS.reduce((km, d) => km + d.km, 0), 24);
  const t7 = DRUMS.find((d) => d.id === "T7");
  const t8 = DRUMS.find((d) => d.id === "T8");
  assert.equal(t7.status, "HOLD");
  assert.equal(t7.inIncident, true);
  assert.match(t8.status, /NON DÉMARRÉ|REPLANIFIÉ/);
  for (const d of DRUMS.filter((x) => ["T1","T2","T3","T4","T5","T6"].includes(x.id))) {
    assert.equal(d.inIncident, false);
  }
});

test("the incident is a single power-loss trigger, 17:42 → 18:40, 58 minutes", () => {
  assert.equal(SCENARIO.incident.lossClock, "17:42");
  assert.equal(SCENARIO.incident.returnClock, "18:40");
  assert.equal(SCENARIO.incident.durationMinutes, 58);
  assert.equal(SCENARIO.incident.causes.length, 1);
});

test("the synthetic power set matches the approved calibration badge values", () => {
  assert.equal(SCENARIO.power.internalEnvelopeMW, 1.50);
  assert.equal(SCENARIO.power.restartAllPeakMW, 1.74);
  assert.equal(SCENARIO.power.conservativePeakMW, 1.43);
  assert.equal(SCENARIO.power.sequencedPeakMW, 1.28);
});

test("the constraint catalogue declares all six decision domains", () => {
  const domains = new Set(CONSTRAINTS.map((c) => c.domain));
  for (const d of ["energy","machine","material","human","quality","logistics"]) {
    assert.ok(domains.has(d), `missing domain: ${d}`);
  }
  assert.equal(BRANCHES.map((b) => b.id).sort().join(","), "A,B,C,O0");
});

test("the synthetic cohort is deterministic and well-formed, no conformity label", () => {
  const a = buildSyntheticCohort();
  const b = buildSyntheticCohort();
  assert.deepEqual(a, b);
  for (const row of a) {
    assert.equal(row.features.length, FEATURE_COUNT);
    assert.equal(row.evidenceClass, EVIDENCE_CLASSES.SYNTHETIC_INPUT);
    for (const v of row.features) assert.ok(v >= 0 && v <= 1);
    assert.ok(!("conformityProbability" in row));
  }
  assert.ok(FORBIDDEN_RESULT_FIELDS.includes("conformityProbability"));
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `node --test scripts/reprise.test.mjs`
Expected: FAIL — `Cannot find module '../engine/reprise-data.js'`.

- [ ] **Step 3: Implement `engine/reprise-data.js`**

Encode: the four `EVIDENCE_CLASSES`; `SCENARIO` with `id:"reprise-58min-24km"`,
`seed`, `incident { lossClock:"17:42", returnClock:"18:40",
durationMinutes:58, causes:["local grid power loss"] }`, `power` with the four
MW values, `machineGraph` (ordered dependency steps: safety-aux → cooling →
pressure/water/command checks → thermal zones (sequenced) → extrusion/drives),
`material` (limited qualified restart-kit stock), `humans` (one Quality shift
authority + roles, T1–T6 dossiers must close before `05:45`), `quality`
(T7 gate closed, required role + evidence), `logistics`
(first truck `06:30`, cutoff `05:45`). `DRUMS` = T1–T6 done/intact,
T7 HOLD/inIncident, T8 not-started. `CONSTRAINTS` = one entry per domain (ids
`R-ENERGY`, `R-MACHINE`, `R-MATERIAL`, `R-HUMAN`, `R-QUALITY`, `R-LOGISTICS`,
plus `R-BACKUP` and `R-ENVELOPE-LOCK`). `BRANCHES` ids `O0,A,B,C` with encoded
sim inputs (peaks, material, human slot, step order). `FEATURE_NAMES` = the
visible ML features (downtime, run position, aux state, pre-stop dimensional
drift, restart stock, available power, role availability). `buildSyntheticCohort`
= deterministic rows from a seeded generator (mirror the critical-restart
cohort determinism). `FORBIDDEN_RESULT_FIELDS` = `["conformityProbability",
"livesSaved","roi","oee","annualSaving","avoidedCost","certainScrapMeters",
"clusteringAccuracy"]`. `defaultIncidentVector()` returns the current-incident
feature vector.

- [ ] **Step 4: Run to verify it passes**

Run: `node --test scripts/reprise.test.mjs`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add engine/reprise-data.js scripts/reprise.test.mjs
git commit -m "feat(reprise): synthetic scenario data for the 58min/24km Day 3 scenario"
```

---

## Task 2: ML case retrieval

**Files:**
- Create: `engine/reprise-ml.js`
- Test: `scripts/reprise.test.mjs`

**Interfaces:**
- Consumes: `FEATURE_NAMES`, `FEATURE_COUNT`, `COHORT_SEED`,
  `buildSyntheticCohort`, `EVIDENCE_CLASSES`, `defaultIncidentVector` from
  Task 1.
- Produces: `ML_MODEL` (`{ name, version, k, seed, weights }`);
  `retrieveSimilar(vector, options?)` →
  `{ evidenceClass, label, similarityScore, similarityNote, neighbors:[{ id,
  distance, shared:[...], differences:[...] }], oodWarning:boolean, modelVersion,
  k, weights, seed }`. `similarityScore` bounded (0,1], explicitly NOT a
  probability; `oodWarning` true when mean distance exceeds an encoded
  threshold.

- [ ] **Step 1: Write the failing test**

```js
import { ML_MODEL, retrieveSimilar } from "../engine/reprise-ml.js";
import { defaultIncidentVector } from "../engine/reprise-data.js";

test("ML retrieval is deterministic and explainable, never a conformity probability", () => {
  const r1 = retrieveSimilar(defaultIncidentVector());
  const r2 = retrieveSimilar(defaultIncidentVector());
  assert.deepEqual(r1, r2);
  assert.equal(r1.neighbors.length, ML_MODEL.k);
  for (const n of r1.neighbors) {
    assert.ok(Number.isFinite(n.distance));
    assert.ok(Array.isArray(n.shared) && Array.isArray(n.differences));
  }
  assert.ok(r1.similarityScore > 0 && r1.similarityScore <= 1);
  assert.match(r1.similarityNote, /pas une probabilité|not a probability/i);
  assert.ok(!("conformityProbability" in r1));
});

test("a far-off-distribution vector raises the OOD warning", () => {
  const far = new Array(defaultIncidentVector().length).fill(0.99);
  const res = retrieveSimilar(far);
  assert.equal(res.oodWarning, true);
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `node --test scripts/reprise.test.mjs`
Expected: FAIL — `Cannot find module '../engine/reprise-ml.js'`.

- [ ] **Step 3: Implement `engine/reprise-ml.js`**

Mirror `engine/critical-restart-ml.js`: fixed inspectable weights, weighted
Euclidean `distance`, top feature `differences`/`shared` per neighbor, k=3
(the WOW panel shows max three neighbors), `similarityScore = 1/(1+4*mean)`,
`similarityNote` in French ("score de similarité — pas une probabilité, jamais
une autorisation"), `oodWarning = meanDistance > OOD_THRESHOLD`. No family/vote
or conformity output.

- [ ] **Step 4: Run to verify it passes**

Run: `node --test scripts/reprise.test.mjs`
Expected: PASS (7 tests total).

- [ ] **Step 5: Commit**

```bash
git add engine/reprise-ml.js scripts/reprise.test.mjs
git commit -m "feat(reprise): deterministic explainable k-NN case retrieval"
```

---

## Task 3: Deterministic constraint engine

**Files:**
- Create: `engine/reprise-engine.js`
- Test: `scripts/reprise.test.mjs`

**Interfaces:**
- Consumes: `SCENARIO`, `DRUMS`, `CONSTRAINTS`, `BRANCHES`,
  `EVIDENCE_CLASSES`, `FORBIDDEN_RESULT_FIELDS` from Task 1.
- Produces: `SCENARIO_ID`, `SEED`, `INITIAL_STATE`, `RULES` (ordered
  `[{ id, label }]`); `evaluateBranch(branchId, inputs)` →
  `{ branchId, feasible, firstViolatedRule|null, reason, peakMW, durationMin,
  materialUsed, humanConflicts:[...], logisticsFeasible, drumStatuses:{T1..T8},
  investigationEnvelope:{ meters, formula, label }, evidenceClass }`;
  `evaluateAll(inputs)` → `{ branches:{O0,A,B,C}, recommendation:"C"|null,
  anyFeasible:boolean, noFeasibleReason|null, qualityGate:{ open:false,
  missingEvidence, requiredRole }, digest }`. `inputs` includes
  `availablePowerMW` and optional `manualEnvelopeMeters` (rejected if below
  minimum) and `labResult` (the ONLY thing that can change the quality gate).
  `evaluateAll` never reads a display mode.

- [ ] **Step 1: Write the failing tests**

```js
import {
  RULES, INITIAL_STATE, evaluateBranch, evaluateAll, SCENARIO_ID,
} from "../engine/reprise-engine.js";
import { SCENARIO, FORBIDDEN_RESULT_FIELDS } from "../engine/reprise-data.js";

const nominal = () => ({ availablePowerMW: SCENARIO.power.internalEnvelopeMW });

test("Option 0 (backup source) is a hard immediate rejection", () => {
  const r = evaluateBranch("O0", nominal());
  assert.equal(r.feasible, false);
  assert.equal(r.firstViolatedRule, "R-BACKUP");
});

test("Option A (restart all) is hard-rejected for the first violated rule, not a red score", () => {
  const r = evaluateBranch("A", nominal());
  assert.equal(r.feasible, false);
  assert.ok(["R-ENERGY", "R-MACHINE"].includes(r.firstViolatedRule));
  assert.ok(r.reason.length > 0);
});

test("Options B and C are both feasible; C has the lower peak and material", () => {
  const b = evaluateBranch("B", nominal());
  const c = evaluateBranch("C", nominal());
  assert.equal(b.feasible, true);
  assert.equal(c.feasible, true);
  assert.ok(c.peakMW < b.peakMW);
  assert.ok(c.materialUsed <= b.materialUsed);
});

test("C keeps T7 HOLD and T8 replanned regardless of feasibility", () => {
  const c = evaluateBranch("C", nominal());
  assert.equal(c.drumStatuses.T7, "HOLD");
  assert.match(c.drumStatuses.T8, /REPLANIFIÉ|NON DÉMARRÉ/);
});

test("below the minimum power threshold NO branch is feasible and the blocking constraint is named", () => {
  const low = evaluateAll({ availablePowerMW: 0.8 });
  assert.equal(low.anyFeasible, false);
  assert.equal(low.recommendation, null);
  assert.match(low.noFeasibleReason, /puissance|énergie/i);
});

test("the minimum investigation envelope cannot be manually reduced", () => {
  const full = evaluateBranch("C", nominal());
  const tampered = evaluateBranch("C", { ...nominal(), manualEnvelopeMeters: 1 });
  assert.equal(tampered.investigationEnvelope.meters, full.investigationEnvelope.meters);
});

test("the quality gate only changes through a lab/human result", () => {
  const noLab = evaluateAll(nominal());
  assert.equal(noLab.qualityGate.open, false);
  const withLab = evaluateAll({ ...nominal(), labResult: { role: "quality-authority", pass: true } });
  assert.equal(withLab.qualityGate.open, true);
});

test("the decision digest is stable across repeated evaluations", () => {
  assert.equal(evaluateAll(nominal()).digest, evaluateAll(nominal()).digest);
  assert.match(evaluateAll(nominal()).digest, /^[0-9a-f]{16,}$/);
});

test("no engine result carries a forbidden field and every result is labelled synthetic", () => {
  const all = evaluateAll(nominal());
  for (const r of Object.values(all.branches)) {
    for (const f of FORBIDDEN_RESULT_FIELDS) assert.ok(!(f in r), `${f} on ${r.branchId}`);
    assert.ok(r.evidenceClass);
  }
});

test("RULES is an ordered id'd list and the engine never imports a display mode", () => {
  assert.ok(RULES.every((rule) => rule.id && rule.label));
  const src = readFileSync(new URL("../engine/reprise-engine.js", import.meta.url), "utf8");
  assert.ok(!/reprise-replay|displayMode|JURY_30/.test(src), "engine must not know the display layer");
  assert.equal(SCENARIO_ID, "reprise-58min-24km");
});
```

(Add `import { readFileSync } from "node:fs";` to the test file header.)

- [ ] **Step 2: Run to verify it fails**

Run: `node --test scripts/reprise.test.mjs`
Expected: FAIL — `Cannot find module '../engine/reprise-engine.js'`.

- [ ] **Step 3: Implement `engine/reprise-engine.js`**

Deterministic evaluation per branch:
- `investigationEnvelope.meters = round(lineSpeed * uncertainHistoryWindow +
  encodedProcessMargin)`; label `SORTIE MODÈLE — SYNTHÉTIQUE / À CALIBRER`;
  `manualEnvelopeMeters` ignored if below `meters` (enforces `R-ENVELOPE-LOCK`).
- Rules evaluated in fixed order; the FIRST violated one sets
  `firstViolatedRule` and `feasible=false`:
  `R-BACKUP` (O0: production on backup source), `R-ENERGY`
  (`peakMW > availablePowerMW` OR `> internalEnvelopeMW`), `R-MACHINE`
  (step before prerequisite / interlock order), `R-MATERIAL` (kit stock <
  needed), `R-HUMAN` (same authority double-booked), `R-LOGISTICS`
  (first-truck sequence/cutoff broken).
- Peaks per branch come from `SCENARIO.power` (A=1.74 rejected, B=1.43,
  C=1.28); duration/material/humanConflicts encoded per branch in
  `reprise-data`.
- `evaluateAll`: run O0/A/B/C; `anyFeasible = B||C feasible`;
  `recommendation = "C"` when feasible and lower peak/material/conflict than B,
  else null; when `availablePowerMW` below the min feasible need,
  everything infeasible → `noFeasibleReason` names the binding constraint
  (`R-ENERGY`). `qualityGate.open` = false unless a valid `labResult` with the
  required role is passed. `digest` = short hex (Web-Crypto in browser / node
  `crypto`) over `{ SCENARIO_ID, SEED, INITIAL_STATE, RULES.map(id), inputs
  (sans display), branch results, qualityGate, recommendation }`. Attach
  `evidenceClass` to every branch result. Never reference a display mode.

- [ ] **Step 4: Run to verify it passes**

Run: `node --test scripts/reprise.test.mjs`
Expected: PASS (all Task 1–3 tests).

- [ ] **Step 5: Commit**

```bash
git add engine/reprise-engine.js scripts/reprise.test.mjs
git commit -m "feat(reprise): deterministic multi-constraint recovery engine"
```

---

## Task 4: Replay journal + display scheduler + mode identity

**Files:**
- Create: `engine/reprise-replay.js`
- Test: `scripts/reprise.test.mjs`

**Interfaces:**
- Consumes: `evaluateAll`, `SCENARIO_ID`, `SEED`, `INITIAL_STATE`, `RULES`
  from Task 3; `SCENARIO` from Task 1.
- Produces: `BUSINESS_JOURNAL` (ordered `[{ id, simClock, beat, text }]` — NO
  display time); `CHECKPOINTS` (ordered ids the player pauses at);
  `MODES` (`{ "x1","x5","x7","jury30" }`); `buildSchedule(mode)` →
  `[{ checkpointId, displayMs }]`; `computeModeDigest(mode, inputs)` → the
  identity digest computed from engine + journal WITHOUT the display schedule;
  `JURY_BEATS` (the five 4–7 s beats).

- [ ] **Step 1: Write the failing tests**

```js
import {
  BUSINESS_JOURNAL, buildSchedule, computeModeDigest, JURY_BEATS, MODES,
} from "../engine/reprise-replay.js";
import { SCENARIO } from "../engine/reprise-data.js";

const nominal = () => ({ availablePowerMW: SCENARIO.power.internalEnvelopeMW });

test("EXPERT x1 and JURY 30 S share an identical decision digest — only display timing differs", () => {
  assert.equal(computeModeDigest("x1", nominal()), computeModeDigest("jury30", nominal()));
  const a = buildSchedule("x1");
  const j = buildSchedule("jury30");
  assert.notDeepEqual(a.map((s) => s.displayMs), j.map((s) => s.displayMs));
  assert.deepEqual(a.map((s) => s.checkpointId), j.map((s) => s.checkpointId));
});

test("the JURY 30 S schedule totals <= 30 s with five readable 4-7 s beats", () => {
  const total = buildSchedule("jury30").reduce((ms, s) => ms + s.displayMs, 0);
  assert.ok(total <= 30000, `jury replay is ${total} ms`);
  assert.equal(JURY_BEATS.length, 5);
  for (const b of JURY_BEATS) assert.ok(b.displayMs >= 4000 && b.displayMs <= 7000);
});

test("the business journal is one ordered sequence reused by every mode", () => {
  assert.ok(BUSINESS_JOURNAL.length >= 5);
  const ids = BUSINESS_JOURNAL.map((e) => e.id);
  assert.deepEqual(ids, [...ids].sort((a, b) =>
    BUSINESS_JOURNAL.findIndex((e) => e.id === a) - BUSINESS_JOURNAL.findIndex((e) => e.id === b)));
  assert.ok(Object.keys(MODES).includes("jury30"));
  for (const e of BUSINESS_JOURNAL) assert.ok(!("displayMs" in e), "journal must carry no display time");
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `node --test scripts/reprise.test.mjs`
Expected: FAIL — `Cannot find module '../engine/reprise-replay.js'`.

- [ ] **Step 3: Implement `engine/reprise-replay.js`**

`BUSINESS_JOURNAL` = the 12 expert beats (0:00–6:20 table in the contract §8),
each with a `simClock` and semantic `beat` id, NO display time. `CHECKPOINTS`
= the pausable checkpoint ids (incident, uncertainty, ml, futures, stress,
restore, decision). `buildSchedule("x1")` maps each checkpoint to its natural
duration (sum ≈ 380 s); `x5`/`x7` divide non-critical durations; `jury30`
uses the five `JURY_BEATS` (4–7 s each, ≤30 s total) + compressed transitions.
`computeModeDigest(mode, inputs)` calls `evaluateAll(inputs)` and hashes
`{ SCENARIO_ID, SEED, INITIAL_STATE, RULES.map(id), BUSINESS_JOURNAL (minus any
timing), engineResult }` — the SAME value for any mode (the mode argument is
accepted for symmetry but never enters the hash). `MODES` metadata (labels,
effective factor: jury `×12.67`).

- [ ] **Step 4: Run to verify it passes**

Run: `node --test scripts/reprise.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add engine/reprise-replay.js scripts/reprise.test.mjs
git commit -m "feat(reprise): shared business journal + display scheduler with mode-identity digest"
```

---

## Task 5: Route scaffold — HTML skeleton + styles

**Files:**
- Create: `reprise/index.html`, `reprise/styles.css`
- Test: `scripts/reprise.test.mjs`

**Interfaces:**
- Consumes: nothing at runtime yet (app.js wired in Task 6). The test asserts
  structure only.

Required structured DOM ids (populated by app.js from engine data — NEVER
hardcoded literals): `reprise-clock`, `mode-x1`, `mode-x5`, `mode-x7`,
`mode-jury30`, `jury-timer`, `btn-play`, `btn-pause`, `btn-reset`,
`btn-stress`, `btn-restore`, `drum-ribbon` (8 `drum-T1..drum-T8` children),
`t7-envelope`, `gantt-energy`, `gantt-machine`, `gantt-human`,
`gantt-material`, `gantt-quality`, `gantt-logistics`, `ml-neighbors`,
`no-feasible-plan`, `authorities` (four role nodes + `lab-gate`),
`decision-digest`, `evidence-legend` (the four labels), `assumptions-drawer`,
`perma-footer`.

- [ ] **Step 1: Write the failing test**

```js
const repriseFile = (name) => readFileSync(new URL(`../reprise/${name}`, import.meta.url), "utf8");

test("the route skeleton exposes every structured DOM id and no hardcoded engine literals", () => {
  const html = repriseFile("index.html");
  for (const id of [
    "reprise-clock","mode-x1","mode-x5","mode-x7","mode-jury30","jury-timer",
    "btn-play","btn-pause","btn-reset","btn-stress","btn-restore",
    "drum-ribbon","t7-envelope","gantt-energy","gantt-machine","gantt-human",
    "gantt-material","gantt-quality","gantt-logistics","ml-neighbors",
    "no-feasible-plan","authorities","lab-gate","decision-digest",
    "evidence-legend","assumptions-drawer","perma-footer",
  ]) assert.ok(html.includes(`id="${id}"`), `missing id: ${id}`);
  for (const drum of ["T1","T2","T3","T4","T5","T6","T7","T8"]) {
    assert.ok(html.includes(`id="drum-${drum}"`), `missing drum node: ${drum}`);
  }
  // Live numbers must be injected, not hardcoded in the markup.
  for (const literal of ["1.74","1.43","1.28","58 minutes","×12,67"]) {
    assert.ok(!html.includes(literal), `value must be dynamic, not hardcoded: "${literal}"`);
  }
});

test("the four evidence labels and the permanent footer are present in the markup", () => {
  const html = repriseFile("index.html");
  for (const label of [
    "FAIT EXTERNE VÉRIFIÉ","ENTRÉE SCÉNARIO — SYNTHÉTIQUE",
    "SORTIE MODÈLE — SYNTHÉTIQUE / À CALIBRER","ENTRÉE HUMAINE OU LABORATOIRE",
  ]) assert.ok(html.includes(label), `missing evidence label: ${label}`);
  assert.match(html, /n['’]est ni un système de sécurité/i);
});

test("styles define focus-visible and honour reduced motion", () => {
  const css = repriseFile("styles.css");
  assert.match(css, /:focus-visible/);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `node --test scripts/reprise.test.mjs`
Expected: FAIL — `ENOENT ../reprise/index.html`.

- [ ] **Step 3: Implement `reprise/index.html` + `reprise/styles.css`**

HTML: `lang="fr"`, links `/reprise/styles.css` + `<script type="module"
src="/reprise/app.js">`. Layout top→bottom: permanent evidence banner +
`evidence-legend` (four labels); header (brand, mode buttons
`mode-x1/x5/x7/jury30`, `jury-timer` showing `00:30`, play/pause/reset,
`btn-stress` "STRESS TEST −35 %", `btn-restore` "RESTAURER", `reprise-clock`);
dominant grid — top `drum-ribbon` (8 `drum-Tn` + `t7-envelope` sub-zone),
center Energy × Quality Gantt rows (`gantt-energy/machine/human/material/
quality/logistics`), side `ml-neighbors`; a `no-feasible-plan` region (hidden
by default); `authorities` (Production, Maintenance/Énergie, Qualité/Labo with
`lab-gate` closed, Logistique); `decision-digest`; `assumptions-drawer`
(`<details>`); `perma-footer` with the §7 disclaimer. Placeholders (`—`) for
all live values.
CSS: reuse the `styles.css` token names (`--deep`, `--teal`, `--mint`,
`--orange`, `--red`, `--cream`, radius/shadow) via a local `:root` copy or an
`@import "/app/styles.css"` guarded to tokens only; adopt the dark
`body { background:#071f1c }` `/#twin` aesthetic; grid layout for the dominant
screen; `:focus-visible` (3px orange outline); reduced-motion block; media
queries verified at 1920×1080 and 1366×768. No external font/URL.

- [ ] **Step 4: Run to verify it passes**

Run: `node --test scripts/reprise.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add reprise/index.html reprise/styles.css scripts/reprise.test.mjs
git commit -m "feat(reprise): dominant Energy x Quality screen skeleton + dark twin styling"
```

---

## Task 6: App wiring — render, play, stress test, reset

**Files:**
- Create: `reprise/app.js`
- Modify: `package.json` (add `check:reprise` script)
- Test: `scripts/reprise.test.mjs`

**Interfaces:**
- Consumes: all four engine modules + the DOM ids from Task 5.

- [ ] **Step 1: Write the failing tests**

```js
test("package.json exposes the reprise check script", () => {
  const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
  assert.equal(pkg.scripts["check:reprise"], "node --test scripts/reprise.test.mjs");
});

test("app.js renders from engine data and never hardcodes a forbidden claim", () => {
  const app = repriseFile("app.js");
  assert.ok(/reprise-engine\.js/.test(app) && /reprise-ml\.js/.test(app) && /reprise-replay\.js/.test(app));
  assert.ok(/renderRibbon|renderGantt|renderNeighbors/.test(app), "app must render structured views");
  const corpus = [repriseFile("index.html"), repriseFile("app.js"), repriseFile("styles.css")].join("\n").toLowerCase();
  for (const phrase of [
    "sauvé","partiellement libéré","ship-ready","épissé","rebut certain",
    "prédit la coupure","certifie la conformité","aucun concurrent",
    "données d'une usine réelle","roi réel","économie annuelle",
  ]) assert.ok(!corpus.includes(phrase.toLowerCase()), `forbidden phrase in runtime: "${phrase}"`);
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `node --test scripts/reprise.test.mjs`
Expected: FAIL — `ENOENT ../reprise/app.js` (and the package.json assertion).

- [ ] **Step 3: Implement `reprise/app.js` + add the npm script**

app.js: import the four engine modules; on boot compute `evaluateAll(nominal)`
+ `retrieveSimilar(defaultIncidentVector())`; `renderRibbon` (8 drums, T7 HOLD
+ orange envelope, T8 replanned), `renderGantt` (six rows from branch results),
`renderNeighbors` (3 ML neighbors: distance/shared/differences/OOD),
`renderAuthorities` (four roles + closed lab gate), `renderDigest` (live). Mode
player: on `mode-*` click, iterate `buildSchedule(mode)` timing over
`CHECKPOINTS`, re-`evaluateAll` at each and re-render; pausable at every
checkpoint; `jury30` shows the `jury-timer` counting to `00:30`. `btn-stress`:
set `availablePowerMW *= 0.65` (−35 %), re-`evaluateAll` → reveal
`no-feasible-plan` with the binding constraint. `btn-restore`: reset power,
re-`evaluateAll` → C recommended. `btn-reset`: exact reset to boot state.
Keyboard: mode buttons + stress/restore reachable and operable by keyboard;
manage focus. Everything offline (no fetch). Add
`"check:reprise": "node --test scripts/reprise.test.mjs"` to package.json
scripts.

- [ ] **Step 4: Run to verify the full suite passes**

Run: `npm run check:reprise`
Expected: PASS (all tests).
Also run `npm run check` and confirm the frozen `tests/` count is unchanged.

- [ ] **Step 5: Commit**

```bash
git add reprise/app.js package.json scripts/reprise.test.mjs
git commit -m "feat(reprise): wire engine to the dominant screen, stress test and reset"
```

---

## Task 7: Self-QA (browser, offline, timing, responsive) + Codex handoff

**Files:**
- No new source files (verification only). Update the coordination mailbox.

- [ ] **Step 1: Serve locally** — `npm run dev`, open `http://127.0.0.1:4173/reprise/`.
- [ ] **Step 2: Playwright MCP** — render at 1920×1080 and 1366×768; screenshot
  the dominant screen in each; confirm no horizontal body scroll and the
  five-second readability of ribbon + Gantt + ML.
- [ ] **Step 3: Offline** — reload with network blocked; confirm zero external
  request and full function (check the Playwright network log).
- [ ] **Step 4: Mode identity live** — run `EXPERT ×1` then `JURY 30 S`;
  confirm the `decision-digest` is identical; time `JURY 30 S` three times, each
  ≤30 s, five beats readable.
- [ ] **Step 5: Stress test live** — reduce power → `Aucun plan faisable` with
  the binding constraint; RESTAURER → C recommended; quality gate never moves.
- [ ] **Step 6: Accessibility** — keyboard-only walk of mode/stress/restore/
  reset; focus visible; contrast on the dark theme.
- [ ] **Step 7: Handoff** — append a complete entry to
  `docs/collaboration/phase2-codex-claude-handoff.md`: exact files + commits,
  branch/worktree state, full test command + raw results, mode-identity +
  30-s + responsive + offline evidence, known limitations, residual state;
  set the active owner to **Codex** for the independent adversarial review; no
  deployment.

---

## Self-Review

**Spec coverage** (contract §§3–15 → task):
- §3 order / drums / incident → Task 1 (data + tests). ✅
- §3.5 constraints (6 domains) + power set → Task 1 + Task 3. ✅
- §4.1 ML memory (distance/diff/OOD, no probability) → Task 2. ✅
- §4.2–4.3 twin + hard rules + investigation envelope + envelope lock → Task 3. ✅
- §5 Options 0/A/B/C + `Aucun plan faisable` → Task 3. ✅
- §6 T7 HOLD / T8 replanned / T1–T6 out of incident → Task 1 + Task 3. ✅
- §7 dominant WOW screen (ribbon + Energy×Quality Gantt + ML panel + footer) → Task 5 + Task 6. ✅
- §8 expert 6:20 journal + §9 jury 30 s five beats + speeds → Task 4 + Task 6. ✅
- §8 mode-identity digest test → Task 4. ✅
- §13/§14 allowed vs forbidden claims/fields → forbidden-wording + forbidden-fields tests (Tasks 1,3,6). ✅
- §15 acceptance gates (scope isolation, narrative truth, engine, ML, a11y, offline, reset) → distributed across tasks + Task 7 self-QA. ✅
- §15 WOW comprehension gate (3 unfamiliar viewers) → Task 7 (Oussama-run; recorded, not auto-testable). ⚠ human step.

**Placeholder scan:** every code step carries real test code or an explicit
implementation spec with exact ids/values; no "TBD"/"handle edge cases".

**Type consistency:** `evaluateAll`/`evaluateBranch` shapes, `retrieveSimilar`
neighbor shape (`shared`/`differences`), `buildSchedule`→`{checkpointId,
displayMs}`, `computeModeDigest(mode, inputs)`, and the DOM ids are used
identically across tasks.

**Known gaps to flag to Oussama:** the WOW human-comprehension gate (§15) needs
three unfamiliar viewers — a team-leader step, not automatable; and the demo
power values are synthetic-to-calibrate by design.
