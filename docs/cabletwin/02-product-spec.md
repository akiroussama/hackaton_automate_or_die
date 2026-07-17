# CableTwin — spécification produit

_Produit : prototype de jumeau numérique opérationnel pour une usine tunisienne de câbles._

## Proposition de valeur

> **CableTwin permet au responsable de production de voir les conséquences d'un aléa, de tester plusieurs réponses dans une copie numérique de l'usine et d'approuver le meilleur plan avant de modifier la production réelle.**

Promesse courte : **voir avant de décider**.

## Objectif du MVP

Démontrer, de bout en bout, qu'un arrêt de ligne peut être transformé en une décision compréhensible et traçable :

```text
Plan initial → Arrêt simulé → Impact sans action → Options calculées → Comparaison → Approbation
```

Le MVP doit être utilisable par une personne non technique en moins de deux minutes et fonctionner hors ligne avec des données synthétiques.

## Objectifs et non-objectifs

### Objectifs

- représenter l'état simplifié d'une usine de câbles ;
- simuler l'effet d'un incident sur les commandes ;
- produire plusieurs plans réalisables ;
- expliquer clairement les compromis ;
- laisser la décision finale au responsable ;
- conserver les entrées, résultats et choix dans un journal.

### Non-objectifs

- reproduire toute la physique de fabrication d'un câble ;
- contrôler une machine ou un automate ;
- remplacer l'ERP, le MES ou le planificateur ;
- prétendre disposer de données d'une entreprise réelle ;
- promettre un gain financier non mesuré ;
- construire une usine 3D détaillée ;
- prédire la durée réelle d'une panne.

## Cas d'usage principal

**Situation :** une ligne devient indisponible pendant plusieurs heures alors que des commandes doivent être livrées dans la journée.

**Utilisateur :** responsable de production.

**Décision :** choisir entre protéger les livraisons prioritaires, maîtriser le coût simulé ou préserver la stabilité du planning.

**Résultat :** un plan révisé, validé humainement, accompagné de KPI avant/après et d'une trace de décision.

## Parcours utilisateur

1. **Observer** — l'utilisateur voit les lignes, commandes et KPI du plan initial.
2. **Perturber** — il déclenche le scénario d'arrêt de quatre heures sur la ligne 2.
3. **Comprendre** — CableTwin met en évidence les commandes menacées si aucune action n'est prise.
4. **Explorer** — le système calcule trois options selon des priorités différentes.
5. **Comparer** — l'utilisateur voit les mêmes KPI pour chaque option et une explication en langage simple.
6. **Décider** — il sélectionne une option, renseigne éventuellement une note et approuve.
7. **Transmettre** — le prototype affiche la nouvelle séquence et génère un journal exportable.

## Stratégies proposées

| Option | Objectif principal | Explication utilisateur |
| --- | --- | --- |
| Protéger les clients | Minimiser les commandes prioritaires en retard | « Cette option déplace davantage d'opérations pour préserver les échéances importantes. » |
| Coût maîtrisé | Minimiser le coût simulé de production, retard et adaptation | « Cette option protège l'essentiel tout en limitant le coût total du plan. » |
| Rester stable | Minimiser les changements par rapport au plan initial | « Cette option réduit les perturbations dans l'atelier, avec un compromis sur le service. » |

Les noms parlent d'un résultat métier. Les termes algorithmiques restent dans la documentation technique, pas dans l'interface principale.

## Exigences fonctionnelles

### P0 — indispensable pour la démonstration

- charger un scénario synthétique déterministe ;
- afficher trois lignes, leurs états et les commandes planifiées ;
- simuler l'arrêt de quatre heures de la ligne 2 ;
- recalculer l'impact « sans action » ;
- générer au moins trois plans alternatifs réalisables ;
- afficher les KPI de chaque option sur une base identique ;
- expliquer en une phrase le principal avantage et le principal compromis ;
- permettre l'approbation explicite d'une option ;
- afficher successivement le plan initial, le plan simulé et un journal de décision ;
- réinitialiser la démo en un clic.

### P1 — utile si le P0 est stable

- modifier la priorité d'une commande ;
- changer la durée estimée de l'incident ;
- afficher pourquoi une ligne est compatible ou non avec une opération ;
- exporter le planning révisé et le journal en CSV ou JSON ;
- proposer un second incident : commande urgente.

### P2 — uniquement après le hackathon

- import d'un export ERP/MES réel ;
- synchronisation avec la supervision ;
- apprentissage des durées à partir de l'historique ;
- prise en compte des stocks, matières, maintenance et énergie ;
- simulation multi-jours et multi-sites ;
- gestion des rôles et des validations réelles.

## Moteur d'intelligence

Le cœur n'est pas un chatbot. Il associe :

1. **un modèle d'état** : ressources, commandes, opérations, calendriers et contraintes ;
2. **un simulateur** : calcule les conséquences d'un incident et d'un plan ;
3. **un planificateur heuristique sous contraintes** : recherche des créneaux réalisables pour différents objectifs ;
4. **une couche d'explication** : transforme les écarts de KPI en phrases simples.

La recherche et planification sous contraintes constitue le travail d'IA d'aide à la décision : comparer systématiquement des candidats selon des règles explicites. Le MVP est déterministe et ne garantit pas l'optimum global. Un LLM peut reformuler une explication, mais il n'est jamais responsable des calculs et le produit doit fonctionner sans lui.

## Contraintes minimales du modèle

- une ligne ne traite qu'une opération à la fois ;
- une opération ne peut être affectée qu'à une ligne compatible ;
- une ligne indisponible ne reçoit aucune opération pendant l'incident ;
- les durées et calendriers sont respectés ;
- une option approuvée ne peut pas modifier silencieusement une contrainte dure.

Les préférences — priorité client, heures supplémentaires, nombre de déplacements — sont des objectifs pondérés, pas des contraintes cachées.

Pour tenir le périmètre solo, le MVP représente chaque ordre de fabrication par **un seul créneau de production**. La modélisation des étapes successives, stocks intermédiaires et changements de série appartient au pilote.

## Modèle de données du MVP

```text
Factory
├── lines: id, name, coûts, fin de poste
├── orders: id, produit, quantité, échéance, priorité, lignes éligibles, durées
├── baseline_schedule: order_id, line_id, start, end
├── incident: line_id, start, end
└── settings: horizon et coût de réaffectation
```

Toutes les données embarquées portent une étiquette visible : **« Scénario de démonstration — données synthétiques »**.

## KPI affichés

Le tableau principal doit rester lisible :

- commandes à l'heure ;
- heures de retard cumulées ;
- heures supplémentaires ;
- ordres déplacés ;
- coût total simulé et surcoût par rapport au plan nominal.

Le KPI principal sera choisi après validation mentor. Le prototype ne doit pas agréger tous ces indicateurs dans un score opaque.

## Règles d'explication

Chaque option répond à quatre questions :

- **Que protège-t-elle ?**
- **Que change-t-elle ?**
- **Quel compromis accepte-t-elle ?**
- **Quelles hypothèses utilise-t-elle ?**

Exemple :

> « Cette option améliore le service en déplaçant trois ordres, avec un coût simulé supérieur à l'option coût. Résultat calculé sur le scénario synthétique actuel. »

## Critères d'acceptation

Le MVP est terminé si :

- le scénario initial est toujours reproductible après réinitialisation ;
- l'arrêt produit un impact visible sans action ;
- chaque option respecte toutes les contraintes dures ;
- les KPI affichés peuvent être recalculés à partir du planning ;
- au moins deux options présentent un compromis réellement différent ;
- aucune recommandation n'est appliquée sans approbation ;
- l'origine synthétique des données est visible ;
- une démo complète tient en 90 secondes ;
- l'absence de réseau ne bloque pas le parcours principal.

## Architecture logique

```text
Données synthétiques / futur export ERP
                ↓
       État du jumeau numérique
                ↓
    Simulateur + contraintes métier
                ↓
      Générateur de scénarios
                ↓
 Comparaison KPI + explications simples
                ↓
 Approbation humaine + journal de décision
```

## Risques et réponses

| Risque | Réponse de conception |
| --- | --- |
| Le produit ressemble à un simple planning | Montrer l'incident, la simulation et les conséquences avant/après |
| Le mot « digital twin » paraît exagéré | Dire « prototype » et montrer le chemin vers une synchronisation réelle |
| Les options ne sont pas réalistes | Valider compatibilités et contraintes avec un mentor |
| Les gains paraissent inventés | Afficher uniquement les résultats calculés sur le scénario synthétique |
| L'optimisation paraît opaque | Montrer objectifs, contraintes, déplacements et compromis |
| La démo devient trop vaste pour une équipe solo | Geler P0 : trois lignes, dix commandes, un incident |
| Une option est techniquement irréalisable | Vérification automatique des contraintes avant affichage |
| Le jury attend de l'IA générative | Expliquer que l'IA utile ici est la recherche de décisions sous contraintes ; LLM optionnel |

## Chemin vers un pilote industriel

### Hackathon

Données synthétiques, simulation locale, approbation simulée.

### Pilote 30 jours

Import en lecture seule d'un export ERP/MES, règles validées par le planificateur, comparaison des recommandations avec les décisions réelles, aucune commande machine.

### Déploiement

Synchronisation contrôlée, gestion des rôles, données historiques, audit, intégration au processus officiel de planification.

Le critère de passage au pilote n'est pas une belle animation ; c'est la capacité à reproduire un scénario passé et à produire une option que le responsable juge réalisable.
