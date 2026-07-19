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

// Human-readable link labels — used instead of raw URLs as visible link text
// so the CSB-announcement slug (which repeats the casualty numbers) is never
// rendered as running prose (adversarial-review finding, audit cleanup).
export const SOURCE_LABELS = {
  csbPage: "CSB investigation page",
  csbFinalReport: "CSB final investigation report (PDF)",
  csbAnnouncement: "CSB announcement",
  nistHitlTwin: "NIST human-in-the-loop digital-twin architecture",
};

export const EVIDENCE_CLASSES = {
  FACT: "CSB DOCUMENTED FACT",
  RECONSTRUCTION: "SOURCE-GROUNDED RECONSTRUCTION",
  SYNTHETIC: "DT SYNTHETIC RESULT",
};

// Every historical number the UI displays MUST come from this object
// (acceptance gate 13: UI numbers -> source map -> unit test).
export const CSB_FACTS = {
  reportVersion: "CSB final report, approved 20 March 2007",
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
    // The CSB report distinguishes two separate alarms (pp. 34, 49, 81):
    // the transmitter-associated high-level alarm (72% of span) was ACTIVE
    // and ACKNOWLEDGED throughout the startup; the separate REDUNDANT
    // HARDWIRED high-level alarm did NOT sound. These are not the same
    // device — conflating them into one generic "independent alarm
    // unavailable" claim overstates what the record documents.
    transmitterAlarmPercentOfSpan: 72,
    transmitterAlarmStatus: "active and acknowledged",
    redundantHardwiredAlarmStatus: "did not sound",
    reportRef:
      "CSB final report, pp. 55-57 (level indication), pp. 104-106 (instrumentation), pp. 34, 49, 81 (alarm distinction)",
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
};

function seededShuffle(items, rng) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const clamp01 = (value) => Math.min(1, Math.max(0, value));

// Synthesizes a 10-feature reconstruction vector from a row's CSB-aligned
// tags. Severity scales with how many documented marginals the row carries;
// the "within cited boundaries" row is deliberately calm. All jitter is
// seeded — reproducible, never real telemetry.
function featuresForRow(tags, rng) {
  const j = (base, amp) => clamp01(base + (rng() - 0.5) * 2 * amp);
  const swingBoost = tags.significantLevelSwing ? 0.18 : 0;
  const rangeBoost = tags.exceededTransmitterRange ? 0.18 : 0;
  const hourBoost = tags.outOfRangeOverOneHour ? 0.14 : 0;
  const base = tags.withinCitedBoundaries ? 0.1 : 0.42 + swingBoost + rangeBoost + hourBoost;

  return [
    j(base, 0.15), // feed/outflow imbalance
    j(base + rangeBoost * 0.4, 0.15), // sensor-vs-balance disagreement
    j(tags.exceededTransmitterRange ? base + 0.15 : base * 0.6, 0.15), // time outside valid transmitter range
    j(base + swingBoost * 0.3, 0.18), // pressure-alarm excursion
    j(base + hourBoost * 0.5, 0.12), // independent alarm unhealthy (reconstruction layer)
    j(tags.withinCitedBoundaries ? 0.2 : 0.6 + swingBoost * 0.3, 0.2), // manual control (vs automatic)
    j(tags.withinCitedBoundaries ? 0.15 : 0.5, 0.25), // occupied exposure zone
    j(base * 0.85, 0.2), // qualified startup supervision missing
    j(base * 0.8, 0.2), // shift handover incomplete
    j(base * 0.8, 0.2), // pre-startup safety review incomplete
  ];
}

// Builds the deterministic synthetic cohort of 19 rows (one per analyzed
// startup). The CSB report publishes four OVERLAPPING marginal counts over
// the same 19 startups — not a mutually exclusive partition:
//   14 had significant level swings; 15 exceeded the transmitter range;
//   8 of those remained out of range for more than one hour;
//   1 stayed within the cited level/pressure boundaries.
// This cohort assigns each of those counts as an independent boolean TAG so
// rows can (and, by the pigeonhole principle here, must) carry more than one
// tag — mirroring the fact that the categories overlap. The SPECIFIC rows
// chosen for each tag, and therefore the exact joint/overlap pattern, is a
// SYNTHETIC TEACHING CONSTRUCTION: only the four marginal counts above are
// CSB-documented; CSB does not report which individual startups combined
// which conditions. Exported for testing (acceptance gate 5).
export function buildSyntheticCohort(seed = COHORT_SEED) {
  const rng = mulberry32(seed);
  const h = CSB_FACTS.startupHistory;
  const total = h.startupsAnalyzed; // 19
  const withinCount = h.startupsWithinBoundaries; // 1
  const swingCount = h.startupsWithMajorLevelSwings; // 14
  const rangeCount = h.startupsExceedingTransmitterRange; // 15
  const overHourCount = h.startupsOutOfRangeOverOneHour; // 8

  const allIndices = Array.from({ length: total }, (_, i) => i);
  const shuffled = seededShuffle(allIndices, rng);
  const withinIdx = new Set(shuffled.slice(0, withinCount));
  const remaining = shuffled.slice(withinCount); // 18 non-boundary rows, fixed order

  // swingSet and rangeSet are deterministic sliding windows over the SAME
  // fixed order, sized exactly to the CSB marginals. Because
  // swingCount + rangeCount (14 + 15 = 29) exceeds remaining.length (18),
  // their union necessarily covers all 18 rows and their overlap is exactly
  // 29 - 18 = 11 rows — an explicit, honest synthetic overlap, not a claim
  // about which real startups overlapped.
  const swingSet = new Set(remaining.slice(0, swingCount));
  const rangeStart = remaining.length - rangeCount;
  const rangeWindow = remaining.slice(rangeStart);
  const rangeSet = new Set(rangeWindow);
  const overHourSet = new Set(rangeWindow.slice(0, overHourCount)); // subset of rangeSet, per CSB wording

  return allIndices.map((idx) => {
    const tags = {
      withinCitedBoundaries: withinIdx.has(idx),
      significantLevelSwing: swingSet.has(idx),
      exceededTransmitterRange: rangeSet.has(idx),
      outOfRangeOverOneHour: overHourSet.has(idx),
    };
    const family = tags.withinCitedBoundaries
      ? PATTERN_FAMILIES.IN_ENVELOPE
      : PATTERN_FAMILIES.RECURRENT_ABNORMAL;
    return {
      id: `SYN-${String(idx + 1).padStart(2, "0")}`,
      family,
      tags,
      evidenceClass: EVIDENCE_CLASSES.SYNTHETIC,
      features: featuresForRow(tags, rng),
    };
  });
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
