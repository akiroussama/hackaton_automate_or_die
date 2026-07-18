# 03 — AI planning, learned recommendation and explainability

## The core AI is the planning decision

CableTwin uses **symbolic, constraint-based AI planning** to transform a broken
production schedule into feasible recovery alternatives. The intelligence is
not a chatbot and it is not the dashboard: it is the structured search over
line assignments, order sequences and time slots under industrial rules.

The current build also contains a **separate local learned recommender**. It
classifies the incident and the three completed plans to suggest which existing
route best matches an explicit arbitration policy. It never creates a schedule,
changes a constraint or approves a plan.

An interface alone can display that Line 2 stopped. The planning engine must
answer the harder question:

> Which complete schedules remain executable, and how do their consequences
> change when service, cost or workshop stability is the priority?

## Formal decision model

For every order that was not complete when the incident began, the model
chooses:

- an eligible production line;
- a position in that line's sequence;
- a start and end time consistent with the line-specific duration.

### Hard constraints: a route is rejected if any one fails

1. Every order appears exactly once.
2. An order is assigned only to an eligible line.
3. Its scheduled duration equals its duration on that line.
4. A line runs no more than one order at a time.
5. No order overlaps the Line 2 stoppage.
6. Every order finishes inside the planning horizon.
7. Orders already complete at 10:00 stay fixed.

These rules encode feasibility. The prototype never trades a hard constraint
for a better score.

### Soft objectives: feasible routes can express different priorities

| Policy | Lexicographic business objective in the exact verifier | Meaning |
| --- | --- | --- |
| **Service** | Priority-weighted delay → total delay → illustrative cost → overtime → moves | Protect the most important delivery commitments first |
| **Cost** | Illustrative total cost → total delay → priority-weighted delay → moves | Limit the encoded cost of production, delay, overtime and reassignment |
| **Stability** | Moves → total delay → illustrative cost → priority-weighted delay | Preserve original line assignments before optimizing consequences |

Lexicographic objectives make the priority order explicit and reproducible.
They avoid a hidden composite score whose weights a manager cannot interpret.

## Three complementary technical layers

### 1. Deterministic live decision engine

[`engine/twin-engine.js`](../../engine/twin-engine.js) contains the
dependency-free planner used by the browser. It is a deterministic constructive
search:

1. freeze orders complete before the incident;
2. order the remaining seven orders according to the selected policy;
3. inspect each eligible line;
4. find the earliest slot that respects occupied capacity and downtime;
5. compare feasible candidates according to the policy;
6. build a complete schedule and calculate its KPI.

This implementation is fast, explainable and reliable for the demonstration.
It does not claim general factory-scale optimality.

### 2. Separate local learned recommender

The recommender is a softmax-regression classifier trained from scratch in
plain JavaScript. Its training set contains **687 simulated incidents generated
by the twin itself** by varying the stopped line, start time and stop duration
and replaying each scenario through the implemented deterministic planner.

Each scenario is labelled by one documented demonstration policy:

```text
utility = -estimatedCostDt
          - 120 DT per late order
          - 35 DT per reassignment
```

The model uses 16 explainable features, including exposure, incident timing,
recoverable delay and pairwise differences between the three completed plans.
It reports:

| Learned-assist fact | Result |
| --- | ---: |
| Synthetic incidents | **687** |
| Training accuracy | **95.7%** |
| Held-out synthetic-grid test accuracy | **93.6%** |
| Canonical suggestion | **Cost** |
| Displayed confidence on the canonical incident | **79%** |
| Dedicated checks | **5/5** |

The test result measures agreement with the encoded labeling policy on a
held-out subset of the synthetic grid. It is not plant accuracy, an operational
KPI or evidence that the policy represents a real manager. The planner remains
deterministic and non-learning.

### 3. Separate exhaustive bounded verifier

[`engine/exact-benchmark.js`](../../engine/exact-benchmark.js) does not reuse
the live planner's construction logic. For the fixed bounded scenario, it
enumerates every eligible-line assignment and every within-line sequence for
the seven orders to replan, then executes each sequence at the earliest feasible
time.

| Verification fact | Reproducible result |
| --- | ---: |
| Assignment-and-sequence candidates evaluated | **17,856** |
| Feasible complete schedules | **10,440** |
| Displayed policies checked | **3/3** |
| Displayed plans matching their policy optimum | **3/3** |
| Unique policy optima | **3/3** |

The exact claim is deliberately bounded to the encoded demonstration: eligible
line assignments, within-line sequences, earliest-start execution, the incident
window and the planning horizon. It is not a claim that an arbitrary industrial
plant can always be solved exhaustively.

## Why the search matters

The fixed scenario contains a visible trade-off that a simple “maximize the
number of on-time orders” rule would hide:

- the Service policy produces **8/10 on time**, **140 minutes total delay** and
  **360 priority-weighted delay minutes**;
- a separate 9/10 alternative exists, but produces **230 minutes total delay**
  and **690 priority-weighted delay minutes**.

The planner therefore protects the severity and priority of lateness, not only a
headline count. The separate bounded verifier confirms that this is the unique
optimum for the declared Service policy in the bounded scenario.

The other baseline is equally important: avoiding every line reassignment
preserves workshop stability but leaves **620 minutes of delay** and only
**188 km** completed by 18:00. Constraint-based reallocation is what allows
Service to reach **140 minutes** and **216 km**.

## Explainability by construction

Every recovery plan can be inspected at four levels:

1. **Inputs:** orders, priorities, eligible lines, durations and incident
   window.
2. **Rules:** the seven hard constraints above.
3. **Policy:** the ordered business objectives for Service, Cost or Stability.
4. **Consequences:** orders on time, cumulative delay, overtime, line moves,
   output and illustrative cost.

The manager sees the revised Gantt before approval. The approved strategy,
actor, timestamp and metric snapshot are stored in the audit trail.

The learned suggestion adds a fifth, separate level: the interface shows the
model's route, displayed confidence and leading factors. These factors explain
the classifier's output; they do not replace the plan's constraint and KPI
explanation.

## Human approval is a design principle

The engine proposes; the production manager decides. Approval is a separate,
explicit operation and does not mutate the proposed plan. The current build has
no connection capable of commanding a machine or modifying a production
system.

This boundary mitigates automation bias and makes an incomplete model safer:
the manager can select a different route or withhold approval before anything
affects the workshop. In the canonical demonstration the model suggests Cost,
while choosing Service on stage demonstrates that human authority is real.

## What is AI today, and what changes in a pilot

| Layer | Phase 2 status | Possible pilot evolution |
| --- | --- | --- |
| Constraint model | Working and explicit | Add planner-validated setup, material, labour and precedence rules |
| Decision planning | Working and deterministic | Replace or complement constructive search with CP-SAT at larger scale |
| Route recommender | Working local softmax model trained on twin-generated synthetic incidents | Retrain on sufficient real incident history, on-site, with a separate representative holdout and rollback |
| Exact evaluation | Working for the bounded demo | Use benchmark suites and optimality gaps for larger cases |
| Incident-duration prediction | Not claimed | Estimate a duration distribution only if validated history exists |
| Natural-language explanation | Not required | Optional wording layer; never responsible for schedules or KPI |

During a pilot, real incident history remains inside the plant's approved
environment. Retraining is versioned and on-site; data never leaves the plant.
The learned model remains advisory until plant-specific validation demonstrates
adequate generalization and calibration. The deterministic planner and the
three-route comparison remain the safe fallback.
