# CableTwin - Phase 2 master execution plan

**Project:** CableTwin  
**Team:** SUPCOM  
**Team leader and solo participant:** Oussama Akir  
**Phase:** Phase 2 - The Build  
**Official date:** 18 July 2026  
**Status:** Draft for adversarial review before execution  
**Last updated:** 17 July 2026

---

## 1. Official basis

The organizers have confirmed that Phase 2 is the heaviest phase and the one
that weighs most in the final evaluation.

Six deliverables are mandatory:

1. a final presentation in `.pptx` format;
2. a technical data room;
3. a two-minute demo video;
4. a complete GitHub repository;
5. a brand kit;
6. above all, a working end-to-end prototype.

The global scoring grid is:

| Official criterion | Weight |
| --- | ---: |
| Business-process relevance and measured impact | 25% |
| Core AI integration | 20% |
| Working prototype | 20% |
| Business viability | 20% |
| Pitch and clarity | 15% |

The elimination rule is absolute: one missing deliverable at the deadline means
automatic elimination.

Only the team leader may submit. The dedicated Phase 2 email will provide the
exact deadline, submission link, file constraints and detailed requirements.

## 2. Unknowns to resolve from the dedicated Phase 2 email

This plan can begin safely before the detailed email, but these items must be
recorded immediately when it arrives:

- exact deadline and timezone;
- conversion of the deadline into both the organizer's timezone and the
  workstation's timezone; the workstation is configured for Europe/Paris while
  the event is in Tunis, so the two clocks must never be assumed identical;
- submission form or platform;
- whether each deliverable is uploaded separately or through one archive;
- maximum file size per deliverable and total upload size;
- accepted video container, codec and resolution;
- expected technical data room format and page limit, if any;
- expected brand kit contents and formats;
- GitHub visibility requirements;
- whether a release, tag or commit hash is requested;
- whether the prototype must be hosted or may be demonstrated locally;
- naming convention imposed by the organizers;
- any new judging subcriteria;
- confirmation or receipt mechanism after submission.

**Rule:** the dedicated email overrides this draft. The plan is updated before
any irreversible packaging or final export.

## 3. Current baseline

| Deliverable | Current state | Main gap | Risk |
| --- | --- | --- | --- |
| End-to-end prototype | Working locally | Final freeze, browser replay, ZIP and evidence capture | Low |
| GitHub repository | Remote configured | No commit; every file is currently untracked | Critical |
| Technical data room | Strong source documents exist | No jury-facing index, consolidated PDF or ZIP | High |
| Brand kit | Visual language exists in the app | No logo pack, guide, thumbnail or ZIP | High |
| Final presentation | Narrative material exists | No `.pptx`, speaker notes or PDF fallback | Critical |
| Two-minute demo video | Demo path is documented | No script, recording, captions or MP4 | Critical |
| Submission manifest | Not officially required yet | No package index, hashes or version reference | High |

Technical baseline already verified:

- local offline web prototype;
- 3 production lines and 10 orders;
- 4-hour simulated stoppage on Line 2;
- Service, Cost and Stability strategies;
- incident-to-approval end-to-end journey;
- 8/8 automated tests passing;
- independent exhaustive verifier passing;
- 17,856 assignment-and-sequence candidates evaluated;
- 10,440 feasible schedules;
- all prototype data explicitly synthetic.

## 4. Execution doctrine

### 4.1 Completeness before polish

The first objective is not to make one artifact excellent. It is to ensure that
all six mandatory deliverables exist, open successfully and refer to the same
product version.

Two passes are used:

1. **Minimum complete pass:** create an acceptable, openable version of every
   mandatory deliverable.
2. **Evidence and polish pass:** improve clarity, visual consistency,
   reproducibility and scoring strength without reopening product scope.

### 4.2 One canonical truth

All deliverables must use the same:

- scenario;
- strategy names;
- metrics;
- AI explanation;
- product limitations;
- logo and colors;
- Git commit or tag;
- claim that all operational results are synthetic.

### 4.3 Product freeze

No new feature is added after the prototype freeze except a blocking defect that
prevents the official demonstration.

Explicitly out of scope:

- new ML or LLM component;
- real ERP, MES, PLC or sensor integration;
- a 3D factory twin;
- authentication or cloud deployment;
- a second complex factory scenario;
- invented industrial data or testimonials;
- speculative pricing or ROI;
- visual effects that do not improve an official deliverable;
- architecture rewrites.

### 4.4 Internal deadline

Once the official deadline `T` is known:

- `T-8h`: all six deliverables must exist in usable form;
- `T-6h`: content and product freeze;
- `T-5h`: final tag and clean-clone verification;
- `T-3h`: final video, exports and packaging;
- `T-2h`: clean-room verification finished;
- `T-90min`: team leader starts the official submission;
- `T-60min`: submission should already be confirmed.

No optional improvement is allowed after `T-3h`.

## 5. Critical path

```text
Official constraints
        ->
Freeze and prove the prototype
        ->
Create the initial clean Git history
        ->
Freeze the visual identity
        ->
Build the data room
        ->
Build and time the presentation
        ->
Run the cross-deliverable consistency audit
        ->
Create the final tag and clean clone
        ->
Record the video on the final tag
        ->
Package, verify, back up and submit
```

The deck depends on the final narrative and the brand foundation. The video
depends on the final tagged prototype, final metrics and visual identity. The
final Git tag depends on the data room, brand sources and repository
documentation. Packaging depends on everything.

## 6. Detailed solo schedule

The clock schedule will be recalculated when the exact deadline arrives. The
following workload is the default execution sequence.

### Work block 0 - Official constraints and manifest - 20 minutes

Actions:

- inspect inbox, spam and promotions;
- copy exact Phase 2 instructions into the submission manifest;
- record deadline, timezone, formats and size limits;
- set alarms for `T-4h`, `T-3h`, `T-2h` and `T-90min`;
- create the final package checklist;
- confirm that Oussama Akir is the submitting team leader.

Exit condition:

- there is one written source of truth for the submission rules.

### Work block 1 - Prototype freeze and evidence lock - 50 minutes

Actions:

- run the automated test suite;
- run the independent exact verifier;
- replay the full browser journey;
- verify nominal state, incident, three strategies, preview, approval, audit and
  reset;
- verify operation without network access;
- confirm every visible number against the canonical metrics;
- capture the final screens needed by the deck and data room;
- create a standalone prototype archive;
- stop feature development.

Exit condition:

- the exact build used for screenshots, deck and video is identified and
  reproducible.

### Work block 2 - Initial GitHub publication - 70 minutes

Actions:

- scan for secrets, personal files and generated temporary artifacts;
- validate `.gitignore`;
- make the README autonomous;
- reconcile stale documentation with the exact verifier and 8/8 tests;
- decide the license explicitly; do not choose one silently;
- create a clean initial commit;
- push to the configured GitHub remote;
- verify access from a private or unauthenticated session;
- test a fresh clone, launch and test sequence.

Exit condition:

- a juror can access, understand, launch and test the repository.

The final immutable tag is not created yet because jury-facing documentation and
brand sources still need to be added.

### Work block 3 - Brand foundation - 45 minutes

Actions:

- freeze the name `CableTwin`;
- freeze the signature `The Waze of the cable factory`;
- create the primary wordmark and compact mark;
- create light, dark and monochrome variants;
- freeze the existing product palette;
- choose standard, portable typography;
- define logo spacing and minimum-size rules;
- prepare the visual assets needed by slides and video.

Exit condition:

- the deck and video can start with a stable logo, palette and type system.

### Work block 4 - Deliverable skeleton checkpoint - 60 minutes

Create immediately:

- data room directory and index;
- deck file with all slide titles;
- video script with timestamps;
- brand guide source;
- submission manifest;
- final packaging directory.

Exit condition:

- every mandatory deliverable has at least a named source artifact and an owner,
  which is always the team leader.

This checkpoint prevents discovering a completely missing deliverable at the end.

### Work block 5 - Technical data room - 120 minutes

Build the jury-facing evidence room described in section 9.

Exit condition:

- indexed sources, PDF and ZIP exist and open successfully.

### Work block 6 - Final presentation - 135 minutes

Build the deck described in section 11.

Exit condition:

- `.pptx` and PDF fallback exist, no overflow is visible, all figures match the
  prototype and a first timed run is below 7 minutes.

### Work block 7 - Complete brand kit - 45 minutes

Actions:

- export SVG and PNG assets;
- finish the short brand guide;
- produce the demo thumbnail;
- verify light and dark variants;
- package the brand ZIP.

Exit condition:

- the brand kit is an independent, complete deliverable rather than a logo
  embedded only inside the deck.

### Work block 8 - Cross-deliverable consistency audit - 75 minutes

Verify:

- scenario and strategy names;
- every metric and percentage;
- AI wording;
- synthetic-data disclosure;
- buyer, user and pilot;
- brand assets;
- Git URL and candidate version;
- no false affiliation;
- no placeholder, TODO or internal note.

Exit condition:

- the repository, data room, brand kit and deck tell one coherent story and are
  ready to be tagged.

### Work block 9 - Final Git tag and clean clone - 75 minutes

Actions:

- add final repository documentation and lightweight brand sources;
- avoid committing oversized video files unless explicitly required;
- run tests again;
- create the final commit;
- push the final branch;
- create the immutable submission tag;
- clone the tagged version into a clean directory;
- launch the prototype and run all tests from that clone;
- export an archive of the tagged source.

Exit condition:

- commit hash, tag and archive reproduce the prototype that will be recorded.

### Work block 10 - Record and finish the demo video - 105 minutes

Actions:

- prepare a clean 1080p desktop;
- disable notifications and personal overlays;
- record the prototype from the final tagged version;
- edit to a target duration of 1:50 to 1:55;
- add captions;
- export MP4 and SRT;
- play the downloaded local file from beginning to end.

Exit condition:

- the final video is under 2:00 and proves the real end-to-end product.

### Work block 11 - Packaging, backups and submission QA - 90 minutes

Actions:

- assemble the official folder;
- open every artifact from that folder;
- verify all file names and sizes;
- calculate SHA-256 hashes;
- copy to a second local location, USB storage and cloud backup;
- verify GitHub permissions one last time;
- submit at `T-90min`;
- capture the confirmation page and confirmation email.

Exit condition:

- all six deliverables are confirmed received before the deadline.

## 7. Priority system

### P0 - Elimination blockers

- all six deliverables exist;
- all required formats are correct;
- files open successfully;
- GitHub is accessible;
- video is within the duration limit;
- prototype works;
- team leader submits before the deadline.

### P1 - Score drivers

- business process is concrete and visible;
- impact is measurable and consistent;
- symbolic AI is central and defensible;
- exact scenario validation is reproducible;
- prototype proves the full journey;
- buyer, pilot and commercial gate are credible;
- deck and video are immediately understandable.

### P2 - Optional polish

- additional logo variants;
- decorative transitions;
- extra diagrams;
- additional test scenarios;
- extended market research;
- cinematic video editing;
- supplementary appendices.

P2 work starts only when all P0 and P1 conditions are green.

## 8. Canonical facts that must never drift

| Fact | Canonical value |
| --- | --- |
| Team | SUPCOM - Oussama Akir - solo participant |
| Sector | Industry |
| Theme | Production Planning & Supply Chain Optimization |
| Factory | Fictional Tunisian cable factory |
| Dataset | Fully synthetic |
| Production lines | 3 |
| Orders | 10 |
| Incident | Line 2 stops at 10:00 for 4 hours |
| Strategies | Service, Cost and Stability |
| Stability | 620 min delay, 7/10 on time, 180 min overtime, 0 moves |
| Service | 140 min delay, 8/10 on time, 30 min overtime, 3 moves |
| Cost | 170 min delay, 8/10 on time, 60 min overtime, 2 moves |
| Shift-end output | 216 km for Service/Cost vs 188 km for Stability |
| Throughput difference | +14.9% |
| Exact benchmark | 17,856 candidates; 10,440 feasible schedules |
| Automated checks | 8/8 passing |
| Decision authority | Human production manager |
| Deployment boundary | Offline/read-only first; no machine control |
| Company affiliation | None |

The DT cost figures may be shown only when labelled as outputs of an illustrative
synthetic comparison model, never as factory savings or ROI.

## 9. Technical data room blueprint

The data room must allow a juror to find any proof in less than 30 seconds.

Recommended structure:

```text
docs/data-room/
  INDEX.md
  01-problem-process-and-scope.md
  02-product-and-user-journey.md
  03-ai-planning-and-explainability.md
  04-data-model-constraints-and-assumptions.md
  05-validation-results-and-reproducibility.md
  06-business-case-pilot-and-viability.md
  07-risks-security-responsible-ai-and-limits.md
  08-architecture-and-deployment.md
  evidence/
    screenshots/
    test-results/
    benchmark-results/
```

### Required data room content

#### Problem and process

- precise incident-driven rescheduling process;
- production manager decision;
- cable-factory context;
- current unknowns that require pilot validation.

#### Product

- input, incident, analysis, alternatives, preview, approval and audit;
- boundaries: no prediction, no autonomous control, no ERP replacement.

#### Core AI

- symbolic constraint-based planning;
- hard constraints versus soft objectives;
- three policies and their business meaning;
- independent exact scenario verifier;
- bounded nature of the exact claim;
- human approval.

#### Data and assumptions

- data dictionary;
- line and order fields;
- synthetic scenario;
- cost coefficients and their status;
- missing industrial constraints;
- proposed pilot data contract.

#### Validation

- 8/8 tests;
- exact benchmark results;
- metric formulas;
- deterministic reset;
- browser verification;
- known limitations.

#### Business

- user, buyer and beneficiaries;
- measurable value;
- 4-to-6-week read-only pilot;
- success gates;
- commercial hypothesis without invented price.

#### Risks and responsible deployment

- wrong or incomplete constraints;
- uncertain incident duration;
- production data confidentiality;
- planner adoption;
- integration risks;
- recommendation misuse;
- mitigation and human authority.

### Data room outputs

- indexed Markdown sources;
- one jury-facing PDF;
- one ZIP containing sources and evidence;
- all links relative and working;
- no duplicated or contradictory legacy claim.

## 10. Brand kit blueprint

Minimum viable brand kit:

```text
brand/
  logo/
    cabletwin-logo-light.svg
    cabletwin-logo-dark.svg
    cabletwin-logo-monochrome.svg
    cabletwin-mark.svg
    cabletwin-logo.png
    cabletwin-mark.png
  social/
    cabletwin-demo-thumbnail.png
  CableTwin_Brand_Guide.pdf
  README.md
```

The guide should cover:

- brand idea;
- primary logo and mark;
- safe spacing;
- minimum size;
- light and dark backgrounds;
- palette with HEX values;
- typography;
- one slide example;
- one thumbnail example;
- correct and incorrect uses;
- no visual association with a real cable manufacturer.

The existing interface palette is the baseline:

- deep green `#092925`;
- teal `#0F766E`;
- mint `#C9F36B`;
- cream `#F5F4ED`;
- white `#FFFFFF`;
- orange accent `#E9763B`.

## 11. Final presentation blueprint

Recommended format:

- 16:9;
- standard portable fonts;
- 8 to 9 main slides;
- one message per slide;
- minimal text;
- large metrics;
- screenshots from the frozen prototype;
- speaker notes;
- PDF fallback.

### Proposed 9-slide narrative

| Slide | Message | Target time |
| ---: | --- | ---: |
| 1 | A line stops; the production schedule becomes wrong immediately | 0:00-0:35 |
| 2 | The production manager must protect orders under real constraints | 0:35-1:10 |
| 3 | CableTwin is the Waze of the cable factory | 1:10-1:40 |
| 4 | One journey: incident, impact, three routes, human approval | 1:40-2:00 |
| 5 | Live end-to-end demonstration | 2:00-3:30 |
| 6 | The AI core: symbolic planning plus bounded exact validation | 3:30-4:20 |
| 7 | Measured synthetic impact and pilot measurement protocol | 4:20-5:05 |
| 8 | Buyer, read-only pilot, differentiation and responsible limits | 5:05-6:10 |
| 9 | Why CableTwin should advance and what Phase 2 proves | 6:10-6:45 |

Reserve approximately 15 seconds for timing variation.

### Presentation acceptance criteria

- opens in PowerPoint on another machine;
- no missing fonts;
- no cropped or overflowing element;
- all metrics match the tagged build;
- synthetic results are visibly labelled;
- demo transition is rehearsed;
- timed run is below 7:00;
- PDF export is visually identical enough to serve as fallback.

## 12. Two-minute demo video blueprint

Target duration: 1:50 to 1:55.

| Time | Visual | Spoken message |
| --- | --- | --- |
| 0:00-0:10 | Title and nominal factory | A line stoppage can invalidate the production plan immediately |
| 0:10-0:25 | 3 lines and 10 on-time orders | This is the fixed synthetic cable-factory scenario |
| 0:25-0:40 | Trigger Line 2 stoppage | Three orders become threatened; projected delay reaches 620 minutes |
| 0:40-1:05 | Three strategy cards | CableTwin compares Service, Cost and Stability on the same incident |
| 1:05-1:30 | Service and Cost metrics plus Gantt | The manager sees delay, overtime, movements and output before acting |
| 1:30-1:45 | Approval and audit | The decision stays human and is recorded |
| 1:45-1:55 | Final impact and pilot path | From 620 to 140 minutes in the simulation; next step is a read-only pilot |

### Video acceptance criteria

- actual working product is visible;
- duration does not exceed 2:00;
- 1080p and readable at normal playback size;
- voice is clear;
- captions are embedded or supplied as SRT;
- no personal notification, email, token or unrelated tab appears;
- no external network is required;
- local MP4 playback is tested from beginning to end;
- displayed metrics match the final tag.

## 13. Complete GitHub repository acceptance criteria

The repository is complete only if:

- it is accessible to the jury;
- no secret or private attachment is committed;
- the README explains problem, solution, AI, architecture, launch, demo, tests,
  limitations and data status;
- launch requires minimal steps;
- tests and exact benchmark are documented;
- all relative links work;
- no stale 7/7 claim remains;
- the data room index is linked;
- license or usage rights are explicit;
- a final commit hash and immutable tag exist;
- a fresh clone launches and passes all checks;
- the submission manifest contains the final URL and tag.

## 14. Working prototype acceptance criteria

The prototype is ready only if:

- it launches locally with documented prerequisites;
- it works without Internet access;
- the nominal plan loads correctly;
- Line 2 can be stopped for the canonical four hours;
- the impact is calculated;
- Service, Cost and Stability remain distinct;
- the revised Gantt is visible;
- human approval is required;
- the audit event is visible;
- reset restores the exact initial state;
- synthetic-data labels are visible;
- 8/8 automated tests pass;
- the exact benchmark passes;
- the 90-second demo is repeatable three times in a row;
- a standalone ZIP and fallback video exist.

## 15. Scoring alignment

| Criterion | Primary proof | Supporting artifact |
| --- | --- | --- |
| Business process and impact - 25% | Line-stoppage rescheduling and measured trade-offs | Prototype, deck, data room |
| Core AI - 20% | Constraint planning, three objectives, exact bounded verifier | Prototype, repository, data room |
| Working prototype - 20% | Incident-to-approval flow, offline reset, tests | Live build, video, GitHub |
| Business viability - 20% | Buyer, read-only pilot, data contract and commercial gate | Deck, data room |
| Pitch and clarity - 15% | Waze analogy, 90-second journey and consistent metrics | PPTX, video, brand kit |

No artifact should attempt to claim a jury score. Each artifact supplies evidence
and lets the jury assign the score.

## 16. Risk register

| Risk | Probability | Impact | Mitigation |
| --- | --- | --- | --- |
| Dedicated email arrives late | Medium | Critical | Work from known requirements; update only packaging details when it arrives |
| Exact deadline is earlier than assumed | Medium | Critical | Use relative milestones and compression mode |
| GitHub remote or permissions fail | Medium | Critical | Push early; verify anonymously; keep tagged ZIP fallback |
| One mandatory artifact remains missing | Medium | Critical | Skeleton checkpoint before polishing |
| Product changes invalidate screenshots/video | Medium | High | Freeze product before deck and recording |
| Metrics drift between files | Medium | High | Canonical-facts table and final consistency audit |
| Video exceeds 2:00 or cannot upload | Medium | High | Target 1:50-1:55; keep compressed fallback |
| PPTX renders differently | Medium | High | Standard fonts and PDF backup |
| Data room contains stale claims | High | High | Reconcile legacy docs before export |
| Solo fatigue causes submission error | High | Critical | Fixed blocks, breaks, minimum sleep, T-90 submission |
| No industrial validation exists | High | Medium | Label hypotheses; propose shadow pilot; never invent traction |
| Last-minute feature request appears | Medium | High | Accept only if required by official email or fixes a blocker |

## 17. Compression mode

Activate compression mode if the usable execution window is below 10 hours.

Cut immediately:

- decorative slide animations;
- extra brand mockups;
- extended appendices;
- additional product features;
- new market research;
- second video take unless the first is unusable;
- nonessential repository refactoring.

Minimum deliverable versions:

- **Brand kit:** logo variants, palette, typography and one-page guide.
- **Deck:** 8 slides, speaker notes and PDF.
- **Data room:** index plus the five essential evidence documents.
- **Video:** one clean direct recording, trimmed to 1:50-1:55 with captions.
- **GitHub:** clean README, source, tests, data room link, final commit and tag.
- **Prototype:** current frozen flow with no enhancements.

Completeness and submission safety remain more important than polish.

## 18. Final package

Provisional package structure:

```text
CableTwin_SUPCOM_Phase2_2026-07-18/
  00_SUBMISSION-MANIFEST.pdf
  01_CableTwin_SUPCOM_Final.pptx
  01_CableTwin_SUPCOM_Final.pdf
  02_CableTwin_SUPCOM_Technical_Data_Room.pdf
  02_CableTwin_SUPCOM_Technical_Data_Room.zip
  03_CableTwin_SUPCOM_Demo_2min.mp4
  03_CableTwin_SUPCOM_Demo_2min.srt
  04_CableTwin_SUPCOM_Brand_Kit.zip
  05_CableTwin_SUPCOM_Prototype.zip
  06_GitHub_URL.txt
  SHA256SUMS.txt
```

The dedicated email may require different names or separate uploads.

## 19. Submission protocol

1. Check inbox, spam and promotions every 30 minutes.
2. Verify the official form from the team leader account.
3. Upload at `T-90min`, not at the deadline.
4. Open uploaded links where possible.
5. Confirm file names and sizes one final time.
6. Submit only from the team leader account.
7. Capture the confirmation screen with timestamp.
8. Save the confirmation email.
9. Store the submitted package and hashes unchanged.
10. Do not resume product development until receipt is confirmed.

## 20. Phase 2 go/no-go

Phase 2 is **GO** only when:

- all six mandatory deliverables exist;
- all six open successfully;
- the prototype and video use the same final build;
- GitHub is accessible and reproducible;
- all numbers match the canonical-facts table;
- all synthetic claims are labelled;
- the final package is backed up;
- the team leader has submitted;
- confirmation has been captured before the deadline.

A strong prototype does not compensate for one missing file.

## 21. Questions for adversarial review before execution

The reviewer should challenge this plan, not redesign CableTwin.

Please answer:

1. What is the single most dangerous execution flaw in this plan?
2. Which dependency or hidden task is missing?
3. Which time estimate is least realistic for a solo participant?
4. What should be cut first if the deadline is earlier than expected?
5. Does any deliverable fail to meet the official wording?
6. Is the order of GitHub, brand, data room, deck and video optimal?
7. What is the one change that most reduces elimination risk?
8. What is the one change that most improves the official score?

Requested review format:

- **Top 1 fatal risk**
- **Top 1 sequencing change**
- **Top 1 missing acceptance criterion**
- **Top 1 recommended cut**

Do not propose new product features unless an official requirement cannot be met
without them.
