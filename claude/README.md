# CableTwin — « Voir avant de décider »

Le Waze de l'usine de câbles : quand une ligne s'arrête, CableTwin transforme une urgence de
production en trois décisions comparables (retard, coût, perturbation), validées par l'humain
et tracées dans un journal d'audit.

Projet candidat au challenge en 3 phases (17–19 juillet 2026) — participant solo : Oussama Akir (SUPCOM).

## Structure

- `sim/cabletwin_sim.py` — moteur V0 : génération exhaustive de plans sous contraintes +
  scoring multiobjectif sur le scénario synthétique S1 (Python ≥ 3.10, aucune dépendance).
- `sim/results.json` — sortie de référence du moteur (déterministe).
- `deliverables/phase1/` — document Phase 1 « The Idea » (FR + EN, HTML source et PDF).

## Reproduire les chiffres

```
python sim/cabletwin_sim.py          # résumé lisible
python sim/cabletwin_sim.py --json   # résultats complets
```

Résultats S1 : sans action 620 min de retard projeté ; stratégies Vitesse 140 min (−77,4 %),
Équilibre 150 min (−75,8 %, surcoût inférieur à l'inaction), Zéro transfert 560 min (−9,7 %).

**Intégrité des chiffres :** scénario 100 % synthétique — aucun chiffre ne représente une
performance mesurée dans une usine réelle.
