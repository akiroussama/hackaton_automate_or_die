# Team SUPCOM

## Oussama Akir - solo participant

**Project:** CableTwin - the Waze of the cable factory

**Track:** Industry - Production Planning & Supply Chain Optimization

**Live product:** https://hackaton-automate-or-die.vercel.app/#twin

## One accountable builder, end to end

Oussama owns the complete product loop:

- **Product and industrial workflow:** narrowed the project to the urgent
  decision after an unplanned production-line stoppage.
- **Constraint engineering:** encoded feasibility, policy trade-offs and the
  deterministic Service, Cost and Stability routes.
- **AI/ML:** built a separate local learned route recommender with explainable
  features and a strict boundary: it ranks existing plans but never creates or
  changes a schedule.
- **Product experience:** built the live decision interface and isometric
  workshop twin.
- **Evidence and responsible deployment:** separated planner checks, learned
  recommender checks and bounded exhaustive verification; kept human approval,
  read-only deployment and local data handling explicit.
- **Narrative and delivery:** converted the system into a reproducible demo,
  documentation, pitch and jury submission.

## Progress during the challenge

### Phase 1 - Focus the decision

Defined CableTwin as an incident-time decision twin for a fictional Tunisian
cable factory: one stoppage, three recovery routes, one human decision.

### Accepted Phase 2 - Make it reproducible

Delivered the working end-to-end journey, 9/9 planner/workflow checks, the
17,856-candidate bounded verifier, technical documentation, pitch material and
public deployment.

### Day 2 - Make the intelligence and workshop visible

Added a live isometric factory-twin view and a separate local learned route
recommender trained on 687 twin-generated simulated incidents. Its own 5/5
suite is reported separately. The human manager can choose another route and
remains the final authority.

## Evidence, not team-size theatre

- Public working product: https://hackaton-automate-or-die.vercel.app/#twin
- Source: https://github.com/akiroussama/hackaton_automate_or_die
- 9/9 deterministic planner and workflow checks
- 5/5 separate learned-recommender checks
- 17,856 candidates, 10,440 feasible schedules, three unique bounded optima
- No machine control, external AI API or real factory data in the demonstration

**Team SUPCOM is one person by design for this challenge.** The next team
extension is not a fictional org chart: it is a real plant design partner and a
planner-led read-only shadow pilot.
