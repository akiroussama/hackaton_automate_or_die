# CableTwin — validation technique du MVP

**Date de contrôle : 17 juillet 2026**

Cette fiche distingue ce qui a été effectivement vérifié de ce qui doit encore être validé sur le terrain.

## Vérifications automatisées

Commande :

```powershell
npm run check
```

Résultat : **8 tests réussis sur 8**, aucune erreur de syntaxe.

Les tests couvrent :

- le marquage explicite des données synthétiques ;
- le jeu de 3 lignes et 10 commandes ;
- l'identification des commandes exposées par l'incident ;
- la faisabilité et le déterminisme des trois plannings ;
- l'existence de compromis distincts entre service, coût et stabilité ;
- le calcul du retard, des heures supplémentaires, du coût, des mouvements et du taux de service ;
- l'approbation humaine sans mutation du plan proposé ;
- le format lisible des heures.
- la concordance des trois plans affichés avec un oracle exhaustif indépendant.

Commande de certificat exact :

```powershell
npm run benchmark:exact
```

Résultat sur le même scénario synthétique : **17 856** candidats d'affectation et de séquencement évalués, **10 440** plannings faisables, et trois optima de politique confirmés. Cette preuve est bornée au scénario canonique ; elle n'est pas une revendication d'optimalité à l'échelle d'une usine réelle.

## Parcours vérifié dans le navigateur

Le parcours complet a été joué sur l'application locale :

| État | Signal observé |
| --- | --- |
| Initial | 10/10 commandes à l'heure, 10 ordres visibles, stratégies verrouillées |
| Incident | Ligne 2 arrêtée, 3 commandes menacées, 620 min de retard, 3 options débloquées |
| Service | 8/10 à l'heure, 140 min de retard, 3 mouvements, coût total simulé 1 971,15 DT |
| Coût maîtrisé | 8/10 à l'heure, 170 min de retard, 2 mouvements, coût total simulé 1 931,45 DT |
| Stabilité | 7/10 à l'heure, 620 min de retard, 0 mouvement, coût total simulé 3 862,20 DT |
| Validation | Bouton verrouillé, décision horodatée à 10:07 et ajoutée au journal |
| Réinitialisation | Retour à 10/10, stratégies verrouillées et journal en attente |

Le coût affiché dans les cartes est le **surcoût par rapport au planning nominal** ; le tableau ci-dessus conserve le coût total calculé par le moteur pour faciliter l'audit.

## Contrôle de mise en page

- Écran 1280 × 720 : aucune largeur de page parasite, grille principale chargée, Gantt lisible.
- Mobile 390 × 844 : aucune largeur de page parasite, hero et stratégies sur une colonne, Gantt défilable horizontalement.
- Navigation au clavier : boutons HTML natifs, états désactivés et `aria-pressed` exposés.
- Les résultats sont annoncés par des régions `aria-live`.

## Preuves acquises

- [x] Le scénario et l'incident sont reproductibles.
- [x] Les KPI proviennent du moteur, pas de texte codé dans les cartes.
- [x] Les trois options utilisent exactement le même incident.
- [x] Une décision humaine est nécessaire avant l'état « validé ».
- [x] Les données synthétiques et l'absence de connexion machine sont visibles.
- [x] La démo fonctionne sans dépendance externe ni clé d'API.
- [x] Le benchmark exact reproduit indépendamment les trois plans du démonstrateur.

## Preuves encore requises

- [ ] Un professionnel confirme que l'arbitrage délai/coût/stabilité correspond à une décision réelle.
- [ ] Une contrainte d'atelier remplace au moins une hypothèse synthétique.
- [ ] Un mentor confirme l'adéquation au règlement et aux critères du jury.
- [ ] Une capture ou vidéo hors ligne est préparée comme secours.
- [ ] Le pitch est chronométré devant une personne non technique.

La validation technique prouve que le démonstrateur fonctionne. Elle ne prouve pas encore l'adéquation marché, le ROI d'une usine réelle ni un score de jury.
