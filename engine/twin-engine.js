/**
 * Deterministic, dependency-free planning engine for the CableTwin demo.
 * All exported operations are pure: time and user identity are explicit inputs.
 */

export const STRATEGIES = Object.freeze([
  Object.freeze({
    id: "service",
    name: "Priorité service",
    shortName: "Service",
    goal: "Protéger les commandes urgentes et réduire les retards.",
  }),
  Object.freeze({
    id: "cost",
    name: "Coût maîtrisé",
    shortName: "Coût",
    goal: "Réduire le coût total simulé de production, retard et adaptation.",
  }),
  Object.freeze({
    id: "stability",
    name: "Stabilité atelier",
    shortName: "Stabilité",
    goal: "Conserver au maximum les affectations prévues par les équipes.",
  }),
]);

const STRATEGY_BY_ID = new Map(STRATEGIES.map((strategy) => [strategy.id, strategy]));

function round(value, digits = 2) {
  const factor = 10 ** digits;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

function compareValues(left, right) {
  if (typeof left === "string" || typeof right === "string") {
    return String(left).localeCompare(String(right), "fr");
  }
  return left - right;
}

function compareTuples(left, right) {
  const length = Math.max(left.length, right.length);
  for (let index = 0; index < length; index += 1) {
    const difference = compareValues(left[index] ?? 0, right[index] ?? 0);
    if (difference !== 0) return difference;
  }
  return 0;
}

function indexById(items, label) {
  const index = new Map();
  for (const item of items) {
    if (!item?.id) throw new Error(`${label}: identifiant manquant.`);
    if (index.has(item.id)) throw new Error(`${label}: identifiant dupliqué ${item.id}.`);
    index.set(item.id, item);
  }
  return index;
}

function assertFiniteNonNegative(value, label) {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${label} doit être un nombre positif ou nul.`);
  }
}

function intervalsOverlap(left, right) {
  return left.startMinute < right.endMinute && right.startMinute < left.endMinute;
}

/** Validate the scenario contract and return true when it is usable. */
export function validateScenario(scenario) {
  if (!scenario || typeof scenario !== "object") throw new Error("Scénario manquant.");
  if (!Array.isArray(scenario.lines) || scenario.lines.length === 0) {
    throw new Error("Le scénario doit contenir au moins une ligne.");
  }
  if (!Array.isArray(scenario.orders) || scenario.orders.length === 0) {
    throw new Error("Le scénario doit contenir au moins une commande.");
  }
  if (!Array.isArray(scenario.initialSchedule)) {
    throw new Error("Planning initial manquant.");
  }

  const lines = indexById(scenario.lines, "Lignes");
  const orders = indexById(scenario.orders, "Commandes");
  const scheduledOrderIds = new Set();

  for (const line of scenario.lines) {
    assertFiniteNonNegative(line.normalEndMinute, `${line.id}.normalEndMinute`);
    assertFiniteNonNegative(line.productionCostDtPerMinute, `${line.id}.productionCostDtPerMinute`);
    assertFiniteNonNegative(line.overtimePremiumDtPerMinute, `${line.id}.overtimePremiumDtPerMinute`);
  }

  for (const order of scenario.orders) {
    assertFiniteNonNegative(order.dueMinute, `${order.id}.dueMinute`);
    assertFiniteNonNegative(order.quantityKm, `${order.id}.quantityKm`);
    assertFiniteNonNegative(order.delayCostDtPerMinute, `${order.id}.delayCostDtPerMinute`);
    if (!Array.isArray(order.eligibleLineIds) || order.eligibleLineIds.length === 0) {
      throw new Error(`${order.id}: aucune ligne éligible.`);
    }
    for (const lineId of order.eligibleLineIds) {
      if (!lines.has(lineId)) throw new Error(`${order.id}: ligne inconnue ${lineId}.`);
      assertFiniteNonNegative(order.durationByLine?.[lineId], `${order.id}.durationByLine.${lineId}`);
      if (order.durationByLine[lineId] === 0) throw new Error(`${order.id}: durée nulle sur ${lineId}.`);
    }
  }

  for (const entry of scenario.initialSchedule) {
    const order = orders.get(entry.orderId);
    if (!order) throw new Error(`Planning initial: commande inconnue ${entry.orderId}.`);
    if (!lines.has(entry.lineId)) throw new Error(`Planning initial: ligne inconnue ${entry.lineId}.`);
    if (scheduledOrderIds.has(entry.orderId)) {
      throw new Error(`Planning initial: commande dupliquée ${entry.orderId}.`);
    }
    scheduledOrderIds.add(entry.orderId);
    if (!order.eligibleLineIds.includes(entry.lineId)) {
      throw new Error(`${entry.orderId} ne peut pas être produite sur ${entry.lineId}.`);
    }
    assertFiniteNonNegative(entry.startMinute, `${entry.orderId}.startMinute`);
    assertFiniteNonNegative(entry.endMinute, `${entry.orderId}.endMinute`);
    const expectedDuration = order.durationByLine[entry.lineId];
    if (entry.endMinute - entry.startMinute !== expectedDuration) {
      throw new Error(`${entry.orderId}: durée du planning incohérente.`);
    }
  }

  if (scheduledOrderIds.size !== orders.size) {
    throw new Error("Chaque commande doit apparaître exactement une fois dans le planning initial.");
  }

  for (const line of scenario.lines) {
    const entries = scenario.initialSchedule
      .filter((entry) => entry.lineId === line.id)
      .sort((left, right) => left.startMinute - right.startMinute);
    for (let index = 1; index < entries.length; index += 1) {
      if (intervalsOverlap(entries[index - 1], entries[index])) {
        throw new Error(`Chevauchement détecté sur ${line.id}.`);
      }
    }
  }

  const incident = scenario.incident;
  if (!incident || !lines.has(incident.lineId)) throw new Error("Incident invalide ou ligne inconnue.");
  assertFiniteNonNegative(incident.startMinute, "incident.startMinute");
  assertFiniteNonNegative(incident.endMinute, "incident.endMinute");
  if (incident.endMinute <= incident.startMinute) throw new Error("La fin de l’incident doit suivre son début.");
  assertFiniteNonNegative(scenario.clock?.planningHorizonMinute, "clock.planningHorizonMinute");
  assertFiniteNonNegative(scenario.clock?.normalShiftEndMinute, "clock.normalShiftEndMinute");
  if (scenario.clock.planningHorizonMinute <= incident.endMinute) {
    throw new Error("L’horizon de planification doit dépasser la fin de l’incident.");
  }
  if (scenario.clock.normalShiftEndMinute > scenario.clock.planningHorizonMinute) {
    throw new Error("La fin du shift normal doit rester dans l’horizon de planification.");
  }
  assertFiniteNonNegative(scenario.costs?.lineReassignmentDt, "costs.lineReassignmentDt");
  return true;
}

/** Translate a minute offset from the scenario day start into HH:MM. */
export function formatClockMinute(minute, dayStartMinute = 8 * 60) {
  assertFiniteNonNegative(minute, "minute");
  assertFiniteNonNegative(dayStartMinute, "dayStartMinute");
  const absoluteMinute = dayStartMinute + minute;
  const hours = Math.floor(absoluteMinute / 60) % 24;
  const minutes = absoluteMinute % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

/** Return the orders directly or indirectly exposed by the line stop. */
export function analyzeIncident(scenario) {
  validateScenario(scenario);
  const { incident } = scenario;
  const onStoppedLine = scenario.initialSchedule.filter(
    (entry) => entry.lineId === incident.lineId && entry.endMinute > incident.startMinute,
  );
  const directlyAffectedOrderIds = onStoppedLine
    .filter((entry) => intervalsOverlap(entry, incident))
    .map((entry) => entry.orderId);
  const downstreamOrderIds = onStoppedLine
    .filter((entry) => entry.startMinute >= incident.endMinute)
    .map((entry) => entry.orderId);

  return {
    incidentId: incident.id,
    lineId: incident.lineId,
    downtimeMinutes: incident.endMinute - incident.startMinute,
    directlyAffectedOrderIds,
    downstreamOrderIds,
    affectedOrderIds: onStoppedLine.map((entry) => entry.orderId),
  };
}

function overtimeForEntry(entry, line) {
  return Math.max(0, entry.endMinute - Math.max(entry.startMinute, line.normalEndMinute));
}

/** Validate a complete schedule against every hard constraint encoded by the demo.
 * `enforceIncidentWindow: false` validates a pre-incident schedule, where orders
 * may legitimately occupy the future stoppage window. */
export function validateSchedule(scenario, schedule, options = {}) {
  const { enforceIncidentWindow = true } = options;
  validateScenario(scenario);
  if (!Array.isArray(schedule)) throw new Error("Planning à valider manquant.");

  const orders = indexById(scenario.orders, "Commandes");
  const lines = indexById(scenario.lines, "Lignes");
  const seen = new Set();

  if (schedule.length !== orders.size) {
    throw new Error("Le planning doit couvrir chaque commande exactement une fois.");
  }

  for (const entry of schedule) {
    const order = orders.get(entry.orderId);
    if (!order) throw new Error(`Commande inconnue dans le planning: ${entry.orderId}.`);
    if (!lines.has(entry.lineId)) throw new Error(`Ligne inconnue dans le planning: ${entry.lineId}.`);
    if (seen.has(entry.orderId)) throw new Error(`Commande dupliquée dans le planning: ${entry.orderId}.`);
    seen.add(entry.orderId);

    if (!order.eligibleLineIds.includes(entry.lineId)) {
      throw new Error(`${entry.orderId} ne peut pas être produite sur ${entry.lineId}.`);
    }
    assertFiniteNonNegative(entry.startMinute, `${entry.orderId}.startMinute`);
    assertFiniteNonNegative(entry.endMinute, `${entry.orderId}.endMinute`);
    if (entry.endMinute <= entry.startMinute) {
      throw new Error(`${entry.orderId}: la fin doit suivre le début.`);
    }
    if (entry.endMinute - entry.startMinute !== order.durationByLine[entry.lineId]) {
      throw new Error(`${entry.orderId}: durée planifiée incohérente.`);
    }
    if (entry.endMinute > scenario.clock.planningHorizonMinute) {
      throw new Error(`${entry.orderId}: fin au-delà de l’horizon de planification.`);
    }
    if (
      enforceIncidentWindow &&
      entry.lineId === scenario.incident.lineId &&
      intervalsOverlap(entry, scenario.incident)
    ) {
      throw new Error(`${entry.orderId}: chevauchement avec l’arrêt de ${entry.lineId}.`);
    }
  }

  for (const line of scenario.lines) {
    const entries = schedule
      .filter((entry) => entry.lineId === line.id)
      .sort((left, right) => left.startMinute - right.startMinute);
    for (let index = 1; index < entries.length; index += 1) {
      if (intervalsOverlap(entries[index - 1], entries[index])) {
        throw new Error(`Chevauchement détecté sur ${line.id}.`);
      }
    }
  }

  return true;
}

/** Calculate comparable industrial and financial indicators for any complete schedule. */
export function calculateMetrics(scenario, schedule, options = {}) {
  validateSchedule(scenario, schedule, options);

  const orders = indexById(scenario.orders, "Commandes");
  const lines = indexById(scenario.lines, "Lignes");
  const initialByOrder = new Map(scenario.initialSchedule.map((entry) => [entry.orderId, entry]));
  const seen = new Set();
  let totalDelayMinutes = 0;
  let lateOrders = 0;
  let overtimeMinutes = 0;
  let movements = 0;
  let productionCostDt = 0;
  let delayCostDt = 0;
  let overtimeCostDt = 0;
  let completedQuantityByShiftEndKm = 0;

  for (const entry of schedule) {
    const order = orders.get(entry.orderId);
    const line = lines.get(entry.lineId);
    if (!order || !line) throw new Error(`Entrée de planning invalide: ${entry.orderId}/${entry.lineId}.`);
    if (seen.has(entry.orderId)) throw new Error(`Commande dupliquée dans le planning: ${entry.orderId}.`);
    seen.add(entry.orderId);
    if (!order.eligibleLineIds.includes(entry.lineId)) {
      throw new Error(`${entry.orderId} ne peut pas être produite sur ${entry.lineId}.`);
    }
    const duration = entry.endMinute - entry.startMinute;
    if (duration !== order.durationByLine[entry.lineId]) {
      throw new Error(`${entry.orderId}: durée planifiée incohérente.`);
    }
    const delay = Math.max(0, entry.endMinute - order.dueMinute);
    const overtime = overtimeForEntry(entry, line);
    totalDelayMinutes += delay;
    lateOrders += delay > 0 ? 1 : 0;
    overtimeMinutes += overtime;
    productionCostDt += duration * line.productionCostDtPerMinute;
    delayCostDt += delay * order.delayCostDtPerMinute;
    overtimeCostDt += overtime * line.overtimePremiumDtPerMinute;
    movements += initialByOrder.get(entry.orderId)?.lineId === entry.lineId ? 0 : 1;
    if (entry.endMinute <= scenario.clock.normalShiftEndMinute) {
      completedQuantityByShiftEndKm += order.quantityKm;
    }
  }

  if (seen.size !== orders.size) throw new Error("Le planning évalué doit couvrir toutes les commandes.");

  const reassignmentCostDt = movements * scenario.costs.lineReassignmentDt;
  const estimatedCostDt = productionCostDt + delayCostDt + overtimeCostDt + reassignmentCostDt;
  const onTimeOrders = schedule.length - lateOrders;
  const totalQuantityKm = scenario.orders.reduce((total, order) => total + order.quantityKm, 0);

  return {
    totalOrders: schedule.length,
    onTimeOrders,
    lateOrders,
    completedQuantityByShiftEndKm: round(completedQuantityByShiftEndKm),
    totalQuantityKm: round(totalQuantityKm),
    totalDelayMinutes,
    overtimeMinutes,
    movements,
    onTimeRatePct: round((onTimeOrders / schedule.length) * 100, 1),
    estimatedCostDt: round(estimatedCostDt),
    costDt: round(estimatedCostDt),
    costBreakdown: {
      productionDt: round(productionCostDt),
      delayDt: round(delayCostDt),
      overtimeDt: round(overtimeCostDt),
      reassignmentDt: round(reassignmentCostDt),
    },
  };
}

function findEarliestSlot({ lineId, duration, notBefore, occupiedByLine, incident, horizon }) {
  const blocked = [...(occupiedByLine.get(lineId) ?? [])];
  if (lineId === incident.lineId) {
    blocked.push({ startMinute: incident.startMinute, endMinute: incident.endMinute });
  }
  blocked.sort((left, right) => left.startMinute - right.startMinute || left.endMinute - right.endMinute);

  let startMinute = notBefore;
  for (const interval of blocked) {
    if (startMinute + duration <= interval.startMinute) break;
    if (startMinute < interval.endMinute && startMinute + duration > interval.startMinute) {
      startMinute = interval.endMinute;
    }
  }
  return startMinute + duration <= horizon ? startMinute : null;
}

function pendingOrderComparator(strategyId, initialByOrder) {
  return (left, right) => {
    const leftInitial = initialByOrder.get(left.id);
    const rightInitial = initialByOrder.get(right.id);
    if (strategyId === "service") {
      return (
        right.priority - left.priority ||
        left.dueMinute - right.dueMinute ||
        leftInitial.startMinute - rightInitial.startMinute ||
        left.id.localeCompare(right.id)
      );
    }
    if (strategyId === "cost") {
      return (
        right.delayCostDtPerMinute - left.delayCostDtPerMinute ||
        left.dueMinute - right.dueMinute ||
        right.priority - left.priority ||
        left.id.localeCompare(right.id)
      );
    }
    return (
      leftInitial.startMinute - rightInitial.startMinute ||
      leftInitial.lineId.localeCompare(rightInitial.lineId) ||
      left.id.localeCompare(right.id)
    );
  };
}

function candidateScore(strategyId, candidate, order) {
  if (strategyId === "service") {
    return [
      candidate.delayMinutes > 0 ? 1 : 0,
      candidate.delayMinutes * order.priority,
      candidate.endMinute,
      candidate.overtimeMinutes,
      candidate.lineChanged ? 1 : 0,
      candidate.lineId,
    ];
  }
  if (strategyId === "cost") {
    return [
      candidate.incrementalCostDt,
      candidate.delayMinutes,
      candidate.overtimeMinutes,
      candidate.lineChanged ? 1 : 0,
      candidate.endMinute,
      candidate.lineId,
    ];
  }
  return [
    candidate.lineChanged ? 1 : 0,
    candidate.startShiftMinutes,
    candidate.delayMinutes,
    candidate.overtimeMinutes,
    candidate.endMinute,
    candidate.lineId,
  ];
}

function buildCandidate({ scenario, strategyId, order, line, original, occupiedByLine }) {
  const duration = order.durationByLine[line.id];
  const notBefore =
    strategyId === "stability"
      ? Math.max(scenario.incident.startMinute, original.startMinute)
      : scenario.incident.startMinute;
  const startMinute = findEarliestSlot({
    lineId: line.id,
    duration,
    notBefore,
    occupiedByLine,
    incident: scenario.incident,
    horizon: scenario.clock.planningHorizonMinute,
  });
  if (startMinute === null) return null;

  const endMinute = startMinute + duration;
  const delayMinutes = Math.max(0, endMinute - order.dueMinute);
  const overtimeMinutes = overtimeForEntry({ startMinute, endMinute }, line);
  const lineChanged = line.id !== original.lineId;
  const incrementalCostDt =
    duration * line.productionCostDtPerMinute +
    delayMinutes * order.delayCostDtPerMinute +
    overtimeMinutes * line.overtimePremiumDtPerMinute +
    (lineChanged ? scenario.costs.lineReassignmentDt : 0);

  return {
    orderId: order.id,
    lineId: line.id,
    startMinute,
    endMinute,
    delayMinutes,
    overtimeMinutes,
    lineChanged,
    startShiftMinutes: Math.abs(startMinute - original.startMinute),
    incrementalCostDt: round(incrementalCostDt),
  };
}

function sortSchedule(schedule) {
  return [...schedule].sort(
    (left, right) =>
      left.lineId.localeCompare(right.lineId) ||
      left.startMinute - right.startMinute ||
      left.orderId.localeCompare(right.orderId),
  );
}

function scheduleForStrategy(scenario, strategyId) {
  const orders = indexById(scenario.orders, "Commandes");
  const lines = indexById(scenario.lines, "Lignes");
  const initialByOrder = new Map(scenario.initialSchedule.map((entry) => [entry.orderId, entry]));
  const fixedEntries = scenario.initialSchedule
    .filter((entry) => entry.endMinute <= scenario.incident.startMinute)
    .map((entry) => ({ ...entry, state: "completed" }));
  const pendingOrders = scenario.initialSchedule
    .filter((entry) => entry.endMinute > scenario.incident.startMinute)
    .map((entry) => orders.get(entry.orderId))
    .sort(pendingOrderComparator(strategyId, initialByOrder));
  const occupiedByLine = new Map(scenario.lines.map((line) => [line.id, []]));

  for (const entry of fixedEntries) {
    occupiedByLine.get(entry.lineId).push({
      startMinute: entry.startMinute,
      endMinute: entry.endMinute,
    });
  }

  const plannedEntries = [];
  for (const order of pendingOrders) {
    const original = initialByOrder.get(order.id);
    const candidates = order.eligibleLineIds
      .map((lineId) =>
        buildCandidate({
          scenario,
          strategyId,
          order,
          line: lines.get(lineId),
          original,
          occupiedByLine,
        }),
      )
      .filter(Boolean)
      .sort((left, right) =>
        compareTuples(candidateScore(strategyId, left, order), candidateScore(strategyId, right, order)),
      );

    const selected = candidates[0];
    if (!selected) throw new Error(`Aucun créneau disponible pour ${order.id}.`);
    const entry = {
      orderId: selected.orderId,
      lineId: selected.lineId,
      startMinute: selected.startMinute,
      endMinute: selected.endMinute,
      state: "planned",
      movedFromLineId: selected.lineChanged ? original.lineId : null,
    };
    plannedEntries.push(entry);
    occupiedByLine.get(entry.lineId).push({
      startMinute: entry.startMinute,
      endMinute: entry.endMinute,
    });
    occupiedByLine.get(entry.lineId).sort((left, right) => left.startMinute - right.startMinute);
  }

  return sortSchedule([...fixedEntries, ...plannedEntries]);
}

function createPlan(scenario, strategy) {
  const schedule = scheduleForStrategy(scenario, strategy.id);
  return {
    id: `recovery-${scenario.incident.id}-${strategy.id}`,
    scenarioId: scenario.meta.id,
    strategy: { ...strategy },
    status: "proposed",
    generatedAt: scenario.clock.generatedAt,
    dataClassification: scenario.meta.synthetic ? "synthetic" : "provided",
    schedule,
    metrics: calculateMetrics(scenario, schedule),
    incidentImpact: analyzeIncident(scenario),
    auditTrail: [
      {
        sequence: 1,
        type: "incident_detected",
        at: scenario.incident.detectedAt,
        actor: "CableTwin",
        details: {
          incidentId: scenario.incident.id,
          lineId: scenario.incident.lineId,
          synthetic: Boolean(scenario.incident.synthetic),
        },
      },
      {
        sequence: 2,
        type: "recovery_plan_generated",
        at: scenario.clock.generatedAt,
        actor: "CableTwin",
        details: {
          strategyId: strategy.id,
          estimatedCostDt: calculateMetrics(scenario, schedule).estimatedCostDt,
          onTimeRatePct: calculateMetrics(scenario, schedule).onTimeRatePct,
        },
      },
    ],
  };
}

/** Build one recovery plan for a named strategy. */
export function generateRecoveryPlan(scenario, strategyId) {
  validateScenario(scenario);
  const strategy = STRATEGY_BY_ID.get(strategyId);
  if (!strategy) throw new Error(`Stratégie inconnue: ${strategyId}.`);
  return createPlan(scenario, strategy);
}

/** Build the three decision alternatives in a stable order. */
export function generateRecoveryPlans(scenario) {
  validateScenario(scenario);
  return STRATEGIES.map((strategy) => createPlan(scenario, strategy));
}

/** Express candidate gains/losses against a reference plan. */
export function compareMetrics(reference, candidate) {
  if (!reference || !candidate) throw new Error("Deux jeux de métriques sont requis.");
  return {
    delayMinutes: candidate.totalDelayMinutes - reference.totalDelayMinutes,
    overtimeMinutes: candidate.overtimeMinutes - reference.overtimeMinutes,
    estimatedCostDt: round(candidate.estimatedCostDt - reference.estimatedCostDt),
    movements: candidate.movements - reference.movements,
    onTimeRatePoints: round(candidate.onTimeRatePct - reference.onTimeRatePct, 1),
  };
}

/**
 * Approve a proposed plan without side effects. The caller supplies the decision
 * timestamp, keeping this function deterministic and easy to audit/test.
 */
export function approveRecoveryPlan(plan, decision) {
  if (!plan || plan.status !== "proposed") throw new Error("Seul un plan proposé peut être approuvé.");
  if (!decision?.approvedBy?.trim()) throw new Error("Le nom du décideur est requis.");
  if (!decision?.approvedAt?.trim()) throw new Error("L’horodatage de validation est requis.");

  const approval = {
    approvedBy: decision.approvedBy.trim(),
    approvedAt: decision.approvedAt,
    note: decision.note?.trim() ?? "",
  };
  return {
    ...plan,
    status: "approved",
    approval,
    auditTrail: [
      ...plan.auditTrail.map((event) => ({ ...event, details: { ...event.details } })),
      {
        sequence: plan.auditTrail.length + 1,
        type: "recovery_plan_approved",
        at: approval.approvedAt,
        actor: approval.approvedBy,
        details: {
          planId: plan.id,
          strategyId: plan.strategy.id,
          note: approval.note,
          metricsSnapshot: { ...plan.metrics },
        },
      },
    ],
  };
}
