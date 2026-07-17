# CableTwin — architecture du MVP

## Principe

Le prototype est une application web locale sans dépendance externe. Cette contrainte est volontaire : la démonstration doit continuer à fonctionner sans Wi-Fi, sans clé d'API et sans service cloud.

```text
Données synthétiques de l'usine
          │
          ▼
Moteur déterministe du jumeau numérique
          │
          ├── planning après incident
          ├── stratégies alternatives
          ├── KPI avant / après
          └── journal d'approbation
          │
          ▼
Interface narrative du responsable production
```

## Modules

| Module | Responsabilité |
| --- | --- |
| `engine/factory-data.js` | Décrit les lignes, commandes, compatibilités et hypothèses de coût. |
| `engine/twin-engine.js` | Simule l'incident, construit les stratégies et calcule les KPI. |
| `app/app.js` | Gère le parcours de démonstration et traduit l'état en interface. |
| `app/index.html` | Structure sémantique de l'expérience. |
| `app/styles.css` | Identité visuelle, lisibilité et adaptation mobile/projecteur. |
| `tests/twin-engine.test.mjs` | Vérifie déterminisme, contraintes et amélioration par rapport au plan sans réaction. |

## Ce qui est réellement construit

- Un modèle d'état de trois lignes de production de câbles.
- Un planning de commandes avec compatibilités et échéances.
- Un incident simulé et reproductible.
- Un planificateur heuristique multiobjectif qui recherche des créneaux réalisables.
- Trois politiques de décision comparables : service, coût et stabilité.
- Des KPI calculés à partir des données du scénario.
- Une approbation humaine et une trace d'audit.

## Où se trouve l'intelligence

Le MVP emploie de l'IA classique de **recherche et planification**, et non un LLM :

1. le jumeau encode l'état, les contraintes et l'événement ;
2. le moteur explore les lignes et créneaux autorisés ;
3. chaque candidat est évalué selon retard, priorité, coût, heures supplémentaires et mouvements ;
4. trois objectifs produisent des options dont les compromis restent explicables ;
5. l'humain choisit, et cette décision est conservée.

Le moteur actuel est une heuristique déterministe conçue pour une démonstration fiable. Il ne prétend ni garantir l'optimum global, ni apprendre à partir de données industrielles inexistantes. Un pilote pourrait comparer cette base à un solveur de contraintes, puis ajouter une estimation probabiliste de la durée d'incident si des historiques validés existent.

## Ce qui est simulé

- Les données de l'usine et les noms de clients.
- L'arrêt de ligne et sa durée.
- Les coûts de retard, de changement et d'heure supplémentaire.
- L'export vers un éventuel ERP ou MES.

L'interface doit afficher ces hypothèses. Aucun résultat du prototype ne doit être présenté comme une performance obtenue chez Chakira Cables, COFICAB ou une autre entreprise réelle.

## Trajectoire pilote

1. Import en lecture seule des commandes et calendriers d'un atelier.
2. Modélisation avec le responsable production des compatibilités et contraintes du site.
3. Rejeu d'incidents historiques en mode observation.
4. Comparaison des recommandations aux décisions réellement prises.
5. Export d'un plan uniquement après validation humaine.

Le MVP prouve la décision. Le pilote prouverait la représentativité des données et la valeur opérationnelle.
