# CableTwin — Phase 3 live-demo runbook

**Operator:** Oussama Akir · **On-stage demo budget:** 90 seconds inside the
7-minute pitch · **Rehearsal gate:** ≤ 75.0 s on the audience clock, three
consecutive human-operated PASS reports.

## The approved live narration (speak this, verbatim)

Source: `deck/outline.md`, lines 202-210 (slide 5 speaker notes) — copied
unchanged; the recorder stores this source and revision in every report.

> "Here is the live journey. The nominal schedule starts at ten of ten. I
> trigger the stop on Line 2. Without adaptation, three orders are exposed,
> delay reaches 620 minutes, overtime reaches 180 minutes and only 188
> kilometres finish by 18:00. CableTwin calculates three routes from the same
> incident. Service reduces delay to 140 minutes and overtime to 30, while
> output reaches 216 kilometres. It accepts three line moves to protect
> priority-weighted delivery. Cost uses two moves and reaches 170 minutes of
> delay. Stability makes no move and keeps the full 620 minutes. I preview
> Service, inspect the revised Gantt and approve. The audit event appears; no
> order is sent to a machine."

## The audience clock

- The clock starts when **you** arm the recorder (ENTER in the terminal)
  immediately before your first spoken word — it measures the real
  audience-facing delivery, not browser automation.
- The clock stops when the **resolved Service audit is visibly complete**
  (10:07 · « Priorité service » · 8/10).
- Gate: **≤ 75.0 s**, leaving ≥ 15 s of recovery margin on stage.
- The reset happens **after** the report, outside the audience clock; the
  recorder then verifies 10/10 before the next pass can be armed.
- After the final accepted pass, **leave the resolved audit on screen** — it
  is the strongest visual for traceability questions in Q&A.

## The journey while speaking (checkpoints the recorder enforces)

| # | Action | Checkpoint (strategy-specific) |
| ---: | --- | --- |
| 1 | Armed on nominal view | **10 / 10** |
| 2 | Click **Lancer la simulation** | **7 / 10** · **10 h 20 min** · **3** exposed |
| 3 | Let the three cards land | Service 8/10 · +838 DT · 3 — Cost 8/10 · +799 DT · 2 — Stability 7/10 · +2 729 DT · 0 |
| 4 | Click **Choisir cette option** on **Service** | Service is the `aria-pressed` selection; approval enabled; a Cost or Stability selection FAILS the pass |
| 5 | Click **Valider le nouveau plan** | Resolved · exactly 3 audit rows · final row 10:07 « Priorité service » 8/10 — **clock stops** |
| 6 | (after the report) Click **Recommencer** | Back to 10 / 10 — verified outside the clock |

## Rehearsal protocol

1. From this checkout: `phase3\start-demo.cmd` — it refuses occupied ports,
   verifies the CableTwin server identity and assets, opens the demo browser
   on a disposable profile and confirms the CDP target before printing READY
   (hard limit 15 s).
2. Second terminal: `node phase3\rehearse-demo.mjs`
   - if this checkout has no `packaging\` folder, point at the frozen
     package: `node phase3\rehearse-demo.mjs --package-root D:\workspace\hackaton_automate_or_die\packaging`
   - the recorder preflight FAILS if the fallback MP4 and deck PDF cannot be
     resolved and opened.
3. Follow the prompts: **reload the page**, then **ENTER right before your
   first word**. Speak the narration aloud while clicking.
4. Each human report requires your attestation (name, statement, pointer to
   the continuous screen+microphone recording of the session).
5. `session-summary.json` tracks the streak: three consecutive human PASSes =
   acceptance. Any FAIL resets the streak. Machine smoke reports never count.
6. Cleanup: `phase3\start-demo.cmd stop` (closes browser + server, removes
   the disposable profile).

## Machine preparation (T-30 before the pitch)

- [ ] Close everything except the browser, the deck and one terminal.
- [ ] Focus Assist: alarms only. Resolution 1920×1080, browser zoom 100 %.
- [ ] `phase3\start-demo.cmd` → READY.
- [ ] One rehearsal pass on the venue machine/projector.
- [ ] Deck open on slide 5 (its frozen captures are the instant fallback).

## Fallback chain (preflight-verified assets)

| Level | Asset | Use |
| ---: | --- | --- |
| 1 | Live local build (`phase3\start-demo.cmd`) | The default on-stage demo; zero network |
| 2 | Public build <https://hackaton-automate-or-die.vercel.app/> | If the local machine misbehaves; works on any device |
| 3 | **Slide 5 of the already-open deck** (frozen captures + native metrics) | **The immediate timed fallback**: narrate the same script over the captures — fits the same 90-second slot |
| 4 | Accepted MP4 `packaging\03_CableTwin_SUPCOM_Demo_2min.mp4` (1:57.9) | Offline proof for jury/Q&A. **Longer than the 90-second slot** — never play it in full inside the live slot |

Rule: never debug live. Switch levels calmly and keep narrating — the
numbers are identical at every level.

**Required rehearsal:** at least one **forced live-to-slide fallback pass** —
start live, deliberately switch to slide 5 mid-journey, and finish the
narration within the 90-second slot.

## Q&A staging notes

- Keep the resolved audit visible after the demo and through Q&A.
- If an expert asks about the exact claim: `npm run benchmark:exact` in the
  terminal re-proves 17,856 / 10,440 and the three unique optima in seconds.
