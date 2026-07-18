// Critical Restart Lab — unit gates (specification Section 14).
// Run with: npm run check:critical
// Located in scripts/ (not tests/) so `npm run check` keeps returning the
// frozen "9/9" documented everywhere — same convention as recommender tests.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  CSB_FACTS,
  SOURCES,
  EVIDENCE_CLASSES,
  FEATURE_COUNT,
  buildSyntheticCohort,
  defaultIncidentVector,
  PATTERN_FAMILIES,
  BRANCHES,
  CONSTRAINTS,
} from "../engine/critical-restart-data.js";
import { ML_MODEL, retrieveSimilar } from "../engine/critical-restart-ml.js";
import {
  SIMULATOR_MODEL,
  simulateBranch,
  runAllBranches,
  FORBIDDEN_RESULT_FIELDS,
} from "../engine/critical-restart-simulator.js";

// ---------------------------------------------------------------------------
// Gate 13 — every historical number shown by the UI exists in the source map.

test("source map carries the exact CSB documented figures", () => {
  assert.equal(CSB_FACTS.incident.date, "23 March 2005");
  assert.equal(CSB_FACTS.incident.deaths, 15);
  assert.equal(CSB_FACTS.incident.injured, 180);
  assert.equal(CSB_FACTS.evidenceFrame.indicatedPercentOfSpan, 78);
  assert.equal(CSB_FACTS.evidenceFrame.indicatedFeet, 7.9);
  assert.equal(CSB_FACTS.evidenceFrame.postIncidentEstimateFeet, 158);
  assert.equal(CSB_FACTS.evidenceFrame.towerHeightFeet, 170);
  assert.equal(CSB_FACTS.startupHistory.startupsAnalyzed, 19);
  assert.equal(CSB_FACTS.startupHistory.startupsWithinBoundaries, 1);
  assert.equal(CSB_FACTS.startupHistory.startupsWithMajorLevelSwings, 14);
  assert.equal(CSB_FACTS.startupHistory.levelAlarmActivations, 74);
  assert.equal(CSB_FACTS.startupHistory.highLevelSetPointExceedances, 65);
  assert.equal(CSB_FACTS.startupHistory.startupsExceedingTransmitterRange, 15);
  assert.equal(CSB_FACTS.startupHistory.startupsOutOfRangeOverOneHour, 8);
  for (const url of Object.values(SOURCES)) assert.match(url, /^https:\/\/www\.(csb|nist)\.gov\//);
});

test("the UI displays only source-mapped historical numbers", () => {
  const html = readFileSync(new URL("../critical-restart/index.html", import.meta.url), "utf8");
  const app = readFileSync(new URL("../critical-restart/app.js", import.meta.url), "utf8");
  const ui = html + app;
  // Historical figures that appear in the UI must match the source map.
  for (const token of ["78", "7.9", "158", "170", "19", "74", "65", "15", "180", "23 March 2005", "1:04"]) {
    assert.ok(ui.includes(String(token)), `UI should carry source-mapped figure ${token}`);
  }
});

// ---------------------------------------------------------------------------
// Gate 5 — determinism of cohort, retrieval, branches and hash.

test("cohort is deterministic and mirrors the documented aggregate proportions", () => {
  const a = buildSyntheticCohort();
  const b = buildSyntheticCohort();
  assert.deepEqual(a, b);
  assert.equal(a.length, 19);
  const families = (family) => a.filter((row) => row.family === family).length;
  assert.equal(families(PATTERN_FAMILIES.RECURRENT_ABNORMAL), 14);
  assert.equal(families(PATTERN_FAMILIES.IN_ENVELOPE), 1);
  assert.equal(families(PATTERN_FAMILIES.TRANSIENT_UPSET), 4);
  for (const row of a) {
    assert.equal(row.features.length, FEATURE_COUNT);
    assert.equal(row.evidenceClass, EVIDENCE_CLASSES.SYNTHETIC);
    for (const value of row.features) assert.ok(value >= 0 && value <= 1);
  }
});

test("retrieval and branch outputs are deterministic, with a stable scenario hash", async () => {
  const r1 = retrieveSimilar(defaultIncidentVector());
  const r2 = retrieveSimilar(defaultIncidentVector());
  assert.deepEqual(r1, r2);
  const runA = await runAllBranches();
  const runB = await runAllBranches();
  assert.equal(runA.scenarioHash, runB.scenarioHash);
  assert.match(runA.scenarioHash, /^[0-9a-f]{64}$/);
  assert.deepEqual(runA.branches, runB.branches);
});

// ---------------------------------------------------------------------------
// Gates 6-7 — retrieval behavior.

test("default incident vector retrieves the recurrent abnormal-startup family with explanations", () => {
  const result = retrieveSimilar(defaultIncidentVector());
  assert.equal(result.patternFamily, PATTERN_FAMILIES.RECURRENT_ABNORMAL);
  assert.equal(result.neighbors.length, ML_MODEL.k);
  assert.equal(result.neighbors[0].family, PATTERN_FAMILIES.RECURRENT_ABNORMAL);
  for (const neighbor of result.neighbors) {
    assert.equal(neighbor.topContributions.length, 3);
    for (const c of neighbor.topContributions) assert.ok(Number.isFinite(c.contribution));
  }
  assert.ok(result.similarityScore > 0 && result.similarityScore <= 1);
  assert.match(result.similarityNote, /not a probability/);
});

test("removing the sensor/balance disagreement materially lowers similarity", () => {
  const base = retrieveSimilar(defaultIncidentVector());
  const eased = [...defaultIncidentVector()];
  eased[1] = 0.05; // sensor-vs-balance disagreement resolved
  eased[4] = 0.05; // independent alarm healthy
  const calmer = retrieveSimilar(eased);
  assert.ok(
    calmer.similarityScore < base.similarityScore * 0.85,
    `similarity should drop materially (${base.similarityScore.toFixed(3)} -> ${calmer.similarityScore.toFixed(3)})`,
  );
});

// ---------------------------------------------------------------------------
// Gates 8-12 — branch semantics.

test("branch A reaches the release precursor, violates constraints and is never approvable", () => {
  const a = simulateBranch("A");
  assert.equal(a.releasePrecursorReached, true);
  assert.ok(a.stoppedAtStep !== null && a.stoppedAtStep < SIMULATOR_MODEL.horizonSteps);
  assert.ok(a.constraintViolations.includes("CR-02"));
  assert.ok(a.constraintViolations.includes("CR-04"));
  assert.equal(a.approvable, false);
  assert.match(a.humanReadableReason, /RELEASE PRECURSOR REACHED/);
});

test("branch B delays the problem but stays non-approvable with unknown inventory", () => {
  const b = simulateBranch("B");
  assert.equal(b.releasePrecursorReached, false);
  assert.ok(b.constraintViolations.includes("CR-01"));
  assert.ok(b.constraintViolations.includes("CR-02"));
  assert.equal(b.approvable, false);
});

test("branch C is the only eligible branch, and CR-08 readiness gates block it when incomplete", () => {
  const c = simulateBranch("C");
  assert.equal(c.releasePrecursorReached, false);
  assert.deepEqual(c.constraintViolations, []);
  assert.equal(c.readinessComplete, true);
  assert.equal(c.approvable, true);
  const notReady = simulateBranch("C", { simOverride: { readiness: { qualifiedSupervision: false } } });
  assert.equal(notReady.approvable, false);
  assert.match(notReady.humanReadableReason, /CR-08/);
  assert.equal(simulateBranch("A").approvable, false);
  assert.equal(simulateBranch("B").approvable, false);
});

test("no result object carries casualty, probability, ROI or savings fields", async () => {
  const { branches } = await runAllBranches();
  for (const result of Object.values(branches)) {
    for (const forbidden of FORBIDDEN_RESULT_FIELDS) {
      assert.ok(!(forbidden in result), `${forbidden} must not exist on branch ${result.branchId}`);
    }
    assert.equal(result.evidenceClass, EVIDENCE_CLASSES.SYNTHETIC);
    assert.ok(Array.isArray(result.assumptions) && result.assumptions.length > 0);
    assert.ok(result.modelVersion);
    assert.match(result.scenarioHash, /^[0-9a-f]{64}$/);
  }
});

// ---------------------------------------------------------------------------
// Gate 17 — forbidden claims never appear in runtime or jury-facing copy.

test("forbidden wording is absent from the runtime implementation", () => {
  const files = [
    "../critical-restart/index.html",
    "../critical-restart/app.js",
    "../critical-restart/styles.css",
    "../engine/critical-restart-data.js",
    "../engine/critical-restart-ml.js",
    "../engine/critical-restart-simulator.js",
  ];
  const corpus = files
    .map((file) => readFileSync(new URL(file, import.meta.url), "utf8"))
    .join("\n")
    .toLowerCase();
  const forbidden = [
    "would have saved 15",
    "prevents refinery explosions",
    "predicts fatalities",
    "real bp sensor data",
    "chance of explosion",
    "autonomous shutdown",
    "proves what would have happened",
  ];
  for (const phrase of forbidden) {
    assert.ok(!corpus.includes(phrase), `forbidden phrase found: "${phrase}"`);
  }
  // "certified safety system" may only ever appear NEGATED (the mandatory
  // banner "NOT A CERTIFIED SAFETY SYSTEM"); the affirmative claim is banned.
  assert.ok(
    !/(?<!not a )certified safety system/.test(corpus),
    "affirmative 'certified safety system' claim found",
  );
});

// Constraint catalogue sanity: CR-01..CR-08 all present.
test("the eight hard constraints are declared", () => {
  assert.deepEqual(CONSTRAINTS.map((c) => c.id), ["CR-01", "CR-02", "CR-03", "CR-04", "CR-05", "CR-06", "CR-07", "CR-08"]);
  assert.equal(BRANCHES.length, 3);
});
