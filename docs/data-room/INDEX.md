# CableTwin — Technical Data Room

**Team:** SUPCOM — Oussama Akir (solo) · **Phase 2 — The Build** · All operational results are **synthetic**.

## Verify in 3 commands

```bash
npm run check            # 9/9 automated checks
npm run benchmark:exact  # 17,856 candidates -> 10,440 feasible, optimum confirmed
npm run dev              # launch the offline prototype at http://127.0.0.1:4173/
```

## Documents

| # | Document | Answers |
| --- | --- | --- |
| 01 | [Problem, process and scope](01-problem-process-and-scope.md) | What breaks when a line stops, who decides |
| 02 | [Product and user journey](02-product-and-user-journey.md) | Incident → impact → 3 strategies → human approval → audit |
| 03 | [AI planning and explainability](03-ai-planning-and-explainability.md) | Symbolic constraint planning, exact bounded verifier |
| 04 | [Data model, constraints and assumptions](04-data-model-constraints-and-assumptions.md) | Data dictionary, synthetic scenario, cost coefficients |
| 05 | [Validation, results and reproducibility](05-validation-results-and-reproducibility.md) | 9/9 tests, exact benchmark, metric formulas |
| 06 | [Business case, pilot and viability](06-business-case-pilot-and-viability.md) | Buyer, read-only pilot, success gates |
| 07 | [Risks, security, responsible AI and limits](07-risks-security-responsible-ai-and-limits.md) | What can go wrong, human authority |
| 08 | [Architecture and deployment](08-architecture-and-deployment.md) | Offline-first stack, deployment boundary |

## Evidence

- [`evidence/screenshots/`](evidence/screenshots/) — frozen prototype screens
- [`evidence/test-results/`](evidence/test-results/) — test suite output
- [`evidence/benchmark-results/`](evidence/benchmark-results/) — exact benchmark output
