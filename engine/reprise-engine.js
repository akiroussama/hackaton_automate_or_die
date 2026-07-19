// CableTwin — Reprise scenario: deterministic multi-constraint recovery engine.
// The "twin that compares futures": it reconstructs state, computes the minimum
// investigation envelope, keeps drum T7 entirely HOLD, enumerates bounded
// recovery sequences and rejects any that violates a hard rule — returning the
// FIRST violated rule, not a coloured score. When available power drops below
// the minimum feasible need, NO branch is feasible and the engine says so.
//
// This module is pure and deterministic. It never reads a display layer: the
// narration speed is unknown to the decision. All numeric outputs are
// SYNTHETIC / to calibrate (contract §4.2, §4.3, §5, §15).

import {
  SCENARIO, DRUMS, CONSTRAINTS, BRANCHES, EVIDENCE_CLASSES,
} from "./reprise-data.js";

export const SCENARIO_ID = SCENARIO.id;
export const SEED = SCENARIO.seed;

// Rules in FIXED evaluation order. The first one a branch violates sets its
// firstViolatedRule. Reusing the catalogue keeps ids/labels in one place.
export const RULES = CONSTRAINTS;

// Serializable starting snapshot — used in the digest and for an exact reset.
export const INITIAL_STATE = {
  scenarioId: SCENARIO.id,
  drums: DRUMS.map((d) => ({ id: d.id, status: d.status })),
  availablePowerMW: SCENARIO.power.internalEnvelopeMW,
  qualityGateOpen: false,
};

// Drum statuses never change through the engine: T7 stays HOLD, T8 replanned,
// T1–T6 keep their normal status. Only a human/lab entry can move the T7 gate.
function drumStatuses() {
  const out = {};
  for (const d of DRUMS) out[d.id] = d.status;
  return out;
}

// The minimum investigation envelope (metres). SYNTHETIC output to calibrate;
// it is NEVER a certain defect nor a released portion, and it cannot be reduced
// below this value by any manual input (R-ENVELOPE-LOCK).
function investigationEnvelope() {
  const { lineSpeedMPerMin, uncertainWindowMin, encodedProcessMarginM } = SCENARIO.investigation;
  const meters = lineSpeedMPerMin * uncertainWindowMin + encodedProcessMarginM;
  return {
    meters,
    formula: "vitesse de ligne × fenêtre d'historique incertain + marge procédé encodée",
    label: EVIDENCE_CLASSES.SYNTHETIC_OUTPUT,
  };
}

// A step order respects the interlocks iff every step appears after all of its
// prerequisites (R-MACHINE).
function stepOrderRespectsInterlocks(stepOrder) {
  const prereqs = new Map(SCENARIO.machineGraph.steps.map((s) => [s.id, s.prereqs]));
  const seen = new Set();
  for (const stepId of stepOrder) {
    for (const req of prereqs.get(stepId) ?? []) {
      if (!seen.has(req)) return false;
    }
    seen.add(stepId);
  }
  return true;
}

// French-formatted power reading (comma decimal) for human-readable reasons.
const mw = (v) => `${v.toFixed(2).replace(".", ",")} MW`;

export function evaluateBranch(branchId, inputs = {}) {
  const branch = BRANCHES.find((b) => b.id === branchId);
  if (!branch) throw new Error(`unknown branch: ${branchId}`);
  const sim = branch.sim;
  const availablePowerMW = inputs.availablePowerMW ?? SCENARIO.power.internalEnvelopeMW;
  const powerCeiling = Math.min(SCENARIO.power.internalEnvelopeMW, availablePowerMW);

  // Hard rules, evaluated in RULES order; the first failure stops the chain.
  let firstViolatedRule = null;
  let reason = "";

  if (sim.onBackupSource) {
    firstViolatedRule = "R-BACKUP";
    reason = "La source de secours couvre sécurité, contrôle et refroidissement, pas la production.";
  } else if (sim.peakMW > powerCeiling) {
    firstViolatedRule = "R-ENERGY";
    reason = `Pic de reprise ${mw(sim.peakMW)} > enveloppe disponible ${mw(powerCeiling)}.`;
  } else if (!stepOrderRespectsInterlocks(sim.stepOrder)) {
    firstViolatedRule = "R-MACHINE";
    reason = "Une étape est lancée avant ses prérequis (interlock non respecté).";
  } else if (sim.materialKits > SCENARIO.material.restartKitsAvailable) {
    firstViolatedRule = "R-MATERIAL";
    reason = `Matière requise ${sim.materialKits} > kits qualifiés disponibles ${SCENARIO.material.restartKitsAvailable}.`;
  }

  const feasible = firstViolatedRule === null;

  // Quality<->logistics contention: the single Quality authority cannot both run
  // an extended T7 requalif overlapping the 05:45 cutoff AND close the T1–T6
  // dossiers in time. This is surfaced as a conflict, not a hard rejection —
  // Option B stays a valid recovery, it just puts the first truck at risk.
  const humanConflicts = [];
  if (sim.qualityAuthorityTask === "t7-requalif" && sim.authorityOverlapsCutoff) {
    humanConflicts.push({
      role: "Qualité / Laboratoire",
      detail: `Requalif T7 étendue chevauche la clôture des dossiers T1–T6 (${SCENARIO.humans.t1t6DossierCutoffClock}).`,
    });
  }
  const logisticsFeasible = feasible && !sim.authorityOverlapsCutoff;

  if (feasible && !reason) {
    reason = logisticsFeasible
      ? "Séquence faisable sous les hypothèses affichées ; premier camion préservé ; T7 reste HOLD."
      : "Séquence faisable, mais l'autorité Qualité mobilisée met en risque le premier camion.";
  }

  return {
    branchId: branch.id,
    branchName: branch.name,
    summary: branch.summary,
    feasible,
    firstViolatedRule,
    reason,
    peakMW: sim.peakMW,
    durationMin: sim.durationMin,
    materialUsed: sim.materialKits,
    humanConflicts,
    logisticsFeasible,
    drumStatuses: drumStatuses(),
    investigationEnvelope: investigationEnvelope(),
    evidenceClass: EVIDENCE_CLASSES.SYNTHETIC_OUTPUT,
  };
}

// FNV-1a (64-bit) over a stable serialization — synchronous, deterministic and
// identical in Node and the browser. This digest is a NON-DRIFT test proof, not
// a cryptographic authenticity claim (contract §8). Exported so the replay
// layer computes the mode-identity digest with the SAME hash.
export function hash64(text) {
  let h = 0xcbf29ce484222325n;
  const prime = 0x100000001b3n;
  const mask = 0xffffffffffffffffn;
  for (let i = 0; i < text.length; i += 1) {
    h ^= BigInt(text.charCodeAt(i));
    h = (h * prime) & mask;
  }
  return h.toString(16).padStart(16, "0");
}

export function evaluateAll(inputs = {}) {
  const branchResults = {};
  for (const branch of BRANCHES) branchResults[branch.id] = evaluateBranch(branch.id, inputs);

  const anyFeasible = Object.values(branchResults).some((r) => r.feasible);

  // Recommend the feasible branch that preserves logistics with the lowest peak
  // (Option C under the nominal set). Never an automatic order or a certification.
  const recommendable = Object.values(branchResults)
    .filter((r) => r.feasible && r.logisticsFeasible)
    .sort((a, b) => a.peakMW - b.peakMW);
  const recommendation = recommendable.length ? recommendable[0].branchId : null;

  // When nothing is feasible, name the binding constraint (the rule the closest
  // branches trip on — under low power that is R-ENERGY).
  let noFeasibleReason = null;
  if (!anyFeasible) {
    const restartBranches = [branchResults.B, branchResults.C];
    const binding = restartBranches.find((r) => r.firstViolatedRule)?.firstViolatedRule ?? "R-ENERGY";
    const label = RULES.find((r) => r.id === binding)?.label ?? "contrainte dure";
    noFeasibleReason = `Aucun plan faisable sous les contraintes actuelles — ${binding} : ${label}.`;
  }

  // The T7 quality gate is closed unless a valid lab/human result is supplied.
  const labResult = inputs.labResult;
  const qualityGate = {
    open: Boolean(labResult && labResult.pass === true && labResult.role),
    requiredRole: SCENARIO.quality.requiredRole,
    missingEvidence: SCENARIO.quality.missingEvidence,
  };

  const digestPayload = JSON.stringify({
    scenarioId: SCENARIO_ID,
    seed: SEED,
    initialState: INITIAL_STATE,
    rules: RULES.map((r) => r.id),
    inputs: {
      availablePowerMW: inputs.availablePowerMW ?? SCENARIO.power.internalEnvelopeMW,
      manualEnvelopeMeters: inputs.manualEnvelopeMeters ?? null,
      labResult: labResult ? { role: labResult.role, pass: labResult.pass === true } : null,
    },
    branches: Object.keys(branchResults).sort().map((id) => {
      const r = branchResults[id];
      return {
        id,
        feasible: r.feasible,
        firstViolatedRule: r.firstViolatedRule,
        peakMW: r.peakMW,
        materialUsed: r.materialUsed,
        logisticsFeasible: r.logisticsFeasible,
        envelope: r.investigationEnvelope.meters,
      };
    }),
    qualityGateOpen: qualityGate.open,
    recommendation,
  });

  return {
    scenarioId: SCENARIO_ID,
    branches: branchResults,
    anyFeasible,
    recommendation,
    noFeasibleReason,
    qualityGate,
    investigationEnvelope: investigationEnvelope(),
    digest: hash64(digestPayload),
    evidenceClass: EVIDENCE_CLASSES.SYNTHETIC_OUTPUT,
  };
}
