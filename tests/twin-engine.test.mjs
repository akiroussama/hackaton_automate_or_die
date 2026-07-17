import test from "node:test";
import assert from "node:assert/strict";

import { createFactoryScenario, SYNTHETIC_DATA_NOTICE } from "../engine/factory-data.js";
import {
  runExactBenchmark,
  scheduleSignature,
} from "../engine/exact-benchmark.js";
import {
  STRATEGIES,
  analyzeIncident,
  approveRecoveryPlan,
  calculateMetrics,
  compareMetrics,
  formatClockMinute,
  generateRecoveryPlan,
  generateRecoveryPlans,
  validateSchedule,
  validateScenario,
} from "../engine/twin-engine.js";

function assertScheduleIsFeasible(scenario, schedule) {
  assert.equal(schedule.length, scenario.orders.length);
  assert.equal(new Set(schedule.map((entry) => entry.orderId)).size, scenario.orders.length);

  const orders = new Map(scenario.orders.map((order) => [order.id, order]));
  for (const entry of schedule) {
    const order = orders.get(entry.orderId);
    assert.ok(order.eligibleLineIds.includes(entry.lineId));
    assert.equal(entry.endMinute - entry.startMinute, order.durationByLine[entry.lineId]);
    if (entry.lineId === scenario.incident.lineId) {
      const overlapsStop =
        entry.startMinute < scenario.incident.endMinute &&
        scenario.incident.startMinute < entry.endMinute;
      assert.equal(overlapsStop, false, `${entry.orderId} chevauche l’arrêt de ligne`);
    }
  }

  for (const line of scenario.lines) {
    const entries = schedule
      .filter((entry) => entry.lineId === line.id)
      .sort((left, right) => left.startMinute - right.startMinute);
    for (let index = 1; index < entries.length; index += 1) {
      assert.ok(entries[index - 1].endMinute <= entries[index].startMinute);
    }
  }
}

test("le dataset est explicitement synthétique et couvre 3 lignes / 10 commandes", () => {
  const scenario = createFactoryScenario();

  assert.equal(SYNTHETIC_DATA_NOTICE.synthetic, true);
  assert.match(SYNTHETIC_DATA_NOTICE.label, /SYNTHÉTIQUES/);
  assert.equal(scenario.meta.synthetic, true);
  assert.match(scenario.meta.notice, /fictifs/i);
  assert.equal(scenario.lines.length, 3);
  assert.equal(scenario.orders.length, 10);
  assert.equal(validateScenario(scenario), true);
});

test("l’incident identifie les commandes touchées sur la ligne 2", () => {
  const impact = analyzeIncident(createFactoryScenario());

  assert.equal(impact.lineId, "L2");
  assert.equal(impact.downtimeMinutes, 240);
  assert.deepEqual(impact.directlyAffectedOrderIds, ["OF-106", "OF-107"]);
  assert.deepEqual(impact.downstreamOrderIds, ["OF-108"]);
  assert.deepEqual(impact.affectedOrderIds, ["OF-106", "OF-107", "OF-108"]);
});

test("les trois stratégies produisent des plannings déterministes et réalisables", () => {
  const scenario = createFactoryScenario();
  const before = structuredClone(scenario);
  const firstRun = generateRecoveryPlans(scenario);
  const secondRun = generateRecoveryPlans(scenario);

  assert.deepEqual(firstRun, secondRun);
  assert.deepEqual(scenario, before, "le moteur ne doit pas muter le scénario");
  assert.deepEqual(
    firstRun.map((plan) => plan.strategy.id),
    STRATEGIES.map((strategy) => strategy.id),
  );
  for (const plan of firstRun) {
    assertScheduleIsFeasible(scenario, plan.schedule);
    assert.equal(validateSchedule(scenario, plan.schedule), true);
  }
});

test("les stratégies matérialisent trois arbitrages compréhensibles", () => {
  const scenario = createFactoryScenario();
  const plans = Object.fromEntries(
    generateRecoveryPlans(scenario).map((plan) => [plan.strategy.id, plan]),
  );

  assert.equal(plans.stability.metrics.movements, 0, "stabilité conserve les lignes prévues");
  assert.ok(
    plans.service.metrics.totalDelayMinutes < plans.stability.metrics.totalDelayMinutes,
    "service doit réduire le retard par rapport au scénario stable",
  );
  assert.ok(
    plans.service.metrics.onTimeRatePct > plans.stability.metrics.onTimeRatePct,
    "service doit mieux protéger les livraisons",
  );
  assert.ok(
    plans.cost.metrics.estimatedCostDt <= plans.service.metrics.estimatedCostDt,
    "coût doit être au moins aussi économique que service",
  );
  assert.equal(plans.stability.metrics.completedQuantityByShiftEndKm, 188);
  assert.equal(plans.service.metrics.completedQuantityByShiftEndKm, 216);
  assert.equal(plans.cost.metrics.completedQuantityByShiftEndKm, 216);

  const versusStability = compareMetrics(plans.stability.metrics, plans.service.metrics);
  assert.ok(versusStability.delayMinutes < 0);
  assert.ok(versusStability.onTimeRatePoints > 0);
});

test("l’oracle exhaustif certifie les trois politiques sur le scénario canonique", () => {
  const scenario = createFactoryScenario();
  const benchmark = runExactBenchmark(scenario);
  const displayed = Object.fromEntries(
    generateRecoveryPlans(scenario).map((plan) => [plan.strategy.id, plan]),
  );

  assert.equal(benchmark.candidateSchedules, 17856);
  assert.equal(benchmark.feasibleSchedules, 10440);
  assert.equal(benchmark.fixedOrders, 3);
  assert.equal(benchmark.replannedOrders, 7);

  for (const policyId of ["service", "cost", "stability"]) {
    assert.equal(benchmark.policies[policyId].uniqueOptimum, true);
    assert.equal(
      benchmark.policies[policyId].signature,
      scheduleSignature(displayed[policyId].schedule),
    );
  }

  assert.equal(benchmark.policies.service.metrics.totalDelayMinutes, 140);
  assert.equal(benchmark.policies.service.weightedDelayMinutes, 360);
  assert.equal(benchmark.policies.cost.metrics.estimatedCostDt, 1931.45);
  assert.equal(benchmark.policies.stability.metrics.movements, 0);
  assert.equal(benchmark.bestOnTimeAlternative.metrics.onTimeOrders, 9);
  assert.equal(benchmark.bestOnTimeAlternative.metrics.totalDelayMinutes, 230);
  assert.equal(benchmark.bestOnTimeAlternative.weightedDelayMinutes, 690);
});

test("les métriques exposent retard, overtime, coût, mouvements et taux à l’heure", () => {
  const scenario = createFactoryScenario();
  const plan = generateRecoveryPlan(scenario, "service");
  const metrics = calculateMetrics(scenario, plan.schedule);

  assert.deepEqual(metrics, plan.metrics);
  assert.ok(Number.isFinite(metrics.totalDelayMinutes));
  assert.ok(Number.isFinite(metrics.overtimeMinutes));
  assert.ok(Number.isFinite(metrics.estimatedCostDt));
  assert.ok(Number.isInteger(metrics.movements));
  assert.ok(metrics.onTimeRatePct >= 0 && metrics.onTimeRatePct <= 100);
  assert.equal(metrics.completedQuantityByShiftEndKm, 216);
  assert.equal(metrics.totalQuantityKm, 241);
  assert.equal(
    metrics.estimatedCostDt,
    Math.round(
      (metrics.costBreakdown.productionDt +
        metrics.costBreakdown.delayDt +
        metrics.costBreakdown.overtimeDt +
        metrics.costBreakdown.reassignmentDt) *
        100,
    ) / 100,
  );
});

test("l’approbation ajoute une décision auditable sans modifier le plan proposé", () => {
  const plan = generateRecoveryPlan(createFactoryScenario(), "service");
  const before = structuredClone(plan);
  const approved = approveRecoveryPlan(plan, {
    approvedBy: "Responsable production",
    approvedAt: "2026-07-17T10:07:00+01:00",
    note: "Priorité au client stratégique.",
  });

  assert.deepEqual(plan, before, "l’approbation doit rester pure");
  assert.equal(approved.status, "approved");
  assert.equal(approved.approval.approvedBy, "Responsable production");
  assert.equal(approved.auditTrail.length, plan.auditTrail.length + 1);
  assert.deepEqual(approved.auditTrail.map((event) => event.sequence), [1, 2, 3]);
  assert.equal(approved.auditTrail.at(-1).type, "recovery_plan_approved");
  assert.deepEqual(approved.auditTrail.at(-1).details.metricsSnapshot, plan.metrics);
});

test("les heures de la démo sont lisibles", () => {
  assert.equal(formatClockMinute(0), "08:00");
  assert.equal(formatClockMinute(120), "10:00");
  assert.equal(formatClockMinute(360), "14:00");
});

test("les métriques du plan nominal se calculent avant l'incident", () => {
  const scenario = createFactoryScenario();
  const metrics = calculateMetrics(scenario, scenario.initialSchedule, {
    enforceIncidentWindow: false,
  });
  assert.equal(metrics.totalDelayMinutes, 0);
  assert.equal(metrics.lateOrders, 0);
  assert.equal(metrics.movements, 0);
  // La fenêtre d'arrêt reste bloquante par défaut pour les plans de reprise.
  assert.throws(() => calculateMetrics(scenario, scenario.initialSchedule));
});
