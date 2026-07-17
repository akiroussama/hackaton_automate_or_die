# CableTwin — le Waze de l’usine de câbles

Prototype préparé par **l’équipe SUPCOM (1 participant)** pour le track **Industry** d’AUTOMATE OR DIE 2026.

CableTwin est un jumeau numérique opérationnel léger : lorsqu’une ligne s’arrête, il montre les commandes, délais et coûts exposés, compare trois chemins de reprise, puis laisse le responsable production choisir et tracer sa décision.

> Voir demain avant de décider aujourd’hui.

## Lancer la démonstration

Prérequis : Node.js 22 ou version récente.

```powershell
npm run dev
```

Ouvrir ensuite <http://127.0.0.1:4173/>.

Pour vérifier le moteur :

```powershell
npm test
npm run check
npm run benchmark:exact
```

## Livrables officiels

L'organisation a annoncé trois phases éliminatoires. Un livrable manquant à l'échéance entraîne l'élimination.

- **Phase 1 - 17 juillet :** [document d'idée éditable](docs/submissions/phase-1-idea.md) et [PDF prêt à soumettre](output/pdf/CableTwin_Phase1_Idea_SUPCOM.pdf).
- **Phase 2 - 18 juillet :** [audit et checklist des six livrables](docs/submissions/phase-2-delivery-checklist.md).
- **Phase 3 - 19 juillet :** 7 minutes de pitch, 4 minutes de questions-réponses et démonstration live pour les équipes sélectionnées.

La [grille officielle et la stratégie de preuve](docs/cabletwin/05-evaluation-98.md) suivent les pondérations `25 / 20 / 20 / 20 / 15`. L'heure exacte et le lien de chaque soumission doivent être repris du prochain e-mail reçu par le team leader SUPCOM.

Pour reconstruire le PDF Phase 1 :

```powershell
npm run build:phase1
```

La commande détecte automatiquement le Python fourni par Codex. Hors de cet
environnement, installer au besoin la dépendance avec
`python -m pip install -r requirements-pdf.txt`.

## Parcours de 90 secondes

1. Le planning nominal affiche **3 lignes et 10 commandes à l’heure**.
2. Cliquer sur **Simuler l’arrêt de la ligne 2**.
3. CableTwin révèle le statu quo : **3 commandes menacées**, **620 minutes de retard cumulé**.
4. Comparer les stratégies **Service**, **Coût maîtrisé** et **Stabilité**.
5. Prévisualiser une option : le Gantt et les KPI sont recalculés.
6. Valider le plan : la décision humaine apparaît dans le journal d’audit.
7. Cliquer sur **Recommencer** pour restaurer exactement le scénario initial.

## La démarche, du problème à l’implémentation

| Étape | Document |
| --- | --- |
| Problème, persona et processus actuel | [`00-probleme.md`](docs/cabletwin/00-probleme.md) |
| Hypothèses, validations terrain et portes de preuve | [`01-hypotheses-et-validation.md`](docs/cabletwin/01-hypotheses-et-validation.md) |
| Proposition de valeur, périmètre et critères d’acceptation | [`02-product-spec.md`](docs/cabletwin/02-product-spec.md) |
| Démo, pitch et réponses au jury | [`03-demo-et-pitch.md`](docs/cabletwin/03-demo-et-pitch.md) |
| Architecture, limites et trajectoire pilote | [`04-architecture.md`](docs/cabletwin/04-architecture.md) |
| Grille interne de preuve cible 98/100 | [`05-evaluation-98.md`](docs/cabletwin/05-evaluation-98.md) |
| Décisions, pivots et idées volontairement écartées | [`06-journal-decisions.md`](docs/cabletwin/06-journal-decisions.md) |
| Tests, parcours contrôlé et preuves restantes | [`07-validation-technique.md`](docs/cabletwin/07-validation-technique.md) |

Le [contexte de l’événement](docs/01-contexte-evenement.md), le [plan des trois jours](docs/03-plan-execution-et-checklists.md), les [questions aux organisateurs](docs/04-messages-et-questions.md) et le [benchmark 2026](docs/05-benchmark-hackathons-ia-industry-2026.md) restent disponibles. Les concepts abandonnés sont conservés uniquement comme traces d’exploration.

## Où se trouve l’intelligence

Le cœur du MVP est un **planificateur symbolique multiobjectif explicable**, une forme établie d’IA fondée sur la recherche et la planification sous contraintes :

- il encode les lignes éligibles, durées, échéances, priorités, coûts et indisponibilités ;
- il recherche des créneaux réalisables après l’incident ;
- il applique trois politiques de décision et calcule leurs conséquences sur les mêmes données ;
- il expose le compromis au lieu de masquer la décision derrière une boîte noire.

Un vérificateur indépendant énumère exactement le scénario canonique : **17 856 candidats**, **10 440 plannings faisables**, et confirme que les trois plans affichés sont les optima uniques de leurs politiques respectives. Cette preuve est volontairement bornée à la démonstration ; elle ne prétend pas résoudre à l’exactitude une usine entière.

Ce MVP ne prétend pas avoir appris sur les données d’une usine. Dans un pilote réel, une couche prédictive pourrait estimer la durée d’un incident et ses incertitudes ; le planificateur resterait soumis aux contraintes validées par le responsable.

## Ce qui est vrai, ce qui est simulé

- Le moteur, les contraintes, les calculs de KPI, la sélection et le journal d’approbation fonctionnent réellement.
- Les lignes, commandes, clients, coûts et l’incident sont **entièrement synthétiques**.
- Le prototype ne se connecte à aucune machine et n’envoie aucun ordre à un ERP ou MES.
- Chakira Cables et COFICAB/Elloumi sont uniquement des inspirations sectorielles publiques ; aucune donnée ni difficulté interne ne leur est attribuée.

## Structure

```text
app/       interface narrative et interactions
engine/    scénario synthétique, planificateur et vérificateur exact
tests/     tests déterministes du moteur
docs/      contexte du hackathon et démarche CableTwin
scripts/   serveur local sans dépendance
```
