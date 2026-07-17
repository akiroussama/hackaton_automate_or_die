# 01 — Problem, process and scope

## The decision that cannot wait

> When a production line becomes unavailable, which orders should be moved,
> delayed or protected — and what will each choice do to service, throughput,
> overtime and workshop stability?

CableTwin addresses **incident-driven production rescheduling and capacity
reallocation** in a multi-line cable factory. The active production schedule
stops being feasible as soon as a required line becomes unavailable. Orders then
compete for the remaining compatible capacity while the production manager must
protect delivery commitments without creating a second operational problem.

This is a direct implementation of **Industry — Theme 3: Production Planning
and Supply Chain Optimization**, specifically AI-assisted production scheduling
and capacity optimization. The line stoppage is an input to the workflow;
predictive maintenance is not part of the claim.

## The incident-driven rescheduling process

The existence of this decision process follows from the operational event: if an
order was planned inside a newly unavailable capacity window, the plan must be
reassessed. CableTwin does not claim to know how any named manufacturer performs
that reassessment today. The local tools, frequency, duration and cost of the
process remain pilot questions.

| Step | Business event or action | Decision evidence |
| ---: | --- | --- |
| 1 | A line becomes unavailable | Line, start time and estimated duration |
| 2 | The active schedule becomes infeasible | Orders overlapping or downstream of the stop |
| 3 | Orders compete for remaining capacity | Eligible lines, durations and occupied slots |
| 4 | Delivery commitments are exposed | Due times, priorities and projected delay |
| 5 | Feasible recovery slots are searched | Availability, compatibility, non-overlap and horizon |
| 6 | Alternatives are compared | Service, delay, overtime, output, moves and illustrative cost |
| 7 | The production manager approves one route | Selected plan and visible trade-off |
| 8 | The decision is recorded | Actor, timestamp, strategy and metric snapshot |

The process is not “optimize the entire factory.” It is one concrete decision
loop triggered by one disruption:

```text
Active schedule → Line stop → Impact → Feasible routes → Human approval → Audit
```

## Who decides: the production manager

The primary user is the **production manager or planner**. This person is
responsible for protecting commitments while keeping the revised plan
operationally acceptable.

| Role | Need in this process |
| --- | --- |
| Production manager / planner | Understand impact, compare routes and approve a recovery plan |
| Workshop supervisor | Receive a clear, feasible revised sequence |
| Plant or operations director | Review service, capacity and disruption consequences |
| Customer service | Know which commitments remain threatened |
| Industrial engineering / IT | Validate constraints, data definitions and integration boundaries |

CableTwin supports the manager's expertise; it does not replace responsibility
or apply a plan autonomously.

## The fixed demonstration incident

The prototype uses one deliberately small, reproducible scenario:

- a **fictional Tunisian cable factory**;
- **3 production lines**, **10 orders** and **241 km** of total ordered output;
- a nominal schedule with **10/10 orders on time**;
- Line 2 stops at **10:00** for **4 hours**, until 14:00;
- 2 orders overlap the stop and 1 downstream order is exposed;
- keeping every order on its original line produces **620 minutes of cumulative
  delay**, **180 minutes of overtime**, **7/10 orders on time** and **188 km
  completed by 18:00**.

All companies, customers, products, durations, costs and results are synthetic.
The scenario is a controlled test case, not a digital copy of a real plant.

## What the working prototype proves

The executable build proves that, for the fixed scenario, CableTwin can:

- identify the orders exposed by the incident;
- generate three complete schedules that respect the encoded hard constraints;
- calculate the same KPI definitions for every alternative;
- preview a revised Gantt before action;
- require explicit human approval;
- record the approved choice; and
- reset deterministically to the nominal state.

These are product and calculation proofs. They are not claims of observed
industrial performance.

## Scope and boundaries

### In scope

- one workshop, one shift and one unplanned line stop;
- complete orders represented as single production slots;
- product-to-line eligibility and line-specific duration;
- due times, priorities, overtime, line moves and illustrative comparison cost;
- three transparent decision policies;
- local, offline, read-only decision support;
- human preview, approval and audit.

### Out of scope

- predicting failures or the duration of a failure;
- controlling a machine, PLC or production line;
- writing into an ERP, MES or APS;
- replacing the official production planning system;
- modelling cable physics or a 3D factory;
- multi-stage routing, setup matrices, material stocks, labour, energy or
  maintenance resources;
- claiming factory-scale global optimality;
- claiming savings, ROI, traction or affiliation with a real manufacturer.

## What still requires pilot validation

| Status | What is known | What is not yet known |
| --- | --- | --- |
| Executable fact | The prototype produces deterministic, feasible routes for the encoded scenario | Whether the encoded constraint set is complete for a target workshop |
| Synthetic result | Service reduces simulated delay from 620 to 140 minutes | The improvement achievable on real incidents |
| Product hypothesis | A three-route comparison can shorten and clarify the decision | The current time-to-assess and adoption behaviour at a plant |
| Data hypothesis | A read-only order/calendar export can supply the minimum model | Actual data availability, quality and refresh process |
| Commercial hypothesis | A plant or operations director could sponsor a low-risk pilot | Budget, procurement path, pricing and willingness to pay |

The next proof is therefore a **4-to-6-week read-only shadow pilot**, not an
autonomous deployment.

## Integrity disclosure

CableTwin is not affiliated with Chakira Cables, COFICAB, Elloumi Group or any
other cable manufacturer. Publicly visible Tunisian cable manufacturing
inspired the sector choice only. No operational data, internal process or
validation is attributed to a real company.
