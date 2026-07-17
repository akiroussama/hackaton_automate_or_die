# Archive d’exploration — ShiftGuard

> **Concept abandonné comme projet principal.** Ce document est conservé uniquement pour montrer la démarche de sélection. Le projet courant est [CableTwin](../cabletwin/00-probleme.md).

## Résumé en une phrase

**ShiftGuard transforme des signaux industriels dispersés en une décision de maintenance explicable et validée par un humain, avant qu'un petit écart ne devienne un arrêt de ligne.**

## Pourquoi ce choix

Il répond directement aux quatre axes publics du track Industry : usine intelligente, maintenance prédictive, optimisation de processus et efficacité opérationnelle. Surtout, il raconte une automation complète au lieu de n'afficher qu'un score de prédiction ou une conversation avec un LLM.

| Option | Valeur démontrable en 3 jours | Risque solo | Décision |
| --- | --- | --- | --- |
| Chatbot qui répond sur la maintenance | Rapide, mais banal et peu mesurable | Faible | Éviter comme produit principal |
| Modèle prédictif de panne pur | Technique, mais difficile à expliquer sans bonnes données | Moyen/élevé | Utiliser seulement comme composant |
| **ShiftGuard : anomalie → décision → action** | Métier, démonstratif, réaliste et responsable | **Maîtrisé** | **Choix par défaut** |
| Optimisation générale de la production | Impact potentiel fort, mais nécessite données et modélisation métier | Élevé | Garder en plan B seulement si le brief fournit les données |

## Problème métier

Dans un atelier, le chef de maintenance reçoit une multitude de signaux — température, vibrations, pression, consommation, alarmes — tandis que les procédures sont dans des PDF. Les alertes sont traitées tardivement ou de manière hétérogène. Les conséquences : arrêts imprévus, perte de rendement, pièces changées inutilement et faible traçabilité.

Pour le track Industry, raconter aussi le gain macro : une usine plus productive et plus agile utilise mieux ses experts, sécurise sa disponibilité et progresse vers une transformation numérique concrète. Le langage du pitch doit parler de **compétitivité industrielle**, pas seulement de technologie.

## Utilisateur et scénario de démo

**Utilisateur primaire :** responsable de maintenance d'une ligne de conditionnement, pompe industrielle ou moteur.

**Scénario (90 secondes) :**

1. La ligne `P-204` est stable, puis ses vibrations et sa température dérivent sur les 30 dernières minutes.
2. ShiftGuard détecte un risque élevé et montre les facteurs : vibration `+38 %`, température `+14 °C`, hausse d'énergie.
3. Il retrouve la procédure de maintenance pertinente et recommande : inspection planifiée dans les 4 h, contrôle du roulement, baisse temporaire de charge.
4. L'opérateur compare l'impact d'un arrêt planifié avec celui d'une panne estimée, puis clique **Approuver l'intervention**.
5. L'application crée un ordre de travail **simulé**, avec checklist, niveau de confiance, source documentaire et journal d'audit.

La machine n'est jamais pilotée automatiquement : une décision humaine est obligatoire. C'est une force de confiance et de sécurité, pas une limitation.

## MVP non négociable

| Élément | Contenu minimal | Ce que le jury voit |
| --- | --- | --- |
| Tableau d'état | 3 à 5 équipements, état vert/ambre/rouge, risque et tendance | Une situation lisible dès l'ouverture |
| Détection | Règle robuste ou modèle simple : z-score / Isolation Forest sur 3 capteurs | Un score fondé sur les signaux, pas un texte inventé |
| Explication | Les 2–3 facteurs qui ont déclenché l'alerte | Une décision interprétable |
| Procédure contextualisée | 2 fiches d'entretien courtes, locales, avec extrait cité | Une action ancrée dans une source |
| Validation humaine | Boutons approuver / escalader / ignorer, avec raison | Un workflow responsable |
| Ordre de travail | Carte de tâche simulée : équipement, priorité, cause, checklist et horodatage | Une automation métier complète |
| Démo reproductible | Jeu de données local, bouton « lancer le scénario critique » | Zéro dépendance au Wi-Fi |

## À ne pas construire avant le pitch

- Une architecture multi-agents complexe.
- Un modèle deep learning entraîné pendant le hackathon.
- Une vraie intégration SAP, Siemens, Azure IoT ou outil CMMS sans accès confirmé.
- Une app mobile, authentification, rôles multiples ou paiement.
- Un chat libre qui peut recommander une action dangereuse sans contrôle.

## Architecture de démo

```text
CSV local de télémétrie
        │
        ▼
Détection d'anomalie déterministe
        │  (score + facteurs)
        ├──────────► Mini-base documentaire locale
        │                 │
        ▼                 ▼
  Moteur de décision + garde-fous
        │
        ▼
Interface opérateur ──► approbation humaine ──► ordre de travail simulé + journal
```

### Stack recommandée

- **Option la plus rapide** : Python + Streamlit + `pandas` + `scikit-learn`, le tout local.
- **Option si tu es déjà plus rapide en web** : React/Vite + API FastAPI, avec les calculs côté Python.
- Données dans CSV / JSON locaux. Garder les procédures en Markdown ou petits fichiers texte, plus fiables qu'un PDF à parser en direct.
- LLM seulement pour reformuler le diagnostic en langage naturel ou répondre sur les fiches d'entretien ; prévoir une réponse template si aucune clé/API n'est disponible.

Le modèle ou le LLM ne doit jamais être le cœur de la démo : les chiffres, les sources et le workflow le sont.

## Données de démonstration

Préparer quatre équipements et une chronologie de 60 points par équipement :

| Actif | État | Signaux | Cas de démo |
| --- | --- | --- | --- |
| `P-204` — pompe | Critique | vibration, température, énergie | Dérive progressive ; inspection urgente |
| `M-102` — moteur | À surveiller | vibration, charge | Désalignement possible ; suivi programmé |
| `C-011` — compresseur | Sain | pression, température, énergie | Référence normale |
| `F-085` — ventilateur | Sain | vibration, température | Référence normale |

Afficher clairement : **« Données synthétiques de démonstration — pas une prédiction de production. »** Cela protège la crédibilité du projet et ouvre la discussion sur l'intégration réelle.

## Mesures d'impact à employer avec honnêteté

Ne pas inventer de chiffre client. Montrer plutôt un calcul paramétrable :

```text
coût d'arrêt évité = heures d'arrêt évitées × coût horaire de la ligne
valeur nette estimée = coût d'arrêt évité − coût de l'intervention planifiée
```

La démonstration peut utiliser un exemple étiqueté « hypothèse pilote » (par exemple 3 h et 1 000 DT/h), que le jury pourra modifier. L'important est de montrer comment la valeur sera mesurée : taux d'alertes pertinentes, temps de triage, arrêts non planifiés, MTTR, disponibilité/OEE.

## Garde-fous à dire explicitement

- Décision finale et toute action sur machine restent humaines.
- Les recommandations citent une procédure, leur niveau de confiance et les données qui les motivent.
- Toute donnée client serait cloisonnée, journalisée et soumise à une politique de rétention.
- Les alertes sans confiance suffisante deviennent une demande d'inspection, jamais une commande automatique.

## Plan B suivant le brief

| Si le brief apporte… | Adapter ShiftGuard ainsi |
| --- | --- |
| Des données énergétiques | Détecter dérives de consommation et proposer des créneaux / réglages à valider |
| Des données de qualité | Relier paramètres de ligne, risque de défaut et action d'inspection |
| Une entreprise partenaire | Reprendre son équipement et son jargon, sans élargir le workflow |
| Aucun dataset / Wi-Fi fragile | Conserver les CSV synthétiques et le mode local |

## Critères implicites à maximiser

Ils ne sont pas publiés dans les pages consultées ; ce sont donc des hypothèses à vérifier avec le jury. Le projet est conçu pour être robuste sur les critères les plus usuels :

- problème et valeur métier clairs ;
- automatisation visible de bout en bout ;
- faisabilité en environnement industriel ;
- différenciation par l'explicabilité et la validation humaine ;
- démonstration fiable ;
- qualité du pitch, de l'équipe et de la suite proposée.
