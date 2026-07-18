# CableTwin — démonstration et pitch

_Message directeur : la technologie est un jumeau numérique ; le produit est une meilleure décision._

## Positionnement public

**Nom :** CableTwin  
**Signature :** _Voir avant de décider._  
**Catégorie :** aide à la décision pour la production de câbles  
**Analogie :** le Waze de l'usine de câbles

La formulation à retenir :

> **CableTwin permet aux industriels tunisiens du câble de voir les conséquences d'une décision avant de la prendre.**

## Histoire de démonstration

Une usine doit terminer plusieurs commandes aujourd'hui. Son planning est réalisable et les voyants sont au vert. Soudain, la ligne 2 devient indisponible pendant quatre heures.

Sans action, certaines commandes sont menacées. CableTwin reproduit l'incident
dans le jumeau d'atelier, calcule trois réponses réalisables et les affiche dans
la vue isométrique. Un conseiller ML local suggère l'une de ces options ; le
responsable compare les conséquences, peut choisir une autre route et approuve.
La vraie production n'est jamais commandée par le prototype.

## Storyboard de la démo live — 90 secondes

### 0–15 s — Le monde normal

Ouvrir directement `/#twin` : trois lignes, les commandes du jour, les
opérateurs et les KPI au vert. Pointer une seule fois l'étiquette
« Télémétrie simulée · données 100 % synthétiques ».

Dire :

> « Voici le planning synthétique d'une usine tunisienne de câbles : trois lignes et dix commandes à livrer. »

### 15–30 s — L'incident

Cliquer sur **Simuler l'arrêt de la ligne 2**.

Dire :

> « À 10 h, une ligne s'arrête pendant quatre heures. La vraie question n'est pas seulement quand elle repart : quelles commandes allons-nous perdre si nous ne faisons rien ? »

L'écran met en évidence **3 commandes menacées**, **620 minutes de retard cumulé** et le surcoût simulé du statu quo.

### 30–55 s — Le jumeau teste les décisions

Déclencher le recalcul dans le jumeau, laisser apparaître les compteurs
**17 856 → 10 440**, puis les trois options calculées par le planificateur.

Dire :

> « CableTwin injecte l'incident dans la copie numérique de l'usine. Son planificateur déterministe construit trois plans qui respectent les compatibilités, durées et capacités connues. Un modèle local, entraîné sur 687 incidents simulés générés par le jumeau lui-même, suggère ensuite l'une de ces routes sans jamais la modifier. »

Afficher la suggestion **Coût maîtrisé · 79 %**, les trois onglets avec les
mêmes KPI et la mention **93,6 % sur test synthétique**.

### 55–75 s — Le compromis devient visible

Comparer Coût et Service, puis sélectionner Service pour montrer que l'humain
peut ignorer la suggestion.

Dire :

> « Le modèle suggère Coût selon une politique d'arbitrage explicite. Mais le responsable peut préférer Service : 140 minutes de retard avec trois changements, contre 170 minutes et deux changements pour Coût. Le compromis reste visible avant de toucher au planning réel. »

### 75–90 s — La décision reste humaine

Approuver une option et afficher le planning révisé avec son journal.

Dire :

> « Le responsable décide. CableTwin explique, trace et prépare le nouveau plan. Aujourd'hui, toutes les données et la télémétrie sont synthétiques. Demain, un pilote lit l'ERP en lecture seule et, si l'historique est suffisant, réentraîne le conseiller sur site : les données ne quittent jamais l'usine et aucune machine n'est commandée. »

## Pitch de 90 secondes

> Dans une usine de câbles, le planning peut être parfait à 8 heures et devenir faux à 10 heures lorsqu'une ligne s'arrête. Le responsable de production doit alors répondre à une question urgente : quelles commandes protéger, et à quel coût ?
>
> Aujourd'hui, cette décision dépend souvent d'informations dispersées et de l'expérience de quelques personnes. On peut réorganiser l'atelier, mais il est difficile de voir toutes les conséquences avant d'agir.
>
> CableTwin est un simulateur de décisions pour l'usine. Il maintient une copie numérique simplifiée des lignes, commandes et capacités. Lorsqu'un incident survient, il montre d'abord ce qui arrivera sans action. Puis son moteur déterministe de recherche et planification construit trois plans réalisables : protéger les clients prioritaires, maîtriser le coût ou préserver la stabilité de l'atelier. Un conseiller ML local, séparé, suggère l'une de ces routes et explique ses facteurs ; le responsable garde la décision.
>
> Le responsable compare les résultats, comprend les compromis et garde la décision finale. Chaque choix est traçable.
>
> Notre prototype utilise uniquement des données synthétiques et ne prétend représenter aucune entreprise. La prochaine étape est un pilote en lecture seule à partir d'un export ERP.
>
> CableTwin donne à l'industrie tunisienne du câble un avantage simple : voir avant de décider.

## Structure du pitch de trois minutes

| Temps | Message | Preuve à l'écran |
| --- | --- | --- |
| 0:00–0:25 | Un arrêt transforme le planning en pari | Incident et commandes menacées |
| 0:25–0:50 | Persona, décision et conséquence | Responsable production + KPI principal |
| 0:50–1:35 | Démonstration de bout en bout | Impact → options → comparaison → approbation |
| 1:35–1:55 | Pourquoi l'IA est nécessaire | Plusieurs plans explorés sous contraintes |
| 1:55–2:15 | Confiance | Contraintes visibles, humain responsable, journal |
| 2:15–2:35 | Faisabilité | Prototype offline, données synthétiques, chemin ERP/MES |
| 2:35–2:50 | Impact à mesurer | Service, retard, effort, temps de décision |
| 2:50–3:00 | Vision et conclusion | « Voir avant de décider » |

## Slides minimales

1. **Un incident, plusieurs conséquences** — problème et persona.
2. **CableTwin : tester avant d'agir** — flux en six étapes.
3. **Démo** — consacrer la majorité du temps au produit.
4. **Résultat de simulation** — avant/après, mêmes KPI, données synthétiques.
5. **Du prototype au pilote** — CSV/ERP en lecture seule, puis intégration contrôlée.
6. **Pourquoi SUPCOM** — problème tunisien précis, décision concrète, humain responsable.

## Correspondance avec les attentes du jury

| Attente | Réponse CableTwin | Preuve |
| --- | --- | --- |
| Application IA concrète | Génération et comparaison de plans sous contraintes | Options réellement calculées |
| Forte valeur ajoutée | Protège les délais et rend les compromis visibles | KPI avant/après |
| Productivité | Réaffecte la capacité après une perturbation | Charge et commandes replannifiées |
| Agilité | Réduit le chemin incident → décision | Parcours de 90 secondes |
| Compétitivité | Aide à tenir les engagements clients | Commandes à l'heure |
| Faisabilité | Petit périmètre, offline, import futur simple | Trois lignes, dix commandes, un incident |
| Innovation | Le jumeau sert à décider, pas seulement à surveiller | Simulation « what if » |
| Confiance | Contraintes explicites et validation humaine | Journal d'approbation |
| Ancrage tunisien | Cas d'usage d'une usine tunisienne de câbles | Contexte sectoriel, sans fausse affiliation |

## Mots-clés à employer

- décision avant action ;
- simulation « what if » ;
- usine virtuelle ;
- continuité de production ;
- engagements clients ;
- efficacité opérationnelle ;
- agilité industrielle ;
- optimisation sous contraintes ;
- compromis visible ;
- validation humaine ;
- traçabilité ;
- pilote en lecture seule ;
- données synthétiques clairement étiquetées ;
- transformation du tissu industriel tunisien.

## Formulations à éviter

| À éviter | Dire plutôt |
| --- | --- |
| « Nous avons modélisé Chakira/COFICAB » | « Nous avons construit un scénario synthétique inspiré du secteur tunisien du câble » |
| « Le système garantit zéro retard » | « Il compare des options pour réduire l'impact selon les contraintes connues » |
| « Notre IA décide à la place de l'usine » | « Le responsable compare et approuve » |
| « Nous avons un vrai digital twin connecté » | « Nous démontrons le noyau d'un jumeau opérationnel ; la connexion relève du pilote » |
| « Nous économisons X DT » sans preuve | « Le pilote mesurera le gain sur les KPI réels » |
| « Notre algorithme est révolutionnaire » | « Voici la décision qu'il améliore et le résultat calculé » |
| « L'IA prédit tout » | « Le moteur teste des plans sous des contraintes explicites » |

## Questions difficiles du jury

### « Est-ce vraiment un digital twin ? »

> « Le prototype démontre le noyau décisionnel : un état numérique calculable, un événement, une simulation et un retour vers un plan approuvé. Il utilise aujourd'hui un instantané synthétique. Un pilote ajouterait la synchronisation avec l'ERP/MES ; nous ne prétendons pas être déjà connectés à une usine. »

### « Pourquoi pas Excel ou un logiciel de planning existant ? »

> « Excel peut stocker le planning. CableTwin injecte un incident, vérifie les contraintes, explore plusieurs réponses et compare leurs conséquences sur la même base. Le pilote devra justement démontrer que ce temps de décision est réduit par rapport au processus actuel. »

### « Où est l'IA ? »

> « Il y a deux briques distinctes. Le planificateur symbolique et déterministe construit trois plans réalisables sous contraintes. Puis une régression softmax locale suggère l'une de ces routes à partir de 16 facteurs explicables. Elle a été entraînée sur 687 incidents simulés générés par le jumeau lui-même et atteint 93,6 % sur un sous-ensemble tenu à l'écart de cette grille synthétique. Elle ne modifie aucun plan : le responsable décide. »

### « Vos données viennent-elles d'une entreprise ? »

> « Non. Elles sont entièrement synthétiques et visibles comme telles, y compris les 687 incidents d'entraînement et toute la télémétrie. Nous avons choisi le secteur du câble comme ancrage industriel tunisien. Dans un pilote, le réentraînement n'aurait lieu qu'avec un historique représentatif suffisant, hébergé sur site : ses données ne sortent jamais. »

### « Quel est le ROI ? »

> « Nous ne fabriquons pas un ROI. Le prototype mesure commandes à l'heure, retard, heures supplémentaires, changements et coût simulé. Un pilote convertirait ces écarts avec les paramètres réels de l'industriel. »

### « Que se passe-t-il si la durée de panne est fausse ? »

> « La durée est une hypothèse visible et modifiable. Le responsable peut relancer les scénarios lorsque l'estimation évolue ; le produit ne cache pas l'incertitude. »

### « Pourquoi commencer par le câble ? »

> « Le câble offre une histoire industrielle tunisienne forte et un processus composé d'étapes dépendantes, où une perturbation peut affecter plusieurs commandes. Nous validons néanmoins chaque contrainte avant de la présenter comme réelle. »

## Checklist de fiabilité de la démo

- scénario chargé localement ;
- étiquette « données synthétiques » visible ;
- vue `/#twin` chargée et télémétrie simulée visible ;
- `npm run check` vérifié à 9/9 et `npm run check:recommender` séparément à 5/5 ;
- suggestion Coût à 79 %, puis sélection manuelle de Service répétée ;
- bouton de réinitialisation testé ;
- un incident et trois options pré-calculables si le moteur échoue ;
- mêmes définitions de KPI et même incident pour les trois cartes ;
- aucun résultat financier non sourcé ;
- chronométrage sous 90 secondes ;
- capture vidéo de secours ;
- captures d'écran dans les slides ;
- pitch possible sans réseau ni LLM ;
- aucune mention laissant croire à un partenariat industriel.

## Dernière phrase

> **Une usine agile n'est pas celle qui n'a jamais d'imprévu ; c'est celle qui peut en voir les conséquences et choisir la meilleure réponse avant d'agir. CableTwin lui donne cette visibilité.**
