# 05 — Validation, results and reproducibility

## Evidence strategy

CableTwin validates the same fixed scenario through complementary layers:

1. **engine tests** verify data integrity, constraints, KPI, policy behaviour
   and approval;
2. a **separate exhaustive bounded verifier** certifies the displayed policy
   optima without reusing the live planner's construction logic;
3. **dedicated recommender tests** verify the generated model, deterministic
   local inference and context sensitivity;
4. a **real Chromium replay** verifies the decision view and factory-twin
   journey without console errors, exceptions or external application requests.

All results below are synthetic demonstration results. They prove software
calculation and browser execution, not industrial ROI.

## 9/9 automated checks

Run:

```powershell
npm run check
```

The current build passes **9 tests out of 9** with no syntax error. The suite is
defined in
[`tests/twin-engine.test.mjs`](../../tests/twin-engine.test.mjs).

| # | Automated check |
| ---: | --- |
| 1 | Dataset is explicitly synthetic and contains 3 lines / 10 orders |
| 2 | Incident identifies OF-106 and OF-107 as directly affected and OF-108 downstream |
| 3 | Service, Cost and Stability are deterministic and hard-constraint feasible |
| 4 | The three policies produce distinct, understandable business trade-offs |
| 5 | The separate exact bounded verifier certifies all three displayed schedules on the canonical scenario |
| 6 | Delay, overtime, cost, line moves, on-time rate and shift-end output are calculated |
| 7 | Human approval adds an audit event without mutating the proposed plan |
| 8 | Scenario minutes render as readable clock times |
| 9 | Nominal metrics calculate before the incident while recovery validation still blocks the stop window |

The ninth test is a regression check for the distinction between a valid
pre-incident baseline and a valid post-incident recovery schedule.

## 5/5 separate recommender checks

Run:

```powershell
npm run check:recommender
```

The dedicated suite in
[`scripts/recommender.test.mjs`](../../scripts/recommender.test.mjs) passes
**5 checks out of 5**. The five passing subtests cover:

1. generated-model structure, quality gate and synthetic provenance;
2. finite and complete features for the canonical scenario;
3. the canonical incident suggests Cost with confidence above 0.5, normalized
   probabilities and three explanatory factors;
4. repeated inference is deterministic;
5. a later Line 3 incident changes the suggestion to Stability.

These checks are deliberately separate from `npm run check`. They must never be
collapsed into one aggregate score.

The generated model records 95.7% training accuracy and **93.6% accuracy on a
held-out subset of the 687-incident synthetic grid**. The number measures
agreement with the encoded arbitration policy; it is not plant accuracy or an
operational KPI.

## Separate exact benchmark

Run:

```powershell
npm run benchmark:exact
```

Expected output:

| Fact | Result |
| --- | ---: |
| Orders complete and fixed at incident time | 3 |
| Orders to replan | 7 |
| Eligible assignment / sequence candidates | **17,856** |
| Feasible complete schedules | **10,440** |
| Service result matches its policy optimum | Yes — unique |
| Cost result matches its policy optimum | Yes — unique |
| Stability result matches its policy optimum | Yes — unique |

The stored console evidence is
[`exact-benchmark-output.txt`](evidence/benchmark-results/exact-benchmark-output.txt).
The implementation and proof boundary are documented in
[`engine/exact-benchmark.js`](../../engine/exact-benchmark.js).

The verifier is exact only for the encoded bounded demo: eligible-line
assignments, within-line sequences, earliest-start execution, incident window
and planning horizon.

## Canonical results

| Scenario | On-time | Total delay | Overtime | Line moves | Output by 18:00 | Synthetic total cost |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Nominal, before incident | 10/10 | 0 min | 0 min | 0 | 241 km | 1,132.80 DT |
| Stability / no reassignment | 7/10 | 620 min | 180 min | 0 | 188 km | 3,862.20 DT |
| Service | 8/10 | 140 min | 30 min | 3 | 216 km | 1,971.15 DT |
| Cost | 8/10 | 170 min | 60 min | 2 | 216 km | 1,931.45 DT |

Compared with Stability after the same incident, Service produces:

- **480 fewer delay minutes**, a **77.4%** reduction;
- **150 fewer overtime minutes**, an **83.3%** reduction;
- **28 km more output by 18:00**, a **14.9%** increase;
- one additional on-time order, from 7/10 to 8/10;
- three line reassignments instead of zero.

These are reproducible comparisons inside the fixed synthetic model. They are
not forecasts of improvement at a real factory.

### UI cost values versus benchmark cost values

The UI rounds and displays the additional synthetic cost versus the nominal
plan:

| Route | UI incremental value | Benchmark absolute value |
| --- | ---: | ---: |
| Service | +838 DT | 1,971.15 DT |
| Cost | +799 DT | 1,931.45 DT |
| Stability | +2,729 DT | 3,862.20 DT |

The values share the same nominal reference of 1,132.80 DT. Neither column is
real accounting data, savings or ROI.

## KPI definitions

For each order `i`, with completion time `C_i` and due time `D_i`:

```text
order delay_i       = max(0, C_i - D_i)
total delay         = sum(order delay_i)
on-time orders      = count(C_i <= D_i)
overtime per slot   = max(0, end - max(start, normal shift end))
line moves          = count(recovery line != nominal line)
shift-end output    = sum(quantity for orders completed by 18:00)
```

The illustrative total cost is:

```text
production duration cost
+ delay coefficient × delay
+ overtime premium × overtime
+ 75 DT × line moves
```

Every route is evaluated with the same formulas and data.

## A useful counter-example

The bounded verifier finds a separate plan with **9/10 orders on time**, but it creates
**230 minutes of total delay** and **690 priority-weighted delay minutes**. The
Service result has 8/10 on time, **140 total** and **360 priority-weighted**
delay minutes.

This confirms that the declared Service objective protects the severity and
priority of lateness rather than optimizing a single headline count.

## Browser and end-to-end verification

The accepted decision-view interaction was replayed in a 1920×1080 Chromium
session:

```text
nominal 10/10
  → Line 2 incident
  → 3 exposed orders / 620 min
  → three strategy cards
  → Service Gantt preview
  → human approval at 10:07
  → audit event
  → reset to nominal 10/10
```

The capture script recorded **no external network request**. Machine-readable
values are stored in
[`ui-metrics.json`](evidence/screenshots/ui-metrics.json), and the final
screenshots are in [`evidence/screenshots/`](evidence/screenshots/).

The additive `/#twin` journey was also replayed after integration. It covered
the nominal twin, incident state, cinematic recomputation, ML log line, Cost
auto-preview, Service and Cost inspection, approval, decision-view return,
reset-from-twin and click-to-skip. The run reported zero console errors,
exceptions or external application requests.

## Reproduce in under three minutes

Prerequisite: Node.js 22 or a recent compatible version.

```powershell
npm run check
npm run benchmark:exact
npm run check:recommender
npm run dev
```

Open http://127.0.0.1:4173/#twin and follow:

1. verify the nominal 10/10 state;
2. click the Line 2 incident trigger;
3. let the recomputation overlay complete or use its skip control;
4. verify that the local model suggests Cost and discloses 687 simulated
   twin-generated incidents and 93.6% synthetic test accuracy;
5. compare Service, Cost and Stability;
6. switch to Service to prove human override, then preview and approve;
7. verify the audit entry and the 10:07 approved state;
8. reset and confirm 10/10.

To reproduce training, use a clean or disposable checkout because the command
regenerates `engine/recommender-model.js` and its `trainedAt` value:

```powershell
npm run train:recommender
```

To reproduce the evidence capture while the server is running:

```powershell
node scripts/capture-screens.mjs
```

## What has and has not been validated

| Validated in Phase 2 | Not yet validated |
| --- | --- |
| Executable end-to-end workflow | Real plant workflow and user adoption |
| Encoded hard-constraint feasibility | Completeness of constraints for a target workshop |
| Deterministic KPI calculations | Accuracy of real durations and incident estimates |
| Unique policy optima in the bounded demo | Optimality or runtime at factory scale |
| Offline browser operation | ERP/MES data integration |
| Human approval and audit event | Production governance, roles and access control |
| Synthetic before/after comparisons | Industrial savings, ROI or commercial demand |
| Recommender integrity, determinism and context sensitivity (5/5) | Real-history generalization, calibration and operational usefulness |
| 93.6% held-out synthetic-grid classification | Accuracy on representative plant incidents |

## Known limitations

- One fixed incident is evidence of mechanism, not statistical performance.
- All input values and costs are synthetic.
- All 687 recommender-training incidents are synthetic and generated by the
  twin itself.
- The seeded random split can place nearby grid scenarios in both train and
  test subsets; 93.6% must not be presented as factory accuracy.
- The displayed 79% canonical confidence has not been calibrated on real data.
- The current model does not learn online.
- Each order is modelled as one continuous operation.
- Incident duration is known rather than probabilistic.
- The live planner is constructive; the exact certificate is bounded to this
  small scenario.
- There is no persistent database, authentication, ERP write-back or machine
  connection in the prototype.
