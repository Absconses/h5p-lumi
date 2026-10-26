# Référence — Médias & outils (Tier 2/3)

Cinq types dont les bibliothèques sont déjà dans `gabarit-column.h5p`.

## Iframe Embedder — `H5P.IFrameEmbed` (1.0)  ✅ pleinement générable
Intègre une page externe (un site, une carte, un exerciseur en ligne) dans un cadre.
```json
{ "source": "https://www.example.org/widget", "width": "100%", "height": "600", "resizeSupported": true }
```
Le seul du lot qui n'a besoin d'aucun média : juste une **URL**. Idéal pour encapsuler un
outil web dans une Page/un Book.

⚠️ `width`/`height` sont un **ratio** (le cadre n'a pas de défilement), `minWidth` à 280 pour le
téléphone, et rien ne remonte dans le score du livre. Recette complète, ratios mesurés et choix
de la source : `references/iframe-modules.md`.

## Audio Recorder — `H5P.AudioRecorder` (1.0)  (outil, pas de contenu)
Permet à l'élève d'**enregistrer sa voix**. Il n'y a rien à « rédiger » :
```json
{ "title": "Enregistre ta présentation orale" }
```
À placer tel quel (souvent dans une Page, à côté d'une consigne).

## Documentation Tool — `H5P.DocumentationTool` (1.8)
Assistant multi-pages avec **export texte** (fiche-méthode, carnet de bord). Composite :
`pagesList` est une liste de sous-pages (`H5P.StandardPage`, `H5P.GoalsPage`,
`H5P.GoalsAssessmentPage`, `H5P.DocumentExportPage`).
```json
{ "taskDescription":"<p>Construis ta fiche de recherche.</p>",
  "pagesList":[ { "library":"H5P.StandardPage 1.5", "params": { /* champs de saisie */ }, "subContentId":"<guid>", "metadata": {…} } ] }
```
→ Pour la structure exacte des pages, lire le `semantics.json` de `H5P.StandardPage` dans le
gabarit (méthode `extending-new-types.md`).

**Vérifié (octobre 2026, `assets/examples/vitrine-emi/`, fiche d'enquête en 5 pages) :**
- une `H5P.StandardPage 1.5` contient une `elementList` de `H5P.Text 1.1` (la consigne) et de
  `H5P.TextInputField 1.2` (les champs) ;
- `inputFieldSize` n'accepte que **`'1'`, `'3'` ou `'10'`** (lignes) — toute autre valeur est refusée ;
- `requiredField:true` bloque la création du document tant que le champ est vide ;
- la page d'export (`H5P.DocumentExportPage 1.5`) doit être **le dernier élément** de `pagesList` ;
  elle produit un **document Word** téléchargeable, donc une trace écrite à rendre ou à imprimer ;
- ⚠️ le gabarit `gabarit-interactivebook.h5p` ne contient PAS `DocumentExportPage` : pour un livre
  avec export, empaqueter avec **`gabarit-interactivebook-reporter.h5p`**.

## Interactive Video — `H5P.InteractiveVideo` (1.27)  (nécessite une vidéo)
Vidéo enrichie d'interactions **chronométrées** (quiz qui apparaissent à un instant T).
Structure : `interactiveVideo.{ video:{files…}, assets:{interactions:[…]}, summary }`.
```json
{ "interactiveVideo": {
    "video": { "files": [ { "path":"https://…/video.mp4", "mime":"video/mp4" } ], "title":"…" },
    "assets": { "interactions": [ { "duration": { "from":10,"to":15 }, "action": { "library":"H5P.MultiChoice 1.16", "params": {…} }, "x":40, "y":40 } ] }
} }
```
**Source vidéo (confirmé)** : un **lien YouTube** marche directement, rien à embarquer :
`"files":[{ "path":"https://www.youtube.com/watch?v=XXXX", "mime":"video/YouTube", "copyright":{"license":"U"}, "aspectRatio":"16:9" }]`. (Sinon un MP4 en URL ou fichier embarqué.)

**Une interaction** = position + fenêtre temporelle + une action (= un de nos types de questions) :
```json
{ "x":25, "y":20, "width":50, "height":45, "duration":{ "from":15, "to":35 }, "pause":true, "displayType":"poster",
  "action": { "library":"H5P.MultiChoice 1.16", "params": { "/* … notre QCM … */":"" }, "subContentId":"<guid>", "metadata": { "contentType":"Multiple Choice" } } }
```
`from` = seconde d'apparition ; `pause:true` met la vidéo en pause. ⚠️ Comme tous les types du
gabarit-maître, **envelopper dans une Column**. Le calage exact (secondes, position) se peaufine
dans Lumi. ✅ Validé : `video-interactive-demo.h5p`.

**Vidéo embarquée et fabriquée (octobre 2026, `assets/examples/vitrine-emi/`)** : quand aucune vidéo
libre ne dit ce qu'on veut montrer, on peut en **fabriquer une** : une page HTML animée, enregistrée
par Playwright (`recordVideo`), puis convertie par ffmpeg. Deux règles :
- livrer le **mp4 (H.264) ET le webm** dans `files` : le Chromium de test ne lit pas le H.264 ;
- empaqueter les vidéos sous `videos/…` **sans compression** (`ZIP_STORED`) : voir `packbook.py`
  de l'exemple. Pour le rendu de test, le petit serveur doit répondre aux requêtes `Range`,
  sinon la vidéo ne démarre pas.
Poster : `video.startScreenOptions.poster` + `hideStartTitle:true` si le titre est déjà dans l'image.

## Course Presentation — `H5P.CoursePresentation` (1.26)  (diapos positionnées)
Diaporama interactif : `presentation.slides[]`, chaque slide ayant des `elements[]` placés en
`x/y/width/height` (texte, image, question…).
```json
{ "presentation": { "slides": [ { "elements": [ { "x":10,"y":10,"width":80,"height":20, "action": { "library":"H5P.AdvancedText 1.1", "params": { "text":"<h2>Titre</h2>" }, "subContentId":"<guid>" } } ] } ] } }
```
Comme les diapos sont **positionnées au pixel**, la mise en page est bien plus simple **dans
Lumi**. Le skill peut générer les contenus ; le placement se peaufine ensuite.

### Course Presentation **dans un Interactive Book** (testé, exemple `assets/examples/journalisme-ia/`)
La Column 1.18 accepte `H5P.CoursePresentation 1.26` : un livre peut **découper chaque chapitre**
en 3 à 5 diapos, puis enchaîner sur une activité notée native. Règles qui marchent :
- **Échelle** : le canevas 16:9 garde ses proportions ; `1em` = 16 px pour 640 px de large (≈ 20 px
  dans un livre sur ordinateur, ≈ 10 px sur téléphone). Texte ≥ 1.3em, titres ≈ 2em, ~40 mots par
  diapo au plus. Sur téléphone, c'est petit : à réserver à l'ordinateur, au Chromebook ou à la tablette.
- `x`, `y`, `width`, `height` en **% du canevas**. Une image est **étirée** à sa boîte : hauteur =
  `largeur × 16/9 × h/w` de l'image (fabrique `pic` de `cp.mjs`).
- La CP centre le texte : envelopper chaque bloc dans `<div style="text-align:left">`.
- `keywordListEnabled: false` (le menu latéral mange un tiers de la largeur) et
  `override.hideSummarySlide: true` (le livre fait déjà le bilan des scores).
- Couleur de fond : `presentation.globalBackgroundSelector.fillGlobalBackground`, et
  `slideBackgroundSelector: {}` sur chaque diapo (aucun champ image vide).
- Une question dans une diapo (Vrai/Faux, QCM…) est **notée et remonte au livre** ; garder les
  activités longues (Drag Text, Drag and Drop, Mark the Words, Essay) **hors de la CP**, dans la
  page, où elles restent lisibles.
- Ce qui donne du sens à la CP : une **logique de diapos** propre au contenu (un trajet avec une
  frise qui avance, une histoire heure par heure, une comparaison), pas un découpage arbitraire.

## Cornell Notes — `H5P.Cornell` (0.3)  (outil de prise de notes)
Grille de **prise de notes selon la méthode Cornell** : une **source** à lire + 3 zones que
l'élève remplit (mots-clés, notes, résumé). `mainLibrary=H5P.Cornell` → **pas d'enveloppe Column**.
```json
{ "exerciseContent": { "library":"H5P.AdvancedText 1.1", "params": { "text":"<p>… la source à étudier …</p>" }, "subContentId":"<guid>", "metadata": { "contentType":"Text","license":"U","title":"Source" } },
  "notesFields": { "recallTitle":"Mots-clés","recallPlaceholder":"…","notesTitle":"Mes notes","notesPlaceholder":"…","summaryTitle":"Mon résumé","summaryPlaceholder":"…" },
  "headline":"Prise de notes — …", "instructions":"<p>Consigne…</p>",
  "l10n": { "save":"Sauvegarder","copy":"Copier","…":"" }, "a11y": { "…":"" } }
```
`exerciseContent` = la source (texte/image/vidéo) sur laquelle on prend des notes : on génère le
texte + les **amorces** des 3 zones, l'élève remplit. Démo : `notes-cornell-source.h5p`.

## Structure Strip — `H5P.StructureStrip` (1.0)  (canevas d'écriture guidée)
Des **bandes colorées** guident la rédaction : chaque section a une consigne et une **proportion**
(la hauteur de la bande = longueur conseillée). L'élève écrit dans chaque bande. `mainLibrary=StructureStrip` → **pas d'enveloppe Column**.
```json
{ "taskDescription":"<p>Consigne globale…</p>",
  "sections":[ { "weight":2, "colorBackground":"#d5f5e3", "colorText":"#1c1c1c", "title":"2. …", "description":"<p>Consigne de cette partie…</p>" } ],
  "behaviour": { "enableRetry":true,"enableSolutionsButton":true,"slack":10,"feedbackMode":"onRequest" },
  "media": { "disableImageZooming":false }, "l10n": { "checkAnswer":"…","sectionTooShort":"…","sectionTooLong":"…" }, "a11y": { "…":"" } }
```
`weight` = **proportion relative** (part d'une bande = weight ÷ somme des weights) ; `slack` = tolérance en % sur la longueur ; `feedbackMode` = `onRequest`/`continuously`. On génère titres + consignes + couleurs. Démo : `avis-de-lecture-strip.h5p`.

## Dictée — `H5P.Dictation` (1.3)  (écouter → écrire)
L'élève **écoute** une phrase et l'**écrit** ; correction automatique. `mainLibrary=Dictation` → **pas d'enveloppe Column**.
```json
{ "taskDescription":"<p>Écoute et écris chaque phrase.</p>",
  "sentences":[ { "description":"indice", "text":"La phrase correcte.", "sample":[ { "path":"audios/p1.wav","mime":"audio/wav","copyright":{"license":"U"} } ], "sampleAlternative":[ { "path":"audios/p1-slow.wav","mime":"audio/wav","copyright":{"license":"U"} } ] } ],
  "behaviour": { "scoring": { "ignorePunctuation":true }, "shuffleSentences":"never", "enableRetry":true, "enableSolutionsButton":true }, "l10n": { "checkAnswer":"Vérifier","…":"" }, "a11y": { "play":"Lecture","playSlowly":"Lecture lente","…":"" } }
```
`sample` = audio normal, `sampleAlternative` = bouton « lecture lente ». ⚠️ Les audios vont dans **`content/audios/`** → empaqueter avec **`-Audio`** (pas `-Media`).
🎙️ **AUDIO GÉNÉRABLE PAR LE SKILL** : Windows a la voix française **Hortense** (`System.Speech`, cf. `make-dictee-audio.ps1`) → dictée **100 % auto** (texte + voix). Démo : `dictee-emi.h5p`.

---

### Note d'empaquetage (médias embarqués)
Pour les types ci-dessus qui utilisent des **fichiers** (vidéo, images), il faut les inclure
dans `content/` et empaqueter avec `-KeepMedia`. Pour les sources **URL** (Iframe, vidéo
distante), rien à embarquer.
