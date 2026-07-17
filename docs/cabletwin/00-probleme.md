# CableTwin — cadrage du problème

_Version de travail — 17 juillet 2026._

## Décision de départ

CableTwin cible une décision simple à comprendre et coûteuse à prendre dans l'urgence : **comment continuer à livrer quand la réalité de l'usine ne correspond plus au planning ?**

Le terrain d'application est une usine tunisienne de câbles. Chakira Cables et COFICAB/Elloumi servent uniquement d'exemples indirects d'un secteur industriel tunisien visible et orienté vers des marchés exigeants. CableTwin n'est ni commandité ni approuvé par ces entreprises et n'utilise aucune de leurs données.

## Le problème en une phrase

> Lorsqu'une ligne s'arrête, qu'une commande urgente arrive ou qu'une ressource devient indisponible, le responsable de production doit réorganiser l'usine rapidement sans pouvoir voir clairement les conséquences de chaque décision sur les livraisons, les coûts et les équipes.

## Pourquoi ce problème mérite d'être résolu

Une usine de câbles enchaîne plusieurs étapes dépendantes : préparation du conducteur, isolation, assemblage, gainage, contrôle et mise en bobine. Une perturbation sur une étape peut se propager aux suivantes. Le problème n'est donc pas seulement « une machine est arrêtée » ; c'est l'incertitude créée dans tout le plan de production.

Les conséquences possibles sont faciles à comprendre :

- commandes livrées en retard ;
- client prioritaire non servi ;
- équipes mobilisées en heures supplémentaires ;
- changements de série et pertes de temps ;
- capacité disponible mal utilisée ;
- décisions difficiles à expliquer après coup.

Ces conséquences sont des **hypothèses métier à confirmer avec un industriel ou un mentor**. Aucun chiffre d'impact ne sera présenté comme un fait avant validation terrain.

## Persona principal

### Responsable de production

Son objectif n'est pas de « faire de l'IA ». Il doit tenir les engagements clients malgré les aléas, tout en protégeant la stabilité de l'atelier.

**Quand un incident survient, il veut :**

- savoir quelles commandes sont menacées ;
- comprendre jusqu'où l'incident va se propager ;
- comparer plusieurs solutions réalistes ;
- connaître les compromis entre délai, coût et perturbation ;
- décider rapidement et conserver une trace de la décision.

**Ce qu'il ne veut pas :**

- un planning imposé par une boîte noire ;
- un écran 3D spectaculaire sans aide à la décision ;
- une recommandation qui ignore les contraintes du terrain ;
- ressaisir manuellement toutes les données de l'usine.

### Utilisateurs et parties prenantes secondaires

| Rôle | Besoin principal |
| --- | --- |
| Planificateur | Recalculer un plan réalisable sans repartir de zéro |
| Chef d'atelier | Recevoir une séquence claire et applicable |
| Commercial / service client | Identifier les livraisons réellement menacées |
| Direction industrielle | Mesurer l'effet sur service, coût et capacité |
| Informatique / méthodes | Connecter progressivement les données sans arrêter l'usine |

## Processus actuel supposé — à valider

Le scénario de référence n'est pas présenté comme le fonctionnement interne d'une entreprise précise. C'est une hypothèse de travail construite pour être testée.

1. Le planning du jour existe dans un ERP, un tableur ou un outil de planification.
2. Un arrêt de ligne est signalé par téléphone, message ou supervision.
3. Le responsable rassemble l'état des commandes, des lignes et des équipes.
4. Il modifie le planning selon son expérience et échange avec plusieurs personnes.
5. Il découvre progressivement les effets secondaires : nouvelle commande en retard, conflit de capacité ou heures supplémentaires.
6. Le nouveau plan est communiqué à l'atelier.

La compétence du responsable est essentielle. La faiblesse du processus vient du manque d'un espace où il peut **tester une décision sans perturber la vraie usine**.

## Processus futur visé

1. CableTwin reçoit un instantané simple : lignes, commandes, capacités, délais et contraintes.
2. Un incident réel ou hypothétique est déclaré.
3. Le jumeau montre les commandes et KPI affectés si aucune action n'est prise.
4. Le moteur teste plusieurs plans réalisables.
5. Le responsable compare les compromis dans un langage simple.
6. Il approuve une option ou ajuste une priorité.
7. CableTwin produit un plan révisé et un journal de décision.

```text
État de l'usine → Incident → Conséquences → Options → Décision humaine → Plan traçable
```

## La question de conception

> Comment permettre à un responsable d'une usine tunisienne de câbles de voir les conséquences d'un aléa et de comparer des réponses réalistes avant de modifier la production réelle ?

## Pourquoi un jumeau numérique

Le jumeau numérique n'est pas le problème ni la promesse commerciale. C'est le mécanisme qui rend la promesse possible : maintenir une représentation calculable de l'usine, y injecter un événement et observer ses conséquences.

L'analogie non technique est :

> **Le Waze de l'usine de câbles : quand la route de production change, il montre les conséquences et propose des chemins alternatifs avant que le responsable décide.**

Pour rester honnête, le livrable du hackathon sera un **prototype de jumeau numérique opérationnel alimenté par des données synthétiques**, et non une réplique connectée à une usine réelle. Une synchronisation ERP/MES et équipements relève d'un pilote ultérieur.

## Ce qui ferait de ce problème un mauvais choix

Le sujet doit être abandonné ou recentré si les entretiens montrent que :

- les incidents de ligne ont peu d'effet sur le planning ;
- le responsable peut déjà comparer des scénarios facilement avec son outil actuel ;
- les données minimales ne sont pas accessibles, même sous forme d'exports ;
- les lignes ne sont pas substituables et aucune décision alternative n'existe ;
- un autre problème du brief officiel est explicitement prioritaire.

## Critère de succès du cadrage

Avant d'investir dans l'interface, nous devons pouvoir compléter cette phrase avec les mots d'un mentor ou industriel :

> « Quand ______ survient, je dois décider ______ en moins de ______, sinon ______. Aujourd'hui, je m'appuie sur ______. »
