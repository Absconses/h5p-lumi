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

## Validation

Valide la structure avec `-Type generic` (syntaxe). La justesse des `params` de chaque brique
vient de sa fiche dédiée.
