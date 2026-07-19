# CableTwin Critical Restart Lab

**Experience subtitle:** `Texas City 2005 — Counterfactual Safety Replay`

## Controlled implementation brief for Claude Code

**Verdict:** `REVISE`, then implement this one bounded improvement.

The team leader's objective is accepted: build a separate, advanced human-machine
demonstration in which machine learning retrieves historical warning patterns,
a digital twin rehearses alternatives, and humans retain final authority.

The framing is revised in two important ways:

1. use the officially investigated **BP Texas City refinery incident of
   23 March 2005**, not an invented Liverpool example;
2. demonstrate a source-grounded counterfactual decision window, never claim
   that CableTwin certainly would have prevented the event or saved lives.

This is an expert-jury demonstrator for a possible 21 July presentation. It is
not the stable 30-second selection demo and it must not replace or regress the
accepted cable-production twin.

## 1. Why this incident is selected

Texas City is unusually strong for an expert digital-twin demonstration because
the official U.S. Chemical Safety and Hazard Investigation Board (CSB) report
documents all four layers required by the scenario:

- **physical process:** a raffinate splitter tower was flooded and
  overpressurized during unit restart, leading to a flammable release;
- **instrument disagreement:** at 1:04 p.m. the control system indicated
  78 percent of the level transmitter span, corresponding to 7.9 feet, while
  the liquid level was later estimated at 158 feet in the 170-foot tower;
- **historical memory:** the report analyzes 19 startups between April 2000
  and March 2005. Only one kept both level within the transmitter range and
  pressure within alarm limits. Fourteen had major level swings, producing
  74 level-alarm activations; the high-level set point was exceeded 65 times;
- **human and organizational context:** the startup proceeded despite known
  instrumentation problems, abnormal earlier startups were not treated as
  learning events, supervisory support was inadequate, and occupied trailers
  were located near the release area.

The incident killed 15 workers and injured 180. These numbers establish the
documented stakes. They must never become a simulated casualty counter, a
marketing device, or a claim about lives CableTwin would have saved.

The CSB explicitly recommended improved abnormal-situation training using
simulators or similar training tools. That makes an educational twin a
source-aligned demonstration, provided its limits remain visible.

## 2. Primary sources

Only these source classes may support historical claims in the UI:

1. U.S. CSB investigation page:
   <https://www.csb.gov/bp-america-texas-city-refinery-explosion/>
2. U.S. CSB final investigation report, approved 20 March 2007:
   <https://www.csb.gov/assets/1/20/csbfinalreportbp.pdf>
3. U.S. CSB final-report announcement:
   <https://www.csb.gov/u-s-chemical-safety-board-concludes-organizational-and-safety-deficiencies-at-all-levels-of-the-bp-corporation-caused-march-2005-texas-city-disaster-that-killed-15-injured-180/>
4. NIST human-in-the-loop digital-twin architecture:
   <https://www.nist.gov/publications/conceptual-architecture-digital-twins-human-loop-based-smart-manufacturing>

Useful final-report locations:

- incident outcome and process summary: executive summary;
- 78 percent indication versus 158-foot estimated level: report pp. 55-57;
- nineteen-startup historical analysis: report pp. 72-75;
- inadequate control display and missing material balance: report pp. 82-84;
- earlier overfill events and instrumentation: report pp. 104-106;
- causes and safeguards: report pp. 209-211.

No secondary article, stock image, company logo, victim photograph, dramatic
sound effect, or invented quote is permitted.

## 3. Permanent truth boundary

The interface must separate three evidence types everywhere:

| Badge | Meaning | Examples |
| --- | --- | --- |
| `CSB DOCUMENTED FACT` | Directly supported by the official investigation | Date, incident outcome, 19-startup aggregate history, 78% / 158 ft frame |
| `SOURCE-GROUNDED RECONSTRUCTION` | Simplified topology or state inferred from the report for teaching | Process schematic and decision checkpoint |
| `DT SYNTHETIC RESULT` | Output from CableTwin's bounded deterministic model | Branch curves, relative risk index, time horizon, scenario hash |

A permanent banner must read:

> EDUCATIONAL COUNTERFACTUAL — SYNTHETIC SIMULATION — NOT A CERTIFIED SAFETY SYSTEM

The source drawer must state:

> Historical facts are sourced from the U.S. CSB investigation. The interactive
> telemetry, reconstructed startup episodes and virtual branch outcomes are
> synthetic. They demonstrate a decision-support architecture; they do not
> reproduce refinery thermodynamics, prove a historical counterfactual, or
> issue commands to physical equipment.

It must also state:

> Independent educational reconstruction. CableTwin is not affiliated with BP
> or the U.S. Chemical Safety Board.

## 4. Product proposition shown by the demo

The central line is:

> **The warning signals already existed. CableTwin turns them into an
> explainable decision window before the physical system crosses the point of
> no return.**

The expert lesson is deliberately more nuanced than “AI predicts disaster”:

1. a learned model can retrieve and compare prior operating patterns;
2. unsafe practice repeated often can look normal to a model trained only on
   historical operations;
3. the digital twin independently reconciles flows and tests alternatives;
4. hard safety constraints prevent learned normalization from being presented
   as approval;
5. qualified humans decide whether to accept the operational cost of a safe
   course of action.

This complementarity between ML, deterministic modeling, hard constraints and
human authority is the primary expert-jury differentiator.

## 5. Isolation and file scope

Implement the demonstrator as a separate static application at:

`/critical-restart/`

The current `/`, `#twin`, decision view, production-twin files, canonical
production metrics and existing tests must remain unchanged.

### Permitted implementation files

- `critical-restart/index.html`
- `critical-restart/styles.css`
- `critical-restart/app.js`
- `engine/critical-restart-data.js`
- `engine/critical-restart-ml.js`
- `engine/critical-restart-simulator.js`
- `tests/critical-restart.test.mjs`
- `scripts/capture-critical-restart.mjs`
- this coordination file for Claude's handoff

If a different file is indispensable, Claude must stop and record why before
editing it. In particular, do not edit `app/index.html`, `app/app.js`,
`app/factory-view.js`, the existing engine modules, the accepted Day 2/Day 3
artifacts, `packaging/`, `phase2-final`, or `phase2-submission-final`.

No dependency, CDN, analytics service, external font or runtime network request
may be introduced.

The existing server already resolves directory requests to `index.html`, so
`http://127.0.0.1:4173/critical-restart/` should work without a server change.

## 6. Visual concept

Use a premium, restrained industrial command-center aesthetic rather than an
accident animation.

### Dominant visual

A full-height simplified raffinate splitter is shown in the center. It has two
simultaneous liquid representations:

- a thin green instrument band labelled `INDICATED: 78% OF SENSOR SPAN`;
- a translucent amber/red internal column labelled
  `POST-INCIDENT ESTIMATE: 158 FT`.

The contrast must be understood in under five seconds. A small callout explains
that 78 percent referred only to the transmitter's limited span, not 78 percent
of the 170-foot tower.

Surrounding equipment is abstract and source-respectful:

- feed pump and feed line;
- raffinate splitter tower;
- bottom outlet/control valve;
- relief path;
- blowdown drum and atmospheric stack;
- independent high-level alarm status;
- abstract occupied-zone markers outside the process boundary.

Do not render flames, bodies, blast waves, collapsing buildings or victim
portraits. For a dangerous virtual branch, show a red `RELEASE PRECURSOR
REACHED` boundary and freeze the simulation there.

The casualty figures appear once in the running UI, on the sober opening fact
card. They are not repeated as a dashboard KPI.

### Layout

- top: incident/date/source, non-affiliation label and accelerated timeline;
- left: `Historical memory` with the 19-startup evidence;
- center: physical twin and indicated-versus-inferred inventory;
- right: ML explanation, three virtual futures and constraints;
- bottom: human approvals and append-only audit trail;
- source/limitations drawer always reachable;
- visible `Reset` and `90 s expert demo` controls.

Support 1920x1080 as the presentation target and 1366x768 without clipped
controls. All meaning must remain available without color alone.

## 7. Exact state machine

The same deterministic state machine drives manual and automatic modes:

1. `briefing`
2. `historical_frame`
3. `rewind_to_gate`
4. `ml_memory`
5. `twin_reconciliation`
6. `branch_comparison`
7. `operations_signed`
8. `safety_signed`
9. `recommendation_finalized`

`Reset` returns exactly to `briefing`, clears every signature and audit event,
and restores the initial scenario hash.

### Mode A — expert, 75-90 seconds

Each step advances on a single large call-to-action. The presenter can pause
after any step and inspect assumptions.

### Mode B — accelerated, at most 30 seconds

The same actions and results are replayed automatically. It must not use a
different model, hard-coded screenshot or separate outcome path. A visible
pause button allows the presenter to regain control.

## 8. Storyboard

### Beat 1 — “This happened”

Show a sober fact card:

- Texas City, Texas — 23 March 2005;
- restart of a hydrocarbon isomerization unit;
- 15 workers killed and 180 injured;
- tower flooded and overpressurized; flammable material was released;
- source: U.S. CSB.

Spoken transition:

> We begin with the investigation, not with a fictional catastrophe.

### Beat 2 — “The instrument and the process disagreed”

Animate the official 1:04 p.m. evidence frame:

- instrument: 78 percent of transmitter span / 7.9 feet;
- `CSB POST-INCIDENT MATERIAL-BALANCE ESTIMATE: 158 FT`;
- tower height: 170 feet;
- visible status: the transmitter-associated 72 percent alarm was active and
  acknowledged; the separate redundant hardwired high-level alarm did not
  sound (CSB final report pp. 34, 49, 81 — the two alarms are distinct).

Then rewind the UI to a clearly labelled `SOURCE-GROUNDED RECONSTRUCTION —
PRE-START DECISION GATE`. This prevents the demo from pretending that the
chosen action occurred at a precisely documented historical minute.

### Beat 3 — “History had normalized the warning”

Show the official aggregate history:

- 19 startups analyzed;
- only 1 kept both level and pressure within the cited boundaries;
- 14 had significant level swings;
- 74 level-alarm activations across those 14 startups;
- 65 high-level set-point exceedances;
- 15 of 19 exceeded the transmitter range;
- 8 remained out of range for more than one hour.

The ML historian runs a deterministic k-nearest-neighbor similarity model on a
synthetic, seeded reconstruction cohort constrained by these published
aggregates. It must be labelled exactly:

`CASE-BASED ML — SYNTHETIC COHORT CONSTRAINED BY CSB AGGREGATES`

It returns:

- nearest pattern family: `RECURRENT ABNORMAL STARTUP`;
- similarity score, explicitly not a probability;
- contributing distances: sensor/inventory disagreement, missing reliable
  high-level barrier, inlet/outlet imbalance, pressure excursion, manual
  control, occupied exposure zone.

The important expert reveal is:

> A model trained on repeated unsafe operations can learn that unsafe looks
> normal. Similarity is evidence, not permission.

### Beat 4 — “The twin checks physics-like invariants”

Use a deliberately bounded normalized material balance:

`inventory[t+1] = inventory[t] + feed[t] - outflow[t]`

The simulator does not model thermodynamics, vapor-cloud formation, ignition,
blast pressure or casualties. It only detects when a release precursor becomes
reachable under encoded assumptions.

Display the contradiction:

- indicated sensor value falls;
- cumulative material balance rises beyond the sensor's valid range;
- independent high-level alarm is unavailable;
- the restart therefore has unknown inventory.

### Beat 5 — “Three futures before one physical decision”

Run all branches in parallel using the same initial state and horizon.

#### Branch A — Continue restart

Actions:

- keep feed active;
- retain limited indication;
- do not clear the occupied zone.

Result:

- `RELEASE PRECURSOR REACHED`;
- hard constraints violated;
- branch may be inspected but never approved.

#### Branch B — Reduce feed only

Actions:

- reduce feed;
- leave inventory unverified;
- leave independent high-level protection unavailable.

Result:

- escalation is delayed in the bounded model;
- unknown inventory remains;
- branch stays non-approvable.

#### Branch C — Hold, verify, protect, clear

Actions:

- hold the restart;
- verify a redundant level measurement;
- restore/test independent high-level protection;
- reconcile feed/outflow through material balance;
- clear the modeled exposure zone;
- require a qualified startup supervisor.

Result:

- no release precursor is reached within the bounded simulation horizon under
  the encoded assumptions;
- production is delayed;
- branch can proceed to human review;
- a controlled restart becomes eligible only after every readiness gate in
  `CR-08` is recorded as complete.

No branch may output predicted deaths, injuries, “lives saved,” refinery loss,
ROI or probability of explosion.

### Beat 6 — “Two human approvals”

Require two separate role actions:

1. `Operations lead` accepts the operational delay and confirms that no
   physical command has been sent;
2. `Process safety lead` confirms barrier verification and exposure-zone
   clearance.

The final button remains disabled until both are signed. Signatures are roles,
not real personal names.

Final status:

`RECOMMENDATION APPROVED — NO MACHINE COMMAND SENT`

### Beat 7 — “Every decision is auditable”

The audit view contains:

- source version and URLs;
- input snapshot;
- synthetic-data disclosure;
- model name, `k`, feature weights and deterministic seed;
- scenario hash;
- three branches and violated constraints;
- rejected alternatives;
- both role approvals and rationales;
- explicit `no machine command` event.

## 9. Hard constraints

Constraints are deterministic and separate from the learned model.

1. `CR-01 — Reliable inventory required`
   - If cumulative inflow/outflow implies inventory outside the valid sensor
     range and no independent verified measurement exists, restart approval is
     blocked.
2. `CR-02 — Independent high-level protection required`
   - If the safety-critical high-level alarm is unavailable or unverified,
     restart approval is blocked.
3. `CR-03 — Outflow plausibility required`
   - Sustained feed without plausible outflow creates an unknown-inventory
     condition and blocks approval.
4. `CR-04 — Exposure zone must be clear`
   - A branch that reaches a release precursor while the modeled exposure zone
     is occupied is never approvable.
5. `CR-05 — Dual human authority`
   - The recommended branch cannot be finalized without Operations and Process
     Safety approval.
6. `CR-06 — No automatic actuation`
   - The code contains no network, PLC, control, write-back or machine-command
     interface.
7. `CR-07 — Simulation stop boundary`
   - The simulator stops at `RELEASE PRECURSOR REACHED`; it never simulates an
     explosion or casualty outcome.
8. `CR-08 — Readiness evidence required`
   - A controlled restart remains blocked until instrument tests, shift
     handover, pre-startup safety review and qualified supervision are recorded.

## 10. ML contract

Use a small, deterministic and inspectable k-NN implementation. Do not import a
library and do not label simple distance contributions as SHAP.

### Feature vector

- normalized feed/outflow imbalance;
- sensor-versus-balance disagreement;
- time outside valid transmitter range;
- pressure-alarm excursion;
- independent alarm health;
- manual-versus-automatic control;
- occupied exposure zone;
- qualified startup supervision present;
- shift handover complete;
- pre-startup safety review complete.

### Dataset boundary

- aggregated historical counts are documented CSB facts;
- individual reconstructed feature rows are synthetic;
- use a fixed seed and export the cohort builder for testing;
- no row may be called raw BP telemetry;
- the default incident vector must retrieve the recurrent abnormal-startup
  family, but similarity must not authorize a branch.

### Explainability

For every neighbor show:

- synthetic episode ID;
- distance;
- three largest feature-distance contributions;
- data badge;
- a link to the aggregate CSB evidence used to constrain generation.

## 11. Simulator contract

The simulator is deterministic and bounded:

- fixed timestep and horizon;
- normalized rather than refinery-grade units for virtual branches;
- documented 1:04 p.m. frame kept separate from branch model state;
- same initial state for all three branches;
- stable sort and stable serialization;
- Web Crypto or Node crypto SHA-256 scenario hash where available, with a
  deterministic pure-JS fallback only if needed for browser compatibility;
- no randomness after the seeded cohort is built;
- no physics or safety-certification claim.

Every result object must include:

- `evidenceClass`;
- `assumptions`;
- `constraintViolations`;
- `approvable`;
- `humanReadableReason`;
- `modelVersion`;
- `scenarioHash`.

## 12. Exact expert script

Target: 75-90 seconds.

> On 23 March 2005, during a refinery restart in Texas City, a distillation
> tower was flooded and overpressurized. Fifteen workers died and 180 were
> injured. We use this tragedy respectfully, from the official CSB record — not
> as entertainment and not to claim hindsight proves prevention.
>
> At 1:04 p.m., the instrument showed 78 percent of its limited span — 7.9
> feet — while the liquid level was later estimated at 158 feet in a 170-foot
> tower. The warning history also existed: across 19 startups, only one kept
> both level and pressure within the cited boundaries.
>
> Our case-based model retrieves that recurrent abnormal-startup pattern. But
> here is the important AI lesson: when unsafe operation repeats, machine
> learning can normalize it. Similarity is evidence, not permission.
>
> The digital twin independently reconciles feed and outflow. The sensor trends
> down while inferred inventory rises outside its measurable range, and the
> independent high-level barrier is unavailable.
>
> Before any physical action, CableTwin rehearses three futures. Continuing
> reaches a release precursor and violates hard constraints. Reducing feed only
> delays the problem. Holding the restart, verifying level and protection,
> reconciling inventory and clearing the exposure zone stays within our bounded
> model's safe envelope.
>
> Operations accepts the delay. Process Safety verifies the barriers. Every
> input, rejected alternative and approval is audited. CableTwin sends no
> machine command. It gives humans an explainable decision window before an
> abnormal condition becomes irreversible.

## 13. Forbidden wording

Never say or display:

- “CableTwin would have saved 15 lives.”
- “CableTwin prevents refinery explosions.”
- “The model predicts fatalities.”
- “This is real BP sensor data.”
- “95% safe,” “95% chance of explosion,” or another probability not supported
  by a validated model.
- “Certified safety system,” “SIS,” “ESD,” or equivalent certification claim.
- “Autonomous shutdown” or any physical control claim.
- “Digital twin proves what would have happened.”

Permitted closing claim:

> This source-grounded synthetic reconstruction demonstrates how historical
> pattern retrieval, bounded virtual testing, hard constraints and human
> approval can be combined before a physical decision. It does not prove the
> historical counterfactual.

## 14. Acceptance tests

Claude must complete all gates before transferring the lock.

### Regression and isolation

1. Existing production-twin files listed in Section 5 remain byte-identical.
2. Existing `npm run check`, `npm run check:recommender` and
   `npm run benchmark:exact` results remain unchanged.
3. `/`, `/#twin` and `/critical-restart/` all return HTTP 200.
4. The new page performs zero external network requests at runtime.

### Model and simulator

5. Fixed input and seed produce the same cohort, branch outputs and scenario
   hash on repeated runs.
6. Default incident vector retrieves `RECURRENT ABNORMAL STARTUP` first and
   exposes distance contributions.
7. Removing sensor/balance disagreement materially lowers similarity and the
   displayed alert level.
8. Branch A reaches `RELEASE PRECURSOR REACHED`, violates constraints and is
   never approvable.
9. Branch B remains non-approvable while inventory is unverified or the
   independent high-level barrier is unavailable.
10. Branch C is the only potentially approvable branch and remains blocked
    until both role approvals exist.
11. No result object contains deaths, injuries, lives-saved, explosion
    probability, ROI or industrial-savings fields.
12. Reset restores the exact initial state and hash.

### Claims and audit

13. Every historical number visible in the UI is present in the source map and
    covered by a unit test.
14. Every synthetic value carries `DT SYNTHETIC RESULT` or an equivalent
    machine-readable evidence class.
15. The permanent disclaimer is visible at 1366x768 and 1920x1080.
16. The audit contains model version, `k`, weights, seed, inputs, all branches,
    constraints, rejected alternatives, both approvals and `NO MACHINE COMMAND
    SENT`.
17. Search of runtime, tests and jury-facing implementation copy (excluding
    this specification's explicit prohibition list and the coordination log)
    finds none of the forbidden claims in Section 13.

### Browser and visual QA

18. Capture the complete expert journey at 1920x1080 in Chromium.
19. Capture the accelerated journey and prove it completes in at most 30
    seconds using the same state machine.
20. Inspect full-size renders at 1920x1080 and 1366x768: no clipped text,
    overlapping panels or inaccessible controls.
21. Keyboard navigation reaches every action; focus is visible; reduced-motion
    preference disables nonessential animation.
22. The page remains understandable in grayscale and does not depend on red
    versus green alone.

## 15. Required Claude handoff

Claude's completion entry must include:

- exact files changed and generated;
- commit hash and branch;
- confirmation that every existing twin/runtime file stayed byte-identical;
- test commands and outputs;
- source-map verification result;
- runtime network-request log;
- screenshot/video evidence paths;
- 1920x1080 and 1366x768 visual-QA result;
- hashes for the captured artifacts;
- known limitations and remaining risks;
- no deployment claim unless deployment was explicitly authorized and tested;
- next owner `Codex` for independent adversarial review;
- next permitted action `read-only review of this improvement only`.

Do not begin another improvement after this implementation.
