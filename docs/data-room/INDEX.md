# CableTwin — Technical Data Room

**Team:** SUPCOM — Oussama Akir (solo) · **Phase 2 — The Build** · All
operational results, training incidents and telemetry are **synthetic**.

## Verify the current build

```bash
npm run check                 # deterministic planner/workflow: 9/9
npm run benchmark:exact       # 17,856 candidates -> 10,440 feasible
npm run check:recommender     # separate local learned assist: 5/5
npm run dev                   # local build at http://127.0.0.1:4173/
```

Open `http://127.0.0.1:4173/#twin` for the factory-twin view. Model training
can be reproduced separately with `npm run train:recommender`; this regenerates
the model file and its training timestamp.

## Documents

| # | Document | Answers |
| --- | --- | --- |
| 01 | [Problem, process and scope](01-problem-process-and-scope.md) | What breaks when a line stops, who decides |
| 02 | [Product and user journey](02-product-and-user-journey.md) | Incident → twin → 3 routes → ML suggestion → human approval |
| 03 | [AI planning and explainability](03-ai-planning-and-explainability.md) | Deterministic planning, learned assist, bounded verifier |
| 04 | [Data model, constraints and assumptions](04-data-model-constraints-and-assumptions.md) | Scenario, constraints, synthetic training grid and labeling policy |
| 05 | [Validation, results and reproducibility](05-validation-results-and-reproducibility.md) | 9/9 core checks, 5/5 recommender checks, exact benchmark |
| 06 | [Business case, pilot and viability](06-business-case-pilot-and-viability.md) | Buyer, read-only pilot, on-site retraining gates |
| 07 | [Risks, security, responsible AI and limits](07-risks-security-responsible-ai-and-limits.md) | Planner/model risks, human authority and safe fallback |
| 08 | [Architecture and deployment](08-architecture-and-deployment.md) | Live/offline modes, local model and deployment boundary |

## Evidence

- [`evidence/screenshots/`](evidence/screenshots/) — accepted decision-view
  journey; the current live build also exposes the additive `/#twin` view
- [`evidence/test-results/`](evidence/test-results/) — test suite output
- [`evidence/benchmark-results/`](evidence/benchmark-results/) — exact benchmark output
