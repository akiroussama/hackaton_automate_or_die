// CableTwin Critical Restart Lab — factual base and scenario definitions.
// Texas City 2005 — Counterfactual Safety Replay (educational).
//
// TRUTH BOUNDARY:
// - CSB_FACTS values are documented by the official U.S. CSB investigation
//   (sources below). They are the ONLY historical claims the UI may show.
// - The synthetic cohort rows are reconstructions constrained by the CSB
//   aggregate history. No row is real BP telemetry.
// - Everything else produced from this module is a DT SYNTHETIC RESULT.
//
// Independent educational reconstruction. CableTwin is not affiliated with BP
// or the U.S. Chemical Safety Board.

export const SOURCES = {
  csbPage: "https://www.csb.gov/bp-america-texas-city-refinery-explosion/",
  csbFinalReport: "https://www.csb.gov/assets/1/20/csbfinalreportbp.pdf",
  csbAnnouncement:
    "https://www.csb.gov/u-s-chemical-safety-board-concludes-organizational-and-safety-deficiencies-at-all-levels-of-the-bp-corporation-caused-march-2005-texas-city-disaster-that-killed-15-injured-180/",
  nistHitlTwin:
    "https://www.nist.gov/publications/conceptual-architecture-digital-twins-human-loop-based-smart-manufacturing",
};

export const EVIDENCE_CLASSES = {
  FACT: "CSB DOCUMENTED FACT",
  RECONSTRUCTION: "SOURCE-GROUNDED RECONSTRUCTION",
  SYNTHETIC: "DT SYNTHETIC RESULT",
};

// Every historical number the UI displays MUST come from this object
// (acceptance gate 13: UI numbers -> source map -> unit test).
export const CSB_FACTS = {
  incident: {
    place: "Texas City, Texas",
    date: "23 March 2005",
    process: "restart of a hydrocarbon isomerization unit (raffinate splitter)",
    deaths: 15,
    injured: 180,
    outcome:
      "the tower was flooded and overpressurized; flammable material was released",
    reportRef: "CSB final report, executive summary",
  },
  evidenceFrame: {
    clockTime: "1:04 p.m.",
    indicatedPercentOfSpan: 78,
    indicatedFeet: 7.9,
    postIncidentEstimateFeet: 158,
    towerHeightFeet: 170,
    independentHighLevelAlarm: "unavailable",
    reportRef: "CSB final report, pp. 55-57 (level indication), pp. 104-106 (instrumentation)",
    explanation:
      "78 percent referred only to the transmitter's limited span — not 78 percent of the 170-foot tower.",
  },
  startupHistory: {
    windowLabel: "April 2000 – March 2005",
    startupsAnalyzed: 19,
    startupsWithinBoundaries: 1,
    startupsWithMajorLevelSwings: 14,
    levelAlarmActivations: 74,
    highLevelSetPointExceedances: 65,
    startupsExceedingTransmitterRange: 15,
    startupsOutOfRangeOverOneHour: 8,
    reportRef: "CSB final report, pp. 72-75",
  },
  contextFindings: {
    summary:
      "the startup proceeded despite known instrumentation problems; abnormal earlier startups were not treated as learning events; supervisory support was inadequate; occupied trailers were located near the release area",
    reportRef: "CSB final report, pp. 82-84 and pp. 209-211",
  },
  csbTrainingRecommendation:
    "The CSB recommended improved abnormal-situation training using simulators or similar training tools.",
};

// ---------------------------------------------------------------------------
// Feature space (Section 10 of the specification). Order is the contract.

export const FEATURE_NAMES = [
  "feed/outflow imbalance",
  "sensor-vs-balance disagreement",
  "time outside valid transmitter range",
  "pressure-alarm excursion",
  "independent alarm unhealthy",
  "manual control (vs automatic)",
  "occupied exposure zone",
  "qualified startup supervision missing",
  "shift handover incomplete",
  "pre-startup safety review incomplete",
];

export const FEATURE_COUNT = FEATURE_NAMES.length;

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const COHORT_SEED = 20050323;

export const PATTERN_FAMILIES = {
  RECURRENT_ABNORMAL: "RECURRENT ABNORMAL STARTUP",
  IN_ENVELOPE: "IN-ENVELOPE STARTUP",
  TRANSIENT_UPSET: "TRANSIENT UPSET, RECOVERED",
};

// Builds the deterministic synthetic cohort. The FAMILY PROPORTIONS mirror the
// documented aggregate history (19 startups: 1 within boundaries, 14 with
// major level swings, the remaining 4 treated as transient upsets); the
// per-row feature values are synthetic reconstructions, generated from the
// fixed seed. Exported for testing (acceptance gate 5).
export function buildSyntheticCohort(seed = COHORT_SEED) {
  const rng = mulberry32(seed);
  const rows = [];
  const jitter = (base, amp) => Math.min(1, Math.max(0, base + (rng() - 0.5) * 2 * amp));

  const push = (family, index, profile) => {
    rows.push({
      id: `SYN-${family === PATTERN_FAMILIES.RECURRENT_ABNORMAL ? "RA" : family === PATTERN_FAMILIES.IN_ENVELOPE ? "IE" : "TU"}-${String(index).padStart(2, "0")}`,
      family,
      evidenceClass: EVIDENCE_CLASSES.SYNTHETIC,
      features: profile,
    });
  };

  // 14 recurrent abnormal startups (major level swings; most exceeded the
  // transmitter range; alarm activations were frequent).
  for (let i = 1; i <= 14; i += 1) {
    push(PATTERN_FAMILIES.RECURRENT_ABNORMAL, i, [
      jitter(0.72, 0.18),
      jitter(0.78, 0.16),
      jitter(0.7, 0.22),
      jitter(0.62, 0.2),
      jitter(0.65, 0.25),
      jitter(0.8, 0.15),
      jitter(0.55, 0.3),
      jitter(0.6, 0.25),
      jitter(0.55, 0.25),
      jitter(0.6, 0.25),
    ]);
  }
  // 1 startup that stayed within the cited boundaries.
  push(PATTERN_FAMILIES.IN_ENVELOPE, 1, [
    jitter(0.12, 0.08),
    jitter(0.1, 0.06),
    jitter(0.05, 0.05),
    jitter(0.08, 0.06),
    jitter(0.1, 0.08),
    jitter(0.25, 0.15),
    jitter(0.15, 0.1),
    jitter(0.1, 0.08),
    jitter(0.1, 0.08),
    jitter(0.1, 0.08),
  ]);
  // 4 transient upsets that recovered (the remaining analyzed startups).
  for (let i = 1; i <= 4; i += 1) {
    push(PATTERN_FAMILIES.TRANSIENT_UPSET, i, [
      jitter(0.42, 0.15),
      jitter(0.38, 0.15),
      jitter(0.3, 0.15),
      jitter(0.35, 0.18),
      jitter(0.3, 0.2),
      jitter(0.5, 0.2),
      jitter(0.3, 0.2),
      jitter(0.3, 0.18),
      jitter(0.3, 0.18),
      jitter(0.3, 0.18),
    ]);
  }
  return rows;
}

// The reconstructed pre-start decision-gate vector for the replay. This is a
// SOURCE-GROUNDED RECONSTRUCTION of the conditions the CSB report documents
// (instrument disagreement, unavailable independent high-level protection,
// manual control, occupied trailers, inadequate supervision) — not a measured
// historical minute.
export function defaultIncidentVector() {
  return [0.85, 0.9, 0.75, 0.6, 1.0, 0.9, 1.0, 0.9, 0.7, 0.8];
}

// ---------------------------------------------------------------------------
// Hard constraints (Section 9). Deterministic, separate from the ML model.

export const CONSTRAINTS = [
  { id: "CR-01", name: "Reliable inventory required", rule: "inventory implied outside the valid sensor range with no independent verified measurement blocks approval" },
  { id: "CR-02", name: "Independent high-level protection required", rule: "an unavailable or unverified safety-critical high-level alarm blocks approval" },
  { id: "CR-03", name: "Outflow plausibility required", rule: "sustained feed without plausible outflow creates unknown inventory and blocks approval" },
  { id: "CR-04", name: "Exposure zone must be clear", rule: "a branch reaching a release precursor while the modeled exposure zone is occupied is never approvable" },
  { id: "CR-05", name: "Dual human authority", rule: "finalization requires both Operations and Process Safety approval" },
  { id: "CR-06", name: "No automatic actuation", rule: "no network, PLC, control, write-back or machine-command interface exists" },
  { id: "CR-07", name: "Simulation stop boundary", rule: "the simulator stops at RELEASE PRECURSOR REACHED and never simulates an explosion or casualty outcome" },
  { id: "CR-08", name: "Readiness evidence required", rule: "controlled restart stays blocked until instrument tests, shift handover, pre-startup safety review and qualified supervision are recorded" },
];

// ---------------------------------------------------------------------------
// Virtual branches (Section 8, Beat 5). Normalized units by design.

export const BRANCHES = [
  {
    id: "A",
    name: "Continue restart",
    actions: ["keep feed active", "retain limited indication", "do not clear the occupied zone"],
    sim: { feedRate: 0.05, outflowRate: 0.004, verifiedMeasurement: false, independentAlarmRestored: false, exposureZoneCleared: false, readiness: {} },
  },
  {
    id: "B",
    name: "Reduce feed only",
    actions: ["reduce feed", "leave inventory unverified", "leave independent high-level protection unavailable"],
    sim: { feedRate: 0.008, outflowRate: 0.004, verifiedMeasurement: false, independentAlarmRestored: false, exposureZoneCleared: false, readiness: {} },
  },
  {
    id: "C",
    name: "Hold, verify, protect, clear",
    actions: [
      "hold the restart",
      "verify a redundant level measurement",
      "restore and test independent high-level protection",
      "reconcile feed/outflow through material balance",
      "clear the modeled exposure zone",
      "require a qualified startup supervisor",
    ],
    sim: {
      feedRate: 0,
      outflowRate: 0.012,
      verifiedMeasurement: true,
      independentAlarmRestored: true,
      exposureZoneCleared: true,
      readiness: { instrumentTests: true, shiftHandover: true, preStartupSafetyReview: true, qualifiedSupervision: true },
    },
  },
];
