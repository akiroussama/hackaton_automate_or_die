# Phase 2 — audit des livrables du 18 juillet 2026

**Projet :** CableTwin  
**Équipe :** SUPCOM — un seul participant  
**Date de l’audit :** 17 juillet 2026  
**Règle critique :** un livrable absent à l’échéance entraîne l’élimination automatique.

## Verdict immédiat

Le prototype local est fonctionnel et testé, mais le dossier Phase 2 n’est **pas encore soumissionnable** : cinq des six livrables nécessitent encore une production ou une consolidation, et le dépôt GitHub n’a aucun commit.

| Ordre | Livrable obligatoire | État réel | Propriétaire |
| ---: | --- | --- | --- |
| 1 | Working end-to-end prototype | **PRÊT localement** | Team leader SUPCOM |
| 2 | Complete GitHub repository | **PARTIEL** | Team leader SUPCOM |
| 3 | Technical data room | **PARTIEL** | Team leader SUPCOM |
| 4 | Brand kit | **MANQUANT** | Team leader SUPCOM |
| 5 | Final presentation `.pptx` | **MANQUANT** | Team leader SUPCOM |
| 6 | Demo video de 2 minutes | **MANQUANT** | Team leader SUPCOM |

Tous les rôles reviennent à la même personne. L’ordre ci-dessus est donc séquentiel : stabiliser la preuve technique, la publier, consolider les preuves, puis fabriquer les supports qui reposent sur cette version figée.

## 1. Working end-to-end prototype — PRÊT localement

### Preuves actuellement présentes

- Interface : `app/index.html`, `app/styles.css`, `app/app.js`.
- Moteur : `engine/factory-data.js`, `engine/twin-engine.js`.
- Certificat exact : `engine/exact-benchmark.js`, `scripts/run-exact-benchmark.mjs`.
- Serveur local : `scripts/serve.mjs`.
- Tests : `tests/twin-engine.test.mjs`.
- Lancement et parcours : `README.md`.
- Rapport de validation : `docs/cabletwin/07-validation-technique.md`.
- Contrôle du 17 juillet : `npm run check` réussit, **9 tests sur 9** ; `npm run benchmark:exact` confirme les trois optima du scénario canonique parmi **10 440** plannings faisables.

### Critères de fini avant soumission

- [ ] `npm run check` réussit sur la machine de présentation.
- [ ] Le parcours complet fonctionne hors ligne : état nominal → arrêt de ligne → comparaison de trois stratégies → sélection → validation humaine → journal d’audit → reset.
- [ ] Un test complet est refait après toute dernière modification.
- [ ] Les données synthétiques, hypothèses et limites sont visibles, sans affiliation prétendue avec une usine réelle.
- [ ] Une copie autonome du prototype est incluse dans le paquet de secours.
- [ ] Un navigateur, Node.js et la résolution du projecteur sont testés avant le pitch.

### Fichiers attendus

- Sources existantes dans `app/`, `engine/`, `scripts/` et `tests/`.
- `submissions/phase-2/CableTwin_SUPCOM_Prototype.zip` — **à produire**.
- `submissions/phase-2/prototype-check.txt` — sortie finale de `npm run check`, **à produire**.

## 2. Complete GitHub repository — PARTIEL

### État réel

Le code, les tests, la documentation et un `README.md` existent localement. Un remote `origin` est configuré vers `akiroussama/hackaton_automate_or_die`, mais l’audit Git indique **« No commits yet »**, tous les fichiers sont non suivis et la branche distante est signalée comme absente. Le livrable GitHub ne peut donc pas être déclaré prêt.

### Critères de fini avant soumission

- [ ] Vérifier que l’URL du dépôt existe et est accessible au jury sans compte spécial.
- [x] Ajouter un `.gitignore` adapté.
- [ ] Vérifier qu’aucun secret, token ou donnée personnelle n’est présent.
- [ ] Faire un premier commit propre contenant code, tests et documentation.
- [ ] Pousser la branche utilisée pour la soumission et vérifier le rendu depuis l’URL distante.
- [ ] Rendre le `README.md` autonome : problème, proposition, IA, architecture, installation, démo, tests, limites et captures.
- [ ] Ajouter une licence ou préciser explicitement les conditions d’utilisation.
- [ ] Créer un tag immuable de soumission, par exemple `phase-2-final`.
- [ ] Tester un clone neuf : installation/lancement et `npm run check`.

### Fichiers et preuves attendus

- Dépôt GitHub complet — **à publier**.
- URL finale dans `submissions/phase-2/SUBMISSION-MANIFEST.md` — **à produire**.
- Tag ou release `phase-2-final` — **à produire**.
- Archive du tag/release — **à produire comme secours**.

## 3. Technical data room — PARTIEL

### Preuves actuellement présentes

Le workspace contient déjà une base solide : problème, hypothèses de validation, product spec, architecture, pitch, grille d’évaluation, journal des décisions, validation technique, contexte de l’événement et benchmark. Ces documents restent dispersés et ne constituent pas encore une data room indexée et emballée pour le jury.

### Critères de fini avant soumission

- [ ] Créer un index qui permet au jury de trouver une preuve en moins de 30 secondes.
- [ ] Distinguer clairement : faits vérifiés, hypothèses, données synthétiques et validations encore manquantes.
- [ ] Inclure le modèle de données, les contraintes, l’algorithme, les KPI, les tests et les limites.
- [ ] Expliquer précisément l’intégration IA : planification/recherche heuristique, objectifs, entrées, sorties, explicabilité et trajectoire vers un pilote réel.
- [ ] Ajouter une fiche business : utilisateur, processus, impact mesurable, hypothèses ROI, déploiement et modèle économique.
- [ ] Ajouter un registre des risques : qualité des données, cybersécurité, intégration ERP/MES, adoption humaine et dérive des hypothèses.
- [ ] Ajouter les preuves visuelles et résultats de test datés.
- [ ] Exporter une version lisible en PDF et une archive contenant les sources.

### Fichiers attendus

- `docs/data-room/INDEX.md` — index des preuves, **à produire**.
- `docs/data-room/ai-and-algorithm.md` — intégration IA et explicabilité, **à produire**.
- `docs/data-room/data-model-and-assumptions.md` — données, contraintes et hypothèses, **à produire**.
- `docs/data-room/business-case.md` — impact, ROI, viabilité et pilote, **à produire**.
- `docs/data-room/risks-security-and-limits.md` — risques et limites, **à produire**.
- Documents existants sous `docs/cabletwin/` — **à référencer, pas à dupliquer sans raison**.
- `submissions/phase-2/CableTwin_SUPCOM_Technical_Data_Room.pdf` — **à produire**.
- `submissions/phase-2/CableTwin_SUPCOM_Technical_Data_Room.zip` — **à produire**.

## 4. Brand kit — MANQUANT

### État réel

Aucun logo source, guide de marque, palette officielle, pack d’icônes ou export de marque n’apparaît dans le workspace. Le style de l’interface peut servir de point de départ, mais il ne remplace pas un brand kit livré.

### Critères de fini avant soumission

- [ ] Nom et signature figés : « CableTwin — le Waze de l’usine de câbles » ou formulation finale validée.
- [ ] Logo principal et variante monochrome lisibles sur fond clair et sombre.
- [ ] Palette avec codes HEX, typographies et règles d’espacement.
- [ ] Une page « à faire / à éviter » et les règles d’usage du logo.
- [ ] Exports cohérents pour slides, vidéo, GitHub et miniature.
- [ ] Les éléments graphiques ne suggèrent aucune affiliation avec Chakira Cables, COFICAB/Elloumi ou une autre entreprise.

### Fichiers attendus

- `brand/logo/cabletwin-logo.svg` — **à produire**.
- `brand/logo/cabletwin-logo.png` — **à produire**.
- `brand/logo/cabletwin-mark.svg` — **à produire**.
- `brand/CableTwin_SUPCOM_Brand_Guide.pdf` — **à produire**.
- `brand/social/demo-thumbnail.png` — **à produire**.
- `submissions/phase-2/CableTwin_SUPCOM_Brand_Kit.zip` — **à produire**.

## 5. Final presentation `.pptx` — MANQUANT

### État réel

Les contenus narratifs existent dans `docs/cabletwin/03-demo-et-pitch.md` et les autres documents CableTwin, mais aucun fichier `.pptx` n’est présent.

### Critères de fini avant soumission

- [ ] Format final `.pptx`, ouvrable sur une seconde machine sans police manquante.
- [ ] Histoire alignée à la grille : processus et impact 25 %, IA 20 %, prototype 20 %, viabilité 20 %, pitch 15 %.
- [ ] Une idée principale par slide et des chiffres explicitement marqués comme hypothèses lorsqu’ils ne viennent pas du terrain.
- [ ] Déroulé compatible avec **7 minutes**, incluant une marge pour la démo.
- [ ] Slides minimales : problème, persona/processus, incident, solution, innovation/IA, preuve prototype, impact mesurable, différenciation, business/pilote, risques/limites, demande finale.
- [ ] Notes orateur et transitions vers la démo préparées.
- [ ] Export PDF de secours vérifié visuellement.

### Fichiers attendus

- `submissions/phase-2/CableTwin_SUPCOM_Final.pptx` — **à produire**.
- `submissions/phase-2/CableTwin_SUPCOM_Final.pdf` — **à produire comme secours**.

## 6. Demo video — MANQUANT

### État réel

Le parcours de démonstration est documenté, mais aucun fichier vidéo n’est présent.

### Critères de fini avant soumission

- [ ] Durée finale inférieure ou égale à **2:00**, générique compris.
- [ ] Montrer le produit réellement utilisé, pas seulement des slides.
- [ ] Structure recommandée : problème 0:00–0:15 ; état initial 0:15–0:30 ; incident 0:30–0:50 ; trois options 0:50–1:15 ; choix et impact 1:15–1:40 ; approbation/audit 1:40–1:52 ; valeur et prochaine étape 1:52–2:00.
- [ ] Résolution 1080p, texte lisible, voix claire et aucune notification personnelle.
- [ ] Sous-titres intégrés ou fichier `.srt`.
- [ ] Les KPI montrés correspondent exactement à la version GitHub taguée.
- [ ] Lecture testée depuis le fichier téléchargé, sans dépendre d’un lien privé.

### Fichiers attendus

- `submissions/phase-2/CableTwin_SUPCOM_Demo_2min.mp4` — **à produire**.
- `submissions/phase-2/CableTwin_SUPCOM_Demo_2min.srt` — **à produire**.
- `submissions/phase-2/demo-script.md` — **à produire**.

## Ordre d’exécution solo

| Séquence | Action | Condition de sortie |
| ---: | --- | --- |
| 0 | Lire l’email du team leader et noter heure, fuseau, formats, taille et lien exacts | Contraintes officielles recopiées dans le manifeste |
| 1 | Geler et retester le prototype | `npm run check` vert et aucun changement fonctionnel ensuite |
| 2 | Nettoyer, committer, pousser et tester un clone du dépôt | URL GitHub accessible et tag final créé |
| 3 | Consolider la technical data room | Index complet, PDF et ZIP ouvrables |
| 4 | Créer le mini brand kit | Logo et guide réutilisables dans tous les supports |
| 5 | Construire le `.pptx`, chronométrer et exporter le PDF | Deck lisible et pitch ≤ 7 minutes |
| 6 | Enregistrer la vidéo sur le build figé | MP4 ≤ 2:00 et lecture contrôlée |
| 7 | Assembler, contrôler, sauvegarder puis soumettre | Reçu/confirmation capturé avant l’échéance |

Règle solo : ne pas rouvrir le périmètre produit après l’étape 1, sauf bug bloquant. Toute amélioration non essentielle va dans une liste « après soumission ».

## Contrôle deadline, inbox et soumission

L’heure exacte n’est pas encore inscrite dans le workspace ; elle doit provenir de l’email dédié envoyé au team leader.

- [ ] Le **team leader SUPCOM** vérifie maintenant boîte principale, spam, promotions et corbeille.
- [ ] Activer les notifications et rechercher les expéditeurs/objets liés à « AUTOMATE OR DIE », « Phase 2 » et « submission ».
- [ ] Noter l’échéance officielle avec fuseau dans `SUBMISSION-MANIFEST.md`.
- [ ] Programmer trois alarmes : **T−4 h**, **T−2 h** (freeze interne) et **T−60 min** (soumission au plus tard).
- [ ] Vérifier l’inbox toutes les 30 minutes et immédiatement avant le packaging.
- [ ] Seul le team leader ouvre le lien et effectue l’envoi.
- [ ] Ne jamais attendre la dernière minute : upload, quota ou formulaire peuvent échouer.
- [ ] Après envoi, capturer page de confirmation, email reçu, heure et liste des fichiers.
- [ ] Si aucune confirmation n’arrive, refaire un contrôle du formulaire avant l’échéance et conserver les captures.

## Packaging final

Créer un dossier unique `CableTwin_SUPCOM_Phase2_2026-07-18/` contenant :

```text
00_SUBMISSION-MANIFEST.pdf
01_CableTwin_SUPCOM_Final.pptx
01_CableTwin_SUPCOM_Final.pdf
02_CableTwin_SUPCOM_Technical_Data_Room.pdf
02_CableTwin_SUPCOM_Technical_Data_Room.zip
03_CableTwin_SUPCOM_Demo_2min.mp4
03_CableTwin_SUPCOM_Demo_2min.srt
04_CableTwin_SUPCOM_Brand_Kit.zip
05_CableTwin_SUPCOM_Prototype.zip
06_GitHub_URL.txt
```

Contrôle avant ZIP :

- [ ] Noms sans ambiguïté, aucune mention « final-final ».
- [ ] Tous les fichiers s’ouvrent après copie dans un autre dossier.
- [ ] Les tailles respectent l’email officiel.
- [ ] Le manifeste contient version/tag, URL GitHub, commandes de lancement, liste des fichiers, limites et coordonnées du leader.
- [ ] Le ZIP est décompressé et vérifié avant envoi.
- [ ] Une somme SHA-256 est conservée pour les fichiers soumis.

## Plan de secours

1. **Trois copies :** machine principale, clé USB, cloud synchronisé.
2. **Démo live indisponible :** lancer la copie hors ligne ; si elle échoue, lire la vidéo locale ; si la vidéo échoue, utiliser le PDF avec captures.
3. **GitHub inaccessible :** fournir l’archive du tag et le hash du commit dans le manifeste.
4. **Upload trop lourd :** garder une vidéo compressée de secours et des ZIP séparés, dans les limites autorisées par l’email.
5. **PPTX incompatible :** présenter le PDF local ; conserver les polices intégrées ou standards.
6. **Connexion absente :** aucun service cloud ne doit être nécessaire au prototype ; ouvrir tous les fichiers localement avant le départ.
7. **Bug de dernière minute :** revenir au tag testé, ne pas corriger en direct sans rerun complet des tests.
8. **Lien de soumission absent :** vérifier spam et promotions, conserver une capture horodatée, puis contacter immédiatement l’organisation par le canal officiel avant l’échéance.

## Go / no-go final

La Phase 2 est **GO** uniquement si les six livrables sont présents, ouvrables, cohérents avec le même tag GitHub et si une preuve de soumission par le team leader a été conservée. Un excellent prototype ne compense pas un fichier absent : la priorité absolue est une soumission complète et anticipée.
