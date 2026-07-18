# CableTwin — validation technique du MVP

**Date de contrôle : 18 juillet 2026**

Cette fiche sépare les preuves du planificateur, du vérificateur, du conseiller
ML et du navigateur. Elle distingue aussi les résultats synthétiques de ce qui
reste à valider sur le terrain.

## Planificateur et workflow — 9/9

```powershell
npm run check
```

Résultat : **9 tests réussis sur 9**, aucune erreur de syntaxe.

Les tests couvrent :

- le marquage explicite des données synthétiques ;
- le jeu de 3 lignes et 10 commandes ;
- l'identification des commandes exposées par l'incident ;
- la faisabilité et le déterminisme des trois plannings ;
- les compromis Service, Coût et Stabilité ;
- le calcul du retard, des heures supplémentaires, du coût, des mouvements et
  du taux de service ;
- l'approbation humaine sans mutation du plan proposé ;
- le format lisible des heures ;
- la distinction entre planning nominal et fenêtre d'incident.

## Certificat exact borné

```powershell
npm run benchmark:exact
```

Résultat : **17 856 candidats d'affectation et de séquencement**, **10 440
plannings faisables** et trois optima uniques confirmés. Le vérificateur ne
réutilise pas la logique de construction du planificateur, mais partage
volontairement les définitions canoniques de validation et de KPI. Cette preuve
est bornée au scénario encodé, pas à une usine entière.

## Conseiller appris séparé — 5/5

```powershell
npm run check:recommender
```

Résultat : **5 contrôles réussis sur 5**, annoncés séparément des 9/9 :

1. structure, porte qualité et provenance synthétique du modèle ;
2. caractéristiques finies et complètes sur le scénario canonique ;
3. suggestion Coût avec confiance supérieure à 0,5, probabilités normalisées
   et trois facteurs explicatifs ;
4. inférence déterministe ;
5. sensibilité au contexte : un incident tardif sur L3 suggère Stabilité.

Le modèle est une régression softmax locale à 16 caractéristiques. Il est
entraîné sur **687 incidents simulés générés par le jumeau lui-même** et atteint
95,7 % sur l'entraînement, puis **93,6 % sur un sous-ensemble de test de la
grille synthétique**. Ces pourcentages ne constituent ni une précision d'usine
ni un nouveau KPI opérationnel.

Sur l'incident canonique, l'interface affiche Coût avec 79 % de confiance.
L'utilisateur peut néanmoins choisir Service ou Stabilité : le modèle ne
génère, ne modifie et n'approuve aucun planning.

## Parcours vérifié dans le navigateur

La vue décision historique et la vue `/#twin` actuelle ont été rejouées :

| État | Signal observé |
| --- | --- |
| Initial | 10/10 à l'heure, trois lignes, télémétrie explicitement simulée |
| Incident | Ligne 2 arrêtée 10:00–14:00, 3 ordres exposés, 620 min |
| Recalcul | Compteurs 17 856 → 10 440, trois optima et ligne ML |
| Suggestion | Coût maîtrisé, 79 %, 687 incidents simulés générés par le jumeau, 93,6 % test synthétique |
| Service | 8/10, 140 min, 30 min overtime, 3 mouvements |
| Coût | 8/10, 170 min, 60 min overtime, 2 mouvements |
| Stabilité | 7/10, 620 min, 180 min overtime, 0 mouvement |
| Validation | Choix humain, décision 10:07, aucune commande machine |
| Réinitialisation | Retour exact à 10/10 depuis le jumeau |

Le contrôle d'intégration de l'Iteration 3 a couvert dix états pleine page,
l'auto-prévisualisation, le changement manuel de route, le retour vue décision,
le reset et le click-to-skip. Résultat : **zéro erreur console, zéro exception
et zéro requête applicative externe**.

## Accessibilité et robustesse

- Les onglets exposent `aria-pressed` et les statuts utilisent `role=status`.
- `prefers-reduced-motion` supprime tous les mouvements non indispensables.
- Le recalcul cinématique peut être ignoré par clic.
- Le jumeau et la vue décision utilisent le même état et les mêmes KPI.
- Le parcours local fonctionne sans API, modèle externe, GPU ou Wi-Fi.
- Le build public reste accessible à
  <https://hackaton-automate-or-die.vercel.app/#twin>.

## Preuves acquises

- [x] Scénario, incident et reset reproductibles.
- [x] KPI calculés par le moteur, pas saisis dans les cartes.
- [x] Trois options fondées sur le même incident et les mêmes contraintes.
- [x] Planificateur/workflow 9/9.
- [x] Vérificateur borné 17 856 / 10 440 / trois optima uniques.
- [x] Conseiller séparé 5/5 avec provenance synthétique.
- [x] Jumeau isométrique, suggestion, choix humain alternatif et approbation rejoués.
- [x] Données, télémétrie et entraînement synthétiques clairement déclarés.
- [x] Aucune connexion ou commande machine.

## Preuves encore requises

- [ ] Un professionnel confirme que l'arbitrage délai/coût/stabilité correspond
  à une décision réelle.
- [ ] Une contrainte d'atelier remplace au moins une hypothèse synthétique.
- [ ] La généralisation et la calibration du conseiller sont testées sur un
  historique représentatif du site.
- [ ] Le réentraînement pilote est exécuté et gouverné sur site, sans sortie de
  données.
- [ ] Le pitch est chronométré devant une personne non technique.

La validation technique prouve le mécanisme actuel. Elle ne prouve pas encore
l'adéquation marché, la précision sur incidents réels, le ROI d'une usine ou un
score de jury.
