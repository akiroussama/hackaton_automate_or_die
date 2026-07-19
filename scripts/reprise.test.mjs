// CableTwin — Reprise scenario ("58 minutes sans réseau — 24 km d'engagement
// client") acceptance-gate unit suite. Run with: npm run check:reprise
// Located in scripts/ (not tests/) so `npm run check` keeps the frozen twin
// count untouched — same convention as scripts/critical-restart.test.mjs.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  EVIDENCE_CLASSES, SCENARIO, DRUMS, CONSTRAINTS, BRANCHES,
  FEATURE_COUNT, buildSyntheticCohort, FORBIDDEN_RESULT_FIELDS,
  defaultIncidentVector,
} from "../engine/reprise-data.js";
import { ML_MODEL, retrieveSimilar } from "../engine/reprise-ml.js";
import {
  RULES, INITIAL_STATE, SCENARIO_ID, evaluateBranch, evaluateAll,
} from "../engine/reprise-engine.js";

import {
  BUSINESS_JOURNAL, CHECKPOINTS, MODES, JURY_BEATS, buildSchedule, computeModeDigest,
} from "../engine/reprise-replay.js";

const nominal = () => ({ availablePowerMW: SCENARIO.power.internalEnvelopeMW });

// ---------------------------------------------------------------------------
// Task 1 — scenario data.

test("scenario data is synthetic, 24 km over 8 drums, T7 HOLD, T8 not started", () => {
  assert.equal(SCENARIO.id, "reprise-58min-24km");
  assert.equal(DRUMS.length, 8);
  assert.equal(DRUMS.reduce((km, d) => km + d.km, 0), 24);
  const t7 = DRUMS.find((d) => d.id === "T7");
  const t8 = DRUMS.find((d) => d.id === "T8");
  assert.equal(t7.status, "HOLD");
  assert.equal(t7.inIncident, true);
  assert.match(t8.status, /NON DÉMARRÉ|REPLANIFIÉ/);
  for (const d of DRUMS.filter((x) => ["T1", "T2", "T3", "T4", "T5", "T6"].includes(x.id))) {
    assert.equal(d.inIncident, false);
  }
});

test("the incident is a single power-loss trigger, 17:42 -> 18:40, 58 minutes", () => {
  assert.equal(SCENARIO.incident.lossClock, "17:42");
  assert.equal(SCENARIO.incident.returnClock, "18:40");
  assert.equal(SCENARIO.incident.durationMinutes, 58);
  assert.equal(SCENARIO.incident.causes.length, 1);
});

test("the synthetic power set matches the approved calibration badge values", () => {
  assert.equal(SCENARIO.power.internalEnvelopeMW, 1.5);
  assert.equal(SCENARIO.power.restartAllPeakMW, 1.74);
  assert.equal(SCENARIO.power.conservativePeakMW, 1.43);
  assert.equal(SCENARIO.power.sequencedPeakMW, 1.28);
});

test("the constraint catalogue declares all six decision domains", () => {
  const domains = new Set(CONSTRAINTS.map((c) => c.domain));
  for (const d of ["energy", "machine", "material", "human", "quality", "logistics"]) {
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

// ---------------------------------------------------------------------------
// Task 2 — ML case retrieval.

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
  const far = new Array(FEATURE_COUNT).fill(0.99);
  const res = retrieveSimilar(far);
  assert.equal(res.oodWarning, true);
  // the in-distribution incident must NOT be flagged out-of-distribution
  assert.equal(retrieveSimilar(defaultIncidentVector()).oodWarning, false);
});

// ---------------------------------------------------------------------------
// Task 3 — deterministic constraint engine.

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

test("C keeps T7 HOLD and T8 replanned; B surfaces the quality<->logistics conflict", () => {
  const c = evaluateBranch("C", nominal());
  assert.equal(c.drumStatuses.T7, "HOLD");
  assert.match(c.drumStatuses.T8, /REPLANIFIÉ|NON DÉMARRÉ/);
  assert.equal(c.logisticsFeasible, true);
  const b = evaluateBranch("B", nominal());
  assert.ok(b.humanConflicts.length > 0);
  assert.equal(b.logisticsFeasible, false);
});

test("below the minimum power threshold NO branch is feasible and the blocking constraint is named", () => {
  const low = evaluateAll({ availablePowerMW: 0.8 });
  assert.equal(low.anyFeasible, false);
  assert.equal(low.recommendation, null);
  assert.match(low.noFeasibleReason, /puissance|énergie|R-ENERGY/i);
});

test("nominal power recommends the sequenced Option C", () => {
  const all = evaluateAll(nominal());
  assert.equal(all.anyFeasible, true);
  assert.equal(all.recommendation, "C");
});

test("the minimum investigation envelope cannot be manually reduced", () => {
  const full = evaluateBranch("C", nominal());
  const tampered = evaluateBranch("C", { ...nominal(), manualEnvelopeMeters: 1 });
  assert.equal(tampered.investigationEnvelope.meters, full.investigationEnvelope.meters);
  assert.ok(full.investigationEnvelope.meters > 1);
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
  // a different input (stress test) must produce a different digest (live recompute)
  assert.notEqual(evaluateAll(nominal()).digest, evaluateAll({ availablePowerMW: 0.9 }).digest);
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
  assert.ok(INITIAL_STATE.scenarioId === SCENARIO_ID);
  const src = readFileSync(new URL("../engine/reprise-engine.js", import.meta.url), "utf8");
  assert.ok(!/reprise-replay|displayMode|JURY_30/.test(src), "engine must not know the display layer");
  assert.equal(SCENARIO_ID, "reprise-58min-24km");
});

// ---------------------------------------------------------------------------
// Task 4 — replay journal, display scheduler and mode identity.

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

test("EXPERT x1 runs the full 6 min 20 (380 s) and the intermediate speeds compress it", () => {
  const sum = (mode) => buildSchedule(mode).reduce((ms, s) => ms + s.displayMs, 0);
  assert.equal(sum("x1"), 380000);
  assert.ok(Math.abs(sum("x5") - 380000 / 5) < 50);
  assert.ok(Math.abs(sum("x7") - 380000 / 7) < 50);
});

test("the business journal is one ordered sequence, checkpoint-aligned, carrying no display time", () => {
  assert.ok(BUSINESS_JOURNAL.length >= 5);
  assert.deepEqual(BUSINESS_JOURNAL.map((e) => e.id), CHECKPOINTS);
  assert.ok(Object.keys(MODES).includes("jury30"));
  for (const e of BUSINESS_JOURNAL) assert.ok(!("displayMs" in e), "journal must carry no display time");
  // every jury beat references a real checkpoint
  for (const b of JURY_BEATS) assert.ok(CHECKPOINTS.includes(b.checkpointId), `unknown beat: ${b.checkpointId}`);
});

// ---------------------------------------------------------------------------
// Task 5 — route scaffold (HTML + styles).

const repriseFile = (name) => readFileSync(new URL(`../reprise/${name}`, import.meta.url), "utf8");

test("the route skeleton exposes every structured DOM id and no hardcoded engine literals", () => {
  const html = repriseFile("index.html");
  for (const id of [
    "reprise-clock", "mode-x1", "mode-x5", "mode-x7", "mode-jury30", "jury-timer",
    "btn-play", "btn-pause", "btn-reset", "btn-stress", "btn-restore",
    "drum-ribbon", "t7-envelope", "gantt-energy", "gantt-machine", "gantt-human",
    "gantt-material", "gantt-quality", "gantt-logistics", "ml-neighbors",
    "no-feasible-plan", "authorities", "lab-gate", "decision-digest",
    "evidence-legend", "assumptions-drawer", "perma-footer",
  ]) assert.ok(html.includes(`id="${id}"`), `missing id: ${id}`);
  for (const drum of ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8"]) {
    assert.ok(html.includes(`id="drum-${drum}"`), `missing drum node: ${drum}`);
  }
  // Live engine metrics must be injected into the rendered surface, never
  // hardcoded. The <head> (title/meta) may name the scenario; only the <body>
  // is checked, so a drift between the source of truth and what renders is
  // impossible.
  const body = html.split(/<body/i)[1] ?? html;
  for (const literal of ["1.74", "1.43", "1.28", "58 minutes", "×12,67"]) {
    assert.ok(!body.includes(literal), `value must be dynamic, not hardcoded in <body>: "${literal}"`);
  }
});

test("the four evidence labels and the permanent footer are present in the markup", () => {
  const html = repriseFile("index.html");
  for (const label of [
    "FAIT EXTERNE VÉRIFIÉ", "ENTRÉE SCÉNARIO — SYNTHÉTIQUE",
    "SORTIE MODÈLE — SYNTHÉTIQUE / À CALIBRER", "ENTRÉE HUMAINE OU LABORATOIRE",
  ]) assert.ok(html.includes(label), `missing evidence label: ${label}`);
  assert.match(html, /n['’]est ni un système de sécurité/i);
});

test("styles define focus-visible and honour reduced motion", () => {
  const css = repriseFile("styles.css");
  assert.match(css, /:focus-visible/);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
});

// ---------------------------------------------------------------------------
// Task 6 — app wiring.

test("package.json exposes the reprise check script", () => {
  const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
  assert.equal(pkg.scripts["check:reprise"], "node --test scripts/reprise.test.mjs");
});

test("app.js renders from every engine module and never hardcodes a forbidden claim", () => {
  const app = repriseFile("app.js");
  assert.ok(/reprise-engine\.js/.test(app));
  assert.ok(/reprise-ml\.js/.test(app));
  assert.ok(/reprise-replay\.js/.test(app));
  assert.ok(/renderRibbon/.test(app) && /renderGantt/.test(app) && /renderNeighbors/.test(app), "app must render structured views");
  const corpus = [repriseFile("index.html"), repriseFile("app.js"), repriseFile("styles.css")].join("\n").toLowerCase();
  for (const phrase of [
    "sauvé", "partiellement libéré", "ship-ready", "épissé", "rebut certain",
    "prédit la coupure", "certifie la conformité", "aucun concurrent",
    "données d'une usine réelle", "roi réel", "économie annuelle",
  ]) assert.ok(!corpus.includes(phrase.toLowerCase()), `forbidden phrase in runtime: "${phrase}"`);
});
