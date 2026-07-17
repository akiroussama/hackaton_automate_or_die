# Phase 2 — audit final de préparation des livrables

**Projet :** CableTwin · **Équipe :** SUPCOM — Oussama Akir (solo)  
**Dernière vérification :** 18 juillet 2026, ~03:00 (Europe/Paris)  
**Règle critique :** un livrable absent à l'échéance entraîne l'élimination automatique.

## Verdict

**Les six livrables obligatoires existent, sont vérifiés et sont packagés.**
Le paquet numéroté est dans `packaging/`, avec sommes SHA-256. La soumission
officielle attend uniquement l'email dédié des organisateurs (deadline,
plateforme, limites de taille).

| # | Livrable obligatoire | État vérifié | Preuve |
| ---: | --- | --- | --- |
| 1 | Working end-to-end prototype | **PRÊT** — 9/9 tests, benchmark exact reproduit, parcours navigateur rejoué, offline prouvé (0 requête externe) | `packaging/05_CableTwin_SUPCOM_Prototype.zip`, `docs/data-room/evidence/` |
| 2 | Complete GitHub repository | **PRÊT** — public (vérifié sans authentification), clone neuf → 9/9, tags immuables | <https://github.com/akiroussama/hackaton_automate_or_die>, tag de soumission |
| 3 | Technical data room | **PRÊT** — 29 pages PDF + ZIP sources/evidence, index « preuve en 30 s » | `packaging/02_*` |
| 4 | Brand kit | **PRÊT** — logos SVG/PNG light/dark/monochrome, mark, thumbnail 1280×720, guide PDF | `packaging/04_CableTwin_SUPCOM_Brand_Kit.zip` |
| 5 | Final presentation `.pptx` | **PRÊT** — 9 slides, notes orateur, Arial uniquement, PDF de secours, QA slide par slide | `packaging/01_*` |
| 6 | Demo video 2 min | **PRÊT** — 1:57.9 (< 2:00), 1080p H.264+AAC, narration anglaise, SRT 20 cues, décodage complet vérifié | `packaging/03_*` |

Chaîne de validation appliquée à chaque artefact : génération scriptée
reproductible → vérification exécutable (tests, benchmark, sondes pypdf,
ffprobe) → inspection visuelle → revue croisée Codex ↔ Claude (log complet
dans `docs/collaboration/phase2-codex-claude-handoff.md`).

## Contrôle deadline, inbox et soumission

L'heure exacte doit provenir de l'email dédié envoyé au team leader.

- [ ] Le **team leader SUPCOM** vérifie boîte principale, spam, promotions et corbeille.
- [ ] Rechercher les expéditeurs/objets « AUTOMATE OR DIE », « Phase 2 », « submission ».
- [ ] Noter l'échéance officielle avec fuseau dans le manifest de soumission.
- [ ] Programmer trois alarmes : **T−4 h**, **T−2 h** (freeze interne) et **T−90 min** (début de soumission).
- [ ] Vérifier l'inbox toutes les 30 minutes.
- [ ] Seul le team leader ouvre le lien et effectue l'envoi.
- [ ] Après envoi : capturer page de confirmation, email reçu, heure et liste des fichiers.

## Contrôle final avant envoi

- [ ] Adapter les noms de fichiers si l'email officiel impose une convention.
- [ ] Vérifier que les tailles respectent les limites de l'email officiel.
- [ ] Ré-ouvrir chaque fichier depuis une copie du dossier `packaging/`.
- [ ] Vérifier `packaging/SHA256SUMS.txt` après toute modification.

## Plan de secours

1. **Trois copies :** machine principale, clé USB, cloud synchronisé.
2. **Démo live indisponible :** copie hors ligne du prototype ; sinon vidéo locale ; sinon PDF avec captures.
3. **GitHub inaccessible :** fournir l'archive du tag et le hash du commit.
4. **Upload trop lourd :** ZIP séparés dans les limites autorisées.
5. **PPTX incompatible :** présenter le PDF de secours (visuellement identique).
6. **Bug de dernière minute :** revenir au tag testé ; aucun correctif sans rerun complet des tests.
7. **Lien de soumission absent :** capture horodatée, puis contact immédiat des organisateurs par le canal officiel.

## Go / no-go final

La Phase 2 est **GO** dès que : les six livrables sont présents et ouvrables
(fait), cohérents avec le même tag GitHub (fait), et qu'une preuve de
soumission par le team leader est conservée (en attente de l'email officiel).
