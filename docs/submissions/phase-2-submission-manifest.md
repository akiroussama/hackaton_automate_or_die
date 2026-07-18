# Phase 2 submission manifest — single source of truth

> Updated 2026-07-18 ~15:20 local. The Day-2 organizer email and the live
> submission form (signed-in view pasted by the team leader) now define every
> constraint. All former "PENDING ORGANIZER EMAIL" placeholders are resolved.

## Official constraints — confirmed 18 July 2026

- **Deadline: TODAY, 18 July 2026, 21:00 ("9 PM").** The organizers did not
  state a timezone; the plan beats every plausible reading by requiring the
  submission to be **CONFIRMED by 19:30 local (Tunis)**.
- **Platform:** Google Form "Hackathon Final Deliverables Submission Form"
  <https://forms.gle/iyuxPCA7vkYUczYQA> — **requires Google sign-in**
  (verified 18/07 ~15:00: anonymous fetch redirects to accounts.google.com).
  Only the team leader submits, signed in as `akir.oussama@gmail.com`.
  The form records the account name/e-mail/photo when uploading files.
- **Structure: mixed uploads + links.** Two REQUIRED direct uploads
  (1 file each, max 100 MB): *Upload Technical Documentation (PDF)* and
  *Upload Architecture Diagram*. Every other deliverable is a link field.
- **Every linked file must be a SwissTransfer link** — active, public,
  no password and no special permission (organizer email).
- **Late submissions may not be considered.** Technical issues: contact the
  organizing committee as soon as possible (organizer email).
- Video/data-room/brand format limits: none added beyond the known rules
  (video ≤ 2:00 — the frozen MP4 is 1:57.9).
- Naming convention: none imposed — the frozen numbered names stay.
- Confirmation mechanism: the form's response receipt; the runbook requires a
  screenshot of the confirmation screen.

## Exact form fields (pasted by the team leader, 18 July ~15:02)

| # | Field | Kind | Required |
|--:|-------|------|----------|
| 1 | Team Name | short answer | yes |
| 2 | Team Leader Name | short answer | yes |
| 3 | Sector — Insurance / Pharma / Industry | single choice | yes |
| 4 | Link to your final presentation | link (text) | yes |
| 5 | Upload Technical Documentation (PDF) | file upload, 1 file, ≤ 100 MB | yes |
| 6 | Upload Architecture Diagram | file upload, 1 file, ≤ 100 MB | yes |
| 7 | Video Link (Demo) | link (text) | yes |
| 8 | GitHub Repository URL | link (text) | yes |
| 9 | Link to your branding materials | link (text) | no |
| 10 | Provide any additional resources if applicable | text | no |

Notes vs the organizer email: the email called the data room *optional*, but
the form REQUIRES the Technical Documentation PDF; the email never mentioned
the REQUIRED architecture diagram. Both are covered below.

## Field mapping (submission source = frozen, hash-verified `packaging/`)

| Field | Value / file |
|-------|--------------|
| Team Name | `SUPCOM` |
| Team Leader Name | `Oussama Akir` |
| Sector | `Industry` |
| Link to your final presentation | SwissTransfer **T1** = `packaging/01_CableTwin_SUPCOM_Final.pptx` + `packaging/01_CableTwin_SUPCOM_Final.pdf` |
| Upload Technical Documentation (PDF) | direct upload: `packaging/02_CableTwin_SUPCOM_Technical_Data_Room.pdf` (81 KB) |
| Upload Architecture Diagram | direct upload: `docs/submissions/assets/CableTwin_SUPCOM_Architecture_Diagram.png` (3360×2100, ~546 KB); PDF twin ready if the field refuses PNG |
| Video Link (Demo) | SwissTransfer **T2** = `packaging/03_CableTwin_SUPCOM_Demo_2min.mp4` (1:57.9) + `packaging/03_CableTwin_SUPCOM_Demo_2min.srt` |
| GitHub Repository URL | <https://github.com/akiroussama/hackaton_automate_or_die> |
| Link to your branding materials | SwissTransfer **T3** = `packaging/04_CableTwin_SUPCOM_Brand_Kit.zip` |
| Provide any additional resources | live build <https://hackaton-automate-or-die.vercel.app/> + SwissTransfer **T4** = `packaging/02_CableTwin_SUPCOM_Technical_Data_Room.zip` + `packaging/05_CableTwin_SUPCOM_Prototype.zip` + `packaging/SHA256SUMS.txt`, plus the tag/verify text block (see runbook §5) |

Exact SwissTransfer settings and the paste-ready text blocks live in
[`phase-2-submission-runbook.md`](phase-2-submission-runbook.md).

## Architecture-diagram asset (new, 18 July 2026)

- The organizer email never mentioned it; the live form REQUIRES it.
- Files (all in `docs/submissions/assets/`):
  `CableTwin_SUPCOM_Architecture_Diagram.svg` (source),
  `.png` (the upload file), `.pdf` (fallback format).
- Content derived verbatim from
  `docs/data-room/08-architecture-and-deployment.md` and the canonical facts
  table (§6 of the coordination protocol): 3 lines / 10 orders, Line-2 stop
  10:00→14:00 (4 h), engine pipeline, independent exact verifier
  17,856 → 10,440 → 3 unique optima, 9/9 checks, offline/read-only deployment
  boundary, human-in-command. **No new claim, no new metric.**
- NOT part of the frozen nine-file package: `packaging/` contents,
  `packaging/SHA256SUMS.txt` and both immutable tags are untouched.

## Final references (re-verified 18 July 2026 15:03 local)

- Public GitHub URL: <https://github.com/akiroussama/hackaton_automate_or_die>
  (anonymous access re-verified today: public, README and tags visible)
- Public live build: <https://hackaton-automate-or-die.vercel.app/>
  (re-verified today: full app content served)
- Submission tag: **`phase2-submission-final`** (annotated, immutable) —
  on origin: tag object `2b0d545…`, peeled commit `08f25a1…`
- Prototype-freeze tag unchanged: `phase2-final` → `3c9af9e`
- Package integrity: all nine `packaging/` files re-hashed today — every
  SHA-256 matches `packaging/SHA256SUMS.txt`
- Demo video: 1:57.9, 1920×1080 H.264 + AAC, English narration + SRT
- Launch and verify (Node.js ≥ 22, no other dependency):

  ```bash
  npm run check            # 9/9 automated checks
  npm run benchmark:exact  # 17,856 candidates -> 10,440 feasible, optima confirmed
  npm run dev              # offline prototype at http://127.0.0.1:4173/
  ```

- Team leader and sole submitter: Oussama Akir (SUPCOM)

## Timing plan (deadline tonight 21:00 — earliest reading beaten)

| Time (local) | Action |
|---|---|
| now → 15:45 | Team leader runs SwissTransfer uploads T1–T4 (runbook §3) |
| 15:45 → 16:00 | Every link verified in a signed-out/private window (runbook §4) |
| ≤ 16:30 | Codex cross-review verdict on manifest + runbook + diagram (hard timeout 16:30 — past it, proceed as written) |
| ≤ 17:00 | Form filled, uploads attached, **SUBMITTED**; confirmation screenshot saved |
| 19:30 | Hard ceiling for a CONFIRMED submission |
| ~20:00 | Final anonymous re-verification of every submitted link |
