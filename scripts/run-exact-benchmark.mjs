import { createFactoryScenario } from "../engine/factory-data.js";
import {
  runExactBenchmark,
  scheduleSignature,
} from "../engine/exact-benchmark.js";
import { generateRecoveryPlans } from "../engine/twin-engine.js";

const scenario = createFactoryScenario();
const benchmark = runExactBenchmark(scenario);
const displayed = Object.fromEntries(
  generateRecoveryPlans(scenario).map((plan) => [plan.strategy.id, plan]),
);

const verification = Object.fromEntries(
  Object.entries(benchmark.policies).map(([policyId, certificate]) => [
    policyId,
    {
      matchesDisplayedPlan:
        scheduleSignature(displayed[policyId].schedule) === certificate.signature,
      uniqueOptimum: certificate.uniqueOptimum,
      weightedDelayMinutes: certificate.weightedDelayMinutes,
      metrics: certificate.metrics,
    },
  ]),
);

if (process.argv.includes("--json")) {
  console.log(JSON.stringify({ ...benchmark, verification }, null, 2));
  process.exit(0);
}

console.log("CableTwin exact benchmark - synthetic canonical scenario");
console.log(
  `${benchmark.candidateSchedules} assignment/sequence candidates; ` +
    `${benchmark.feasibleSchedules} feasible schedules; ` +
    `${benchmark.replannedOrders} orders replanned.`,
);
for (const policyId of ["service", "cost", "stability"]) {
  const result = verification[policyId];
  const metrics = result.metrics;
  console.log(
    `${policyId.padEnd(9)} verified=${String(result.matchesDisplayedPlan).padEnd(5)} ` +
      `unique=${String(result.uniqueOptimum).padEnd(5)} ` +
      `delay=${String(metrics.totalDelayMinutes).padStart(3)} min ` +
      `onTime=${metrics.onTimeOrders}/${metrics.totalOrders} ` +
      `moves=${metrics.movements} cost=${metrics.estimatedCostDt.toFixed(2)} DT`,
  );
}
const alternative = benchmark.bestOnTimeAlternative;
console.log(
  `best-on-time alternative: ${alternative.metrics.onTimeOrders}/${alternative.metrics.totalOrders}, ` +
    `${alternative.metrics.totalDelayMinutes} min total delay, ` +
    `${alternative.weightedDelayMinutes} priority-weighted delay.`,
);
