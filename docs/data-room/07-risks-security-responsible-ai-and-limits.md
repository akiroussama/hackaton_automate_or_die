# 07 — Risks, security, responsible AI and limits

## Responsible deployment principle

> A schedule is useful only if its data, constraints and authority are trusted.

CableTwin is designed as decision support. The current build works offline,
uses synthetic data, has no production-system write access and requires explicit
human approval. A pilot would preserve these boundaries until its model and
value are validated.

## Risk register

| Risk | Impact | Current control | Required pilot control |
| --- | --- | --- | --- |
| Missing or wrong hard constraint | A route appears feasible but cannot be executed | Explicit encoded rules and automatic validation | Planner sign-off, versioned rule set, constraint acceptance tests |
| Incorrect incident duration | Recovery plan becomes stale or misleading | Duration is visible and fixed in the scenario | Duration range, update trigger, replan when estimate changes |
| Poor or stale source data | Wrong assignments, due times or KPI | Single controlled synthetic source | Read-only snapshots, freshness marker, schema and quality checks |
| Cost model mistaken for ROI | Misleading business claim | All coefficients labelled synthetic | Customer-approved definitions; keep operational and accounting evidence separate |
| Planner over-trusts the recommendation | Automation bias or unreviewed execution | Three routes, visible trade-offs, explicit approval | Training, reason codes, override, no automatic write-back |
| Incomplete explainability | Manager cannot defend the choice | Inputs, policy, Gantt and KPI are visible | Per-order reason and constraint trace where required |
| Production data disclosure | Commercial or customer confidentiality breach | Local app and synthetic dataset | Least-privilege access, pseudonymization, retention policy and internal hosting |
| ERP/MES integration error | Planning disruption or data corruption | No integration in Phase 2 | Read-only adapter first, reconciliation, staged export and rollback |
| Search does not scale | Slow response on industrial volumes | Small deterministic scenario; bounded exact proof | Performance benchmark, timeout, solver evaluation and safe fallback |
| Model drift after plant changes | Recommendations use obsolete capability | Static versioned demo | Owner, effective dates, change approval and periodic revalidation |
| Low workshop adoption | Useful routes are ignored or misunderstood | Plain-language policies and French operator UI | Co-design, usability log, champion and feedback loop |
| Prototype availability failure | Decision support unavailable during incident | Offline build and standalone archive | Supported internal deployment, monitoring and documented manual fallback |

## Human authority and safe failure

CableTwin separates four states:

1. **calculated** — a route exists in the model;
2. **validated by rules** — it satisfies the encoded hard constraints;
3. **reviewed by a manager** — a human checks operational context;
4. **approved** — the manager accepts responsibility for the proposed route.

The prototype implements the first, second and explicit simulated approval
states. It does not send the approved route to a machine or production system.

If data is missing, constraints are unresolved or no feasible route exists, the
safe behaviour is to stop and escalate to the planner — never to relax a hard
constraint silently.

## Responsible AI controls

| Principle | CableTwin implementation |
| --- | --- |
| **Transparency** | Synthetic data notice, explicit policies, formulas and limitations |
| **Validity** | Constraint validation, 9/9 automated checks and independent bounded oracle |
| **Human oversight** | Preview and named approval before any decision is recorded |
| **Contestability** | Three routes and visible trade-offs; the manager may reject all |
| **Traceability** | Scenario, strategy, metrics, actor and timestamp in the audit event |
| **Proportionality** | One bounded operational decision; no unnecessary LLM or autonomous control |
| **Data minimization** | Only scheduling fields required for the decision; customer identity can be pseudonymized |
| **Honest claims** | Simulation separated from pilot hypotheses and real-world evidence |

## Security posture

### Phase 2 prototype

- bound to `127.0.0.1`, not exposed as a public server by default;
- works without an external API, cloud call or runtime dependency;
- contains no production credentials or real company data;
- browser evidence recorded zero external network requests;
- no authentication because the prototype is local and synthetic;
- no database, machine connection or ERP/MES write path.

### Minimum pilot controls

- deploy inside the customer's approved environment;
- use read-only service credentials and least-privilege database views or file
  drops;
- encrypt data at rest and in transit where applicable;
- pseudonymize customer or product identifiers where names are not required;
- define retention, deletion, backup and incident-response rules;
- record input and constraint versions for every recommendation;
- add role-based access for configuration, review and approval;
- perform a security review before any export or write-back.

Offline-first reduces exposure but does not remove the need for access control
once real data is used.

## Uncertainty management

The demonstration knows that Line 2 will be unavailable for four hours. A real
repair estimate is uncertain. A pilot should:

- show the estimate, source and last update;
- allow a range or multiple duration scenarios;
- calculate sensitivity of the route to the duration;
- replan when the estimate crosses a defined threshold;
- warn when an approved plan is based on stale incident information.

CableTwin must not claim certainty that does not exist in the source data.

## Explicit limitations

- The dataset is fully synthetic and contains one incident.
- No industrial user, customer or signed pilot is claimed.
- The model represents one order as one continuous production slot.
- Setup, labour, tooling, material, quality and energy constraints are absent.
- Processing and incident durations are deterministic.
- The live planner is constructive; exhaustive optimality is certified only for
  the encoded small scenario.
- The cost model is illustrative and not an accounting or ROI model.
- The prototype is not persistent and has no production identity management.
- No machine, PLC, ERP, MES or APS is controlled or modified.
- Predictive maintenance, failure diagnosis and autonomous execution are outside
  scope.

## Deployment gate

CableTwin should progress beyond read-only shadow mode only if:

1. the production planner has accepted the constraint model;
2. replay evidence shows zero hard-constraint violations;
3. a pre-agreed KPI improves;
4. managers understand and can contest recommendations;
5. security and data-governance owners approve the architecture;
6. an operational fallback and rollback process exists.

Until then, the product remains an advisory layer and the current planning
process remains authoritative.
