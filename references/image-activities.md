# Référence — Activités « sur image »

Ces 9 types s'appuient sur des **images** (parfois de l'audio/vidéo). Toutes leurs
bibliothèques sont déjà dans `gabarit-column.h5p` (versions entre parenthèses).

## ⚠️ Règle commune : images EMBARQUÉES (pas d'URL externe)

Contrairement à la frise (qui accepte une URL Wikimedia), ces types attendent un **fichier
image embarqué** :

```json
"image": { "path": "images/photo.jpg", "mime": "image/jpeg", "copyright": { "license": "U" }, "width": 800, "height": 600 }
```

Le fichier doit se trouver dans `content/images/` du paquet. **Workflow** :
1. Tu fournis les **fichiers image** → j'empaquette avec l'option **`-Media`** (déjà en place :
   `Build-H5PPackage.ps1 -Media .\couverture.jpg`) qui les injecte dans `content/images/`.
   ✅ Validé sur une couverture de livre. Position des hotspots = `{ "x":50, "y":33 }` en %.
2. Pour les types **à coordonnées** (Image Hotspots, Find the Hotspot, Drag and Drop), le
   placement visuel est bien plus simple à **finir dans Lumi** : le skill génère la structure
   et les **textes**, toi/Lumi posez l'image et les points.

C'est pourquoi ces types sont « semi-auto » : le texte et la logique sont générés, l'image
(et la position) viennent de toi.

### ⚠️ CRUCIAL : empaqueter via le gabarit-maître = ENVELOPPER dans une Column
Ces types n'ont pas de gabarit autonome : leurs bibliothèques vivent dans `gabarit-column.h5p`
(dont `mainLibrary = H5P.Column`). Le `content.json` doit donc être une **Column qui contient
l'activité** — sinon Lumi charge une Column, ne trouve pas de `content[]`, et affiche une
**page vide** (l'image ne s'affiche pas) :

```json
{ "content": [
  { "content": { "library": "H5P.ImageHotspots 1.10", "params": { "/* … l'activité … */": "" }, "subContentId": "<guid>", "metadata": { "contentType":"Image Hotspots","license":"U","title":"…" } }, "useSeparator": "none" }
] }
```
Puis : `Build-H5PPackage.ps1 -Template gabarit-column.h5p -Content ... -Media .\image.jpg`.
(Leçon vécue : un `content.json` ImageHotspots « brut » + gabarit Column = page vide.)

---

## Multimedia Choice — `H5P.MultiMediaChoice` (0.3)
QCM dont les **options sont des images**. Le plus « générable » du lot.
```json
{ "question":"<p>Quel logo est celui d'un navigateur ?</p>",
  "options":[ { "media": { "library":"H5P.Image 1.1", "params": { "file": { "path":"images/firefox.png","mime":"image/png" }, "alt":"Firefox" } }, "correct":true } ],
  "behaviour": { "type":"single","enableRetry":true,"enableSolutionsButton":true } }
```

## Guess the Answer — `H5P.GuessTheAnswer` (1.5)
Une image + une question ; on clique pour révéler la réponse.
```json
{ "taskDescription":"<p>Quel est cet objet ?</p>", "media": { "type": { "library":"H5P.Image 1.1", "params": { "file": { "path":"images/cle-usb.jpg","mime":"image/jpeg" } } } }, "solutionLabel":"Voir la réponse", "solutionText":"Une clé USB." }
```

## Image Slider — `H5P.ImageSlider` (1.1)
Diaporama d'images.
```json
{ "imageSlides":[ { "imageSlide": { "library":"H5P.Image 1.1", "params": { "file": { "path":"images/1.jpg","mime":"image/jpeg" }, "alt":"…" } } } ], "aspectRatioMode":"auto" }
```

## Agamotto — `H5P.Agamotto` (1.6)
Suite d'images qui changent progressivement (avant/après, calques) avec un curseur.
```json
{ "title":"Évolution d'une page web", "items":[ { "image": { "library":"H5P.Image 1.1", "params": { "file": { "path":"images/etape1.jpg","mime":"image/jpeg" } } }, "labelText":"1990", "description":"<p>…</p>" } ] }
```

## Image Juxtaposition — `H5P.ImageJuxtaposition` (1.5)
Deux images superposées avec un **curseur** qui révèle l'une puis l'autre (avant/après, comparaison).
`mainLibrary = ImageJuxtaposition` → **pas d'enveloppe Column** (gabarit autonome `gabarit-imagejuxtaposition.h5p`).
```json
{ "imageBefore": { "labelBefore":"Avant", "imageBefore": { "library":"H5P.Image 1.1", "subContentId":"<guid>", "params": { "alt":"…","contentName":"Image","file": { "path":"images/avant.png","mime":"image/png","width":1000,"height":640 } } } },
  "imageAfter":  { "labelAfter":"Après",  "imageAfter":  { "library":"H5P.Image 1.1", "subContentId":"<guid>", "params": { "alt":"…","contentName":"Image","file": { "path":"images/apres.png","mime":"image/png","width":1000,"height":640 } } } },
  "behavior": { "startingPosition":50, "sliderOrientation":"horizontal" } }
```
Les 2 images doivent avoir la **même taille** (le curseur les superpose). `behavior` = orthographe US.
⚠️ Un export Lumi peut être **« contenu seul »** (sans la bibliothèque embarquée) : le paquet fonctionne dans un Lumi où la lib est déjà installée ; pour un fichier **autonome/partageable**, greffer `H5P.ImageJuxtaposition` (dépôt GitHub `h5p/h5p-image-juxtaposition`). Démo générée (images dessinées) : graphique trompeur (axe coupé) vs honnête (axe à 0).

## Image Pairing — `H5P.ImagePair` (1.4)
Jeu d'**association** : on glisse chaque image sur sa paire. `mainLibrary=ImagePair` → **pas d'enveloppe Column** (gabarit autonome `gabarit-imagepair.h5p`).
```json
{ "taskDescription":"<p>Associe chaque image à sa paire.</p>",
  "cards":[ { "image": { "path":"images/a.png","mime":"image/png","copyright":{"license":"U"},"width":420,"height":300 }, "imageAlt":"…", "match": { "path":"images/b.png","mime":"image/png","copyright":{"license":"U"},"width":420,"height":300 }, "matchAlt":"…" } ],
  "behaviour": { "allowRetry":true },
  "l10n": { "checkAnswer":"Vérifier","tryAgain":"Recommencer","showSolution":"Voir la solution","score":"Tu as obtenu @score sur @total points" } }
```
⚠️ `image`/`match` = **objets-fichier DIRECTS** (pas de wrapper `H5P.Image`) ; `imageAlt`/`matchAlt` = textes alternatifs. Démo générée : pictogrammes de médias ↔ leurs noms.

## Image Sequencing — `H5P.ImageSequencing` (1.1)
Remettre des images dans le **bon ordre** (chronologie, étapes d'un processus…). `mainLibrary=ImageSequencing` → **pas d'enveloppe Column** (gabarit `gabarit-imagesequencing.h5p`).
```json
{ "taskDescription":"<p>Range les images dans l'ordre.</p>", "altTaskDescription":"Ordonne la liste correctement (flèches + espace).",
  "sequenceImages":[ { "image": { "path":"images/1.png","mime":"image/png","copyright":{"license":"U"},"width":420,"height":360 }, "imageDescription":"Légende 1" } ],
  "behaviour": { "enableSolution":true,"enableRetry":true,"enableResume":true },
  "l10n": { "checkAnswer":"Vérifier","tryAgain":"Recommencer","showSolution":"Voir la solution","score":"Tu as obtenu @score sur @total points","totalMoves":"Déplacements","timeSpent":"Temps écoulé","resume":"Reprendre","audioNotSupported":"Audio non supporté","ariaPlay":"Lire l'audio","ariaMoveDescription":"@cardDesc déplacé de @posSrc à @posDes","ariaCardDesc":"élément à ordonner" } }
```
⚠️ `sequenceImages[]` = l'**ordre CORRECT** (H5P mélange à l'affichage) ; `image` = objet-fichier direct + `imageDescription` (légende/aria). Démo générée : médias par ordre d'apparition.

## Memory Game — `H5P.MemoryGame` (1.3)
Jeu de paires. Chaque carte a une `image` ; `match` = sa paire (ou même image pour identique).
```json
{ "cards":[ { "image": { "path":"images/a.jpg","mime":"image/jpeg" }, "imageAlt":"…", "description":"Bravo !" } ], "lookNFeel": { "themeColor":"#1768c4" } }
```

## Collage — `H5P.Collage` (0.3)
Montage de plusieurs images selon un gabarit.
```json
{ "collage": { "template":"2-1", "options": { "spacing":1,"frame":true }, "clips":[ { "image": { "path":"images/a.jpg","mime":"image/jpeg" } } ] } }
```

## Image Hotspots — `H5P.ImageHotspots` (1.10)
Une image de fond + des **points cliquables** qui ouvrent du texte. ⚠️ Coordonnées `x`/`y` en %.
```json
{ "image": { "path":"images/schema.jpg","mime":"image/jpeg" }, "iconType":"icon", "icon":"plus", "color":"#1768c4",
  "hotspots":[ { "position": { "x":40,"y":55 }, "header":"Le navigateur", "content":[ { "library":"H5P.AdvancedText 1.1", "params": { "text":"<p>Logiciel pour afficher les pages web.</p>" }, "subContentId":"<guid>" } ] } ] }
```
→ Génère les `header`/`content` ; **pose l'image et les positions dans Lumi** (plus simple).

## Find the Hotspot — `H5P.ImageHotspotQuestion` (1.8)
Trouver la bonne zone sur une image. Structure imbriquée `imageHotspotQuestion.{backgroundImageSettings, hotspotSettings.hotspot[]}` avec coordonnées. → **Placement dans Lumi recommandé.**

## Drag and Drop — `H5P.DragQuestion` (1.14)
Glisser des étiquettes/images sur des zones d'une image de fond. Structure `question.task.{elements[], dropZones[]}` avec `x/y/width/height`. Type **le plus visuel** → générer le texte, **finir le placement dans Lumi**.
