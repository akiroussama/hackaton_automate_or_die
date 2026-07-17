/**
 * CableTwin demonstration dataset.
 *
 * IMPORTANT: every company, customer, order, duration, cost and production value
 * in this file is synthetic. The scenario is designed for a hackathon demo and
 * must not be presented as operational data from a real cable manufacturer.
 */

export const SYNTHETIC_DATA_NOTICE = Object.freeze({
  synthetic: true,
  label: "DONNÉES SYNTHÉTIQUES — DÉMONSTRATEUR",
  text: "Toutes les lignes, commandes, durées, coûts et performances sont fictifs. Aucun chiffre ne provient d’une usine réelle.",
});

/**
 * Return a fresh scenario so callers can safely enrich their local copy without
 * mutating a shared singleton.
 */
export function createFactoryScenario() {
  return {
    meta: {
      id: "cabletwin-demo-v1",
      name: "CableTwin — usine de câbles virtuelle",
      sector: "Fabrication de câbles en Tunisie",
      locale: "fr-TN",
      currency: "TND",
      synthetic: true,
      notice: SYNTHETIC_DATA_NOTICE.text,
    },
    clock: {
      dayStartLabel: "08:00",
      dayStartMinute: 8 * 60,
      planningHorizonMinute: 14 * 60,
      normalShiftEndMinute: 10 * 60,
      generatedAt: "2026-07-17T10:00:00+01:00",
    },
    costs: {
      lineReassignmentDt: 75,
    },
    lines: [
      {
        id: "L1",
        name: "Ligne 1 — Automobile",
        color: "#2F80ED",
        normalEndMinute: 10 * 60,
        productionCostDtPerMinute: 0.85,
        overtimePremiumDtPerMinute: 0.65,
      },
      {
        id: "L2",
        name: "Ligne 2 — Flexible",
        color: "#EB5757",
        normalEndMinute: 10 * 60,
        productionCostDtPerMinute: 0.72,
        overtimePremiumDtPerMinute: 0.58,
      },
      {
        id: "L3",
        name: "Ligne 3 — Export",
        color: "#27AE60",
        normalEndMinute: 10 * 60,
        productionCostDtPerMinute: 0.95,
        overtimePremiumDtPerMinute: 0.7,
      },
    ],
    orders: [
      {
        id: "OF-101",
        customer: "Client local A",
        product: "Câble bâtiment",
        quantityKm: 18,
        priority: 2,
        dueMinute: 120,
        delayCostDtPerMinute: 2.5,
        eligibleLineIds: ["L1"],
        durationByLine: { L1: 120 },
      },
      {
        id: "OF-102",
        customer: "Client automobile A",
        product: "Câble automobile basse tension",
        quantityKm: 24,
        priority: 4,
        dueMinute: 375,
        delayCostDtPerMinute: 5.5,
        eligibleLineIds: ["L1", "L2"],
        durationByLine: { L1: 120, L2: 110 },
      },
      {
        id: "OF-103",
        customer: "Client export A",
        product: "Câble industriel",
        quantityKm: 30,
        priority: 3,
        dueMinute: 460,
        delayCostDtPerMinute: 3.2,
        eligibleLineIds: ["L1", "L2", "L3"],
        durationByLine: { L1: 150, L2: 135, L3: 160 },
      },
      {
        id: "OF-104",
        customer: "Client local B",
        product: "Câble bâtiment",
        quantityKm: 21,
        priority: 2,
        dueMinute: 570,
        delayCostDtPerMinute: 2.1,
        eligibleLineIds: ["L1", "L3"],
        durationByLine: { L1: 150, L3: 165 },
      },
      {
        id: "OF-105",
        customer: "Client export B",
        product: "Câble de commande",
        quantityKm: 20,
        priority: 3,
        dueMinute: 150,
        delayCostDtPerMinute: 3.4,
        eligibleLineIds: ["L2"],
        durationByLine: { L2: 120 },
      },
      {
        id: "OF-106",
        customer: "Client automobile stratégique",
        product: "Faisceau — câble primaire",
        quantityKm: 26,
        priority: 5,
        dueMinute: 270,
        delayCostDtPerMinute: 6,
        eligibleLineIds: ["L1", "L2", "L3"],
        durationByLine: { L1: 135, L2: 120, L3: 145 },
      },
      {
        id: "OF-107",
        customer: "Client export C",
        product: "Câble industriel renforcé",
        quantityKm: 28,
        priority: 3,
        dueMinute: 430,
        delayCostDtPerMinute: 4.2,
        eligibleLineIds: ["L1", "L2"],
        durationByLine: { L1: 165, L2: 150 },
      },
      {
        id: "OF-108",
        customer: "Client local C",
        product: "Câble de distribution",
        quantityKm: 25,
        priority: 2,
        dueMinute: 570,
        delayCostDtPerMinute: 2.5,
        eligibleLineIds: ["L2", "L3"],
        durationByLine: { L2: 150, L3: 170 },
      },
      {
        id: "OF-109",
        customer: "Client export D",
        product: "Câble énergie",
        quantityKm: 17,
        priority: 3,
        dueMinute: 150,
        delayCostDtPerMinute: 3.8,
        eligibleLineIds: ["L3"],
        durationByLine: { L3: 120 },
      },
      {
        id: "OF-110",
        customer: "Client export prioritaire",
        product: "Câble énergie blindé",
        quantityKm: 32,
        priority: 4,
        dueMinute: 330,
        delayCostDtPerMinute: 4.8,
        eligibleLineIds: ["L1", "L3"],
        durationByLine: { L1: 170, L3: 180 },
      },
    ],
    initialSchedule: [
      { orderId: "OF-101", lineId: "L1", startMinute: 0, endMinute: 120 },
      { orderId: "OF-102", lineId: "L1", startMinute: 120, endMinute: 240 },
      { orderId: "OF-103", lineId: "L1", startMinute: 240, endMinute: 390 },
      { orderId: "OF-104", lineId: "L1", startMinute: 390, endMinute: 540 },
      { orderId: "OF-105", lineId: "L2", startMinute: 0, endMinute: 120 },
      { orderId: "OF-106", lineId: "L2", startMinute: 120, endMinute: 240 },
      { orderId: "OF-107", lineId: "L2", startMinute: 240, endMinute: 390 },
      { orderId: "OF-108", lineId: "L2", startMinute: 390, endMinute: 540 },
      { orderId: "OF-109", lineId: "L3", startMinute: 0, endMinute: 120 },
      { orderId: "OF-110", lineId: "L3", startMinute: 120, endMinute: 300 },
    ],
    incident: {
      id: "INC-L2-001",
      type: "unplanned_line_stop",
      title: "Arrêt imprévu de la ligne 2",
      lineId: "L2",
      startMinute: 120,
      endMinute: 360,
      detectedAt: "2026-07-17T10:00:00+01:00",
      reason: "Incident mécanique simulé — diagnostic en cours",
      synthetic: true,
    },
  };
}

