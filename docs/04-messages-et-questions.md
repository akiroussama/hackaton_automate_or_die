# Messages prêts à envoyer et questions à poser

> Mise à jour du 17 juillet : **SUPCOM participe en solo** sur le challenge Industry. Les messages ci-dessous servent à confirmer le règlement, confronter le problème au terrain et préparer les objections du jury.

## Message urgent — règlement et timing

À envoyer aujourd'hui à l'organisateur ou au contact de l'événement, puis à relancer au check-in si aucune réponse n'arrive.

Les coordonnées ci-dessous proviennent du dossier initial fourni pour cette préparation et doivent être utilisées avec discernement : **CJD Tunis Horizon** — `cjdtunishorizon@gmail.com`, +216 95 999 644 ; **CJD Tunisie** — `contact@cjd.tn`, +216 70 294 959. Si un email de confirmation indique un autre contact, il prévaut.

### Français

> Bonjour,  
> Je participe à AUTOMATE OR DIE 2026 sur le challenge Industry avec l'équipe SUPCOM. Je souhaite confirmer les modalités pratiques de soumission.  
>
> Pour préparer un prototype conforme, pourriez-vous partager ou confirmer : le règlement et les critères du jury, l'heure de soumission et des pitchs, les données ou API mises à disposition, ainsi que les règles d'utilisation de code et outils préexistants ?  
>
> Mon prototype utilisera uniquement des données industrielles synthétiques, clairement signalées comme telles.  
>
> Merci beaucoup.

### English

> Hello,  
> I am participating in AUTOMATE OR DIE 2026 in the Industry challenge with team SUPCOM. I would like to confirm the submission arrangements.  
>
> To prepare a compliant prototype, could you please confirm or share the rules and judging criteria, submission and pitch times, any datasets or APIs provided, and the policy on pre-existing code and AI tools?  
>
> My prototype will use synthetic industrial data only, clearly identified as such.  
>
> Thank you.

## Message pour trouver un mentor ou un expert industriel

> Bonjour, je développe CableTwin, un jumeau numérique léger pour aider un responsable de production d'une usine de câbles à réagir à un arrêt de ligne. Le prototype montre les commandes touchées, simule plusieurs replanifications et laisse le responsable choisir puis valider le plan.  
>
> Le cas est fictif, repose sur des données synthétiques et n'est affilié à aucune entreprise réelle. J'aimerais confronter trois hypothèses au terrain en dix minutes : les contraintes de replanification les plus importantes, les indicateurs réellement regardés et les conditions nécessaires pour faire confiance à une recommandation.

## Les cinq questions à poser au mentor Industry

1. Lorsqu'une ligne de production de câbles s'arrête plusieurs heures, qui décide du nouveau planning et quelles informations lui manquent le plus ?
2. Quelles contraintes rendent le déplacement d'un ordre vers une autre ligne impossible ou risqué : compatibilité produit, outillage, qualification, matière, qualité ou disponibilité des équipes ?
3. Quels arbitrages comptent réellement : livraisons à l'heure, coût supplémentaire, heures additionnelles, nombre de changements ou stabilité du planning ?
4. Quelle recommandation un outil peut-il préparer automatiquement, et quelle décision doit obligatoirement rester validée par le responsable ?
5. Quel résultat rendrait un pilote crédible : temps de replanification réduit, commandes sauvées, retard évité, coût maîtrisé ou meilleure traçabilité des décisions ?

## Pitch de 20 secondes

> Quand une ligne de câbles s'arrête, le responsable doit comprendre en urgence quelles commandes seront en retard et comment réorganiser la production. CableTwin est le Waze de l'usine : il reproduit le planning, simule plusieurs itinéraires de reprise et compare leurs effets sur les délais, le coût et les changements. Le responsable garde la décision finale. La démonstration utilise des données synthétiques et ne représente aucune entreprise réelle.

## Questions au jury juste avant le pitch

- Combien de minutes sont prévues pour le pitch, la démonstration et les questions ?
- Une démonstration live est-elle obligatoire ou simplement recommandée ?
- Les critères sont-ils pondérés, et quelle priorité donnent-ils à l'impact, à la faisabilité et à l'innovation ?
- Quel livrable faut-il soumettre, dans quel format et avant quelle heure ?
- Les données synthétiques sont-elles acceptées si elles sont clairement identifiées et accompagnées d'un plan de validation terrain ?
- Le jury attend-il surtout un prototype fonctionnel, une proposition de pilote industriel ou les deux ?

## Réponses courtes aux objections probables

| Objection | Réponse utile |
| --- | --- |
| « Ce n'est qu'un planning ou un dashboard. » | « Le planning est la représentation visible. La valeur vient du moteur qui propage l'incident, mesure ses conséquences, compare plusieurs plans de reprise et trace la décision validée. » |
| « Pourquoi parler de jumeau numérique ? » | « Parce que CableTwin maintient une représentation exploitable des lignes, commandes, contraintes et événements, puis permet de tester une décision avant de l'appliquer à l'usine. C'est volontairement un jumeau opérationnel léger, pas une simulation physique complète. » |
| « L'algorithme peut proposer un plan irréaliste. » | « Le moteur ne peut déplacer une commande que vers une ligne déclarée compatible et respecte les contraintes explicites du scénario. Surtout, il recommande : le responsable compare, choisit et valide. » |
| « Les données sont synthétiques. » | « C'est explicite et volontaire pour prouver le workflow sans revendiquer de données industrielles confidentielles. Le premier pilote consistera à remplacer le jeu synthétique par les contraintes et historiques validés avec une usine partenaire. » |
| « Est-ce inspiré d'une entreprise particulière ? » | « Non. Le cas représente une usine de câbles tunisienne fictive et CableTwin n'est affilié à aucune entreprise réelle. Les exemples publics du secteur servent uniquement à établir la pertinence industrielle du domaine. » |
| « Pourquoi pas Excel ou un outil de planification existant ? » | « CableTwin ne cherche pas à remplacer l'ERP. Il ajoute une couche de simulation rapide au moment d'un incident : voir les commandes touchées, comparer les compromis et enregistrer la décision avant de renvoyer le plan validé vers les outils existants. » |
| « Comment l'intégrer dans une vraie usine ? » | « Le pilote commence sur une ligne et un type d'incident, avec import des ordres et contraintes depuis un fichier ou l'ERP. On mesure ensuite le temps de replanification, les retards évités et l'acceptation des recommandations avant toute extension. » |
| « Où est l'IA ? » | « Dans la recherche et planification sous contraintes : le moteur évalue les lignes et créneaux possibles selon trois objectifs, puis expose les compromis. C'est une heuristique déterministe et explicable, pas un LLM ni une promesse d'optimum global. Avec des historiques réels, une couche prédictive pourrait ensuite estimer la durée des incidents. » |
| « Comment gagnez-vous de l'argent ? » | « Le modèle envisagé est un pilote payé sur un atelier, puis un abonnement par site selon le nombre de lignes et de connecteurs. Il devra être validé par la valeur mesurée : temps de replanification, commandes protégées et coûts d'incident évités. » |
