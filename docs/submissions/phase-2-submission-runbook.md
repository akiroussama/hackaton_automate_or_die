# Phase 2 submission runbook — SwissTransfer + Google Form

**Operator: Oussama Akir (team leader, sole submitter).**
Goal: submission CONFIRMED by **19:30 local** (deadline "9 PM" tonight —
this beats every timezone reading). Everything uploaded comes from the
frozen, hash-verified `packaging/` folder plus the architecture-diagram
asset. **Never edit any of those files.**

## 1. Hard rules

- Files shared by link → **SwissTransfer only** (organizer rule), link mode
  (not e-mail mode), **no password**, validity **30 days**, download limit at
  the **maximum** the site offers.
- Verify EVERY link in a signed-out/private window before it goes in the form.
- The two form uploads (Technical Documentation PDF, Architecture Diagram)
  are direct file uploads from disk — no SwissTransfer for those two.
- If anything technical blocks a required field, e-mail the organizing
  committee immediately (their instruction) — before 21:00, not after.

## 2. Pre-verified state (Claude, 18 July 15:03 local)

- All nine `packaging/` SHA-256 hashes match `packaging/SHA256SUMS.txt`.
- Both immutable tags present on origin (`phase2-final` → `3c9af9e`,
  `phase2-submission-final` → `08f25a1`).
- GitHub repo publicly readable without login.
- <https://hackaton-automate-or-die.vercel.app/> serves the full app.
- Architecture diagram rendered and visually QA'd (3360×2100 PNG, 546 KB).

Re-run anytime: `npm run check` (9/9) and the hash loop in
`docs/submissions/phase-2-submission-manifest.md`.

## 3. SwissTransfer uploads (four transfers)

On <https://www.swisstransfer.com>: add the files → choose **Link** mode →
settings (validity 30 days, no password, max downloads) → start → copy the
link into the table below. Put the transfer title in the message field so the
jury sees what it opened.

| Transfer | Title to paste | Files (from `packaging/` unless stated) |
|---|---|---|
| **T1** | `CableTwin — SUPCOM — Final Presentation` | `01_CableTwin_SUPCOM_Final.pptx`, `01_CableTwin_SUPCOM_Final.pdf` |
| **T2** | `CableTwin — SUPCOM — Demo video (1:57.9)` | `03_CableTwin_SUPCOM_Demo_2min.mp4`, `03_CableTwin_SUPCOM_Demo_2min.srt` |
| **T3** | `CableTwin — SUPCOM — Brand kit` | `04_CableTwin_SUPCOM_Brand_Kit.zip` |
| **T4** | `CableTwin — SUPCOM — Additional resources` | `02_CableTwin_SUPCOM_Technical_Data_Room.zip`, `05_CableTwin_SUPCOM_Prototype.zip`, `SHA256SUMS.txt` |

Link record (fill in as you go):

```text
T1 (presentation): ................................................
T2 (video):        ................................................
T3 (brand):        ................................................
T4 (resources):    ................................................
```

## 4. Link verification — mandatory before the form

For each of T1–T4, in a **private/incognito window** (best: also once on the
phone over mobile data):

1. the link opens with NO password prompt and NO login;
2. the file list shows exactly the expected names and sizes;
3. download one file per transfer and open it (for T2, download the MP4 and
   play the first and last seconds).

Any failure → redo that transfer; do not paste a failing link into the form.

## 5. The form, field by field

Signed in as `akir.oussama@gmail.com` on
<https://forms.gle/iyuxPCA7vkYUczYQA>:

| Field | Paste / do exactly |
|---|---|
| Team Name | `SUPCOM` |
| Team Leader Name | `Oussama Akir` |
| Sector | select `Industry` |
| Link to your final presentation | paste **T1** |
| Upload Technical Documentation (PDF) | upload `packaging/02_CableTwin_SUPCOM_Technical_Data_Room.pdf` |
| Upload Architecture Diagram | upload `docs/submissions/assets/CableTwin_SUPCOM_Architecture_Diagram.png` (if the field only accepts PDF: upload the `.pdf` twin next to it) |
| Video Link (Demo) | paste **T2** |
| GitHub Repository URL | `https://github.com/akiroussama/hackaton_automate_or_die` |
| Link to your branding materials | paste **T3** |
| Provide any additional resources | paste the block below (with T4 filled in) |

Additional-resources block (multi-line; use the one-liner instead if the
field is single-line):

```text
Live playable build (any device, no install): https://hackaton-automate-or-die.vercel.app/

Additional resources (SwissTransfer): <T4-LINK>
- Technical data room evidence bundle (ZIP: sources, evidence screenshots, UI-metric traces)
- Standalone offline prototype (ZIP, byte-exact export of the submission tag)
- SHA256SUMS.txt — SHA-256 of every delivered file

Everything is frozen at git tag phase2-submission-final (commit 08f25a1).
Verify locally with Node.js 22 (no other dependency):
  npm run check            -> 9/9 automated checks
  npm run benchmark:exact  -> 17,856 candidates, 10,440 feasible, three unique optima
  npm run dev              -> offline prototype at http://127.0.0.1:4173/
```

One-line fallback:

```text
Live build: https://hackaton-automate-or-die.vercel.app/ | Extra resources (SwissTransfer): <T4-LINK> | Frozen at git tag phase2-submission-final (08f25a1); verify with Node 22: npm run check (9/9), npm run benchmark:exact, npm run dev
```

## 6. Final check, then Submit

- [ ] Four links tested per §4 (private window, downloads open).
- [ ] Both upload fields show the correct file names.
- [ ] GitHub URL opens in a private window.
- [ ] Every required field (*) filled.
- Click **Submit** → screenshot the confirmation screen (phone + PC).
- If the form offers "Edit your response", save that link too.

## 7. After submitting

1. Paste T1–T4 + the confirmation screenshot reference into the coordination
   handoff file (or directly to Claude in session).
2. Claude re-verifies every link anonymously (~20:00 sweep).
3. Only then: rehearsal work resumes (Iteration 2 correction — Phase 3 prep).

## 8. Contingencies

- SwissTransfer unreachable → retry on mobile data; if still down, e-mail the
  organizing committee and ask which alternative they accept (their rule
  names SwissTransfer — do not substitute silently).
- Form upload field rejects the file → try the PDF twin (diagram) or contact
  the committee; never re-export a frozen deliverable.
- Form errors at Submit → screenshot the error, retry once on another
  network/browser, then e-mail the committee with the screenshot before 21:00.
