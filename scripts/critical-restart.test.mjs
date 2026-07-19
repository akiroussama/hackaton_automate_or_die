// Critical Restart Lab — unit gates (specification Section 14, revised after
// the 2026-07-19 02:21 Codex adversarial review — see the coordination
// mailbox for the exact REVISE findings this file addresses).
// Run with: npm run check:critical
// Located in scripts/ (not tests/) so `npm run check` keeps returning the
// frozen "9/9" documented everywhere — same convention as the recommender.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  CSB_FACTS,
  SOURCES,
  SOURCE_LABELS,
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

const readCriticalRestartFile = (name) =>
  readFileSync(new URL(`../critical-restart/${name}`, import.meta.url), "utf8");

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
  assert.equal(CSB_FACTS.evidenceFrame.transmitterAlarmPercentOfSpan, 72);
  assert.equal(CSB_FACTS.evidenceFrame.transmitterAlarmStatus, "active and acknowledged");
  assert.equal(CSB_FACTS.evidenceFrame.redundantHardwiredAlarmStatus, "did not sound");
  assert.equal(CSB_FACTS.startupHistory.startupsAnalyzed, 19);
  assert.equal(CSB_FACTS.startupHistory.startupsWithinBoundaries, 1);
  assert.equal(CSB_FACTS.startupHistory.startupsWithMajorLevelSwings, 14);
  assert.equal(CSB_FACTS.startupHistory.levelAlarmActivations, 74);
  assert.equal(CSB_FACTS.startupHistory.highLevelSetPointExceedances, 65);
  assert.equal(CSB_FACTS.startupHistory.startupsExceedingTransmitterRange, 15);
  assert.equal(CSB_FACTS.startupHistory.startupsOutOfRangeOverOneHour, 8);
  assert.match(CSB_FACTS.reportVersion, /20 March 2007/);
  for (const url of Object.values(SOURCES)) assert.match(url, /^https:\/\/www\.(csb|nist)\.gov\//);
  // Every source has a human-readable label (audit cleanup: no raw-URL prose,
  // so the casualty-bearing CSB-announcement slug is never displayed as text).
  for (const key of Object.keys(SOURCES)) assert.ok(SOURCE_LABELS[key]);
});

test("historical numbers are rendered from CSB_FACTS via structured DOM ids, not duplicated as static literals", () => {
  const html = readCriticalRestartFile("index.html");
  // Structured DOM mapping: each historical figure has a dedicated id that
  // app.js populates from CSB_FACTS at boot (gate 13 — no drift possible
  // between the source map and what a fresh load actually renders, verified
  // dynamically by scripts/capture-critical-restart.mjs).
  for (const id of [
    "fact-place-date", "fact-casualties", "fact-report-version",
    "hist-19", "hist-1", "hist-14", "hist-74", "hist-65", "hist-15", "hist-8",
    "tower-title-ft", "grad-top", "span-indicated", "estimate-label", "tower-callout-text",
    "alarm-line-1", "alarm-line-2", "alarm-line-3", "alarm-line-4",
  ]) {
    assert.ok(html.includes(`id="${id}"`), `missing structured DOM id: ${id}`);
  }
  // These exact literals must NOT be hardcoded a second time in the markup —
  // they are injected by app.js from the single CSB_FACTS source of truth.
  for (const literal of [
    "78% OF SENSOR SPAN", "POST-INCIDENT ESTIMATE: 158", "170 FT",
    "INDEPENDENT HIGH-LEVEL ALARM", "UNAVAILABLE ⚠",
  ]) {
    assert.ok(!html.includes(literal), `historical literal must be dynamic, not hardcoded: "${literal}"`);
  }
  const app = readCriticalRestartFile("app.js");
  assert.ok(app.includes("renderFacts"), "app.js must render facts from CSB_FACTS");
});

// ---------------------------------------------------------------------------
// Gate 3 (revised) — CSB aggregate marginals are represented as overlapping
// tags, never as an invented mutually-exclusive partition.

test("cohort mirrors the documented CSB marginals as overlapping tags, not a partition", () => {
  const rows = buildSyntheticCohort();
  assert.equal(rows.length, 19);

  const count = (pred) => rows.filter(pred).length;
  assert.equal(count((r) => r.tags.significantLevelSwing), 14);
  assert.equal(count((r) => r.tags.exceededTransmitterRange), 15);
  assert.equal(count((r) => r.tags.outOfRangeOverOneHour), 8);
  assert.equal(count((r) => r.tags.withinCitedBoundaries), 1);

  // outOfRangeOverOneHour must be a SUBSET of exceededTransmitterRange (CSB
  // wording: "8 remained out of range for more than one hour" describes a
  // subset of the 15 that exceeded the range at all).
  for (const row of rows) {
    if (row.tags.outOfRangeOverOneHour) assert.ok(row.tags.exceededTransmitterRange, `${row.id}: overHour without exceededRange`);
  }
  // The within-boundaries startup must not also carry the abnormal tags —
  // logically exclusive by definition, not an independent CSB marginal.
  const boundaryRow = rows.find((r) => r.tags.withinCitedBoundaries);
  assert.equal(boundaryRow.tags.significantLevelSwing, false);
  assert.equal(boundaryRow.tags.exceededTransmitterRange, false);

  // The defining fix: prove the categories OVERLAP (are not disjoint) —
  // at least one row must carry both significantLevelSwing AND
  // exceededTransmitterRange, since 14 + 15 > 18 non-boundary rows forces it.
  const overlapCount = count((r) => r.tags.significantLevelSwing && r.tags.exceededTransmitterRange);
  assert.ok(overlapCount >= 11, `expected >=11 overlapping rows, got ${overlapCount}`);

  // No invented third bucket / no "recovered" claim beyond CSB's own words.
  assert.deepEqual(Object.values(PATTERN_FAMILIES).sort(), [
    "IN-ENVELOPE STARTUP",
    "RECURRENT ABNORMAL STARTUP",
  ]);
  for (const row of rows) assert.ok(Object.values(PATTERN_FAMILIES).includes(row.family));

  const engineSrc = readFileSync(new URL("../engine/critical-restart-data.js", import.meta.url), "utf8");
  assert.ok(!engineSrc.includes("TRANSIENT_UPSET"), "the invented transient-upset bucket must be removed");
  assert.ok(!engineSrc.includes("RECOVERED"), "no 'recovered' claim beyond CSB's documented wording");
});

test("cohort feature vectors are deterministic and well-formed", () => {
  const a = buildSyntheticCohort();
  const b = buildSyntheticCohort();
  assert.deepEqual(a, b);
  for (const row of a) {
    assert.equal(row.features.length, FEATURE_COUNT);
    assert.equal(row.evidenceClass, EVIDENCE_CLASSES.SYNTHETIC);
    for (const value of row.features) assert.ok(value >= 0 && value <= 1);
  }
});

// ---------------------------------------------------------------------------
// Gate 5 (revised) — determinism, INCLUDING hash stability across approvals.

test("retrieval and branch outputs are deterministic, with a stable simulationOutputHash", async () => {
  const r1 = retrieveSimilar(defaultIncidentVector());
  const r2 = retrieveSimilar(defaultIncidentVector());
  assert.deepEqual(r1, r2);

  const runNoApprovals = await runAllBranches();
  const runBothApproved = await runAllBranches({ approvals: { operations: true, safety: true } });
  assert.match(runNoApprovals.simulationOutputHash, /^[0-9a-f]{64}$/);
  // The hash identifies the deterministic SIMULATION, not the human approval
  // state — required for an exact Reset (gate 12) to show the same hash a
  // fresh load would, even mid-signature.
  assert.equal(runNoApprovals.simulationOutputHash, runBothApproved.simulationOutputHash);
  assert.equal(runNoApprovals.branches.A.series.join(","), runBothApproved.branches.A.series.join(","));
});

// ---------------------------------------------------------------------------
// Gates 6-7 — retrieval behavior (unchanged mechanism, re-verified against
// the corrected, overlapping-tag cohort).

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
  eased[4] = 0.05; // barrier reconstruction eased
  const calmer = retrieveSimilar(eased);
  assert.ok(
    calmer.similarityScore < base.similarityScore * 0.85,
    `similarity should drop materially (${base.similarityScore.toFixed(3)} -> ${calmer.similarityScore.toFixed(3)})`,
  );
});

// ---------------------------------------------------------------------------
// Gates 8-10 (revised) — branch semantics, with CR-05 dual-approval gate.

test("branch A reaches the release precursor, violates constraints and is never approvable", () => {
  const a = simulateBranch("A", { approvals: { operations: true, safety: true } });
  assert.equal(a.releasePrecursorReached, true);
  assert.ok(a.stoppedAtStep !== null && a.stoppedAtStep < SIMULATOR_MODEL.horizonSteps);
  assert.equal(a.eligibleForHumanReview, false);
  assert.ok(a.constraintViolations.includes("CR-02"));
  assert.ok(a.constraintViolations.includes("CR-04"));
  assert.equal(a.approvable, false, "must stay false even with both approvals granted");
  assert.match(a.humanReadableReason, /RELEASE PRECURSOR REACHED/);
});

test("branch B delays the problem but stays non-approvable with unknown inventory", () => {
  const b = simulateBranch("B", { approvals: { operations: true, safety: true } });
  assert.equal(b.releasePrecursorReached, false);
  assert.equal(b.eligibleForHumanReview, false);
  assert.ok(b.constraintViolations.includes("CR-01"));
  assert.ok(b.constraintViolations.includes("CR-02"));
  assert.equal(b.approvable, false, "must stay false even with both approvals granted");
});

test("CR-05: Branch C requires BOTH approvals before approvable becomes true", () => {
  const noApprovals = simulateBranch("C");
  assert.equal(noApprovals.eligibleForHumanReview, true);
  assert.equal(noApprovals.operationsApproved, false);
  assert.equal(noApprovals.safetyApproved, false);
  assert.equal(noApprovals.approvable, false);

  const opsOnly = simulateBranch("C", { approvals: { operations: true } });
  assert.equal(opsOnly.eligibleForHumanReview, true);
  assert.equal(opsOnly.approvable, false, "one signature must not be enough (CR-05)");

  const safetyOnly = simulateBranch("C", { approvals: { safety: true } });
  assert.equal(safetyOnly.approvable, false, "one signature must not be enough (CR-05)");

  const both = simulateBranch("C", { approvals: { operations: true, safety: true } });
  assert.equal(both.eligibleForHumanReview, true);
  assert.equal(both.approvable, true, "both signatures must make the eligible branch approvable");
});

test("CR-08: Branch C stays eligible-but-not-approvable when a readiness gate is missing, regardless of approvals", () => {
  const notReady = simulateBranch("C", {
    simOverride: { readiness: { qualifiedSupervision: false } },
    approvals: { operations: true, safety: true },
  });
  assert.equal(notReady.readinessComplete, false);
  assert.equal(notReady.eligibleForHumanReview, false);
  assert.equal(notReady.approvable, false);
  assert.match(notReady.humanReadableReason, /CR-08/);
});

test("no result object carries casualty, probability, ROI or savings fields", async () => {
  const { branches } = await runAllBranches({ approvals: { operations: true, safety: true } });
  for (const result of Object.values(branches)) {
    for (const forbidden of FORBIDDEN_RESULT_FIELDS) {
      assert.ok(!(forbidden in result), `${forbidden} must not exist on branch ${result.branchId}`);
    }
    assert.equal(result.evidenceClass, EVIDENCE_CLASSES.SYNTHETIC);
    assert.ok(Array.isArray(result.assumptions) && result.assumptions.length > 0);
    assert.ok(result.modelVersion);
    assert.match(result.simulationOutputHash, /^[0-9a-f]{64}$/);
  }
});

// ---------------------------------------------------------------------------
// Gate 17 — forbidden claims never appear in runtime or jury-facing copy.

test("forbidden wording is absent from the runtime implementation", () => {
  const files = [
    "index.html", "app.js", "styles.css",
  ].map(readCriticalRestartFile).join("\n") + "\n" + [
    "../engine/critical-restart-data.js",
    "../engine/critical-restart-ml.js",
    "../engine/critical-restart-simulator.js",
  ].map((f) => readFileSync(new URL(f, import.meta.url), "utf8")).join("\n");
  const corpus = files.toLowerCase();
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

// ---------------------------------------------------------------------------
// Audit cleanup checks.

test("the permanent affiliation disclosure appears outside the drawer (header or footer)", () => {
  const html = readCriticalRestartFile("index.html");
  const headerAndFooter =
    html.split('<main class="lab-grid"')[0] + (html.split("<footer")[1] ?? "");
  assert.match(headerAndFooter, /not affiliated with BP/i);
});

test("the footer states the precise synthetic/historical boundary", () => {
  const html = readCriticalRestartFile("index.html");
  assert.ok(html.includes("model-generated outputs are synthetic"));
  assert.ok(html.includes("historical displayed values are CSB-sourced"));
  assert.ok(!html.includes("all interactive values are synthetic"));
});

test("reduced-motion preference disables nonessential animation (gate 21)", () => {
  const css = readCriticalRestartFile("styles.css");
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
});

test("focus-visible styling is defined for keyboard navigation", () => {
  const css = readCriticalRestartFile("styles.css");
  assert.match(css, /:focus-visible/);
});

// Constraint catalogue sanity: CR-01..CR-08 all present.
test("the eight hard constraints are declared", () => {
  assert.deepEqual(CONSTRAINTS.map((c) => c.id), ["CR-01", "CR-02", "CR-03", "CR-04", "CR-05", "CR-06", "CR-07", "CR-08"]);
  assert.equal(BRANCHES.length, 3);
});
