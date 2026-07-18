// Shared feature definition for the CableTwin decision recommender.
// One source of truth used by BOTH training (scripts/train-recommender.mjs)
// and runtime inference (engine/recommender.js) so the two can never drift.
// Every feature is human-readable on purpose: the recommendation must stay
// explainable to a production manager.

export const FEATURE_NAMES = [
  "commandes exposées",
  "priorité max exposée",
  "durée d'arrêt (h)",
  "heure de début d'arrêt",
  "arrêt sur L1",
  "arrêt sur L3",
  "retard récupérable (h)",
  "écart de coût Service vs Coût (DT)",
  "réaffectations du plan Service",
  "gain de commandes à l'heure",
  "retard en plus du plan Coût vs Service (h)",
  "retards clients en plus Coût vs Service",
  "réaffectations en plus Service vs Coût",
  "écart de coût Coût vs Stabilité (DT)",
  "retards clients Coût vs Stabilité",
  "réaffectations Coût vs Stabilité",
];

export function extractFeatures(scenario, impact, plans) {
  const metricsOf = (id) => plans.find((plan) => plan.strategy.id === id)?.metrics;
  const service = metricsOf("service");
  const cost = metricsOf("cost");
  const stability = metricsOf("stability");
  if (!service || !cost || !stability) {
    throw new Error("recommender: the three strategy plans are required");
  }
  const exposedOrders = impact.affectedOrderIds
    .map((id) => scenario.orders.find((order) => order.id === id))
    .filter(Boolean);
  const incident = scenario.incident;

  return [
    impact.affectedOrderIds.length,
    exposedOrders.length ? Math.max(...exposedOrders.map((order) => order.priority ?? 0)) : 0,
    (incident.endMinute - incident.startMinute) / 60,
    incident.startMinute / 60,
    incident.lineId === "L1" ? 1 : 0,
    incident.lineId === "L3" ? 1 : 0,
    (stability.totalDelayMinutes - service.totalDelayMinutes) / 60,
    service.estimatedCostDt - cost.estimatedCostDt,
    service.movements,
    service.onTimeOrders - stability.onTimeOrders,
    (cost.totalDelayMinutes - service.totalDelayMinutes) / 60,
    cost.lateOrders - service.lateOrders,
    service.movements - cost.movements,
    cost.estimatedCostDt - stability.estimatedCostDt,
    cost.lateOrders - stability.lateOrders,
    cost.movements - stability.movements,
  ];
}
