// CableTwin Critical Restart Lab — case-based ML historian.
// A deliberately small, deterministic, inspectable weighted k-nearest-neighbor
// retrieval over the synthetic cohort (constrained by CSB aggregates).
// Similarity is EVIDENCE, never permission: no output of this module can
// authorize a branch — hard constraints and human approval do that.
//
// Labeled in the UI as:
//   CASE-BASED ML — SYNTHETIC COHORT CONSTRAINED BY CSB AGGREGATES
// The similarity score is explicitly NOT a probability.

import {
  FEATURE_NAMES,
  FEATURE_COUNT,
  COHORT_SEED,
  buildSyntheticCohort,
  EVIDENCE_CLASSES,
} from "./critical-restart-data.js";

export const ML_MODEL = {
  name: "case-based weighted k-NN",
  version: "critical-restart-ml/1",
  k: 5,
  seed: COHORT_SEED,
  // Fixed, inspectable feature weights (sensor disagreement and barrier
  // health weigh most — mirroring the investigation's emphasis).
  weights: [1.0, 1.4, 1.0, 0.8, 1.3, 0.7, 1.1, 0.9, 0.6, 0.7],
};

function weightedDistance(a, b, weights) {
  let sum = 0;
  let weightTotal = 0;
  for (let i = 0; i < FEATURE_COUNT; i += 1) {
    const d = (a[i] - b[i]) * weights[i];
    sum += d * d;
    weightTotal += weights[i] * weights[i];
  }
  return Math.sqrt(sum / weightTotal);
}

function contributions(a, b, weights) {
  const items = [];
  for (let i = 0; i < FEATURE_COUNT; i += 1) {
    const d = (a[i] - b[i]) * weights[i];
    items.push({ feature: FEATURE_NAMES[i], contribution: d * d });
  }
  items.sort((x, y) => y.contribution - x.contribution);
  return items;
}

export function retrieveSimilar(vector, options = {}) {
  if (!Array.isArray(vector) || vector.length !== FEATURE_COUNT) {
    throw new Error(`retrieveSimilar: expected a ${FEATURE_COUNT}-feature vector`);
  }
  const k = options.k ?? ML_MODEL.k;
  const cohort = options.cohort ?? buildSyntheticCohort(ML_MODEL.seed);
  const weights = options.weights ?? ML_MODEL.weights;

  const scored = cohort
    .map((row) => ({
      id: row.id,
      family: row.family,
      evidenceClass: row.evidenceClass,
      distance: weightedDistance(vector, row.features, weights),
      topContributions: contributions(vector, row.features, weights).slice(0, 3),
    }))
    .sort((a, b) => a.distance - b.distance || (a.id < b.id ? -1 : 1));

  const neighbors = scored.slice(0, k);

  // Distance-weighted family vote (deterministic; ties broken alphabetically).
  const votes = new Map();
  for (const n of neighbors) {
    votes.set(n.family, (votes.get(n.family) ?? 0) + 1 / (1e-6 + n.distance));
  }
  const patternFamily = [...votes.entries()]
    .sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1))[0][0];

  const meanDistance = neighbors.reduce((acc, n) => acc + n.distance, 0) / neighbors.length;
  const similarityScore = 1 / (1 + 4 * meanDistance); // bounded (0,1]; NOT a probability

  return {
    evidenceClass: EVIDENCE_CLASSES.SYNTHETIC,
    label: "CASE-BASED ML — SYNTHETIC COHORT CONSTRAINED BY CSB AGGREGATES",
    patternFamily,
    similarityScore,
    similarityNote: "similarity score — not a probability, and never an authorization",
    neighbors,
    modelVersion: ML_MODEL.version,
    k,
    weights: [...weights],
    seed: ML_MODEL.seed,
  };
}
