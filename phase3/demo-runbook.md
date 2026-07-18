# CableTwin — Phase 3 live-demo runbook

**Operator:** Oussama Akir · **On-stage demo budget:** 90 seconds inside the
7-minute pitch · **Rehearsal target:** ≤ 75 seconds per pass (15 s recovery
margin), three consecutive human-operated passes.

## The 90-second journey (exact, with canonical checkpoints)

| # | Action (operator) | Say while doing it | Checkpoint on screen |
| ---: | --- | --- | --- |
| 1 | Start on the nominal factory view | "Three lines, ten orders, all on time." | **10 / 10** on time |
| 2 | Click **Lancer la simulation** (incident strip) | "At 10:00, Line 2 stops for four hours." | **7 / 10** · delay **10 h 20 min** · 3 exposed |
| 3 | Point at the three strategy cards | "Same incident, three feasible routes." | Service **8 / 10 · +838 DT · 3**, Cost **8 / 10 · +799 DT · 2**, Stability **7 / 10 · +2 729 DT · 0** |
| 4 | Click **Choisir cette option** on Service | "I preview Service before touching the workshop." | Revised Gantt · preview banner |
| 5 | Click **Valider le nouveau plan** | "The decision stays human — and recorded." | Audit log shows **3 events**, approval at **10:07** |
| 6 | Click **Recommencer** | "And the twin resets, deterministically." | Back to **10 / 10** |

The rehearsal timer runs from the incident click (step 2) to the completed
reset (step 6).

## Machine preparation (T-30 min before the pitch)

- [ ] Close every application except the browser and one terminal.
- [ ] Disable notifications (Windows Focus Assist: Alarms only).
- [ ] Screen resolution 1920×1080; browser at 100 % zoom, bookmarks bar hidden.
- [ ] Run `phase3\start-demo.cmd` — it cold-starts the frozen local build and
      opens a clean observation-ready browser window (< 15 s).
- [ ] One rehearsal pass on the venue machine/projector.
- [ ] Keep the terminal minimized, server running.

## Fallback chain (verified assets, in order)

| Level | Asset | Trigger |
| ---: | --- | --- |
| 1 | Public build: <https://hackaton-automate-or-die.vercel.app/> | Default if venue machine fails: any device, even a phone |
| 2 | Local frozen build: `phase3\start-demo.cmd` (serves `app/` + `engine/` at 127.0.0.1:4173) | Default on the presentation machine; works with zero network |
| 3 | Accepted demo video: `packaging\03_CableTwin_SUPCOM_Demo_2min.mp4` (1:57.9, plays offline) | If the live product cannot run: "let me show you the recorded journey" |
| 4 | Deck captures: `packaging\01_CableTwin_SUPCOM_Final.pdf` slides 4–5 | If video playback fails: narrate the four frozen screenshots |

Rule: never debug live. On any anomaly, switch one level down calmly and
keep narrating — the numbers are identical at every level.

## Rehearsal protocol (with the flight recorder)

1. `phase3\start-demo.cmd` — wait for the browser window.
2. In a second terminal: `node phase3\rehearse-demo.mjs` — it attaches to the
   demo browser and observes; **it never clicks**. It prints a live timer and
   writes `phase3/evidence/iteration-02/rehearsal-<n>.json` per pass.
3. Perform the six steps above while speaking your pitch lines out loud.
4. The recorder validates every canonical checkpoint, logs any console or
   network error, and reports PASS (≤ 75 s, all checkpoints) or FAIL per pass.
5. Acceptance: **three consecutive PASS reports**. If a pass fails, restart
   the count.

## Q&A staging notes

- Keep the app in the resolved state after the demo — the audit log is a
  strong visual during questions about traceability.
- The exact benchmark claim (17,856 / 10,440, unique optima) can be re-run
  live in the terminal if an expert asks: `npm run benchmark:exact` (< 5 s).
