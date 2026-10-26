# Exemple : livre vitrine EMI, tome 2 « Regarder, écouter, écrire » (cycle 4)

Suite du livre `assets/examples/vitrine-emi/`. Le tome 1 montrait 23 types H5P ; ce tome 2 montre
**les 28 autres types fiables** du catalogue, un ou deux par chapitre, toujours précédés d'une
**fiche technique** pour l'adulte. Trois types sont écartés volontairement (risque d'affichage le jour
d'une démonstration) : Advent Calendar, AR Scavenger, Speak the Words Set.

Fil rouge inventé : *Radio JM*, la radio en ligne d'élèves de 4e du collège Jean-Moulin de Montval.
Parties : regarder (1-6), écouter et dire (7-8), compter (9-10), les mots de l'info (11-14),
chercher et vérifier (15-19), écrire (20-22).

| Chapitre | Type(s) | Noté |
|---|---|---|
| Avant-propos | Table (sommaire des types) | — |
| 1. Avant, après | Image Juxtaposition *(cadre)* + QCM | QCM |
| 2. Quelle photo pour ce titre ? | Multimedia Choice | oui |
| 3. Un lieu, quatre récits | Collage + QCM | QCM |
| 4. Le détail et l'image entière | Image Pairing *(cadre)* + Vrai/Faux | V/F |
| 5. Une info, cinq formats | Image Slider + Single Choice Set | SCS |
| 6. Anatomie d'un article | Image Hotspots + Find the Hotspot | oui |
| 7. La dictée de la brève | Dictation *(cadre, voix de synthèse)* | non |
| 8. À ton micro | Audio Recorder + Speak the Words *(cadre)* | non |
| 9. Ta classe et l'info | Questionnaire + Guess the Answer + Chart + QCM | QCM |
| 10. Les chiffres dans les titres | Arithmetic Quiz *(cadre)* + QCM | QCM |
| 11. Les questions du chapô | Fill in the Blanks + Advanced Fill the Blanks *(cadre)* | oui |
| 12. Les supports de l'info | Memory Game | non |
| 13. Les sigles de l'info | Flashcards *(cadre)* | non |
| 14. Mots cachés | Find the Words *(cadre)* | non |
| 15. Se repérer dans Wikipédia | Find Multiple Hotspots *(cadre, repris de wiki-1h)* | non |
| 16. Une histoire du savoir | Image Sequencing *(cadre, repris de wiki-1h)* | non |
| 17. La boîte à outils du vérificateur | Information Wall *(cadre)* + QCM | QCM |
| 18. Le QR code de l'affiche | KewAr Code *(cadre)* + QCM | QCM |
| 19. L'archipel de la vérification | Game Map *(cadre)* | non |
| 20. Prendre des notes | Cornell Notes *(cadre)* | non |
| 21. Écrire sa brève | Structure Strip *(cadre)* + Essay | Essay |
| 22. Le grand quiz | Question Set + crédits | oui |

Modules en cadre : `partage/vitrine-emi-2/`. Livre : `partage/vitrine-emi-2/livre-vitrine-emi-2.h5p`.

## Reconstruire

```bash
python3 px.py px "requête"                     # recherche Pixabay ($PIXABAY) → planche contact numérotée
node shot2.cjs article.html 1000 article-radio.jpg      # capture + positions (%) des éléments à id
node shot2.cjs formats.html 1000 format-1.jpg "#f1"     # une maquette par format (f1…f5)
node modules2.mjs <gabarits_extraits> <sortie>          # les 13 modules en cadre
node book2.mjs <gabarit_interactivebook_reporter_extrait> <base_url_partage> article-radio.json livre.json
python3 ../visite-coulisses-info/validate.py <gabarit_extrait> livre.json "H5P.InteractiveBook 1.11"
python3 pack2.py <gabarit.h5p> livre.json <media> sortie.h5p "<titre>"   # images/, videos/ ET audios/
```

- `defaults.mjs` : construit les paramètres par défaut **en français** d'un type à partir de son
  `semantics.json` et de son `language/fr.json`, puis on ne surcharge que le contenu (`lib()`).
  Évite de recopier des dizaines de libellés pour chaque type natif.
- `article-radio.json` (produit par `shot2.cjs`) donne la position de chaque élément de la maquette :
  les points de l'Image Hotspots et les zones du Find the Hotspot sont calculés, pas placés à l'œil.
- Gabarits : ceux de `assets/templates/` ; Find Multiple Hotspots, KewAr Code et Speak the Words
  viennent du Hub (`https://api.h5p.org/v1/content-types/<machineName>`), les deux derniers sont
  désormais dans `assets/templates/`.
- Voix de la dictée : synthèse Google (`translate.google.com/translate_tts?…&client=tw-ob&tl=fr`),
  version lente avec `ffmpeg -filter:a atempo=0.72`.

## Pièges rencontrés (corrigés ici)

- **Groupe à un seul champ = valeur dépliée** : `GuessTheAnswer.media` reçoit directement le
  sous-contenu `H5P.Image`, pas `{ type: … }` (sinon « Invalid library string » et livre blanc).
- **Questionnaire** : chaque alternative de `H5P.SimpleMultiChoice` doit avoir
  `feedback: { chosenFeedback: '', notChosenFeedback: '' }`, sinon le livre entier plante.
- **Drag Text** : `distractors` est une **chaîne** (`'*2026* *rumeur*'`), pas un tableau.
- **Information Wall 0.4** : `panelTitle` n'est **pas affiché** ; mettre le nom en première propriété (en gras).
- **Flashcards** sans image : le lecteur affiche une vignette grise ; donner une image à chaque carte.
- **Advanced Fill the Blanks** : retirer l'image d'exemple du gabarit (`media`).
- **Game Map** : progression `roaming: 'complete'` et étape de départ en texte ; dessiner la carte sans
  chemin peint (le Game Map trace ses propres chemins).
