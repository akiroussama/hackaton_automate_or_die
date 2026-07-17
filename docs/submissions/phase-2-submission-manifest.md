# Phase 2 submission manifest — single source of truth

> The dedicated organizer email overrides everything in this file the moment
> it arrives.

## Official constraints — PENDING DEDICATED ORGANIZER EMAIL - DO NOT ASSUME

- Exact deadline + timezone (convert Tunis vs Europe/Paris): PENDING DEDICATED ORGANIZER EMAIL - DO NOT ASSUME
- Submission platform / form: PENDING DEDICATED ORGANIZER EMAIL - DO NOT ASSUME
- One archive or separate uploads: PENDING DEDICATED ORGANIZER EMAIL - DO NOT ASSUME
- Max file sizes: PENDING DEDICATED ORGANIZER EMAIL - DO NOT ASSUME
- Video container/codec/resolution constraints: PENDING DEDICATED ORGANIZER EMAIL - DO NOT ASSUME
- Data room format / page limit: PENDING DEDICATED ORGANIZER EMAIL - DO NOT ASSUME
- Brand kit expected contents: PENDING DEDICATED ORGANIZER EMAIL - DO NOT ASSUME
- GitHub visibility requirement: PENDING DEDICATED ORGANIZER EMAIL - DO NOT ASSUME (repository is already public)
- Release/tag/commit hash requested: PENDING DEDICATED ORGANIZER EMAIL - DO NOT ASSUME (immutable tag ready)
- Prototype hosted or local: PENDING DEDICATED ORGANIZER EMAIL - DO NOT ASSUME (local offline build ready)
- Naming convention: PENDING DEDICATED ORGANIZER EMAIL - DO NOT ASSUME (numbered names ready to rename)
- Confirmation mechanism: PENDING DEDICATED ORGANIZER EMAIL - DO NOT ASSUME

## Final references (verified)

- Public GitHub URL: <https://github.com/akiroussama/hackaton_automate_or_die>
  (anonymous access verified: HTTP 200, `visibility: public`)
- Submission tag: **`phase2-submission-final`** (annotated, immutable;
  dereference with `git rev-parse phase2-submission-final^{commit}`)
- Prototype-freeze tag kept unchanged: `phase2-final` -> `3c9af9e`
- Launch and verify (Node.js >= 22, no other dependency):

  ```bash
  npm run check            # 9/9 automated checks
  npm run benchmark:exact  # 17,856 candidates -> 10,440 feasible, optima confirmed
  npm run dev              # offline prototype at http://127.0.0.1:4173/
  ```

- Package: `packaging/` — six numbered deliverables + `06_GitHub_URL.txt`
- Integrity: `packaging/SHA256SUMS.txt` (SHA-256 of every packaged file)
- Demo video: 1:57.9, 1920x1080 H.264 + AAC, English narration + SRT
- Team leader and sole submitter: Oussama Akir (SUPCOM)

## Alarms to set once the official deadline T is known

T-4h, T-3h, T-2h, T-90min (submission starts), T-60min (must be confirmed)
