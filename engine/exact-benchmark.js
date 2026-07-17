/**
 * Exhaustive verification oracle for the bounded synthetic demonstration.
 *
 * The browser planner stays constructive and fast. This module independently
 * enumerates every compatible line assignment and within-line sequence for the
 * orders that were not complete when the incident started. Each order is placed
 * at the earliest feasible time. Under the encoded demo model, voluntary idle
 * time cannot improve delay or cost, so this is complete for the declared
 * Service and Cost objectives. Stability is certified lexicographically by
 * movements first, then cumulative delay.
 */

import { calculateMetrics, validateScenario } from "./twin-engine.js";

function compareValues(left, right) {
  if (typeof left === "string" || typeof right === "string") {
    return String(left).localeCompare(String(right), "fr");
  }
  return left - right;
}

function compareVectors(left, right) {
  for (let index = 0; index < Math.max(left.length, right.length); index += 1) {
    const difference = compareValues(left[index] ?? 0, right[index] ?? 0);
    if (difference !== 0) return difference;
  }
  return 0;
}

function vectorsEqual(left, right) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function permutations(items) {
  if (items.length < 2) return [[...items]];
  const output = [];
  for (let index = 0; index < items.length; index += 1) {
    const remaining = [...items.slice(0, index), ...items.slice(index + 1)];
    for (const suffix of permutations(remaining)) {
      output.push([items[index], ...suffix]);
    }
  }
  return output;
}

export function scheduleSignature(schedule) {
  return [...schedule]
    .sort(
      (left, right) =>
        left.lineId.localeCompare(right.lineId) ||
        left.startMinute - right.startMinute ||
        left.orderId.localeCompare(right.orderId),
    )
    .map(
      (entry) =>
        `${entry.orderId}:${entry.lineId}:${entry.startMinute}-${entry.endMinute}`,
    )
    .join("|");
}

function policyVector(policyId, candidate) {
  const { metrics, weightedDelayMinutes } = candidate;
  if (policyId === "service") {
    return [
      weightedDelayMinutes,
      metrics.totalDelayMinutes,
      metrics.estimatedCostDt,
      metrics.overtimeMinutes,
      metrics.movements,
    ];
  }
  if (policyId === "cost") {
    return [
      metrics.estimatedCostDt,
      metrics.totalDelayMinutes,
      weightedDelayMinutes,
      metrics.movements,
    ];
  }
  if (policyId === "stability") {
    return [
      metrics.movements,
      metrics.totalDelayMinutes,
      metrics.estimatedCostDt,
      weightedDelayMinutes,
    ];
  }
  if (policyId === "on_time") {
    return [
      -metrics.onTimeOrders,
      metrics.totalDelayMinutes,
      weightedDelayMinutes,
      metrics.estimatedCostDt,
    ];
  }
  throw new Error(`Politique de benchmark inconnue: ${policyId}.`);
}

function createBestState(policyId) {
  return {
    policyId,
    best: null,
    vector: null,
    tiedOptima: 0,
  };
}

function considerCandidate(state, candidate) {
  const vector = policyVector(state.policyId, candidate);
  if (!state.best || compareVectors(vector, state.vector) < 0) {
    state.best = candidate;
    state.vector = vector;
    state.tiedOptima = 1;
    return;
  }
  if (vectorsEqual(vector, state.vector)) {
    state.tiedOptima += 1;
    if (candidate.signature.localeCompare(state.best.signature, "fr") < 0) {
      state.best = candidate;
    }
  }
}

function weightedDelay(scenario, schedule) {
  const orders = new Map(scenario.orders.map((order) => [order.id, order]));
  return schedule.reduce((total, entry) => {
    const order = orders.get(entry.orderId);
    return total + Math.max(0, entry.endMinute - order.dueMinute) * order.priority;
  }, 0);
}

function publicCandidate(candidate, objectiveVector, tiedOptima) {
  return {
    objectiveVector: [...objectiveVector],
    uniqueOptimum: tiedOptima === 1,
    tiedOptima,
    weightedDelayMinutes: candidate.weightedDelayMinutes,
    metrics: structuredClone(candidate.metrics),
    schedule: candidate.schedule.map((entry) => ({ ...entry })),
    signature: candidate.signature,
  };
}

function buildEarliestSchedule({
  scenario,
  fixedEntries,
  initialByOrder,
  sequencesByLine,
}) {
  const schedule = fixedEntries.map((entry) => ({ ...entry, state: "completed" }));
  for (const line of scenario.lines) {
    const fixedEnd = fixedEntries
      .filter((entry) => entry.lineId === line.id)
      .reduce(
        (latest, entry) => Math.max(latest, entry.endMinute),
        scenario.incident.startMinute,
      );
    let cursor =
      line.id === scenario.incident.lineId
        ? Math.max(fixedEnd, scenario.incident.endMinute)
        : fixedEnd;

    for (const order of sequencesByLine[line.id]) {
      const duration = order.durationByLine[line.id];
      const endMinute = cursor + duration;
      if (endMinute > scenario.clock.planningHorizonMinute) return null;
      const initial = initialByOrder.get(order.id);
      schedule.push({
        orderId: order.id,
        lineId: line.id,
        startMinute: cursor,
        endMinute,
        state: "planned",
        movedFromLineId: initial.lineId === line.id ? null : initial.lineId,
      });
      cursor = endMinute;
    }
  }
  return schedule.sort(
    (left, right) =>
      left.lineId.localeCompare(right.lineId) ||
      left.startMinute - right.startMinute ||
      left.orderId.localeCompare(right.orderId),
  );
}

/**
 * Exhaustively certify the bounded demo space and return exact policy optima.
 */
export function runExactBenchmark(scenario) {
  validateScenario(scenario);

  const orders = new Map(scenario.orders.map((order) => [order.id, order]));
  const initialByOrder = new Map(
    scenario.initialSchedule.map((entry) => [entry.orderId, entry]),
  );
  const fixedEntries = scenario.initialSchedule.filter(
    (entry) => entry.endMinute <= scenario.incident.startMinute,
  );
  const pendingOrders = scenario.initialSchedule
    .filter((entry) => entry.endMinute > scenario.incident.startMinute)
    .map((entry) => orders.get(entry.orderId));
  const groups = Object.fromEntries(scenario.lines.map((line) => [line.id, []]));
  const states = Object.fromEntries(
    ["service", "cost", "stability", "on_time"].map((policyId) => [
      policyId,
      createBestState(policyId),
    ]),
  );

  let candidateSchedules = 0;
  let feasibleSchedules = 0;

  function evaluateSequences(sequencesByLine) {
    candidateSchedules += 1;
    const schedule = buildEarliestSchedule({
      scenario,
      fixedEntries,
      initialByOrder,
      sequencesByLine,
    });
    if (!schedule) return;

    const metrics = calculateMetrics(scenario, schedule);
    const candidate = {
      schedule,
      metrics,
      weightedDelayMinutes: weightedDelay(scenario, schedule),
      signature: scheduleSignature(schedule),
    };
    feasibleSchedules += 1;
    for (const state of Object.values(states)) {
      considerCandidate(state, candidate);
    }
  }

  function enumerateSequenceCombinations(lineIndex, sequencesByLine) {
    if (lineIndex === scenario.lines.length) {
      evaluateSequences(sequencesByLine);
      return;
    }
    const line = scenario.lines[lineIndex];
    for (const sequence of permutations(groups[line.id])) {
      enumerateSequenceCombinations(lineIndex + 1, {
        ...sequencesByLine,
        [line.id]: sequence,
      });
    }
  }

  function enumerateAssignments(orderIndex) {
    if (orderIndex === pendingOrders.length) {
      enumerateSequenceCombinations(0, {});
      return;
    }
    const order = pendingOrders[orderIndex];
    for (const lineId of order.eligibleLineIds) {
      groups[lineId].push(order);
      enumerateAssignments(orderIndex + 1);
      groups[lineId].pop();
    }
  }

  enumerateAssignments(0);

  return {
    scenarioId: scenario.meta.id,
    dataClassification: scenario.meta.synthetic ? "synthetic" : "provided",
    proofScope:
      "Exact only for the encoded bounded demo: eligible-line assignments, within-line sequences, earliest-start execution, incident window and planning horizon.",
    fixedOrders: fixedEntries.length,
    replannedOrders: pendingOrders.length,
    candidateSchedules,
    feasibleSchedules,
    policies: {
      service: publicCandidate(
        states.service.best,
        states.service.vector,
        states.service.tiedOptima,
      ),
      cost: publicCandidate(
        states.cost.best,
        states.cost.vector,
        states.cost.tiedOptima,
      ),
      stability: publicCandidate(
        states.stability.best,
        states.stability.vector,
        states.stability.tiedOptima,
      ),
    },
    bestOnTimeAlternative: publicCandidate(
      states.on_time.best,
      states.on_time.vector,
      states.on_time.tiedOptima,
    ),
  };
}
