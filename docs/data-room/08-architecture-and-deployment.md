# 08 — Architecture and deployment

## Architecture objective

The Phase 2 build prioritizes a reliable jury demonstration and a low-risk
industrial starting point:

- local and offline;
- zero external runtime dependency;
- deterministic calculations;
- explicit separation between data, planning and interface;
- no machine or production-system control.

## Current end-to-end architecture

```text
engine/factory-data.js
Synthetic lines, orders, schedule, incident and coefficients
                         │
                         ▼
engine/twin-engine.js
Validation → incident analysis → 3 constrained plans → KPI → approval event
                         │
                         ▼
app/app.js + app/index.html + app/styles.css
Nominal state → incident → comparison → Gantt preview → approval → audit → reset
                         │
                         ▼
Local Chromium browser at http://127.0.0.1:4173/

Independent verification path:
engine/exact-benchmark.js → exhaustive bounded oracle → policy-optimum evidence
```

The exact verifier is kept separate from the live constructive planner so it can
detect, rather than reproduce, a planning error.

## Module responsibilities

| Module | Responsibility | Key output |
| --- | --- | --- |
| [`engine/factory-data.js`](../../engine/factory-data.js) | Canonical synthetic dataset and disclosure | Fresh scenario object |
| [`engine/twin-engine.js`](../../engine/twin-engine.js) | Scenario/schedule validation, incident analysis, route construction, KPI and approval | Three proposed plans and one approved plan |
| [`engine/exact-benchmark.js`](../../engine/exact-benchmark.js) | Independent exhaustive evaluation of the bounded demo | Unique policy optima and best on-time alternative |
| `app/app.js` | UI state and rendering | Interactive decision journey |
| `app/index.html` | Semantic structure | Browser entry point |
| `app/styles.css` | Responsive visual system | Projector and mobile layouts |
| `scripts/serve.mjs` | Dependency-free local HTTP server | `127.0.0.1:4173` |
| `tests/twin-engine.test.mjs` | Automated regression and acceptance checks | 9/9 passing checks |
| `scripts/capture-screens.mjs` | Real-browser replay through Chromium DevTools Protocol | Screenshots, UI metrics and network evidence |

## Runtime and dependency profile

| Item | Phase 2 choice |
| --- | --- |
| Runtime | Node.js 22 or recent compatible version |
| Front end | Native HTML, CSS and JavaScript modules |
| Server | Node standard-library HTTP server |
| Application dependencies | None |
| External API / model | None |
| Cloud requirement | None |
| GPU requirement | None |
| Network during main journey | None; browser capture recorded zero external requests |
| Persistent storage | None in the demonstration |

This profile makes the prototype easy to launch from a standalone archive and
reduces hackathon infrastructure risk.

## Data and decision flow

1. `createFactoryScenario()` returns a new controlled scenario.
2. `validateScenario()` checks IDs, data ranges, compatibility, durations,
   initial coverage and incident consistency.
3. `analyzeIncident()` identifies orders exposed on the stopped line.
4. `generateRecoveryPlans()` runs the Service, Cost and Stability policies.
5. `validateSchedule()` rejects any hard-constraint violation.
6. `calculateMetrics()` derives comparable operational and illustrative cost
   KPI from each complete schedule.
7. The app renders strategy cards and a revised Gantt.
8. `approveRecoveryPlan()` returns a new approved object and audit event only
   after explicit user input.
9. Reset creates the original scenario again.

All engine operations are deterministic; decision time and approving identity
are explicit inputs rather than hidden system state.

## Deployment boundary

### What the current build can access

```text
Bundled synthetic JavaScript data
              ↓
Local planning engine
              ↓
Local browser
```

### What it cannot access

- PLCs, sensors, drives or machines;
- production networks;
- ERP, MES or APS databases;
- customer systems;
- external AI or cloud services.

The “Approve” action records a simulated decision in memory. It does not create
a production order or transmit a command.

## Proposed read-only pilot architecture

```text
ERP/MES/CSV read-only export
            │
            ▼
Schema + quality validation ──────► rejected-record report
            │
            ▼
Versioned workshop snapshot + versioned constraint model
            │
            ▼
CableTwin planner + KPI + explanation
            │
            ▼
Production-manager review and approval
            │
            ├────────► immutable pilot audit record
            └────────► comparison only; no automatic write-back
```

The historical decision and actual outcome are stored separately for replay
evaluation. A later plan export is a new governed capability, not an implicit
part of the pilot.

## What a real deployment would add

| Capability | Reason |
| --- | --- |
| Import adapters and schema mapping | Connect approved read-only sources |
| Persistent versioned store | Preserve inputs, constraints, routes and decisions |
| Authentication and role-based access | Separate configuration, review and approval |
| Constraint administration | Manage effective dates and planner sign-off |
| Solver and performance layer | Support larger workshops and time limits |
| Uncertainty / sensitivity analysis | Replan safely when incident duration changes |
| Monitoring and observability | Detect failure, latency, stale data and unusual outputs |
| Security controls | Encryption, retention, access audit and incident response |
| Controlled export | Share an approved plan without direct machine control |

## Non-functional targets for a pilot

- **Feasibility:** zero violations of planner-validated hard constraints.
- **Reproducibility:** same input and rule versions produce the same result.
- **Traceability:** every route retains data, constraint, objective and decision
  lineage.
- **Availability:** a documented manual process remains available if CableTwin
  is unavailable.
- **Performance:** a response-time target is agreed after measuring realistic
  problem size.
- **Security:** least-privilege, read-only access and minimized data.
- **Usability:** a manager can understand the main trade-off without algorithmic
  vocabulary.

## Launch and verify

```powershell
npm run check
npm run benchmark:exact
npm run dev
```

Then open http://127.0.0.1:4173/.

The current evidence set contains the post-fix browser journey at 1920×1080,
machine-readable UI values and an offline-network trace under
[`evidence/screenshots/`](evidence/screenshots/).
