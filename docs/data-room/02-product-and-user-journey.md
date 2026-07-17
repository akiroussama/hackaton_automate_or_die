# 02 — Product and user journey

## Product promise

> CableTwin lets a production manager see the consequences of a line stoppage,
> compare three feasible recovery routes and approve one before the real
> workshop changes.

CableTwin is a lightweight **incident-time decision twin**. It maintains a
calculable representation of the relevant production state, injects a
disruption, evaluates recovery schedules and exposes their business trade-offs.
The product is designed around one decision, not around a general-purpose
dashboard.

## Inputs and outputs

| Inputs | Outputs |
| --- | --- |
| Lines, calendars and availability | Orders directly and indirectly exposed |
| Orders, quantities, due times and priorities | Three feasible recovery schedules |
| Product-to-line eligibility and duration by line | Comparable KPI for each route |
| Current schedule | Revised Gantt preview |
| Incident line, start and estimated end | Human approval and decision record |
| Illustrative cost coefficients | Explicit assumptions and comparison values |

## The complete user journey

| Stage | What the user sees or does | What CableTwin produces | Frozen evidence |
| ---: | --- | --- | --- |
| 1. Understand | Opens the nominal workshop: 3 lines, 10 orders, 10/10 on time | A shared view of the initial schedule and assumptions | [Nominal factory](evidence/screenshots/02-factory-nominal.png) |
| 2. Trigger | Simulates a 4-hour stop on Line 2 at 10:00 | A deterministic incident state | [Incident state](evidence/screenshots/03-incident-kpis.png) |
| 3. Measure | Reads 3 exposed orders, 7/10 on time and 620 minutes of projected delay without adaptation | A consistent “no rescheduling” reference | [Incident KPI](evidence/screenshots/03-incident-kpis.png) |
| 4. Compare | Reviews Service, Cost and Stability | Three routes built from the same inputs and hard constraints | [Strategy cards](evidence/screenshots/04-strategies.png) |
| 5. Preview | Selects a route and inspects the revised schedule | Updated Gantt, affected orders and KPI before commitment | [Service preview](evidence/screenshots/05-preview-service-gantt.png) |
| 6. Approve | Confirms the route as production manager | An approved plan; nothing is sent to a machine | [Decision preview](evidence/screenshots/06-decision-preview.png) |
| 7. Audit | Reviews who chose what and when | Timestamped decision record with strategy and metric snapshot | [Approved audit](evidence/screenshots/07-approved-audit.png) |
| 8. Reset | Restarts the demonstration | Exact return to the 10/10 nominal state | [Deterministic reset](evidence/screenshots/09-reset-nominal.png) |

The frozen browser capture also records **zero external network requests** for
the journey. See
[`ui-metrics.json`](evidence/screenshots/ui-metrics.json).

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

It is intentionally not a high-fidelity physical or 3D twin. The originality is
to use the twin where it changes a concrete operational decision at low
integration cost.

## End-to-end acceptance evidence

The build is considered end to end because the same executable path connects:

```text
Scenario data
  → incident analysis
  → three constrained plans
  → KPI calculation
  → Gantt preview
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
- **does not** predict the line stop or its duration;
- **does not** command equipment;
- **does not** modify an ERP, MES or APS;
- **does not** learn from industrial history;
- **does not** remove the production manager from the decision;
- **does not** use real factory or customer data.

The first industrial version remains read-only. Export or write-back would be a
later, separately governed step after constraint validation and measured pilot
success.

## Language choice

The jury-facing deck, data room, video narration and captions are in English.
The frozen operator interface remains in French because it targets the
local operator context and because changing a verified build after the freeze
would add avoidable risk. Labels, numbers and interactions are explained in
English in every submitted narrative artifact.
