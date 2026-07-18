# 02 — Product and user journey

## Product promise

> CableTwin lets a production manager see the consequences of a line stoppage,
> compare three feasible recovery routes and approve one before the real
> workshop changes.

CableTwin is a lightweight **incident-time decision twin**. It maintains a
calculable representation of the relevant production state, injects a
disruption, evaluates recovery schedules and exposes their business trade-offs
in both a decision view and an interactive isometric workshop view. A separate
local learned model suggests one of the three existing routes; it does not
generate the plans or replace the manager. The product is designed around one
decision, not around a general-purpose dashboard.

## Inputs and outputs

| Inputs | Outputs |
| --- | --- |
| Lines, calendars and availability | Orders directly and indirectly exposed |
| Orders, quantities, due times and priorities | Three feasible recovery schedules |
| Product-to-line eligibility and duration by line | Comparable KPI for each route |
| Current schedule | Revised Gantt preview |
| Incident line, start and estimated end | Human approval and decision record |
| Illustrative cost coefficients | Explicit assumptions and comparison values |
| Three generated plans and incident context | Local model suggestion, confidence and top factors |

## The complete user journey

| Stage | What the user sees or does | What CableTwin produces | Current evidence |
| ---: | --- | --- | --- |
| 1. Understand | Opens the nominal workshop: 3 lines, 10 orders, 10/10 on time | A shared view of the initial schedule and assumptions | [Nominal factory](evidence/screenshots/02-factory-nominal.png) |
| 2. Trigger | Simulates a 4-hour stop on Line 2 at 10:00 | A deterministic incident state | [Incident state](evidence/screenshots/03-incident-kpis.png) |
| 3. Measure | Reads 3 exposed orders, 7/10 on time and 620 minutes of projected delay without adaptation | A consistent “no rescheduling” reference | [Incident KPI](evidence/screenshots/03-incident-kpis.png) |
| 4. Compare | Reviews Service, Cost and Stability | Three routes built from the same inputs and hard constraints | [Strategy cards](evidence/screenshots/04-strategies.png) |
| 5. Ask the learned assist | Watches the local model suggest Cost and explain its main factors | A suggestion among the three existing routes; no schedule is changed | Live `/#twin` model panel |
| 6. Preview | Selects any route and inspects its Gantt or isometric schedule | Updated orders, KPI and simulated workshop state before commitment | [Service preview](evidence/screenshots/05-preview-service-gantt.png) |
| 7. Approve | Confirms the route as production manager | An approved plan; nothing is sent to a machine | [Decision preview](evidence/screenshots/06-decision-preview.png) |
| 8. Audit | Reviews who chose what and when | Timestamped decision record with strategy and metric snapshot | [Approved audit](evidence/screenshots/07-approved-audit.png) |
| 9. Reset | Restarts the demonstration from either view | Exact return to the 10/10 nominal state | [Deterministic reset](evidence/screenshots/09-reset-nominal.png) |

The accepted decision-view browser capture records **zero external network
requests** for the journey. See
[`ui-metrics.json`](evidence/screenshots/ui-metrics.json).
The additive factory-twin journey was also replayed without console errors,
exceptions or external application requests. The
[public factory-twin demonstration](https://hackaton-automate-or-die.vercel.app/#twin)
is available to the jury.

## The three routes in user language

| Route | User-facing question | Fixed-scenario result |
| --- | --- | --- |
| **Service** | How do we best protect priority-weighted delivery commitments? | 8/10 on time, 140 min delay, 30 min overtime, 3 line moves |
| **Cost** | How do we minimize the illustrative total comparison cost? | 8/10 on time, 170 min delay, 60 min overtime, 2 line moves |
| **Stability** | What happens if we avoid line reassignments? | 7/10 on time, 620 min delay, 180 min overtime, 0 line moves |

No route is described as universally best. CableTwin makes the consequence of
each business priority visible so the manager can choose the route appropriate
to the incident.

## Why this is a digital twin

The prototype contains the smallest useful digital representation for this
decision:

1. an explicit state of lines, orders, calendars and schedule;
2. an event that changes resource availability;
3. a simulator that recomputes feasible production states and consequences;
4. a human decision that selects one future state.

The isometric workshop is deliberately a **decision visualization**, not a
high-fidelity physical, CAD or plant-connected replica. Every moving order,
operator, line value and ambient sensor is simulated and state-driven. The
originality is to make the consequences of a concrete operational decision
legible without requiring a plant-digitization project.

## End-to-end acceptance evidence

The build is considered end to end because the same executable path connects:

```text
Scenario data
  → incident analysis
  → three constrained plans
  → separate local route suggestion
  → KPI calculation
  → Gantt and factory-twin preview
  → explicit approval
  → audit event
  → deterministic reset
```

The values displayed in the interface are generated from the engine, not typed
into presentation cards. The current suite verifies the engine, the bounded
exact benchmark verifies the three displayed policy optima, and the Chromium
capture verifies the rendered journey.

## Product boundaries

CableTwin currently:

- **does** simulate, compare, explain, preview and record;
- **does** use a separate local recommender trained on 687 simulated incidents
  generated by the twin itself;
- **does not** predict the line stop or its duration;
- **does not** command equipment;
- **does not** modify an ERP, MES or APS;
- **does not** learn from real industrial or customer history in the current
  build;
- **does not** let the recommender create, edit or approve a schedule;
- **does not** remove the production manager from the decision;
- **does not** use real factory or customer data.

The first industrial version remains read-only. Export or write-back would be a
later, separately governed step after constraint validation and measured pilot
success.

## Language choice

The jury-facing deck, data room, video narration and captions are in English.
The operator interface remains in French because it targets the local operator
context. Labels, numbers and interactions are explained in English in every
submitted narrative artifact.
