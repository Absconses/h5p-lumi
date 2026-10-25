# Exemple : livre « Mon identité numérique » (cycle 4, EMI)

Livre interactif qui affiche en cadre (`H5P.IFrameEmbed`) **huit types refusés par la Column** :
Impressive Presentation, Virtual Tour 360, GeoQuiz, Tabs, Grid Checker, Personality Quiz,
Sort the Paragraphs et Crossword. Méthode : `references/iframe-modules.md`.

| Page | Module en cadre (non noté) | Activités natives notées |
|---|---|---|
| Avant de commencer | Personality Quiz « Quel internaute es-tu ? » | — |
| 1. L'iceberg de mes traces | Impressive Presentation : un seul décor (iceberg à 4 couches), 9 étapes | Single Choice Set (5), Multiple Choice |
| 2. Privé, ça veut dire quoi ? | Grid Checker « Qui peut voir quoi ? » | 2 Multiple Choice |
| 3. Une journée de traces | Virtual Tour : maison → collège → boutique (Poly Haven CC0) | Multiple Choice, Vrai/Faux |
| 4. Où voyagent mes données ? | GeoQuiz (Dublin, Menlo Park, Pékin, Luleå, CNIL…) | 2 Multiple Choice (RGPD, majorité numérique) |
| 5. Reprendre la main | Tabs : 4 réflexes (profil d'Inès, réglages, mots de passe, se chercher) | Multiple Choice, Vrai/Faux |
| 6. Faire retirer une photo | Sort the Paragraphs (preuve → personne → réseau → 1 mois → CNIL) | Multiple Choice (droit à l'image) |
| 7. Les mots pour le dire | Crossword (9 mots) | Summary (5) |

Les modules publiés sont dans `partage/identite-numerique/`.

## Reconstruire

```bash
python3 iceberg.py media          # décor de l'iceberg + couverture du livre
python3 profil.py raw media       # faux profil d'Inès (raw/ = 3 photos Pixabay)
node iceberg.mjs <repo> c/iceberg.json
node modules.mjs <repo> c <gabarit_geoquiz_extrait> <edition-collaborative_extrait> <mots-croises-wikipedia_extrait>
node book.mjs <gabarit_interactivebook_extrait> https://raw.githubusercontent.com/Absconses/h5p-lumi/main/partage/identite-numerique c/livre.json
# puis validate.py et pack.py (assets/examples/visite-coulisses-info/) pour chaque ligne de mods.txt et pour le livre ;
# render-book.mjs : rendu du livre avec les vrais cadres (page localhost, proxy), 16 s par page
```

`fr.mjs` : briques en français (MultiChoice, Vrai/Faux, Single Choice Set, Summary) avec un retour
qui explique chaque piège. `grid-checker.mjs` : copie de la fabrique de la PR Grid Checker.
Panoramas : `https://dl.polyhaven.org/file/ph-assets/HDRIs/extra/Tonemapped%20JPG/<id>.jpg`
(lythwood_room, newman_cafeteria, phone_shop), réduits à 3840 × 1920.
