# 06 — Business case, pilot and viability

## Business proposition

CableTwin is not sold as “AI for the factory.” It addresses one event-driven
decision:

> After an unplanned line stoppage, compare feasible recovery schedules before
> changing production.

The product can create value by shortening the time needed to assess an
incident, protecting delivery and shift-end output, reducing avoidable overtime
and movements, and making the chosen response traceable. Which value dominates
is plant-specific and must be measured.

## User, buyer and beneficiaries

| Role | Relationship to CableTwin | Value sought |
| --- | --- | --- |
| Production manager / planner | Primary user and final operational decision-maker | Faster, feasible and explainable recovery options |
| Plant or operations director | Pilot sponsor and likely economic buyer | Service, throughput and disruption evidence |
| Workshop supervisor | Execution stakeholder | A clear revised sequence that respects workshop rules |
| Customer service | Downstream beneficiary | Earlier visibility of threatened commitments |
| Industrial engineering / IT | Technical prescriber and integrator | Explicit constraints, low-risk data access and auditability |
| Finance / management | Evidence consumer | Transparent assumptions rather than invented savings |

The initial beachhead is a multi-line cable or electrical-equipment workshop
where some product families can move between lines and delivery commitments
matter.

## Measurable value in the demonstration

The fixed synthetic incident shows the mechanism:

| Outcome | Stability after incident | Service route | Difference |
| --- | ---: | ---: | ---: |
| Cumulative delay | 620 min | 140 min | -480 min / -77.4% |
| Overtime | 180 min | 30 min | -150 min / -83.3% |
| Output completed by 18:00 | 188 km | 216 km | +28 km / +14.9% |
| On-time orders | 7/10 | 8/10 | +1 order |
| Line reassignments | 0 | 3 | +3 moves |

This table demonstrates that the system can calculate and expose a trade-off.
It is not a claimed factory result.

## A low-risk 4-to-6-week shadow pilot

The first commercial step is one workshop, one decision process and no write
access.

| Stage | Activity | Evidence produced |
| ---: | --- | --- |
| 1. Discover | Confirm the decision owner, current workflow, unacceptable errors and KPI definitions | Signed process and KPI sheet |
| 2. Contract data | Map read-only orders, schedules, calendars, compatibilities and incidents | Data dictionary and quality report |
| 3. Configure | Encode planner-validated constraints and reproduce one known schedule | Constraint acceptance checklist |
| 4. Replay | Re-run 5–10 historical stoppages without changing their historical outcome | Baseline-versus-CableTwin replay pack |
| 5. Shadow | Run beside the current process on qualifying incidents; manager remains in control | Decision-time, feasibility and usability log |
| 6. Decide | Review pre-agreed gates with the sponsor | Go, revise or stop decision |

The historical decision remains the baseline. CableTwin receives the same
available information cutoff and uses identical KPI definitions; later outcomes
must not leak into the replay.

## Proposed pilot success gates

These are proposed thresholds to agree with the pilot sponsor, not achieved
claims:

| Gate | Definition |
| --- | --- |
| **30% faster assessment** | Median incident-to-comparable-options time versus the documented current process |
| **20% lower projected or replayed delay** | Cumulative delay versus the actual historical decision, using the same due-time definition |
| **Zero validated-constraint violations** | No recommended plan breaks a hard rule signed off by the planner |
| **At least 70% planner usability** | Share of evaluated incidents where the planner rates at least one route usable or useful, with reasons recorded |
| **100% decision traceability** | Every recommendation stores input version, constraint version, route, KPI, actor and timestamp |

Plant-specific service, output, overtime and movement KPI can replace or refine
these gates before the pilot begins.

## Pilot inputs and resources

Minimum resources:

- one production manager or planner as business owner;
- one industrial-engineering or IT contact;
- read-only historical exports for 5–10 stoppages;
- line calendars, product-line eligibility, line-specific durations, due times
  and priorities;
- the actual decision and outcome for each replay;
- one local workstation or controlled internal server;
- a weekly 30-minute review during the pilot.

No sensor project, GPU, paid API, cloud migration, machine connection or ERP
write permission is needed for the first proof.

## Business viability path

```text
Hackathon proof
  → fixed-scope shadow pilot
  → measured go/no-go
  → paid configuration and integration
  → per-site software subscription hypothesis
  → optional multi-workshop expansion
```

No price, signed customer, revenue, annual savings or market share is claimed.
Commercial terms are discussed only after the pilot defines integration effort,
support needs and measurable value.

## Competitive differentiation

| Alternative | Strength | CableTwin's complementary difference |
| --- | --- | --- |
| Spreadsheet, calls and planner experience | Familiar, flexible and already available | Adds repeatable constraint checks, comparable routes and an audit trail while preserving human judgement |
| ERP / MES | Trusted system of record and execution context | Sits beside it as a focused read-only incident-decision layer |
| APS / optimization suite | Broad planning depth and mature integrations | Starts with one explainable disruption workflow and a lower-risk shadow pilot |
| High-fidelity digital twin | Rich physical or process representation | Uses the smallest useful decision twin; no 3D model or full plant digitization required |

CableTwin should not replace a capable APS that already performs this workflow
well. Its entry point is a plant where incident response remains manual,
difficult to compare or weakly traced.

## Defensible product asset

The defensible asset is not the synthetic demonstration dataset. It would be the
combination of:

- a planner-validated constraint model for the target workshop;
- versioned incident and decision history;
- consistent KPI definitions;
- feedback on which routes were feasible, chosen and successful;
- integration into the actual approval workflow.

That asset improves with each validated incident while remaining explainable.

## Commercial and operational stop conditions

The pilot stops or is redesigned if:

- the target process does not require alternative schedules;
- the necessary data cannot be obtained reliably in read-only form;
- real constraints cannot be represented or validated;
- no plan can move between compatible capacity;
- recommendations repeatedly fail planner review;
- the product does not improve a pre-agreed KPI;
- security or governance requirements cannot be met.

This go/no-go discipline protects the customer from an attractive demonstration
that does not translate into operational value.
