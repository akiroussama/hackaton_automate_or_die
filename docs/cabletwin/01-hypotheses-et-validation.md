# CableTwin — hypothèses et validation

_Objectif : transformer une bonne intuition en problème défendable, sans inventer de preuve._

## Règle de preuve

Chaque affirmation du pitch appartient à l'une de ces catégories :

- **confirmée** : explicitement corroborée par le brief, une source fiable ou un entretien ;
- **observée dans le prototype** : calculée sur le jeu de données de démonstration ;
- **hypothèse de pilote** : plausible, mais à mesurer chez un industriel ;
- **hors périmètre** : ne doit pas apparaître comme une promesse.

Les résultats de la démo seront toujours annoncés comme des résultats de **simulation sur données synthétiques**. Les noms Chakira Cables et COFICAB/Elloumi peuvent expliquer le choix du secteur, jamais laisser penser à un partenariat, une connaissance interne ou une validation de leur part.

## Carte des hypothèses critiques

| ID | Hypothèse | Risque si elle est fausse | Test rapide | Signal minimum pour continuer |
| --- | --- | --- | --- | --- |
| H1 | Une perturbation oblige réellement à replanifier plusieurs commandes | Le problème devient artificiel | Entretien responsable production / mentor câble | Un exemple récent ou plausible raconté avec ses conséquences |
| H2 | La décision doit être prise rapidement | L'aide à la décision apporte peu de valeur | Demander le délai habituel et ce qui se passe en cas d'attente | Une contrainte temporelle concrète est identifiée |
| H3 | Au moins certaines opérations peuvent changer de ligne, d'ordre ou de créneau | Aucun scénario alternatif n'est possible | Faire décrire les degrés de liberté réels | Au moins deux actions réalistes existent |
| H4 | Les données minimales sont disponibles ou exportables | Aucun pilote crédible | Montrer notre dictionnaire de données | Un export ERP/MES/tableur couvrirait l'essentiel |
| H5 | Le responsable arbitre entre plusieurs objectifs | Une seule règle suffit ; l'IA est superflue | Demander comment il choisit entre délai, coût et stabilité | Au moins deux objectifs entrent en tension |
| H6 | Les outils actuels ne rendent pas les conséquences assez visibles | CableTwin duplique l'existant | Questionner le processus et les contournements | Une étape manuelle, lente ou opaque est confirmée |
| H7 | Un plan recommandé doit rester approuvé par un humain | Le workflow ou la gouvernance changent | Valider rôles et responsabilité | L'approbateur et les limites sont identifiés |
| H8 | Un premier pilote peut fonctionner en lecture seule | L'intégration devient trop lourde | Tester l'acceptation d'un import CSV quotidien | Le mentor accepte un pilote sans commande machine |

## Questions à poser au mentor — dans cet ordre

Éviter « Est-ce que notre idée vous plaît ? ». Chercher un comportement passé ou une contrainte concrète.

1. Pouvez-vous raconter la dernière fois où un arrêt ou une urgence a bouleversé un planning de production ?
2. Qui a pris la décision et de combien de temps disposait-il ?
3. Quelles informations lui manquaient au moment de décider ?
4. Quelles options pouvait-il réellement choisir ?
5. Quelle conséquence comptait le plus : délai client, quantité, coût, qualité ou stabilité de l'atelier ?
6. Quel outil a été utilisé et qu'a-t-il fallu faire manuellement ?
7. Quelles contraintes rendent un planning impossible, même s'il paraît optimal ?
8. Deux lignes peuvent-elles produire la même famille de câble ? Sous quelles conditions ?
9. Quelles données sont disponibles dans l'ERP, le MES, la supervision ou des fichiers Excel ?
10. Quel résultat ferait accepter un pilote de 30 jours ?
11. Qui devrait valider une recommandation avant sa diffusion à l'atelier ?
12. Quelle erreur du système serait inacceptable ?

### Question finale de validation

> Si nous pouvions vous montrer lundi les commandes menacées par un incident, puis trois options calculées avec leurs compromis, qu'est-ce qui manquerait pour que cette démonstration soit crédible ?

## Fiche d'entretien de dix minutes

À remplir pendant l'échange :

| Champ | Note |
| --- | --- |
| Rôle et type d'usine | |
| Incident raconté | |
| Fréquence approximative | |
| Décision à prendre | |
| Temps disponible | |
| Données consultées | |
| Options possibles | |
| KPI prioritaire | |
| Outil actuel | |
| Risque inacceptable | |
| Citation reformulée à faire confirmer | |
| Hypothèses invalidées | |

## Validation des données

Le prototype ne demande qu'un modèle simplifié. Il faut cependant vérifier que ces champs correspondent à une réalité exploitable :

| Objet | Champs minimaux |
| --- | --- |
| Ligne | identifiant, familles compatibles, capacité, disponibilité |
| Commande | produit/famille, quantité, échéance, priorité |
| Ordre de fabrication | durée estimée par ligne compatible |
| Calendrier | équipes, plages ouvrées, éventuelles heures supplémentaires |
| Incident | ressource, début, durée estimée |
| Contraintes | compatibilité, indisponibilité et absence de chevauchement |

Le jeu de démonstration doit être clairement marqué `SYNTHÉTIQUE`. Il doit rester assez petit pour être contrôlable manuellement : trois lignes, environ dix commandes, une journée et un incident.

Le pilote devra ensuite décider s'il faut décomposer chaque ordre en opérations successives avec prédécesseurs, stocks intermédiaires et changements de série. Le MVP ne simule pas encore cette granularité.

## Expériences produit

### E1 — Le problème est compris en 20 secondes

Montrer uniquement le scénario « ligne 2 arrêtée » à une personne non technique et lui demander ce qui est en danger.

**Réussite :** elle répond spontanément « les commandes / les livraisons » sans explication supplémentaire.

### E2 — La valeur des options est évidente

Présenter trois plans nommés « protéger les clients », « limiter le coût » et « changer le moins possible ».

**Réussite :** la personne peut expliquer le compromis entre deux plans et choisir l'un d'eux.

### E3 — La recommandation est crédible

Comparer l'option CableTwin à une référence simple : ne rien changer ou repousser toutes les opérations de la ligne arrêtée.

**Réussite :** le résultat est réalisable, les calculs sont reproductibles et le gain est visible dans au moins un KPI sans dégrader silencieusement les autres.

### E4 — Le système reste sous contrôle

Demander à un mentor ce qu'il pense du bouton d'approbation, de l'explication et du journal de décision.

**Réussite :** il identifie clairement l'humain responsable et ne pense pas que le prototype commande les machines.

## KPI et méthode de mesure

Les KPI ne sont pas des promesses commerciales ; ils comparent des scénarios sur le même jeu de simulation.

| KPI | Calcul de démonstration | Sens |
| --- | --- | --- |
| Commandes à l'heure | nombre livré avant échéance / total | Service client |
| Retard cumulé | somme des heures après échéance | Gravité des retards |
| Heures supplémentaires | temps planifié hors plage normale | Effort / coût |
| Changements de ligne | ordres déplacés par rapport au plan initial | Stabilité opérationnelle |
| Coût simulé | production + retard + overtime + réaffectations | Comparaison, jamais ROI réel |
| Temps de décision | incident → option approuvée | Agilité, à mesurer en pilote |

Tout montant en dinars doit provenir de paramètres visibles et modifiables. Sinon, rester sur des unités opérationnelles.

## Jalons de décision

### Gate 1 — Problème

Continuer si au moins un interlocuteur pertinent confirme un incident, une décision et une conséquence. Sinon, reformuler le problème avant de coder.

### Gate 2 — Degrés de liberté

Continuer si au moins deux décisions alternatives sont réalistes. Sinon, pivoter du « choix de plan » vers la simple analyse d'impact.

### Gate 3 — Données

Continuer si un chemin d'import raisonnable existe. Sinon, réduire la promesse à une étude de scénario configurée manuellement.

### Gate 4 — Valeur

Continuer si un KPI prioritaire est nommé par le mentor. Sinon, ne pas prétendre optimiser « la performance globale ».

## Résultat attendu avant développement intensif

- une phrase problème confirmée ;
- un persona et un décideur identifiés ;
- un incident de référence ;
- deux ou trois options réalistes ;
- un KPI principal ;
- une contrainte inacceptable ;
- une source plausible pour chaque donnée d'entrée.
