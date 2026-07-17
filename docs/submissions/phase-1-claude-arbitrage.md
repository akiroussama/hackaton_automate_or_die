# Arbitrage critique - proposition Claude vs dossier CableTwin

## Verdict

La proposition Claude n'est pas retenue comme document canonique. Elle gagne sur
l'impact des premières secondes et certains repères visuels, mais elle décrit un
autre scénario et un autre moteur que le prototype web réellement démontrable.

La version finale conserve donc notre dossier comme source de vérité et importe
uniquement les éléments de Claude qui améliorent le jugement sans créer de
contradiction.

## Vérité canonique à conserver partout

- équipe SUPCOM, participant solo ;
- usine fictive et données entièrement synthétiques ;
- 3 lignes et 10 commandes ;
- arrêt simulé de 4 heures sur la ligne 2 ;
- stratégies Service, Cost et Stability ;
- 620 minutes avec Stability, 140 avec Service, 170 avec Cost ;
- interface web end-to-end avec prévisualisation, approbation et audit ;
- 8 tests automatisés sur 8 réussis ;
- planificateur live déterministe, complété par un vérificateur exhaustif
  indépendant borné au scénario canonique.

## Apports Claude retenus

1. Une ouverture centrée sur l'urgence humaine avant le vocabulaire technique.
2. La signature `See before you decide`.
3. Trois KPI immédiatement visibles sur la première page.
4. Le cadrage du problème en hypothèses mémorisables : slow, single-path, late
   to reveal customer impact, untraced.
5. Les formulations `incident-first` et `comparability is the product`.
6. Une formulation plus nette du coeur IA : planification sous contraintes,
   évaluation multiobjectif et arbitrage final humain.
7. Un tableau séparant utilisateur, acheteur économique et bénéficiaires.
8. Un encadré d'intégrité séparant résultats synthétiques, hypothèses de coût
   et futurs KPI pilote.
9. Le principe d'une preuve exhaustive, réimplémenté sur notre propre scénario
   et notre propre moteur plutôt que repris avec les chiffres Claude.

## Éléments Claude rejetés

- scénario de 3 commandes affectées et arrêt de 8 heures ;
- résultats 150 et 560 minutes et coûts en unités `u` ;
- stratégies Speed, Balance et Zero transfer ;
- recherche exhaustive de 11 plans comme description du moteur de l'interface ;
- chemin `sim/cabletwin_sim.py` dans le dossier Phase 1 canonique ;
- affirmation que l'interface reste à construire ;
- comparaison `search beats intuition` avec un plan humain non industriel ;
- affirmations non sourcées sur la fréquence des pannes, l'absence d'APS ou le
  coût et l'opacité systématiques des solutions concurrentes ;
- roadmap algorithmique spéculative et matrice explicite de conformité ;
- annexes techniques et structure de huit pages.

## Décision de suite

Le principe a été intégré sous forme d'un oracle indépendant sur le scénario
canonique : 17 856 candidats sont évalués, 10 440 plannings sont faisables et
les trois optima de politique affichés par l'interface sont confirmés. La preuve
est reproductible avec `npm run benchmark:exact`, couverte par le huitième test
et explicitement bornée à cette démonstration. Le solveur Python et les chiffres
Claude restent des références séparées, jamais présentées comme le moteur du
prototype web.
