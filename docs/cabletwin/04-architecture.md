# CableTwin — architecture du MVP

## Principe

Le prototype est une application web statique sans dépendance applicative. Il
est accessible publiquement sur Vercel et reste exécutable localement sans
Wi-Fi, clé d'API ou service d'inférence cloud. Le parcours principal n'envoie
aucune requête à un système industriel.

```text
Données synthétiques de l'usine
          |
          v
Planificateur déterministe sous contraintes
          |
          +--> Service · Coût · Stabilité + KPI
          |
          +--> vérificateur exhaustif borné séparé
          |
          +--> conseiller ML local
               suggère une option existante
          |
          v
Vue décision <-> jumeau d'atelier isométrique
          |
          v
Choix et approbation du responsable production
```

Le planificateur construit les trois plannings. Le conseiller appris ne génère,
ne modifie et n'approuve aucun plan. Le responsable reste l'autorité finale.

## Modules

| Module | Responsabilité |
| --- | --- |
| `engine/factory-data.js` | Décrit les lignes, commandes, compatibilités et hypothèses de coût synthétiques. |
| `engine/twin-engine.js` | Analyse l'incident, construit les trois stratégies, valide les contraintes et calcule les KPI. |
| `engine/exact-benchmark.js` | Énumère séparément le scénario borné sans réutiliser la logique de construction du planificateur. |
| `engine/recommender-features.js` | Définit les 16 caractéristiques explicables partagées entre entraînement et inférence. |
| `engine/recommender-model.js` | Contient les poids générés et la provenance complète du modèle local. |
| `engine/recommender.js` | Suggère une option existante avec probabilités et facteurs principaux. |
| `app/app.js` | Gère l'état partagé et la vue décision. |
| `app/factory-view.js` | Rend le jumeau isométrique, les ordres, opérateurs et valeurs simulées pilotés par l'état applicatif du planning. |
| `app/factory-view.css` | Porte la vue plein écran, le responsive et la réduction de mouvement. |
| `scripts/train-recommender.mjs` | Génère les incidents synthétiques, étiquette, entraîne et applique les portes qualité. |
| `tests/twin-engine.test.mjs` | Vérifie séparément le planificateur et le workflow : 9/9. |
| `scripts/recommender.test.mjs` | Vérifie séparément le modèle et l'inférence : 5/5. |

## Ce qui est réellement construit

- Un modèle d'état de trois lignes et dix commandes.
- Un arrêt synthétique de la ligne 2 de 10:00 à 14:00.
- Un planificateur multiobjectif déterministe sous contraintes.
- Trois politiques comparables : Service, Coût et Stabilité.
- Un vérificateur exhaustif borné : 17 856 candidats d'affectation et de
  séquencement, 10 440 plannings faisables et trois optima uniques.
- Un conseiller local par régression softmax, entraîné sur **687 incidents
  simulés générés par le jumeau lui-même**.
- Une vue décision et un jumeau d'atelier isométrique partageant exactement le
  même état exécutable.
- Une approbation humaine et une trace d'audit en mémoire.

## Où se trouve l'intelligence

CableTwin associe deux formes complémentaires d'aide à la décision, sans LLM :

1. **Recherche et planification symbolique.** Le moteur encode l'état, explore
   des lignes et créneaux autorisés, applique trois objectifs et calcule leurs
   conséquences. Il reste déterministe et non apprenant.
2. **Conseiller appris séparé.** Une régression softmax lit 16 caractéristiques
   du contexte et des trois plans terminés. Elle suggère une option, affiche sa
   confiance et ses facteurs, mais ne touche jamais aux plannings.

Le modèle atteint 95,7 % sur l'entraînement et 93,6 % sur un sous-ensemble de
test de la grille synthétique. Sur l'incident canonique il suggère Coût avec
79 % de confiance affichée. Ces résultats mesurent l'accord avec une politique
d'étiquetage synthétique, pas une performance d'usine. Le responsable peut
choisir Service ou Stabilité et demeure le décideur.

## Ce qui est simulé

- Les données de l'usine et les noms de clients.
- L'arrêt de ligne et sa durée.
- Les coûts de retard, de changement et d'heure supplémentaire.
- Les 687 incidents d'entraînement.
- La vitesse de ligne, la température d'extrusion, la tension, les sept
  capteurs d'ambiance, les opérateurs et leurs animations.
- L'événement d'approbation et tout futur export ERP/MES.

La vue isométrique n'est ni une réplique CAO/physique ni une connexion à des
capteurs réels. Aucun résultat ne doit être présenté comme obtenu chez Chakira
Cables, COFICAB ou une autre entreprise réelle.

## Déploiement actuel

| Mode | Usage | Dépendance externe pendant le parcours |
| --- | --- | --- |
| Vercel statique | Accès immédiat du jury | Aucune API d'application ou d'IA |
| Archive locale + Node.js | Démo hors ligne et secours | Aucune |

Le modèle appris est embarqué dans le dépôt et l'inférence s'exécute localement.
Le prototype n'accède à aucune machine, PLC, base ERP/MES ou donnée client.

## Trajectoire pilote

1. Import en lecture seule des commandes, calendriers et incidents d'un atelier.
2. Modélisation avec le responsable production des compatibilités et contraintes
   du site.
3. Rejeu initial de 5 à 10 incidents pour valider le workflow et les règles,
   sans considérer ce petit échantillon comme une preuve ML suffisante.
4. Comparaison des trois plans aux décisions réellement prises.
5. Si un historique représentatif suffisant existe, réentraînement et
   validation du conseiller **sur site** : les données ne quittent jamais
   l'usine.
6. Exécution en observation, avec version du modèle, facteurs, override humain
   et repli vers les trois plans déterministes.
7. Export d'un plan uniquement après validation humaine et une gouvernance
   séparée.

Le MVP prouve le mécanisme de décision. Le pilote doit encore prouver la
représentativité des données, la calibration du conseiller et la valeur
opérationnelle.
