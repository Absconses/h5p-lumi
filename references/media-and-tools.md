# Référence — Médias & outils (Tier 2/3)

Cinq types dont les bibliothèques sont déjà dans `gabarit-column.h5p`.

## Iframe Embedder — `H5P.IFrameEmbed` (1.0)  ✅ pleinement générable
Intègre une page externe (un site, une carte, un exerciseur en ligne) dans un cadre.
```json
{ "source": "https://www.example.org/widget", "width": "100%", "height": "600", "resizeSupported": true }
```
Le seul du lot qui n'a besoin d'aucun média : juste une **URL**. Idéal pour encapsuler un
outil web dans une Page/un Book.

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

## Course Presentation — `H5P.CoursePresentation` (1.26)  (diapos positionnées)
Diaporama interactif : `presentation.slides[]`, chaque slide ayant des `elements[]` placés en
`x/y/width/height` (texte, image, question…).
```json
{ "presentation": { "slides": [ { "elements": [ { "x":10,"y":10,"width":80,"height":20, "action": { "library":"H5P.AdvancedText 1.1", "params": { "text":"<h2>Titre</h2>" }, "subContentId":"<guid>" } } ] } ] } }
```
Comme les diapos sont **positionnées au pixel**, la mise en page est bien plus simple **dans
Lumi**. Le skill peut générer les contenus ; le placement se peaufine ensuite.

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

---

### Note d'empaquetage (médias embarqués)
Pour les types ci-dessus qui utilisent des **fichiers** (vidéo, images), il faut les inclure
dans `content/` et empaqueter avec `-KeepMedia`. Pour les sources **URL** (Iframe, vidéo
distante), rien à embarquer.
