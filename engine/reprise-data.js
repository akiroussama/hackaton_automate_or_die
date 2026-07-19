// CableTwin — Reprise scenario data ("58 minutes sans réseau — 24 km
// d'engagement client"). SINGLE source of truth for every synthetic input.
// Values here are editable WITHOUT changing the engine rules
// (engine/reprise-engine.js). Everything below is SYNTHETIC design input; the
// four evidence classes label every value shown in the UI. This scenario is
// distinct from the production twin and from the abandoned Critical Restart Lab.

// The four mandatory evidence labels (contract §3.2). Every displayed value is
// classified as exactly one of these.
export const EVIDENCE_CLASSES = {
  EXTERNAL_FACT: "FAIT EXTERNE VÉRIFIÉ",
  SYNTHETIC_INPUT: "ENTRÉE SCÉNARIO — SYNTHÉTIQUE",
  SYNTHETIC_OUTPUT: "SORTIE MODÈLE — SYNTHÉTIQUE / À CALIBRER",
  HUMAN_LAB: "ENTRÉE HUMAINE OU LABORATOIRE",
};

// Eight continuous drums, 3 km each = 24 km client commitment (contract §3.3).
// T1–T6 are outside the incident (histories intact, normal release flow); T7 is
// the drum in the CCV line at the outage and stays entirely HOLD; T8 had not
// started and is replanned.
export const DRUMS = [
  { id: "T1", km: 3, status: "TERMINÉ", inIncident: false },
  { id: "T2", km: 3, status: "TERMINÉ", inIncident: false },
  { id: "T3", km: 3, status: "TERMINÉ", inIncident: false },
  { id: "T4", km: 3, status: "TERMINÉ", inIncident: false },
  { id: "T5", km: 3, status: "TERMINÉ", inIncident: false },
  { id: "T6", km: 3, status: "TERMINÉ", inIncident: false },
  { id: "T7", km: 3, status: "HOLD", inIncident: true },
  { id: "T8", km: 3, status: "NON DÉMARRÉ / REPLANIFIÉ", inIncident: false },
];

// The whole scenario. Editing a value here must never require editing a rule.
export const SCENARIO = {
  id: "reprise-58min-24km",
  seed: 20260719,
  order: {
    ref: "CMD-24KM-SYNTH",
    cableType: "MT XLPE 12/20 kV",
    totalKm: 24,
    drums: DRUMS,
    label: EVIDENCE_CLASSES.SYNTHETIC_INPUT,
  },
  // Single causal trigger: the local grid power loss (contract §3.4, §15).
  incident: {
    lossClock: "17:42",
    returnClock: "18:40",
    durationMinutes: 58,
    causes: ["Perte réseau local — source de secours limitée à sécurité/contrôle/refroidissement"],
    // The operator ENTERS a published risk window; CableTwin never predicts it.
    riskWindowSource: EVIDENCE_CLASSES.EXTERNAL_FACT,
    label: EVIDENCE_CLASSES.SYNTHETIC_INPUT,
  },
  // Synthetic power set carrying the "SYNTHÉTIQUE / À CALIBRER" badge (§3.5).
  power: {
    internalEnvelopeMW: 1.5,
    restartAllPeakMW: 1.74,
    conservativePeakMW: 1.43,
    sequencedPeakMW: 1.28,
    // Below this available power NO branch can be feasible (proves the engine
    // can say no). 1.28 is the smallest peak, so anything under it blocks all.
    minFeasiblePowerMW: 1.28,
    label: EVIDENCE_CLASSES.SYNTHETIC_INPUT,
  },
  // Machine dependency graph (interlocks): a step cannot start before its
  // prerequisites. Order is safety-aux -> cooling -> checks -> thermal zones ->
  // extrusion/drives (contract §5 Option C).
  machineGraph: {
    steps: [
      { id: "safety-aux", label: "Auxiliaires de sécurité", prereqs: [] },
      { id: "cooling", label: "Refroidissement", prereqs: ["safety-aux"] },
      { id: "checks", label: "Vérifs pression / eau / commande", prereqs: ["cooling"] },
      { id: "thermal-zones", label: "Zones thermiques séquencées", prereqs: ["checks"] },
      { id: "extrusion", label: "Extrusion + entraînements", prereqs: ["thermal-zones"] },
    ],
    label: EVIDENCE_CLASSES.SYNTHETIC_INPUT,
  },
  // Limited qualified restart material.
  material: {
    restartKitsAvailable: 2,
    label: EVIDENCE_CLASSES.SYNTHETIC_INPUT,
  },
  // One qualified Quality shift authority; the T1–T6 release dossiers must be
  // closed before 05:45 to allow the 06:30 truck (contract §3.5 Quality<->Logistics).
  humans: {
    qualityAuthorities: 1,
    t1t6DossierCutoffClock: "05:45",
    roles: ["Production", "Maintenance / Énergie", "Qualité / Laboratoire", "Logistique"],
    label: EVIDENCE_CLASSES.SYNTHETIC_INPUT,
  },
  // The T7 quality gate: closed until a lab result + contractual disposition
  // exist. Only a human/lab entry can change it (contract §4.4, §6).
  quality: {
    t7GateOpen: false,
    requiredRole: "Qualité / Laboratoire",
    missingEvidence: "Résultat laboratoire + disposition contractuelle",
    label: EVIDENCE_CLASSES.HUMAN_LAB,
  },
  // First client wave keeps its sequence and loading slot.
  logistics: {
    firstTruckClock: "06:30",
    firstTruckDrums: ["T1", "T2", "T3", "T4", "T5", "T6"],
    cutoffClock: "05:45",
    label: EVIDENCE_CLASSES.SYNTHETIC_INPUT,
  },
  // Minimum investigation-envelope inputs (contract §4.2). The envelope is a
  // SYNTHETIC OUTPUT to calibrate; it is NOT a certain defect nor a released
  // portion. meters = lineSpeed * uncertainWindow + encodedProcessMargin.
  investigation: {
    lineSpeedMPerMin: 12,
    uncertainWindowMin: 8,
    encodedProcessMarginM: 30,
    label: EVIDENCE_CLASSES.SYNTHETIC_OUTPUT,
  },
};

// Constraint catalogue — one entry per decision domain, plus the backup-source
// and envelope-lock hard rules. Ids are stable and referenced by the engine and
// the UI.
export const CONSTRAINTS = [
  { id: "R-BACKUP", domain: "energy", label: "Production impossible sur la source de secours" },
  { id: "R-ENERGY", domain: "energy", label: "Pic de reprise ≤ enveloppe interne et puissance disponible" },
  { id: "R-MACHINE", domain: "machine", label: "Aucune étape avant ses prérequis (interlocks)" },
  { id: "R-MATERIAL", domain: "material", label: "Consommation ≤ kits de reprise qualifiés disponibles" },
  { id: "R-HUMAN", domain: "human", label: "Une autorité qualifiée n'exécute pas deux tâches critiques au même instant" },
  { id: "R-QUALITY", domain: "quality", label: "T7 reste HOLD sans le rôle et la preuve requis" },
  { id: "R-LOGISTICS", domain: "logistics", label: "La première vague client conserve séquence et créneau" },
  { id: "R-ENVELOPE-LOCK", domain: "quality", label: "L'enveloppe minimale d'investigation ne peut être réduite manuellement" },
];

// The four post-return options compared in the demo (contract §5). `sim`
// carries the encoded synthetic inputs the engine reads; the engine — not this
// file — decides feasibility from the rules.
export const BRANCHES = [
  {
    id: "O0",
    name: "Continuer sur groupe électrogène",
    summary: "La source encodée couvre sécurité, contrôle et refroidissement, pas la production.",
    sim: {
      onBackupSource: true,
      peakMW: 0,
      materialKits: 0,
      durationMin: 0,
      stepOrder: [],
      qualityAuthorityTask: null,
      authorityOverlapsCutoff: false,
    },
  },
  {
    id: "A",
    name: "Tout redémarrer simultanément",
    summary: "Pic de reprise et interlocks non respectés.",
    sim: {
      onBackupSource: false,
      peakMW: 1.74,
      materialKits: 2,
      durationMin: 120,
      // Invalid order: extrusion launched before its prerequisites.
      stepOrder: ["extrusion", "safety-aux", "cooling", "checks", "thermal-zones"],
      qualityAuthorityTask: null,
      authorityOverlapsCutoff: false,
    },
  },
  {
    id: "B",
    name: "Reprise conservatrice complète",
    summary: "Valide, mais plus de matière/temps et la même autorité Qualité mobilisée sur T7 pendant la clôture T1–T6.",
    sim: {
      onBackupSource: false,
      peakMW: 1.43,
      materialKits: 2,
      durationMin: 190,
      stepOrder: ["safety-aux", "cooling", "checks", "thermal-zones", "extrusion"],
      // The single Quality authority is consumed by an extended T7 requalif
      // overlapping the 05:45 cutoff -> the T1–T6 dossiers cannot close in time.
      qualityAuthorityTask: "t7-requalif",
      authorityOverlapsCutoff: true,
    },
  },
  {
    id: "C",
    name: "Reprise séquencée",
    summary: "Satisfait les contraintes avec moins de pic, moins de matière et moins de conflit ; T7 reste HOLD.",
    sim: {
      onBackupSource: false,
      peakMW: 1.28,
      materialKits: 1,
      durationMin: 150,
      stepOrder: ["safety-aux", "cooling", "checks", "thermal-zones", "extrusion"],
      // The Quality authority closes the T1–T6 dossiers before the cutoff;
      // T7 lab work is deferred (drum stays HOLD).
      qualityAuthorityTask: "t1-t6-dossiers",
      authorityOverlapsCutoff: false,
    },
  },
];

// ML features visible in the side panel (contract §4.1). No conformity output.
export const FEATURE_NAMES = [
  "durée d'arrêt",
  "position dans le run",
  "état des auxiliaires",
  "dérive dimensionnelle avant arrêt",
  "stock de reprise",
  "puissance disponible",
  "disponibilité des rôles",
];
export const FEATURE_COUNT = FEATURE_NAMES.length;
export const COHORT_SEED = SCENARIO.seed;
export const COHORT_SIZE = 9;

// Fields that must NEVER appear on any engine or ML result object (contract
// §13/§14). The suite asserts their absence.
export const FORBIDDEN_RESULT_FIELDS = [
  "conformityProbability",
  "livesSaved",
  "roi",
  "oee",
  "annualSaving",
  "avoidedCost",
  "certainScrapMeters",
  "clusteringAccuracy",
];

// Small deterministic PRNG (mulberry32) — same seed always yields the same
// synthetic cohort, so retrieval is reproducible and testable.
function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// A small, explicitly synthetic cohort of comparable historical cases. Each row
// is a feature vector in [0,1]; there is no conformity label and no outcome.
export function buildSyntheticCohort(seed = COHORT_SEED) {
  const rand = mulberry32(seed);
  const rows = [];
  for (let i = 0; i < COHORT_SIZE; i += 1) {
    const features = FEATURE_NAMES.map(() => Number(rand().toFixed(4)));
    rows.push({
      id: `CAS-${String(i + 1).padStart(2, "0")}`,
      features,
      evidenceClass: EVIDENCE_CLASSES.SYNTHETIC_INPUT,
      label: "Cas historique synthétique",
    });
  }
  return rows;
}

// The current incident as a normalized feature vector (same order as
// FEATURE_NAMES). Used by the ML retrieval as the query point.
export function defaultIncidentVector() {
  return [0.72, 0.6, 0.5, 0.35, 0.4, 0.5, 0.3];
}
