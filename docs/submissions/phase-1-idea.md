# CableTwin

## The Waze of the cable factory

**AUTOMATE OR DIE 2026 - Sector 3: Industry - Theme 3: Production Planning & Supply Chain Optimization - Phase 1**  
**Team leader:** Oussama Akir - Team SUPCOM - solo participant  
**Submission date:** 17 July 2026

> See before you decide: when a line stops, CableTwin turns a production emergency into three comparable recovery decisions, then lets the production manager choose and records the decision.

<!-- GOAL_GRID -->

## 1. Problem statement

### The decision that cannot wait

> When one production line becomes unavailable, which orders should be moved, delayed or protected - and what will each choice cost?

**The incident:** at 10:00, Line 2 stops for four hours. If every order stays on its original line, 3 of 10 orders finish late, cumulative delay reaches 620 minutes, overtime rises to 180 minutes and only 188 km are completed by 18:00. The production manager must choose a recovery plan before every consequence is visible. This fixed synthetic incident is the thread used throughout this document.

**Specific business process:** incident-driven production rescheduling and capacity reallocation after an unplanned stoppage in a multi-line cable factory. Once capacity is lost, orders compete for the remaining eligible lines. The planner must respect product-line compatibility, duration, line availability, the incident window, non-overlap and the planning horizon while balancing delivery priority, delay, overtime, cost and workshop disruption.

This directly matches **Industry Theme 3: AI-driven production scheduling and capacity optimization**. The stoppage is an input, not a prediction target: predictive maintenance and sensor analytics are outside the scope. CableTwin starts when the active schedule becomes infeasible.

The pain is real as a process; its local frequency and cost are plant-specific. The numbers above are reproducible estimates from a fictional factory, not observed performance or ROI from any named company.

<!-- PAGE_BREAK -->

## 2. Your solution

### Concept and value proposition

CableTwin is a lightweight **incident-time decision twin** that sits alongside the factory's current planning tools. It transforms one disrupted schedule into three feasible recovery choices - **Service, Cost and Stability** - and makes their consequences comparable before the production manager approves anything.

<!-- JOURNEY_DIAGRAM -->

The experience stays understandable without industrial-AI vocabulary:

1. **Understand:** see the active lines, orders and nominal schedule.
2. **Trigger:** enter a line stoppage and its expected duration.
3. **Measure:** reveal exposed orders, projected delay, overtime and throughput.
4. **Compare:** evaluate three recovery routes using the same inputs and KPI definitions.
5. **Preview:** inspect the revised schedule and moved orders.
6. **Decide:** require human approval and record the chosen plan.

**Value proposition:** CableTwin provides a faster and more defensible response to disruption. It protects planner time, throughput and delivery commitments while creating one shared, traceable decision for production, management and customer service.

It does not control a machine, predict failures, replace an ERP/MES/APS or apply a plan autonomously. The first deployment is local and read-only.

## 3. Innovation

CableTwin combines **constraint-based symbolic AI**, multi-objective planning and a human decision loop:

- **Feasibility first:** hard constraints encode line availability, product eligibility, duration, incident downtime, non-overlap and the planning horizon.
- **Business choice second:** soft objectives evaluate due-time delay, priority, illustrative cost, overtime and workshop movement.
- **Three explicit policies:** Service, Cost and Stability expose different priorities instead of hiding one supposedly universal optimum.
- **Human authority and traceability:** the engine proposes; the production manager previews, approves and records.

On the fixed scenario, an independent exhaustive evaluation examined **17,856 candidate schedules**, identified **10,440 feasible alternatives** and confirmed the three displayed policy results. This is bounded validation evidence for the demonstration, not a claim of factory-scale optimality.

Service deliberately protects priority-weighted delay rather than the raw count of on-time orders: a 9/10 alternative exists but creates 230 minutes of total delay versus Service's 140. The business trade-off is visible rather than buried inside a black box.

<!-- PAGE_BREAK -->

## 4. Quantified impact

### Reproducible estimates from one fixed synthetic incident

> **Number integrity:** every figure comes from the working prototype and the same fixed synthetic dataset. DT values are outputs of an illustrative comparison model - never quotations, factory savings or commercial ROI.

| Scenario | On-time orders | Total delay | Overtime | Line moves | Synthetic cost model | Extra vs nominal |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Nominal plan before incident | 10/10 | 0 min | 0 min | 0 | 1,132.80 DT | 0 DT |
| Stability / no line reassignment | 7/10 | 620 min | 180 min | 0 | 3,862.20 DT | +2,729.40 DT |
| Service priority | 8/10 | 140 min | 30 min | 3 | 1,971.15 DT | +838.35 DT |
| Cost controlled | 8/10 | 170 min | 60 min | 2 | 1,931.45 DT | +798.65 DT |

Compared with keeping every order on its original line after the incident:

- **Delay:** Service reduces projected cumulative delay by 480 minutes, from 620 to 140, or **77.4%**.
- **Shift-end throughput:** Service and Cost reach **216 km by 18:00 versus 188 km**, or **+14.9%**.
- **Overtime:** Service reduces projected overtime from 180 to 30 minutes, or **83.3%**; Cost reduces it to 60 minutes.
- **Delivery:** both recovery strategies regain one on-time order, from 7/10 to 8/10.
- **Illustrative cost:** Cost reduces the synthetic comparison model from 3,862.20 to 1,931.45 DT, or **50.0%**.

These results prove that the workflow calculates meaningful and reproducible trade-offs. They do not predict the percentage a real factory will achieve.

### How real impact will be measured

A read-only shadow pilot would replay **5 to 10 historical stoppages** with planner-validated constraints. The actual decision remains the baseline; CableTwin is evaluated with identical KPI definitions.

The evidence pack will compare time-to-plan, cumulative delay, shift-end throughput, on-time rate, overtime and line moves. Pre-agreed success gates are **30% faster assessment**, **20% less delay**, **zero validated-constraint violations**, **70% planner usability** and **100% decision traceability**.

<!-- PAGE_BREAK -->

## 5. Feasibility

### What is already achievable

- A complete offline prototype already demonstrates the incident, three strategies, KPI comparison, schedule preview, human approval, decision record and reset.
- The fixed scenario contains 3 lines, 10 orders and one 4-hour stoppage, with 8/8 automated checks and an independent validation of the displayed plans.
- The scope is deliberately narrow: one operational decision in one workshop, without machine control or production-system write access.

### Resources and realistic 48/72-hour plan

The project is scoped for one participant. Required resources are **one laptop, the existing offline prototype, a browser and a fixed synthetic dataset**. It requires no paid API, GPU, cloud service, sensor connection, PLC access or ERP/MES write permission.

| Challenge window | Priority | Verifiable outcome |
| --- | --- | --- |
| 0 to 24 hours - Evidence lock | Freeze the problem, scenario, KPI definitions, disclosure and story | Phase 1 idea submitted; every claim tied to the same incident |
| 24 to 48 hours - Build and package | Harden the end-to-end journey and all mandatory deliverables | Final deck, data room, repository, brand kit, 2-minute video and offline backup |
| 48 to 72 hours - Demonstrate and defend | Freeze features, rehearse the live demo, 7-minute pitch and 4-minute Q&A | Stable submission pack, fallback demo and concise jury answers |

### After the challenge: realistic industrial validation

The next step is a **4-to-6-week read-only shadow pilot** in one workshop. Minimum inputs are orders, product families, quantities, due times, priorities, eligible-line durations, line calendars, the stopped-line window and the decision actually taken. No subscription is proposed unless a pre-agreed KPI improves and every plan labelled feasible respects the planner-validated constraints.

Key safeguards are simple: validate synthetic assumptions with a planner, keep incident duration visible and adjustable, run locally on minimal read-only data, and require human approval before any operational change.

## 6. Originality

CableTwin is memorable because it repurposes the familiar Waze interaction for a narrow industrial decision:

- **The smallest useful digital twin:** no costly 3D model is required to improve one high-value decision.
- **Incident-first:** it is built for the critical minutes after disruption, not only for retrospective reporting.
- **Comparability is the product:** the output is three understandable routes and their consequences, not one unexplained answer.
- **Frugal by design:** offline, local and read-only makes the first experiment realistic for existing Tunisian factories.

> Like Waze after a road closes, CableTwin reveals the production consequences, compares feasible alternative routes and leaves the final choice to the manager.

<!-- PAGE_BREAK -->

## 7. Target audience and use cases

**Initial beachhead:** Tunisian cable and electrical-equipment manufacturers with several production lines, compatible product families and strict delivery commitments.

CableTwin is event-triggered rather than a daily dashboard: it is used each time an unplanned stoppage makes the current schedule infeasible. Actual incident frequency is plant-specific and will be measured during pilot discovery.

| Audience | Use case | Context and frequency |
| --- | --- | --- |
| Production manager or planner | Compare and approve a recovery schedule | After each qualifying stoppage, before changing the active plan |
| Plant or operations director | Review service, delay, overtime and throughput impact | During incident review and pilot KPI review |
| Customer service, industrial engineering, finance and IT | Coordinate from the same approved, traceable decision | After each rescheduling decision |

A second use case is **historical shadow replay**: operations and industrial-engineering teams replay 5 to 10 past incidents against the decisions actually taken, proving value safely before any deployment.

The APII's June 2026 overview reports **4,604 Tunisian industrial enterprises** with at least 10 employees, including **340 in electrical, electronic and electrical-equipment manufacturing; 240 are totally exporting**. This supports the chosen industrial beachhead, not a guaranteed market size.

**Buyer:** plant or operations director. **Pilot user:** production manager or planner. **Commercial path:** one read-only workshop pilot, configuration and integration services after measured success, then a per-site subscription hypothesis. No signed customer, price or revenue claim is made.

## 8. Competitive differentiation

| Existing alternative | What it does well | Why CableTwin is better or complementary |
| --- | --- | --- |
| Spreadsheet, phone and planner experience | Familiar, flexible and immediately available | Adds consistent constraint checks, three comparable responses and traceable approval while preserving human judgment |
| ERP/MES or APS | System of record and/or advanced production planning | Sits alongside existing systems as a read-only incident-response layer, without replacement or write-back |
| High-fidelity digital twin | Rich physical and process simulation | Starts with a smaller, faster and lower-cost decision twin focused on one measurable operational choice |

The defensible asset is the combination of a planner-validated constraint model, incident history, decision feedback and integration with the plant's real planning workflow.

> Select CableTwin for Phase 2 to see the complete 90-second journey: Line 2 stops -> impact appears -> three alternatives are compared -> the manager approves -> the decision is recorded.

### References

1. Organizer announcement received by the SUPCOM team leader, 17 July 2026: deadline, eight required sections and Phase 1 guidance.
2. AUTOMATE OR DIE official challenge explorer, Industry Theme 3: <https://automate-or-die.netlify.app/challenges#industry>
3. APII, Overview of Tunisian Industry, source June 2026: <https://www.tunisieindustrie.nat.tn/en/tissu.asp>
4. AUTOMATE OR DIE public event page: <https://www.communitydays.org/event/2026-07-17/ai-and-automation-hackathon-automate-or-die>

**Disclosure:** CableTwin is not affiliated with Chakira Cables, COFICAB, Elloumi Group or any other cable manufacturer. All prototype data and all demonstrated operational results are synthetic.
