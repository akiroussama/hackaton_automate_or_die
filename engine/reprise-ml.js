// CableTwin — Reprise scenario: case-based ML historian.
// A deliberately small, deterministic, inspectable weighted k-nearest-neighbor
// retrieval over the synthetic cohort. Similarity is EVIDENCE, never
// permission: no output of this module can authorize a branch — hard
// constraints (engine) and human/lab approval do that.
//
// The similarity score is explicitly NOT a probability, and this module never
// emits a conformity probability of any kind (contract §4.1, §14).

import {
  FEATURE_NAMES,
  FEATURE_COUNT,
  COHORT_SEED,
  buildSyntheticCohort,
  EVIDENCE_CLASSES,
} from "./reprise-data.js";

export const ML_MODEL = {
  name: "recherche de cas — k plus proches voisins pondérés",
  version: "reprise-ml/1",
  k: 3, // the WOW side panel shows at most three neighbors (contract §7)
  seed: COHORT_SEED,
  // Fixed, inspectable feature weights (downtime, run position and pre-stop
  // dimensional drift weigh most). Order matches FEATURE_NAMES.
  weights: [1.2, 1.1, 0.9, 1.3, 0.8, 1.0, 0.7],
  // Above this mean weighted distance the query is flagged out-of-distribution.
  oodThreshold: 0.42,
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

// Per-feature squared weighted contribution, sorted; the smallest contributions
// are the shared features, the largest are the critical differences.
function featureContributions(a, b, weights) {
  const items = [];
  for (let i = 0; i < FEATURE_COUNT; i += 1) {
    const d = (a[i] - b[i]) * weights[i];
    items.push({ feature: FEATURE_NAMES[i], contribution: Number((d * d).toFixed(5)) });
  }
  items.sort((x, y) => x.contribution - y.contribution);
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
    .map((row) => {
      const contributions = featureContributions(vector, row.features, weights);
      return {
        id: row.id,
        evidenceClass: row.evidenceClass,
        distance: Number(weightedDistance(vector, row.features, weights).toFixed(5)),
        // most similar features (smallest contribution) vs critical differences
        shared: contributions.slice(0, 2).map((c) => c.feature),
        differences: contributions.slice(-2).reverse().map((c) => c.feature),
      };
    })
    .sort((a, b) => a.distance - b.distance || (a.id < b.id ? -1 : 1));

  const neighbors = scored.slice(0, k);
  const meanDistance = neighbors.reduce((acc, n) => acc + n.distance, 0) / neighbors.length;
  const similarityScore = Number((1 / (1 + 4 * meanDistance)).toFixed(4)); // bounded (0,1]; NOT a probability

  return {
    evidenceClass: EVIDENCE_CLASSES.SYNTHETIC_INPUT,
    label: "RECHERCHE DE CAS — COHORTE SYNTHÉTIQUE",
    similarityScore,
    similarityNote: "score de similarité — pas une probabilité, jamais une autorisation",
    neighbors,
    oodWarning: meanDistance > ML_MODEL.oodThreshold,
    meanDistance: Number(meanDistance.toFixed(5)),
    modelVersion: ML_MODEL.version,
    k,
    weights: [...weights],
    seed: ML_MODEL.seed,
  };
}
