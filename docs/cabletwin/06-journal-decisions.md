# CableTwin — journal des décisions

Ce journal conserve la démarche, y compris les idées abandonnées. Un pivot n'est pas un échec : il montre que le problème a été clarifié avant l'implémentation.

## D-001 — partir de la valeur, pas de la technologie

**Observation :** l'appel Industry insiste sur les applications concrètes, la productivité, l'agilité, la compétitivité et la transformation du tissu industriel tunisien.

**Décision :** toute solution doit montrer une décision opérationnelle et un résultat mesurable. Une conversation ou un modèle isolé ne suffit pas.

## D-002 — ne pas retenir la maintenance prédictive générique

**Option étudiée :** ShiftGuard, de l'anomalie capteur vers l'ordre de maintenance.

**Raison du rejet comme concept principal :** faisable et crédible, mais très fréquent en hackathon et insuffisamment différenciant sans données industrielles réelles.

## D-003 — ne pas retenir un optimiseur applicable à n'importe quel pays

**Option étudiée :** LineRescue, replanification après arrêt de machine.

**Raison du rejet comme concept principal :** le problème est réel, mais la première formulation n'était pas assez enracinée dans un secteur industriel tunisien reconnaissable.

## D-004 — ne pas faire de la réglementation le cœur émotionnel du pitch

**Option étudiée :** CarbonPulse TN, énergie et traçabilité carbone pour les exportateurs.

**Raison du rejet comme concept principal :** pertinent en 2026, mais moins immédiatement parlant pour un public général et trop éloigné du terrain industriel choisi.

## D-005 — choisir l'industrie tunisienne du câble

**Observation :** Chakira Cables et COFICAB illustrent une industrie tunisienne capable de produire pour des marchés et standards internationaux. Elles servent uniquement de références sectorielles publiques ; aucune donnée ni difficulté interne ne leur est attribuée.

**Décision :** situer le prototype dans une usine de câbles fictive et utiliser un langage métier simple : lignes, commandes, délais, clients et décisions.

## D-006 — passer de CableZero à CableTwin

**Option étudiée :** prédire des défauts techniques pendant l'extrusion.

**Retour :** l'explication exigeait trop de détails techniques pour un jury généraliste.

**Décision finale :** construire un jumeau numérique opérationnel qui permet de voir les conséquences d'un incident et de tester les décisions avant de toucher à la vraie usine.

## D-007 — définir le jumeau numérique par ce qu'il permet de décider

CableTwin n'est pas une animation 3D. Il doit obligatoirement contenir :

1. un état de l'usine ;
2. un événement qui modifie cet état ;
3. une simulation des conséquences ;
4. plusieurs décisions comparables ;
5. une validation humaine et une trace.

**Formulation retenue :**

> CableTwin est le Waze de l'usine de câbles : lorsque la route de production change, il montre les conséquences et propose des chemins alternatifs avant que le responsable décide.

## D-008 — ajouter une vue isométrique sans transformer le produit en spectacle

**Observation :** la vue décision prouve le calcul, mais un jury comprend plus
vite l'incident lorsqu'il voit la ligne arrêtée, les ordres exposés et les
réaffectations dans l'atelier.

**Décision :** ajouter un jumeau d'atelier isométrique piloté par le même état
exécutable. La vue montre lignes, ordres, opérateurs et télémétrie simulée, mais
elle ne prétend pas être une réplique CAO, physique ou connectée. La règle D-007
reste valable : l'animation sert la décision, elle ne la remplace pas.

## D-009 — séparer le conseiller appris du planificateur

**Observation :** le planificateur déterministe produit déjà trois routes
réalisables et vérifiables. Lui attribuer un apprentissage brouillerait la
preuve et le rôle de l'humain.

**Décision :** conserver le planificateur non apprenant et ajouter un conseiller
local séparé. Il est entraîné sur **687 incidents simulés générés par le jumeau
lui-même**, suggère l'une des trois routes existantes et ne modifie aucun plan.
Les contrôles restent séparés : 9/9 pour le planificateur/workflow, 5/5 pour le
conseiller. Dans un pilote, le réentraînement se fait sur site afin que les
données réelles ne quittent jamais l'usine, uniquement si un historique
représentatif suffisant existe, et l'approbation demeure humaine.
