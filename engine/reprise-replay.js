// CableTwin — Reprise scenario: shared business-event journal + display
// scheduler. The long demo and the jury demo are NOT two scenarios: they replay
// ONE ordered journal, one initial state, one rule version and the same engine
// results. Only the DISPLAY schedule differs between speeds.
//
// This module consumes engine outputs; it never feeds the display speed back
// into the decision. The mode-identity digest below is computed from the engine
// result and the journal ONLY — the mode argument never enters the hash, which
// is exactly why EXPERT x1 and JURY 30 S produce the same digest for the same
// input (contract §8, §15).

import {
  evaluateAll, hash64, SCENARIO_ID, SEED, INITIAL_STATE, RULES,
} from "./reprise-engine.js";

// The twelve expert beats (contract §8, 0:00–6:20). Each carries a simulated
// clock and a semantic beat id — NEVER a display duration. Total simulated span
// is 6 min 20 = 380 s.
export const BUSINESS_JOURNAL = [
  { id: "intro", simClock: "état initial", beat: "engagement", text: "24 km d'engagement client sur 8 tourets ; T7 dans la ligne CCV ; premier camion 06:30." },
  { id: "risk-window", simClock: "avant 17:42", beat: "honnêteté-données", text: "Fenêtre de risque saisie par l'opérateur ; légère dérive dimensionnelle encore sous surveillance." },
  { id: "outage", simClock: "17:42 → 18:40", beat: "cause-unique", text: "Perte réseau : sécurité et contrôle restent alimentés, la production s'arrête 58 minutes." },
  { id: "reconstruction", simClock: "18:40", beat: "jumeau-qualité", text: "Le twin reconstitue le run et localise l'intervalle à investiguer ; T7 reste entièrement HOLD." },
  { id: "ml-neighbors", simClock: "18:41", beat: "ia-explicable", text: "Trois voisins synthétiques : distances, ressemblances, différences ; aucune probabilité de conformité." },
  { id: "reject-shortcuts", simClock: "18:42", beat: "faisabilité", text: "Les règles dures bloquent groupe électrogène et « tout redémarrer »." },
  { id: "compare-bc", simClock: "18:45", beat: "arbitrage", text: "B et C sont faisables ; C réduit le pic, la matière et le conflit de ressources." },
  { id: "stress", simClock: "essai", beat: "preuve-live", text: "Puissance réduite sous le seuil : aucun plan faisable — CableTwin sait dire non." },
  { id: "restore", simClock: "essai", beat: "recalcul", text: "Puissance restaurée, Option C sélectionnée : même moteur, nouvel état, nouveau plan." },
  { id: "governance", simClock: "décision", beat: "gouvernance", text: "Quatre rôles et la porte laboratoire fermée : le modèle ne signe pas à la place des humains." },
  { id: "logistics-view", simClock: "décision", beat: "impact-client", text: "T1–T6 hors incident, T7 en attente de disposition, T8 replanifié." },
  { id: "audit", simClock: "clôture", beat: "clarté", text: "Audit, hypothèses et limites : le ML retrouve le passé, le twin compare les futurs, les règles bloquent l'impossible." },
];

// The pausable/inspectable checkpoints, in order — one per journal beat.
export const CHECKPOINTS = BUSINESS_JOURNAL.map((e) => e.id);

// Natural (EXPERT x1) display duration per checkpoint, from the §8 table.
// The sum is exactly 380 000 ms = 6 min 20.
const NATURAL_MS = {
  intro: 35000,
  "risk-window": 25000,
  outage: 25000,
  reconstruction: 45000,
  "ml-neighbors": 40000,
  "reject-shortcuts": 35000,
  "compare-bc": 55000,
  stress: 30000,
  restore: 30000,
  governance: 30000,
  "logistics-view": 20000,
  audit: 10000,
};

// The five readable jury beats (contract §9). Each references a real checkpoint
// and is held 4–7 s; all other checkpoints are compressed to fast transitions.
export const JURY_BEATS = [
  { checkpointId: "outage", label: "Incident", displayMs: 5000 },
  { checkpointId: "reconstruction", label: "Incertitude", displayMs: 5000 },
  { checkpointId: "compare-bc", label: "Futurs", displayMs: 6000 },
  { checkpointId: "stress", label: "Preuve live", displayMs: 6000 },
  { checkpointId: "restore", label: "Décision gouvernée", displayMs: 5000 },
];
const JURY_TRANSITION_MS = 400;

export const MODES = {
  x1: { id: "x1", label: "EXPERT ×1", factor: 1, note: "narration complète 6 min 20" },
  x5: { id: "x5", label: "REPLAY ×5", factor: 5, note: "revue technique" },
  x7: { id: "x7", label: "REPLAY ×7", factor: 7, note: "répétition accélérée" },
  jury30: { id: "jury30", label: "JURY 30 S", effectiveFactor: 12.67, note: "extrait jury — 5 beats" },
};

// Build the per-checkpoint DISPLAY schedule for a mode. Same checkpoint ids and
// order for every mode; only displayMs differs. The decision engine is never
// consulted here.
export function buildSchedule(mode) {
  if (mode === "jury30") {
    const held = new Map(JURY_BEATS.map((b) => [b.checkpointId, b.displayMs]));
    return CHECKPOINTS.map((checkpointId) => ({
      checkpointId,
      displayMs: held.get(checkpointId) ?? JURY_TRANSITION_MS,
    }));
  }
  const factor = MODES[mode]?.factor ?? 1;
  return CHECKPOINTS.map((checkpointId) => ({
    checkpointId,
    displayMs: Math.round(NATURAL_MS[checkpointId] / factor),
  }));
}

// The mode-identity digest: computed from the ENGINE result and the ordered
// journal only. The `mode` argument is accepted for call symmetry but is
// deliberately excluded from the hash — proving the display speed cannot change
// the decision (contract §8 identity test).
export function computeModeDigest(mode, inputs = {}) {
  const engineResult = evaluateAll(inputs);
  const journalSignature = BUSINESS_JOURNAL.map((e) => `${e.id}@${e.simClock}:${e.beat}`).join("|");
  return hash64([
    SCENARIO_ID,
    SEED,
    JSON.stringify(INITIAL_STATE),
    RULES.map((r) => r.id).join(","),
    journalSignature,
    engineResult.digest,
  ].join("::"));
}
