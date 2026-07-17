# Final presentation outline — 9 slides, 16:9, .pptx via python-pptx or PowerPoint

> Rule: every slide must carry its message when read WITHOUT a presenter (Phase 2 jurors read the file alone).
> Language: English. Screenshots from the frozen prototype only.

| # | Message | Time (Phase 3 pitch) |
| ---: | --- | ---: |
| 1 | A line stops; the production schedule becomes wrong immediately | 0:00–0:35 |
| 2 | The production manager must protect orders under real constraints | 0:35–1:10 |
| 3 | CableTwin is the Waze of the cable factory | 1:10–1:40 |
| 4 | One journey: incident, impact, three routes, human approval | 1:40–2:00 |
| 5 | End-to-end demonstration (screenshots + key numbers; live-demo cue in Phase 3) | 2:00–3:30 |
| 6 | The AI core: symbolic planning plus bounded exact validation | 3:30–4:20 |
| 7 | Measured synthetic impact and pilot measurement protocol | 4:20–5:05 |
| 8 | Buyer, read-only pilot, differentiation and responsible limits | 5:05–6:10 |
| 9 | Why CableTwin should advance and what Phase 2 proves | 6:10–6:45 |

## Communication job

By the end of the deck, a juror should be able to say:

> CableTwin turns one real production-rescheduling decision into three feasible,
> measurable and explainable recovery routes; the working offline prototype
> proves the mechanism, and a read-only pilot can test the value without risking
> the factory.

## Slide-level build specification

The text under **Audience-facing copy** is the only prose intended to appear on
the slide. Visual and speaker-note instructions are production guidance, not
visible slide content.

### Slide 1 — CableTwin

**Narrative job:** name the product and make the promise understandable before
any technical explanation.

**Audience-facing copy**

- Eyebrow: `AUTOMATE OR DIE 2026 · INDUSTRY · THEME 3`
- Product: `CableTwin`
- Main line: `When a line stops, see the consequences before changing production.`
- Signature: `The Waze of the cable factory`
- Proof line: `Working offline prototype · Fictional Tunisian factory · Fully synthetic data`
- Footer: `SUPCOM · Oussama Akir · Solo participant`

**Visual**

- Minimal title slide.
- Use the CableTwin mark plus one cropped production-line/Gantt detail from the
  frozen interface; do not use a generic factory stock image.
- Deep-green background, cream type and one mint route line.

**Speaker notes — 0:00–0:35**

“At 10:00, one production line stops. The schedule that looked correct one
minute ago is now impossible. The production manager must decide which orders
to move, delay or protect before every consequence is visible. CableTwin is the
Waze of the cable factory: it shows what the disruption changes, compares
feasible recovery routes and leaves the final decision to the manager. What you
will see is a working offline prototype on a fully synthetic Tunisian cable
factory.”

### Slide 2 — At 10:00, one stoppage exposes 3 orders and 620 minutes of delay

**Narrative job:** make the business process and urgency concrete.

**Audience-facing copy**

- Decision question: `Which orders should be moved, delayed or protected — and what will each choice do to service, throughput and the workshop?`
- Incident facts:
  - `Line 2 unavailable · 10:00–14:00`
  - `3 orders exposed`
  - `7/10 on time without adaptation`
  - `620 min projected cumulative delay`
- Constraint chips: `Eligible lines` · `Durations` · `Due times` ·
  `No overlap` · `Planning horizon`
- Closing line: `The manager needs a feasible choice, not another dashboard.`

**Visual**

- Left: a simple “route closed” production timeline.
- Right: large 3 / 7-of-10 / 620 metric stack, using the same hierarchy as the
  interface.
- Show the production manager at the decision point; no detailed cable-process
  diagram.

**Speaker notes — 0:35–1:10**

“The process is incident-driven rescheduling. Once Line 2 is unavailable, two
orders overlap the stop and one downstream order is exposed. Orders compete for
the remaining eligible capacity. A valid answer must respect product-to-line
compatibility, line-specific duration, downtime, non-overlap and the planning
horizon. If every order stays on its original line, only seven of ten finish on
time and cumulative delay reaches 620 minutes. The decision owner is the
production manager; the process exists because the active schedule has become
infeasible, while its local frequency and cost remain pilot questions.”

### Slide 3 — CableTwin turns one disruption into three feasible routes

**Narrative job:** explain the product and the Waze analogy without algorithmic
language.

**Audience-facing copy**

```text
1  Detect the stop
2  Reveal exposed orders and KPI
3  Compare Service · Cost · Stability
4  Preview, approve and record
```

Callout:

> Like Waze after a road closes: same destination, different routes and visible
> trade-offs — the driver still decides.

Value line:

`One incident → three comparable recovery schedules → one traceable human decision`

Boundary line:

`Read-only decision support · No failure prediction · No machine control`

**Visual**

- A single horizontal route map that forks into Service, Cost and Stability,
  then rejoins at Human approval.
- Use three route colours but keep CableTwin green as the system colour.

**Speaker notes — 1:10–1:40**

“CableTwin is a lightweight incident-time digital twin. It keeps the minimum
calculable state needed for this decision: lines, orders, calendars,
compatibilities and the current schedule. When a route closes, it measures the
impact and generates three alternatives. Service protects priority-weighted
delivery, Cost minimizes the illustrative comparison cost, and Stability avoids
line changes. The value is not a 3D factory. It is the ability to test a
production decision safely before changing the real workshop.”

### Slide 4 — One end-to-end loop connects the incident to an auditable decision

**Narrative job:** prove that the concept is a complete workflow, not a feature
mock-up.

**Audience-facing copy**

| 01 — Understand | 02 — Simulate | 03 — Compare | 04 — Decide |
| --- | --- | --- | --- |
| `3 lines · 10/10 on time` | `Line 2 stops · 3 exposed` | `3 feasible routes · same KPI` | `Manager approves · audit at 10:07` |

Bottom line:

`The same executable path connects data, incident analysis, planning, Gantt preview, approval, audit and reset.`

**Visual**

- Four equal screenshot crops from:
  `02-factory-nominal.png`, `03-incident-kpis.png`,
  `04-strategies.png`, `07-approved-audit.png`.
- Add only the four numbered captions above; do not reproduce the full UI text.

**Speaker notes — 1:40–2:00**

“This is the complete journey in the working build. We start from ten orders on
time, trigger the four-hour stop, reveal the consequence, compare three plans,
preview a revised Gantt and require the manager to approve. The final event
records the choice at 10:07. Reset returns to the exact nominal state. These are
post-freeze browser captures, not design mock-ups.”

### Slide 5 — Service cuts projected delay from 620 to 140 minutes

**Narrative job:** make the working prototype and its measured consequence
impossible to miss.

**Audience-facing copy**

- Hero metric: `620 → 140 min projected cumulative delay`
- Supporting metrics:
  - `188 → 216 km completed by 18:00 · +14.9%`
  - `180 → 30 min overtime · -83.3%`
  - `7/10 → 8/10 orders on time`
  - `Trade-off: 3 line reassignments`
- Route strip:

| Stability | Service | Cost |
| ---: | ---: | ---: |
| `620 min · 188 km · 0 moves` | `140 min · 216 km · 3 moves` | `170 min · 216 km · 2 moves` |

- Disclosure: `Fixed synthetic scenario · calculated by the working prototype · not factory ROI`

**Visual**

- Main visual: Service Gantt preview from
  `05-preview-service-gantt.png`.
- Side strip: before/after KPI crops plus the approved audit crop.
- Keep the metrics as native slide text, not baked only into screenshots.

**Speaker notes — 2:00–3:30**

“Here is the live journey. The nominal schedule starts at ten of ten. I trigger
the stop on Line 2. Without adaptation, three orders are exposed, delay reaches
620 minutes, overtime reaches 180 minutes and only 188 kilometres finish by
18:00. CableTwin calculates three routes from the same incident. Service
reduces delay to 140 minutes and overtime to 30, while output reaches 216
kilometres. It accepts three line moves to protect priority-weighted delivery.
Cost uses two moves and reaches 170 minutes of delay. Stability makes no move
and keeps the full 620 minutes. I preview Service, inspect the revised Gantt and
approve. The audit event appears; no order is sent to a machine.”

Production cue: during Phase 3, run the live 90-second journey here. If the live
environment fails, narrate the four frozen screenshots already present on the
slide.

### Slide 6 — The AI is the planning decision, not the dashboard

**Narrative job:** prove that AI is central, technically honest and independently
verified.

**Audience-facing copy**

**Live symbolic planner**

```text
Decision variables
line assignment · sequence · start/end

Hard constraints
eligibility · duration · downtime · no overlap · horizon

Business policies
Service · Cost · Stability
```

**Independent bounded oracle**

- `17,856 candidate schedules evaluated`
- `10,440 feasible complete schedules`
- `3/3 displayed routes match their unique policy optimum`
- `9/9 automated checks pass`

Proof callout:

`A 9/10 route exists, but creates 230 min of total delay; Service chooses 8/10 with only 140 min because priority-weighted lateness matters.`

Boundary:

`Exact for the encoded bounded demo — not a claim of factory-scale exhaustive optimization.`

**Visual**

- Two engines side by side with different icons:
  “Live constructive planner” and “Independent exhaustive verifier.”
- Show hard constraints as a gate before the three policy routes.
- Avoid robot, brain or chatbot imagery.

**Speaker notes — 3:30–4:20**

“The intelligence is symbolic planning under constraints. For seven orders not
complete at incident time, the engine chooses eligible lines, sequences and
times. A route is rejected if it breaks compatibility, duration, downtime,
non-overlap or the horizon. Service, Cost and Stability then express explicit
lexicographic objectives. The browser uses a fast deterministic constructive
planner. Separately, an exhaustive oracle enumerates 17,856 assignment and
sequence candidates, finds 10,440 feasible schedules and confirms that all
three displayed plans are the unique optima of their declared policies in this
bounded scenario. That separation gives us both a usable product and an honest
certificate.”

### Slide 7 — Simulation proves the mechanism; a shadow pilot will prove value

**Narrative job:** connect honest synthetic results to a credible industrial
measurement protocol.

**Audience-facing copy**

**What Phase 2 proves**

`Same incident + same KPI definitions + reproducible before/after calculations`

**What the pilot measures**

```text
5–10 historical stoppages
→ same information cutoff as the real decision
→ planner-validated constraints
→ CableTwin versus actual historical baseline
→ time, delay, output, overtime, moves and usability
```

**Proposed success gates**

- `30% faster assessment`
- `20% lower delay`
- `0 hard-constraint violations`
- `≥70% planner usability`
- `100% decision traceability`

Disclosure:

`Pilot gates are targets to agree — not achieved claims.`

**Visual**

- Left third: Phase 2 synthetic evidence with a large “PROVED IN DEMO” label.
- Right two-thirds: a five-step shadow-pilot evidence funnel ending in
  `Go · Revise · Stop`.

**Speaker notes — 4:20–5:05**

“I do not convert synthetic results into a factory ROI. Phase 2 proves that the
workflow calculates meaningful, reproducible trade-offs. A real proof starts
with five to ten past stoppages. We freeze the information available at the
decision time, keep the actual decision as baseline, validate the rules with the
planner and compare identical KPI definitions. Proposed gates are 30 percent
faster assessment, 20 percent less delay, zero hard-constraint violations, at
least 70 percent planner usability and complete traceability. The sponsor
decides go, revise or stop.”

### Slide 8 — Start read-only in one workshop; scale only after measured proof

**Narrative job:** show a low-risk buyer path and clear differentiation.

**Audience-facing copy**

- User: `Production manager / planner`
- Buyer: `Plant or operations director`
- Pilot: `4–6 weeks · one workshop · read-only · 5–10 historical incidents`

Pilot path:

```text
Validate process
→ map read-only data
→ encode workshop constraints
→ replay and shadow
→ measured go / revise / stop
```

Differentiation:

| Manual / spreadsheet | ERP · MES · APS | High-fidelity twin | CableTwin |
| --- | --- | --- | --- |
| Familiar but difficult to compare and trace | System of record / broad planning | Rich but integration-heavy | Focused incident layer · three explainable routes · human approval |

Safety line:

`No prediction · no autonomous control · no write-back · no price or ROI claim`

**Visual**

- Make the pilot path dominant.
- Put the alternatives in a thin comparison band, not four dense columns.
- End at an approval gate owned by the buyer and production manager.

**Speaker notes — 5:05–6:10**

“The primary user is the production manager; the likely sponsor is the plant or
operations director. The first engagement is deliberately small: one workshop,
four to six weeks, read-only exports and five to ten historical incidents. It
requires no sensors, GPU, cloud migration or machine access. CableTwin
complements the systems already present. A spreadsheet remains flexible, an
ERP or MES remains the system of record, an APS may already solve broad
planning, and a high-fidelity twin models much more. CableTwin earns its place
only where incident response is still manual, difficult to compare or weakly
traced. If constraints, data or KPI value fail the gate, the pilot stops.”

### Slide 9 — CableTwin is ready for Phase 3

**Narrative job:** close by mapping evidence to the official scoring grid and
make one clear request.

**Audience-facing copy**

| Official criterion | Phase 2 evidence |
| --- | --- |
| `25% · Business process & impact` | `One incident-rescheduling loop · delay, overtime and output measured` |
| `20% · Core AI` | `Constraint planning · 17,856-candidate independent bounded certificate` |
| `20% · Working prototype` | `Offline incident → routes → Gantt → approval → audit → reset · 9/9 checks` |
| `20% · Business viability` | `Named user and buyer · 4–6-week read-only pilot · go/no-go gates` |
| `15% · Pitch & clarity` | `One Waze metaphor · three routes · one human decision` |

Closing request:

> Select CableTwin for the final pitch and see the complete live decision in 90
> seconds.

Footer:

`CableTwin · SUPCOM · Oussama Akir · Solo participant`

**Visual**

- Five compact evidence rows aligned to the official weights.
- CableTwin mark and one mint route ending at `PHASE 3`.
- No “98%” or predicted jury score.

**Speaker notes — 6:10–6:45**

“CableTwin is one coherent proof across the official grid. The process is a
specific line-stoppage rescheduling decision. Impact is calculated with explicit
definitions. The core AI builds constrained alternatives and is independently
verified. The prototype runs end to end, offline, with nine automated checks.
The business path begins with a read-only pilot and stops if evidence is not
there. And the story remains simple: when a production route closes, show three
feasible routes before the manager decides. Select CableTwin for Phase 3, and I
will demonstrate that complete decision live in 90 seconds.”

## Cross-slide integrity rules

- Use **Service, Cost and Stability** everywhere.
- Use **620 / 140 / 170 minutes**, never the exploratory prototype figures.
- Use **188 / 216 km** and **+14.9%** only as synthetic shift-end output.
- Use **9/9 checks** in all new Phase 2 material.
- Keep UI cost deltas separate from benchmark absolute synthetic costs.
- Put `Fully synthetic data` on every slide containing operational results.
- Describe the live engine as a deterministic constructive constraint planner
  and the oracle as exact only for the bounded demo.
- Never imply affiliation with a real cable manufacturer.
- Never imply machine control, ERP/MES write-back, real savings, a signed pilot
  or an achieved jury score.
