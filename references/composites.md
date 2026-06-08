# Référence — Composites : Page (Column) & Interactive Book

Les composites **assemblent les autres types** en une séquence. C'est le format le plus
puissant : une page / un livre = **un cours complet dans un seul `.h5p`**.

## Page — `H5P.Column`

Empilement vertical d'activités. `content.json` :

```json
{
  "content": [
    { "content": { "library":"H5P.AdvancedText 1.1", "params": { "text":"<h2>Titre</h2><p>…</p>" }, "subContentId":"<guid>", "metadata":{"contentType":"Text","license":"U","title":"Intro"} }, "useSeparator":"auto" },
    { "content": { "library":"H5P.Timeline 1.1", "params": { "timeline": {  } }, "subContentId":"<guid>", "metadata":{"contentType":"Timeline","license":"U","title":"Frise"} }, "useSeparator":"auto" }
  ]
}
```

Chaque élément = `{ content:{ library, params, subContentId, metadata }, useSeparator }`.
Le `params` est **exactement le `content.json` du sous-type** (voir sa fiche). `library` doit
porter la **version** présente dans le gabarit.

### Méthode (éprouvée)
1. Génère/valide le `params` de chaque brique (réutilise nos fiches et fichiers existants).
2. Empile-les dans `content[]`, chacun avec un `subContentId` unique (`[guid]::NewGuid()`).
3. Empaquette avec **`assets/templates/gabarit-column.h5p`** — le **gabarit-maître** (~64
   bibliothèques). Tu peux donc composer **toute Page** sans autre gabarit.

Versions clés du gabarit-maître : Column 1.18 · AdvancedText 1.1 · Timeline 1.1 ·
QuestionSet 1.20 · MultiChoice 1.16 · TrueFalse 1.8 · Blanks 1.14 · DragText 1.10 ·
MarkTheWords 1.11 · Dialogcards 1.9 · Summary 1.10 · SingleChoiceSet 1.11 · Chart 1.2 ·
Image 1.1 · ImageHotspots 1.10 · ImageHotspotQuestion 1.8 · MemoryGame 1.3 · Agamotto 1.6 ·
Collage 0.3 · ImageSlider 1.1 · Essay 1.5 · Questionnaire 1.3 · MultiMediaChoice 0.3 ·
Accordion 1.0 · Video 1.6 · Audio 1.5 · CoursePresentation 1.26 · InteractiveVideo 1.27.

> Poids : le paquet embarque TOUTES les bibliothèques du gabarit (~6 Mo même pour une petite
> page) — normal ; on pourra élaguer plus tard si besoin.

## Interactive Book — `H5P.InteractiveBook`

Plusieurs **chapitres**, chaque chapitre étant une **Column**. Forme générale :

```json
{
  "showCoverPage": true,
  "bookCover": { "coverDescription": "<p>Présentation du livre…</p>" },
  "chapters": [
    { "params": { "content": [ /* … mêmes éléments qu'une Column … */ ] },
      "library": "H5P.Column 1.18", "subContentId": "<guid>",
      "metadata": { "contentType":"Column", "license":"U", "title":"Chapitre 1" } }
  ],
  "behaviour": { "defaultTableOfContents": true, "progressIndicators": true, "displaySummary": true }
}
```

Donc : **Book = des Columns rangées en chapitres.** ⚠️ Il faut un **gabarit Interactive Book**
à part (le gabarit Column ne contient pas `H5P.InteractiveBook`) : en exporter un « avec tout
dedans » comme pour la Page.

⚠️⚠️ **Un sous-type qui plante = Livre BLANC.** Au chargement, le Book appelle `getCurrentState`
sur **tous** les chapitres (même non affichés) pour suivre la progression. Si un sous-type
lève une exception dans `getCurrentState`, **tout le Livre reste blanc** (console :
`Cannot read properties of undefined (reading 'isAnswerGiven') … getCurrentState`).
- **`H5P.SortParagraphs 0.11` est INCOMPATIBLE** avec Interactive Book (plante en `getCurrentState`
  tant que le chapitre n'est pas rendu). **Pour ordonner dans un Livre, utilise `H5P.ImageSequencing`**
  (compatible, testé) — au besoin avec des **cartes-images générées** (texte sur fond coloré) si
  l'ordre porte sur du texte. Règle générale : avant d'intégrer un type « riche » peu courant dans un
  Livre/une Page, **teste-le seul** d'abord (un sous-type fragile fait tout planter).

## Branching Scenario — `H5P.BranchingScenario` (1.8)

Scénario **non linéaire** : un **graphe de nœuds** où chaque choix mène ailleurs (dilemmes,
« histoire dont vous êtes le héros »). `mainLibrary=BranchingScenario` → **pas d'enveloppe Column** ;
gabarit dédié `gabarit-branching.h5p` (embarque tout l'écosystème).

- Racine : `{ "branchingScenario": { content[], endScreens[], scoringOptionGroup, startScreen, behaviour, l10n } }`.
- `content[]` : l'**index = le contentId** (positionnel, il n'y a PAS de champ `contentId`). Deux familles :
  - **Nœud contenu** (texte, image…) : `{ type:{library,params,subContentId,metadata}, nextContentId, proceedButtonText, forceContentFinished:"useBehavioural", feedback:{title,subtitle}, contentBehaviour:"useBehavioural", showContentTitle:false }`. `nextContentId` = index du nœud suivant ; **-1 = fin** (→ endScreen).
  - **Question à embranchement** (`H5P.BranchingQuestion 1.0`) : `params.branchingQuestion.{ question, alternatives:[ { text, nextContentId, feedback:{title,subtitle} } ] }`. Chaque alternative mène vers un nœud (ou -1) ; le nœud lui-même n'a pas de `nextContentId`.
- `endScreens:[{endScreenTitle,endScreenSubtitle,contentId:-1,endScreenScore:0}]` (≥1) · `startScreen:{startScreenTitle,startScreenSubtitle}` · `scoringOptionGroup:{scoringOption:"no-score", includeInteractionsScores}` · `behaviour:{enableBackwardsNavigation, forceContentFinished, randomizeBranchingQuestions}`.
- **Astuces** : pour des fins différentes (bon/mauvais), terminer chaque branche par un nœud Texte distinct → `nextContentId:-1`. **Générer le graphe en JS** et **vérifier que chaque `nextContentId` pointe vers un nœud existant**. Démo : `info-ou-intox.h5p` (dilemme EMI « partager ou vérifier »).

## Calendrier de l'Avent — `H5P.AdventCalendar` (0.3)

Une grille de **portes** numérotées qui s'ouvrent sur du contenu (texte, image, vidéo, audio, lien).
`mainLibrary=AdventCalendar` → **pas d'enveloppe Column** ; gabarit `gabarit-avent.h5p`.
```json
{ "modeDoorImage":"automatic",
  "doors":[ { "type":"text", "autoplay":false, "text": { "library":"H5P.AdvancedText 1.1", "params": { "text":"<h3>Mot</h3><p>Définition…</p>" }, "subContentId":"<guid>", "metadata": { "contentType":"Text","license":"U","title":"Jour 1" } } } ],
  "visuals": { "hideNumbers":false,"hideDoorKnobs":false,"hideDoorFrame":false,"snow":true },
  "behaviour": { "modeDoorPlacement":"dynamic","doorPlacementRatio":"6x4","randomize":false,"designMode":true },
  "l10n": { "nothingToSee":"…" }, "a11y": { "door":"Porte","locked":"…" } }
```
Chaque porte : le champ **`type`** (`"text"`/`"image"`/`"video"`/`"audio"`/`"link"`) choisit le contenu
révélé ; le **numéro est automatique** (position). `doorPlacementRatio` = la grille (`"6x4"` = 24 portes).
⚠️⚠️ **DEUX pièges vérifiés (sinon calendrier VIDE)** :
1. En `modeDoorImage:"automatic"`, les **façades des portes sont découpées dans `visuals.backgroundImage`** →
   il **FAUT une image de fond** (ratio 6×4, p.ex. 1200×800), embarquée via `-Media` et déclarée dans
   `visuals.backgroundImage:{path,mime,width,height}`. Sans elle, rien ne s'affiche.
2. Le code lit `door.image` pour **chaque** porte → inclure le wrapper **`image`** (+ `link`) dans chaque
   porte, même en `type:"text"` (sinon plantage JS).
⚠️ Un vrai calendrier **verrouille les portes par date** ; `designMode:true` les garde toutes ouvrables.
⚠️ Type **capricieux / non confirmé** : nos essais (v1 + v2 avec fond et champ `image`) sont restés
**vides** dans Lumi. Cause restante probable : les champs `audio`/`video` de chaque porte (eux aussi
requis) manquaient. Documenté ici par sécurité, mais **à éviter** sauf besoin précis.

## Validation

Valide la structure avec `-Type generic` (syntaxe). La justesse des `params` de chaque brique
vient de sa fiche dédiée.
