// CableTwin Critical Restart Lab — bounded deterministic branch simulator.
// A normalized material balance ONLY:
//   inventory[t+1] = inventory[t] + feed[t] - outflow[t]
// It does NOT model thermodynamics, vapor clouds, ignition, blast pressure or
// casualties. It detects when a RELEASE PRECURSOR becomes reachable under the
// encoded assumptions, and stops there (CR-07).
// All outputs are DT SYNTHETIC RESULT. No machine command exists (CR-06).

import { BRANCHES, CONSTRAINTS, EVIDENCE_CLASSES } from "./critical-restart-data.js";

export const SIMULATOR_MODEL = {
  version: "critical-restart-sim/1",
  timestepLabel: "1 normalized step",
  horizonSteps: 60,
  initialState: {
    inventory: 0.62, // normalized units — already above the valid sensor span
    sensorValidMax: 0.5, // the transmitter only "sees" up to this inventory
    releasePrecursorAt: 0.97,
    independentAlarmAvailable: false,
    exposureZoneOccupied: true,
  },
  assumptions: [
    "normalized units, not refinery-grade engineering units",
    "single-vessel material balance: inventory[t+1] = inventory[t] + feed - outflow",
    "the release precursor threshold is an encoded teaching assumption",
    "the documented 1:04 p.m. CSB frame is displayed separately and is not this model's state",
  ],
};

const FORBIDDEN_RESULT_FIELDS = ["deaths", "injuries", "livesSaved", "explosionProbability", "roi", "industrialSavings"];

function cloneInitialState() {
  return JSON.parse(JSON.stringify(SIMULATOR_MODEL.initialState));
}

export function simulateBranch(branchId, options = {}) {
  const branch = BRANCHES.find((candidate) => candidate.id === branchId);
  if (!branch) throw new Error(`unknown branch: ${branchId}`);
  const horizon = options.horizonSteps ?? SIMULATOR_MODEL.horizonSteps;
  const state = cloneInitialState();
  // simOverride exists ONLY for unit tests (e.g. proving CR-08 blocks an
  // otherwise-safe branch); the UI never passes it.
  const sim = { ...branch.sim, ...(options.simOverride ?? {}), readiness: { ...branch.sim.readiness, ...(options.simOverride?.readiness ?? {}) } };

  const series = [state.inventory];
  let releasePrecursorReached = false;
  let stoppedAtStep = null;

  for (let t = 0; t < horizon; t += 1) {
    const next = series[series.length - 1] + sim.feedRate - sim.outflowRate;
    const bounded = Math.max(0, next);
    series.push(Number(bounded.toFixed(6)));
    if (bounded >= state.releasePrecursorAt) {
      releasePrecursorReached = true;
      stoppedAtStep = t + 1;
      break; // CR-07: stop boundary — never simulate beyond the precursor
    }
  }

  const finalInventory = series[series.length - 1];
  const inventoryVerified = Boolean(sim.verifiedMeasurement);
  const alarmRestored = Boolean(sim.independentAlarmRestored);
  const zoneCleared = Boolean(sim.exposureZoneCleared);
  const inventoryAboveSensorRange = finalInventory > state.sensorValidMax;
  const sustainedFeedWithoutOutflow = sim.feedRate > 0 && sim.outflowRate < sim.feedRate * 0.5;

  const constraintViolations = [];
  if (!inventoryVerified && (inventoryAboveSensorRange || releasePrecursorReached)) {
    constraintViolations.push("CR-01");
  }
  if (!alarmRestored) constraintViolations.push("CR-02");
  if (sustainedFeedWithoutOutflow) constraintViolations.push("CR-03");
  if (releasePrecursorReached && !zoneCleared) constraintViolations.push("CR-04");

  const readiness = {
    instrumentTests: Boolean(sim.readiness.instrumentTests),
    shiftHandover: Boolean(sim.readiness.shiftHandover),
    preStartupSafetyReview: Boolean(sim.readiness.preStartupSafetyReview),
    qualifiedSupervision: Boolean(sim.readiness.qualifiedSupervision),
  };
  const readinessComplete = Object.values(readiness).every(Boolean);
  if (!readinessComplete && constraintViolations.length === 0) {
    // Branch C only becomes fully eligible once every readiness gate is
    // recorded (CR-08); until then it is "pending", not violated.
  }

  const approvable = constraintViolations.length === 0 && !releasePrecursorReached && readinessComplete;

  const humanReadableReason = releasePrecursorReached
    ? "RELEASE PRECURSOR REACHED under the encoded assumptions — this future may be inspected but never approved."
    : constraintViolations.length > 0
      ? `Blocked by hard constraints: ${constraintViolations.join(", ")} — the bounded model delays or hides the problem instead of resolving it.`
      : readinessComplete
        ? "No release precursor within the bounded horizon under the encoded assumptions; production is delayed; eligible for dual human review."
        : "Within the bounded safe envelope, but blocked until every CR-08 readiness gate is recorded.";

  return {
    branchId: branch.id,
    branchName: branch.name,
    actions: [...branch.actions],
    evidenceClass: EVIDENCE_CLASSES.SYNTHETIC,
    series,
    stoppedAtStep,
    releasePrecursorReached,
    finalInventory,
    inventoryAboveSensorRange,
    inventoryVerified,
    independentAlarmRestored: alarmRestored,
    exposureZoneCleared: zoneCleared,
    readiness,
    readinessComplete,
    constraintViolations,
    approvable,
    humanReadableReason,
    assumptions: [...SIMULATOR_MODEL.assumptions],
    modelVersion: SIMULATOR_MODEL.version,
  };
}

// SHA-256 over a stable serialization; Web Crypto in the browser and Node 22+
// both expose globalThis.crypto.subtle. A tiny deterministic FNV-1a fallback
// keeps old browsers working (never used in the QA environment).
async function sha256Hex(text) {
  const subtle = globalThis.crypto?.subtle;
  if (subtle) {
    const digest = await subtle.digest("SHA-256", new TextEncoder().encode(text));
    return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return `fnv1a-${h.toString(16).padStart(8, "0")}`;
}

export async function runAllBranches(options = {}) {
  const branches = {};
  for (const branch of BRANCHES) {
    branches[branch.id] = simulateBranch(branch.id, options);
  }
  const payload = JSON.stringify({
    simulator: SIMULATOR_MODEL.version,
    initialState: SIMULATOR_MODEL.initialState,
    horizon: options.horizonSteps ?? SIMULATOR_MODEL.horizonSteps,
    branches: Object.keys(branches).sort().map((id) => ({
      id,
      series: branches[id].series,
      violations: branches[id].constraintViolations,
      approvable: branches[id].approvable,
    })),
  });
  const scenarioHash = await sha256Hex(payload);
  for (const id of Object.keys(branches)) branches[id].scenarioHash = scenarioHash;
  return { branches, scenarioHash, constraints: CONSTRAINTS };
}

export { FORBIDDEN_RESULT_FIELDS };
