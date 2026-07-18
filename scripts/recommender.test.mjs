// Dedicated tests for the local decision recommender.
// Run with: npm run check:recommender
// (Kept out of tests/*.test.mjs on purpose: the frozen Phase 2 documents
// state "9/9 checks" for `npm run check`, which must stay byte-consistent.)

import test from "node:test";
import assert from "node:assert/strict";
import { createFactoryScenario } from "../engine/factory-data.js";
import { analyzeIncident, generateRecoveryPlans } from "../engine/twin-engine.js";
import { RECOMMENDER_MODEL } from "../engine/recommender-model.js";
import { FEATURE_NAMES, extractFeatures } from "../engine/recommender-features.js";
import { recommendPlan } from "../engine/recommender.js";

test("le modèle embarqué est cohérent et documenté", () => {
  assert.equal(RECOMMENDER_MODEL.classes.length, 3);
  assert.deepEqual(RECOMMENDER_MODEL.classes, ["service", "cost", "stability"]);
  assert.equal(RECOMMENDER_MODEL.featureNames.length, FEATURE_NAMES.length);
  assert.equal(RECOMMENDER_MODEL.weights.length, 3);
  for (const row of RECOMMENDER_MODEL.weights) {
    assert.equal(row.length, FEATURE_NAMES.length);
    for (const w of row) assert.ok(Number.isFinite(w));
  }
  assert.equal(RECOMMENDER_MODEL.means.length, FEATURE_NAMES.length);
  assert.equal(RECOMMENDER_MODEL.stds.length, FEATURE_NAMES.length);
  assert.ok(RECOMMENDER_MODEL.testAccuracy >= 0.85, "précision test >= 0.85");
  assert.ok(RECOMMENDER_MODEL.datasetSize >= 300, "historique >= 300 incidents");
  assert.ok(RECOMMENDER_MODEL.dataProvenance.includes("synthetic"));
  assert.ok(RECOMMENDER_MODEL.policy.length > 20);
});

test("les features du scénario canonique sont finies et complètes", () => {
  const scenario = createFactoryScenario();
  const impact = analyzeIncident(scenario);
  const plans = generateRecoveryPlans(scenario);
  const features = extractFeatures(scenario, impact, plans);
  assert.equal(features.length, FEATURE_NAMES.length);
  for (const value of features) assert.ok(Number.isFinite(value));
});

test("le canonique est recommandé « cost », aligné avec le ruban produit", () => {
  const scenario = createFactoryScenario();
  const impact = analyzeIncident(scenario);
  const plans = generateRecoveryPlans(scenario);
  const reco = recommendPlan(scenario, impact, plans);
  assert.equal(reco.strategyId, "cost");
  assert.ok(reco.confidence > 0.5);
  const sum = Object.values(reco.probabilities).reduce((a, b) => a + b, 0);
  assert.ok(Math.abs(sum - 1) < 1e-9, "les probabilités somment à 1");
  assert.equal(reco.topFactors.length, 3);
  for (const factor of reco.topFactors) {
    assert.ok(typeof factor.name === "string" && factor.name.length > 0);
    assert.ok(Number.isFinite(factor.contribution));
  }
});

test("l'inférence est déterministe", () => {
  const scenario = createFactoryScenario();
  const impact = analyzeIncident(scenario);
  const plans = generateRecoveryPlans(scenario);
  const a = recommendPlan(scenario, impact, plans);
  const b = recommendPlan(scenario, impact, plans);
  assert.deepEqual(a, b);
});

test("la recommandation varie selon le contexte de l'incident", () => {
  const scenario = createFactoryScenario();
  scenario.incident = { ...scenario.incident, lineId: "L3", startMinute: 180, endMinute: 420 };
  const impact = analyzeIncident(scenario);
  const plans = generateRecoveryPlans(scenario);
  const reco = recommendPlan(scenario, impact, plans);
  assert.equal(reco.strategyId, "stability");
});
