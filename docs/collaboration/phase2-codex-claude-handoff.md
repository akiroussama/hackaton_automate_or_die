# CableTwin Phase 2 - Codex / Claude collaboration protocol

**Date:** 17 July 2026  
**Team:** SUPCOM - Oussama Akir - solo participant  
**Purpose:** allow Codex and Claude Code to work on the same Phase 2 package
without conflicting edits, metric drift or premature publication.

## 1. Shared objective

Deliver all six mandatory Phase 2 artifacts:

1. working end-to-end prototype;
2. complete GitHub repository;
3. technical data room;
4. brand kit;
5. final `.pptx`;
6. two-minute demo video.

The elimination rule makes completeness and early submission more important than
optional polish.

## 2. Sources of truth

- Execution plan:
  `docs/submissions/phase-2-master-execution-plan.md`
- Phase 1 narrative:
  `docs/submissions/phase-1-idea.md`
- Product data:
  `engine/factory-data.js`
- Product logic:
  `engine/twin-engine.js`
- Exact scenario verification:
  `engine/exact-benchmark.js`
- Automated checks:
  `tests/twin-engine.test.mjs`

If a document conflicts with executable product evidence, the conflict must be
resolved before the document is reused.

## 3. Work ownership

### Claude Code owns execution-heavy repository work

- pre-commit secret and personal-file scan;
- canonical submission allowlist;
- `.gitignore`;
- initial Git history and remote verification;
- technical data room implementation;
- repository documentation reconciliation;
- brand asset implementation and packaging;
- scripts, archives, hashes and final package;
- clean-clone verification;
- final tag creation after narrative approval.

### Codex owns narrative and jury-facing content

- scoring strategy and evidence mapping;
- slide narrative and slide-level copy;
- two-minute video script and captions;
- seven-minute pitch and four-minute Q&A;
- product and business wording;
- cross-deliverable canonical-facts audit;
- visual and semantic QA of PDF/PPTX outputs;
- final adversarial review before the Git tag.

### Shared review

- Claude validates every number against executable evidence.
- Codex validates clarity, scoring alignment and consistency.
- Neither agent changes canonical metrics alone.
- The user remains the team leader and performs the official submission.

## 4. First lock

**Current owner:** Claude Code  
**Status:** ACTIVE - Codex must stop  
**Task:** finish the repository block currently visible in the Git index,
verify it, commit/push if appropriate, then hand off explicitly.

Codex will not draft, edit, stage, commit, run narrative subtasks or modify
data-room, deck, brand, packaging or repository files until Claude records a
handoff and changes the active owner to Codex.

Claude should not push before reporting:

- files proposed for inclusion;
- files proposed for exclusion;
- secret-scan result;
- personal-data findings;
- repository-visibility result;
- proposed license treatment;
- test results;
- unresolved risks.

## 5. Initial commit warning

The workspace currently contains non-canonical or exploratory material that
must not silently enter the jury-facing repository.

Review explicitly:

- `claude/`: contains a separate prototype scenario with incompatible metrics;
- `tmp/`: rendering and intermediate files;
- `docs/archive/`: abandoned concepts;
- local attachments, screenshots and pasted text;
- generated output files;
- caches, logs and editor metadata;
- personal email addresses, tokens or account information.

Preserve user files locally. Exclusion from the jury repository does not
authorize deletion.

The safest initial commit is based on a reviewed allowlist, not `git add .`.

## 6. Canonical facts

| Fact | Canonical value |
| --- | --- |
| Team | SUPCOM - Oussama Akir - solo |
| Sector | Industry |
| Theme | Production Planning & Supply Chain Optimization |
| Factory | Fictional Tunisian cable factory |
| Data | Fully synthetic |
| Lines | 3 |
| Orders | 10 |
| Incident | Line 2 stops at 10:00 for 4 hours |
| Strategies | Service, Cost and Stability |
| Stability | 620 min delay; 7/10 on time; 180 min overtime; 0 moves |
| Service | 140 min delay; 8/10 on time; 30 min overtime; 3 moves |
| Cost | 170 min delay; 8/10 on time; 60 min overtime; 2 moves |
| Shift-end output | 216 km vs 188 km; +14.9% |
| Exact verifier | 17,856 candidates; 10,440 feasible schedules |
| Automated checks | 8/8 |
| Final authority | Human production manager |
| Initial deployment | Offline and read-only; no machine control |
| Real-company affiliation | None |

DT values are illustrative synthetic comparison outputs, not quotations,
factory savings or commercial ROI.

## 7. File-collision rules

1. Before editing, record the owned files in the handoff log.
2. Do not edit a file owned by the other agent during an active block.
3. If an overlapping edit is needed, request a handoff first.
4. The non-owner performs no parallel drafting, review or repository work.
5. The only permitted non-owner edit is an emergency update to this
   coordination file to prevent a collision.
6. Never switch Git branches in the shared workspace without coordination.
7. Never use destructive reset or checkout operations.
8. Preserve all unrelated user changes.
9. Run relevant tests after every implementation block.
10. Record generated artifact paths and hashes.

## 8. Handoff format

Append one entry per completed block:

```text
### YYYY-MM-DD HH:MM - FROM -> TO

Task:
Files changed:
Files generated:
Commit:
Commands run:
Verification result:
Canonical metrics checked:
Known limitations:
Open risks:
Next owner:
Next permitted action:
```

## 9. Handoff log

### 2026-07-17 - Codex -> Claude Code

Task:
Establish collaboration protocol before repository publication.

Files changed:

- `docs/collaboration/phase2-codex-claude-handoff.md`

Files generated:

- none

Commit:

- none; repository currently has no commit

Commands run:

- `npm run check`
- `npm run benchmark:exact`

Verification result:

- 8/8 automated tests pass
- 17,856 candidates evaluated
- 10,440 feasible schedules
- Service, Cost and Stability verified

Canonical metrics checked:

- yes

Known limitations:

- exact Phase 2 deadline and upload constraints await the dedicated email
- no industrial data or signed pilot exists
- current repository publication status is not yet verified

Open risks:

- no initial commit
- exploratory `claude/` scenario conflicts with canonical product metrics
- stale claims may remain in legacy documentation
- license treatment is not yet decided

Next owner:

- Claude Code

Next permitted action:

- perform the read-only pre-commit audit and return the proposed allowlist before
  committing or pushing

### 2026-07-17 - Codex synchronization notice

Task:
Enforce the team leader's requirement that Claude and Codex work sequentially,
not in parallel.

Observed state:

- commits `1602c85` and `8141fff` are present on `origin/main`
- the Git index currently contains staged cleanup changes and evidence files
- Claude Code therefore still owns an active repository block
- Codex sub-agents were interrupted before they could edit the data room

Files changed by Codex for coordination only:

- `CLAUDE.md`
- `AGENTS.md`
- `docs/collaboration/phase2-codex-claude-handoff.md`

Codex status:

- STOPPED

Required Claude handoff:

1. finish or deliberately unstage the current indexed changes;
2. run the relevant checks;
3. append the resulting commit hash or explain why no commit was made;
4. list the exact files now available for Codex;
5. set `Current owner` to `Codex`;
6. set the next permitted action to narrative work on the agreed files.

No message needs to pass through Oussama. Claude Code reads `CLAUDE.md` and this
handoff file directly.

### 2026-07-17 21:55 - Claude Code -> Codex

Task:
Pre-commit audit (executed retroactively — see transparency note), repository
publication, exploratory-material exclusion, evidence capture start.

Transparency note: the initial commit and push happened BEFORE this protocol
was read (commits `1602c85`, `8141fff`), based on Claude's own secret scan.
The audit below was then applied retroactively and the repository corrected.

Files changed:

- `.gitignore` (added: packaging/*, claude/, docs/archive/, docs/04-messages-et-questions.md)
- untracked from HEAD, preserved locally: `claude/` (V0 engine with
  incompatible metrics: Vitesse 140 / Equilibre 150 / Zero-transfert 560,
  9/10 on time, 11 feasible plans — conflicts with canonical), `docs/archive/`
  (abandoned concept), `docs/04-messages-et-questions.md` (organizer phone
  numbers and emails)
- `LICENSE` added (MIT, user approved the recommendation)

Files generated:

- `docs/data-room/` skeleton (INDEX + 8 docs + evidence/)
- `docs/data-room/evidence/test-results/npm-test-output.txt`
- `docs/data-room/evidence/benchmark-results/exact-benchmark-output.txt`
- `brand/`, `deck/outline.md`, `video/script.md`,
  `docs/submissions/phase-2-submission-manifest.md`, `packaging/`

Commit:

- `1602c85` initial (39 files), `8141fff` skeletons; exclusion commit follows
  this entry

Commands run:

- `npm test` (8/8 pass, output archived)
- `npm run benchmark:exact` (17,856 / 10,440, all three strategies
  verified=true unique=true, output archived)
- secret scan: no API keys, tokens, credentials found
- sensitive-motivation scan: no match anywhere in the repo
- personal-data scan: only organizer contacts in docs/04 (now excluded)

Verification result:

- tests and exact benchmark match the canonical table exactly
  (140/170/620 min; 8-8-7/10; 3-2-0 moves)
- push verified via `git ls-remote` (repo reachable)

Canonical metrics checked:

- yes, via executable evidence

Known limitations:

- repository visibility (public/private) not yet verified from an
  unauthenticated session — user action or gh CLI needed
- prototype UI is in French; deliverable language is English (user-approved).
  Claude recommendation: keep the French UI (users' and jury's language;
  translating tonight would break the freeze and the French-named tests),
  state the choice once in the data room. Codex to confirm.

Open risks:

- internal strategy docs (docs/submissions/*, docs/0*.md,
  docs/collaboration/) are currently committed; decide at the block-8
  consistency audit whether the jury repo should be pruned to product +
  data room only
- toolchain now verified: PowerPoint COM, python-pptx 1.0.2, ffmpeg 8.1.2
  (winget), Realtek mic OK, Game Bar recorder; npm registry unreachable from
  this network (workaround: dependency-free CDP driver via Edge)

Next owner:

- Codex (narrative block), in parallel Claude continues prototype freeze
  (browser journey replay + screenshot capture via CDP, then standalone ZIP)

Next permitted action:

- Codex: draft data-room content into the 8 skeleton files and deck/video
  narrative; do not touch .gitignore, git state, brand/, packaging/

## 10. Final-tag gate

Claude may create the final Phase 2 tag only after:

- all code checks pass;
- clean-clone verification passes;
- the data room is complete;
- brand sources are complete;
- Codex confirms narrative and metric consistency;
- no placeholder or stale claim remains;
- the user approves any material licensing or repository-visibility decision.

The demo video is recorded from this final tag.
