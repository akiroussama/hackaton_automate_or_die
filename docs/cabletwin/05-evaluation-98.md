# CableTwin — grille officielle et cible interne 98/100

Les organisateurs ont communiqué la pondération globale suivante. La cible **98/100** reste une ambition interne, exigeante et non garantie : elle ne constitue ni un score acquis, ni une prédiction du jury.

**Score actuel : non évalué.** Aucun point ne doit être annoncé comme obtenu avant l'évaluation officielle.

> **Mise à jour Iteration 3 — 18 juillet 2026.** Le planificateur
> déterministe, le vérificateur borné, le jumeau d'atelier et le conseiller ML
> local sont désormais implémentés. Les limites terrain et commerciales
> ci-dessous restent ouvertes.

| Critère officiel | Poids | Ce que CableTwin doit démontrer |
| --- | ---: | --- |
| Pertinence du processus métier et impact mesuré | 25 % | Le problème industriel est réel, important et confirmé ; les effets d'une décision sont calculés avant/après avec des hypothèses traçables. |
| Intégration de l'IA au cœur de la solution | 20 % | L'intelligence produit une décision utile qu'une interface ou un tableau de bord seuls ne pourraient pas fournir, et sa qualité est évaluée. |
| Prototype fonctionnel | 20 % | Le parcours complet fonctionne de bout en bout, de l'incident à la décision approuvée, de façon fiable et démontrable. |
| Viabilité business | 20 % | Un client, un acheteur, une valeur économique, un pilote réaliste et une différenciation crédible sont établis. |
| Pitch et clarté | 15 % | Le problème, la valeur, l'IA, les preuves et la demande sont compris en sept minutes, avec une démonstration convaincante. |
| **Total officiel** | **100 %** | La cible interne de 98 exige des preuves presque maximales sur les cinq axes, sans masquer les limites. |

## 1. Pertinence du processus métier et impact mesuré — 25 %

### Preuves CableTwin déjà disponibles

- Le persona et la décision sont précis : un responsable de production doit réagir à l'arrêt d'une ligne dans une usine de câbles.
- Le parcours reproduit un processus métier complet : incident, commandes exposées, alternatives de replanification, comparaison, approbation humaine et journal de décision.
- Les trois alternatives sont évaluées sur le même incident et le même jeu de commandes.
- Le moteur calcule les commandes à l'heure ou en retard, les minutes de retard, les heures supplémentaires, les réaffectations et le coût estimé.
- Les données et hypothèses sont explicitement présentées comme synthétiques ; aucun résultat n'est attribué à Chakira Cables, COFICAB ou à une autre entreprise réelle.

### Lacunes à fermer

- Le problème n'est pas encore confirmé par un responsable industriel ou un mentor métier.
- Les coûts, cadences, compatibilités de lignes et pénalités de retard restent des hypothèses de démonstration.
- La fréquence réelle de ce type d'arbitrage et son coût annuel pour une usine tunisienne ne sont pas documentés.
- Les KPI actuels prouvent le fonctionnement du scénario, pas encore un impact industriel réel.

### Actions prioritaires

1. Obtenir une validation terrain concise : qui arbitre, à quelle fréquence, avec quelles données et quelle contrainte est la plus difficile.
2. Conserver une citation anonymisée et autorisée, ou une note d'entretien datée, dans la data room.
3. Remplacer au moins une hypothèse générique par une contrainte plausible confirmée par un industriel.
4. Afficher les formules, unités, sources et paramètres modifiables derrière chaque estimation.
5. Comparer chaque stratégie au même statu quo « sans replanification » et distinguer clairement résultat simulé, gain projeté et impact réel mesuré.

### Condition pour viser le maximum

Le jury doit pouvoir relier sans saut logique un problème confirmé à une décision opérationnelle, puis à un avant/après reproductible dont toutes les hypothèses sont visibles. Une simulation synthétique ne doit jamais être présentée comme un gain déjà réalisé en usine.

## 2. Intégration de l'IA au cœur de la solution — 20 %

### Preuves CableTwin déjà disponibles

- Le moteur génère trois plans de reprise à partir des mêmes commandes, contraintes de lignes et indisponibilité.
- Les stratégies optimisent des priorités différentes : service, coût et stabilité de l'atelier.
- Chaque proposition est accompagnée de KPI comparables et reste soumise à l'approbation humaine.
- Le calcul est déterministe et testable, ce qui facilite l'explication et l'audit.
- Un vérificateur séparé évalue 17 856 candidats d'affectation et de
  séquencement, trouve 10 440 plannings faisables et confirme les trois optima
  uniques du scénario borné.
- Un conseiller local par régression softmax suggère l'une des trois options
  déjà construites à partir de 16 facteurs explicables.
- Il est entraîné sur **687 incidents simulés générés par le jumeau lui-même**
  et atteint **93,6 % sur un test de la grille synthétique**.
- Les contrôles restent volontairement séparés : 9/9 pour le
  planificateur/workflow et 5/5 pour le conseiller.

### Lacunes à fermer

- La précision 93,6 % mesure l'accord avec une politique d'étiquetage
  synthétique, pas une performance sur incidents réels.
- La calibration, la généralisation au site et la préférence réelle des
  responsables restent à mesurer.
- Il manque encore une comparaison terrain avec la décision manuelle et une
  évaluation sur des incidents réels représentatifs.

### Actions prioritaires

1. Montrer clairement les trois briques distinctes : planificateur déterministe,
   conseiller appris et vérificateur exact borné.
2. Conserver la provenance « 687 incidents simulés générés par le jumeau
   lui-même » sur chaque preuve ML.
3. Ajouter une baseline terrain et mesurer la décision manuelle sur des
   incidents historiques représentatifs.
4. Réentraîner et valider le conseiller sur site uniquement lorsqu'un historique
   suffisant existe ; les données ne quittent jamais l'usine.
5. Si un LLM est ajouté, le limiter à l'explication ; il n'est jamais
   responsable des plannings ou KPI.

### Condition pour viser le maximum

Le jury doit voir que le planificateur produit les alternatives, que le modèle
appris ne fait que suggérer une option existante, que les facteurs sont
inspectables et que l'humain peut choisir autrement. Les résultats synthétiques
ne doivent jamais être présentés comme une preuve d'usine.

## 3. Prototype fonctionnel — 20 %

### Preuves CableTwin déjà disponibles

- Un prototype public et hors ligne relie l'interface au moteur de planification.
- Le scénario couvre trois lignes, dix ordres de fabrication et un arrêt simulé de quatre heures.
- L'utilisateur peut déclencher l'incident, comparer trois options, prévisualiser un planning, approuver une décision et réinitialiser la démonstration.
- La vue décision et le jumeau d'atelier isométrique partagent le même état,
  avec télémétrie et capteurs d'ambiance explicitement simulés.
- La suggestion ML locale, les trois onglets et l'override humain fonctionnent
  de bout en bout.
- L'approbation produit une trace visible.
- Le moteur possède des tests automatisés et ne dépend pas d'un service externe pour la démonstration principale.

### Lacunes à fermer

- Le parcours live doit encore être répété sur le réseau et la machine du pitch.
- La vidéo de 1:57.9 reste la preuve figée antérieure à l'Iteration 3 ; elle ne
  doit pas être décrite comme montrant le jumeau isométrique ou le conseiller.
- Les nouveaux documents et captures doivent être vérifiés contre le build live
  sans modifier les artefacts ou tags immuables.

### Actions prioritaires

1. Exécuter un test de bout en bout complet, puis le refaire après chaque changement important.
2. Tester le lancement depuis un clone propre et documenter une commande unique de démarrage.
3. Préparer la vidéo de deux minutes et des captures comme plan B, sans dépendance Internet.
4. Geler une version de démonstration avant la date limite et n'accepter ensuite que les corrections critiques.
5. Vérifier que tous les KPI affichés proviennent du moteur et qu'un reset restaure exactement l'état initial.

### Condition pour viser le maximum

Un juré doit pouvoir voir, sans intervention cachée, le même parcours réussir en direct et dans la vidéo : entrée d'incident, analyse, alternatives, décision, nouveau planning et audit.

## 4. Viabilité business — 20 %

### Preuves CableTwin déjà disponibles

- L'utilisateur cible est identifiable : responsable de production, planificateur ou directeur d'usine.
- La proposition de valeur est accessible : « le Waze de l'usine de câbles », pour tester une décision avant de la déployer dans l'atelier.
- Les KPI choisis peuvent alimenter un calcul de retour sur investissement.
- Le positionnement se distingue d'un tableau de bord passif : CableTwin compare des décisions et leurs conséquences.
- L'approche peut commencer par un jumeau opérationnel léger, sans exiger la numérisation complète de l'usine.

### Lacunes à fermer

- L'acheteur économique, le budget et le cycle de vente ne sont pas validés.
- Le coût d'un pilote, le modèle de prix et le seuil de rentabilité sont encore des hypothèses.
- Le plan d'intégration avec Excel, ERP, MES ou données d'atelier doit être précisé.
- La comparaison concurrentielle avec Excel, les APS, les MES et les solutions de digital twin n'est pas encore étayée par une matrice factuelle.
- Aucun industriel n'a encore exprimé son intérêt pour un pilote.

### Actions prioritaires

1. Définir séparément utilisateur, prescripteur, décideur et payeur.
2. Proposer un pilote limité avec périmètre, données nécessaires, étapes, responsable et critères de succès — en le présentant comme une proposition à valider.
3. Construire un calculateur de ROI paramétrable, sans transformer des hypothèses en chiffres de marché.
4. Préparer une matrice « Excel / MES-APS / jumeau lourd / CableTwin » fondée sur des fonctions vérifiables.
5. Obtenir au minimum une réaction documentée d'un mentor ou industriel sur l'intérêt, les objections et les conditions d'adoption.

### Condition pour viser le maximum

Le jury doit comprendre qui paie, pourquoi maintenant, comment un premier pilote réduit le risque, comment la valeur sera mesurée et pourquoi CableTwin mérite d'être choisi plutôt qu'un outil déjà présent.

## 5. Pitch et clarté — 15 %

### Preuves CableTwin déjà disponibles

- L'histoire de démonstration est simple : une ligne s'arrête, des commandes sont menacées, trois décisions sont comparées, un responsable choisit et garde la maîtrise.
- La métaphore « Waze de l'usine » rend le jumeau numérique compréhensible à un public non technique.
- Un document de pitch et une liste de questions du jury existent.
- Les hypothèses synthétiques et l'approbation humaine peuvent être montrées directement dans le produit.

### Lacunes à fermer

- La présentation finale `.pptx` n'est pas encore une preuve tant qu'elle n'est pas finalisée et chronométrée.
- Le script de sept minutes, la transition vers la démo et les réponses de quatre minutes doivent être répétés.
- Il faut éviter que les détails techniques du câble ou du moteur masquent le problème business.
- Un plan de reprise doit exister si la démonstration en direct échoue.

### Actions prioritaires

1. Construire le pitch autour de cinq preuves : problème, décision actuelle, solution, résultat mesuré et chemin vers le pilote.
2. Limiter chaque slide à une idée et faire apparaître l'IA comme un mécanisme concret, pas comme un slogan.
3. Répéter le format exact **7 minutes de pitch + 4 minutes de questions-réponses**.
4. Préparer des réponses brèves sur les données synthétiques, l'IA, la concurrence, le ROI, l'intégration et les limites.
5. Préparer une transition immédiate vers la vidéo ou les captures en cas d'échec du live.

### Condition pour viser le maximum

Une personne non technique doit pouvoir reformuler correctement, après sept minutes, le problème, la décision assistée, le rôle de l'IA, l'impact mesuré et la prochaine étape business.

## Les trois phases et les portes d'élimination

### Phase 1 — 17 juillet 2026 : l'idée

Livrable attendu : un document structuré, au format PDF ou texte, couvrant le problème, la solution, l'innovation, l'impact quantifié, la faisabilité, l'originalité, le public cible et la différenciation concurrentielle.

**Porte de passage :** chaque affirmation doit être soutenue par une preuve, une source ou une hypothèse clairement étiquetée. La richesse du dossier de travail ne remplace pas la soumission du livrable demandé.

### Phase 2 — 18 juillet 2026 : la construction

Cette phase est annoncée comme le livrable le plus lourd et celui qui pèse le plus dans l'évaluation finale. Elle exige :

- une présentation finale `.pptx` ;
- une data room technique ;
- une vidéo de démonstration de deux minutes ;
- un dépôt GitHub complet ;
- un brand kit ;
- et surtout un prototype fonctionnel de bout en bout.

**Porte de passage :** tous les éléments doivent être cohérents avec la même version du produit, ouvrables par le jury et soumis dans le format exact communiqué par e-mail.

### Phase 3 — 19 juillet 2026 : le pitch final

Cette phase est réservée aux équipes sélectionnées. Le format annoncé est de **7 minutes de pitch**, suivies de **4 minutes de questions-réponses**, avec démonstration en direct devant le jury.

**Porte de passage :** la démo principale, la vidéo de secours, le chronométrage et les réponses aux objections doivent être prêts avant la sélection.

## Règle d'élimination et discipline de soumission

Tout livrable manquant à l'heure limite entraîne l'élimination automatique, sans exception. La qualité d'un prototype ne compense donc jamais une soumission absente ou tardive.

Pour l'équipe solo SUPCOM :

- surveiller en continu la boîte e-mail du team leader, y compris les spams ;
- noter l'heure limite exacte dès réception de chaque message ;
- préparer le fichier final et son export avant la dernière heure ;
- vérifier les liens et permissions depuis une session privée ;
- conserver une copie locale et une preuve de soumission ;
- ne considérer une phase terminée qu'après confirmation de réception.

## Discipline de la cible 98/100

La cible interne 98/100 signifie « aucune faiblesse majeure et au plus deux points de marge sur l'ensemble », pas « déclarer 98 avant le jury ». Elle reste hors d'atteinte tant que :

- le problème et au moins une contrainte ne sont pas confirmés par le terrain ;
- le cœur IA n'est pas expliqué avec ses trois briques distinctes, puis comparé
  à une baseline terrain et évalué sur des données représentatives ;
- le prototype, la vidéo et le dépôt ne sont pas vérifiés de bout en bout ;
- le pilote, le ROI et la différenciation ne sont pas crédibles ;
- le pitch de sept minutes n'est pas répété en conditions réelles ;
- ou un seul livrable officiel n'est pas soumis dans les délais.

Toute fonctionnalité qui ne renforce pas l'une de ces preuves, un livrable obligatoire ou le parcours de démonstration reste hors MVP.
