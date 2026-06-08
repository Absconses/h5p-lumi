# Référence — Tier 2 : activités texte & données

Structures dérivées des `semantics.json` officiels. Comme toujours : le `content.json` se
génère depuis une consigne ; l'**empaquetage** exige un gabarit du type (sauf Essay, déjà
présent dans `gabarit-questionset.h5p`).

## Rédaction — `H5P.Essay`

Réponse rédigée, notée automatiquement par **mots-clés**. ✅ Déjà packageable (dans un
QuestionSet via le gabarit complet : reprends les `params` Essay du gabarit et remplace le
contenu).

```json
{
  "taskDescription": "<p>Explique, en quelques phrases, la différence entre Internet et le Web.</p>",
  "placeholderText": "Écris ta réponse ici…",
  "solution": {
    "introduction": "<p>Une bonne réponse pouvait contenir :</p>",
    "sample": "<p>Internet est le <strong>réseau</strong> mondial. Le <strong>Web</strong> est un service qui fonctionne grâce à lui : des pages reliées par des liens, vues avec un navigateur.</p>"
  },
  "keywords": [
    { "keyword": "réseau",     "alternatives": ["câbles","connexion"],   "options": { "points":1,"occurrences":1,"caseSensitive":false,"forgiveMistakes":true } },
    { "keyword": "Web",        "alternatives": ["toile","pages","liens"], "options": { "points":1,"occurrences":1,"caseSensitive":false,"forgiveMistakes":true } },
    { "keyword": "navigateur", "alternatives": ["Firefox","Chrome"],      "options": { "points":1,"occurrences":1,"caseSensitive":false,"forgiveMistakes":true } }
  ],
  "behaviour": { "minimumLength":40,"inputFieldSize":"10","enableRetry":true,"ignoreScoring":false,"pointsHost":3,"percentagePassing":50,"percentageMastering":100,"linebreakReplacement":"space" },
  "checkAnswer":"Vérifier","submitAnswer":"Envoyer","tryAgain":"Recommencer","showSolution":"Voir un exemple","feedbackHeader":"Retour","solutionTitle":"Exemple de réponse","remainingChars":"Caractères restants : @chars","notEnoughChars":"Écris au moins @min caractères."
}
```
Chaque `keyword` rapporte des points s'il (ou une `alternatives`) apparaît dans la réponse.

## Remettre dans l'ordre — `H5P.SortParagraphs`

```json
{
  "taskDescription": "<p>Remets les étapes d'une recherche d'information dans le bon ordre.</p>",
  "paragraphs": [
    "Je formule ma question avec des mots-clés.",
    "Je lance la recherche dans un moteur.",
    "Je compare plusieurs résultats.",
    "Je vérifie la fiabilité de la source.",
    "Je note l'information et sa source."
  ],
  "behaviour": { "scoringMode":"transitions","applyPenalties":false,"enableRetry":true,"enableSolutionsButton":true,"addButtonsForMovement":true },
  "l10n": { "checkAnswer":"Vérifier","tryAgain":"Recommencer","showSolution":"Voir la solution","up":"Monter","down":"Descendre" }
}
```
⚠️ Liste les `paragraphs` dans l'ordre **CORRECT** : H5P les mélange à l'affichage.

## Questionnaire (sondage, sans bonne réponse) — `H5P.Questionnaire`

Composite : chaque élément est une sous-question (`H5P.SimpleMultiChoice` ou `H5P.OpenEndedQuestion`).

```json
{
  "questionnaireElements": [
    { "library": { "library":"H5P.SimpleMultiChoice 1.1",
        "params": { "question":"<p>As-tu trouvé cette leçon utile ?</p>", "inputType":"radio",
          "alternatives":[ {"text":"Oui","feedback":{"chosenFeedback":"","notChosenFeedback":""}}, {"text":"Non","feedback":{"chosenFeedback":"","notChosenFeedback":""}} ] },
        "subContentId":"<guid>", "metadata":{ "contentType":"Simple Multi Choice","license":"U","title":"Q1" } },
      "requiredField": true },
    { "library": { "library":"H5P.OpenEndedQuestion 1.0",
        "params": { "question":"Qu'as-tu appris de nouveau ?", "placeholderText":"Ta réponse…", "inputRows":"2" },
        "subContentId":"<guid>", "metadata":{ "contentType":"Open Ended Question","license":"U","title":"Q2" } },
      "requiredField": false }
  ],
  "successScreenOptions": { "enableSuccessScreen":true, "successScreenImage":{ "library":"H5P.Image 1.1", "params":{"decorative":false,"contentName":"Image","expandImage":"Expand Image","minimizeImage":"Minimize Image"}, "subContentId":"<guid>", "metadata":{"contentType":"Image","license":"U","title":"Image"} }, "successMessage":"Merci pour ta réponse !" },
  "uiElements": { "buttonLabels": { "prevLabel":"Précédent","continueLabel":"Continuer","nextLabel":"Suivant","submitLabel":"Envoyer" }, "accessibility":{ "requiredTextExitLabel":"Fermer le message","progressBarText":"Question %current sur %max" }, "requiredText":"obligatoire","requiredMessage":"Tu dois répondre à cette question.","submitScreenTitle":"Tu as répondu à toutes les questions !","submitScreenSubtitle":"Clique pour valider." }
}
```
Gabarit : exporte un Questionnaire (il embarque SimpleMultiChoice + OpenEndedQuestion). Versions à recopier du gabarit.

## Graphique (camembert / barres) — `H5P.Chart`

```json
{
  "graphMode": "barChart",
  "figureDefinition": "Moteurs de recherche utilisés par la classe.",
  "listOfTypes": [
    { "text":"Google", "value":18, "color":"#4285F4" },
    { "text":"Qwant",  "value":5,  "color":"#5C2D91" },
    { "text":"Bing",   "value":3,  "color":"#008373" }
  ]
}
```
`graphMode` = `"pieChart"` ou `"barChart"`. Idéal pour illustrer des statistiques en cours.

---

> ⚠️ Dans un Questionnaire, chaque `questionnaireElements[].library` est un **OBJET imbriqué**
> `{ library, params, subContentId, metadata }` (le wrapper de sous-contenu H5P), pas une chaîne.

## Mur d'infos filtrable — `H5P.InfoWall`  (module « Information Wall » dans Lumi)

⚠️ Nom interne **`H5P.InfoWall`** (et non InformationWall). Une grille de **panneaux**
filtrables : chaque panneau a une image (optionnelle) + un titre + des **entrées** (une par
« propriété »). Idéal pour un **glossaire** cherchable.

```json
{
  "infoWall": {
    "propertiesGroup": { "properties": [
      { "label":"Définition", "showLabel":false, "searchInProperty":true, "styling":{"bold":false,"italic":false} }
    ] },
    "panels": [
      { "panelTitle":"Internet", "entries":["Le réseau mondial qui relie les ordinateurs."],
        "image": { "library":"H5P.Image 1.1", "params":{"decorative":true}, "subContentId":"<guid>", "metadata":{"contentType":"Image","license":"U","title":"Image"} } }
    ],
    "behaviour": { "offerFilterField":true, "modeFilterField":"or", "imageWidth":150, "imageHeight":150, "alternateBackground":true },
    "l10n": { "noMatchesForFilter":"Aucun résultat pour @query.", "enterToFilter":"Tape un mot pour filtrer." }
  }
}
```
`entries[]` s'aligne **par index** avec `properties[]`. Images optionnelles (`decorative:true`
sans fichier, ou ajoutées dans Lumi).

## Texte à trous avancé — `H5P.AdvancedBlanks`  (module « Complex fill the blanks »)

Comme *Fill in the Blanks*, mais avec **indices**, **variantes** et **feedback ciblé** par trou.
Racine : `{ media, content:{ task, blanksText, blanksList }, behaviour, … }`.

```json
{
  "media": { "disableImageZooming": false },
  "content": {
    "task": "<p>Complète le texte sur l'histoire d'Internet.</p>",
    "blanksText": "<p>Le Web a été inventé en __________ par __________ au CERN.</p>",
    "blanksList": [
      { "correctAnswerText": "1989", "hint": "À la fin des années 1980." },
      { "correctAnswerText": "Tim Berners-Lee/Berners-Lee", "hint": "Un chercheur britannique." }
    ]
  },
  "behaviour": { "mode":"typing","caseSensitive":false,"enableRetry":true,"enableSolutionsButton":true,"enableCheckButton":true,"showSolutionsRequiresInput":true,"confirmCheckDialog":false,"confirmRetryDialog":false },
  "checkAnswer":"Vérifier","tryAgain":"Recommencer","showSolutions":"Voir la correction"
}
```
⚠️ Les trous se marquent par `__________` (**3+ tirets bas**) dans `blanksText`, **sans** y mettre
les réponses. `blanksList` liste les trous **dans l'ordre** ; variantes séparées par `/`. Pense à
neutraliser l'image bidon (`"media":{"disableImageZooming":false}`) si elle pointe vers un fichier
embarqué. (Validation : `-Type generic`.)

## Quiz de personnalité — `H5P.PersonalityQuiz`

Chaque réponse pointe vers un ou plusieurs **profils** (par leur **nom**). Idéal en EMI (« Quel internaute es-tu ? »). Pas de bonne/mauvaise réponse.

```json
{
  "showTitleScreen": true,
  "titleScreen": { "titleScreenIntroduction": "<p>Quel internaute es-tu ?</p>" },
  "personalitiesGroup": { "personalities": [
    { "name":"L'Explorateur", "description":"Tu adores explorer le Web !", "image":{} },
    { "name":"Le Prudent", "description":"Tu vérifies tes sources.", "image":{} }
  ] },
  "questionsGroup": { "questions": [
    { "text":"Quand tu cherches une info, tu…", "image":{}, "answers": [
      { "text":"…explores plein de liens.", "personality":"L'Explorateur", "image":{} },
      { "text":"…vérifies la source.", "personality":"Le Prudent", "image":{} }
    ] }
  ] },
  "resultScreen": { "animation":"none", "displayTitle":true, "displayDescription":true, "imagePosition":"background" },
  "visual": { "isAnimationOn":true, "showProgressBar":true, "appearance":"classic", "colorButton":"#1a73d9", "colorProgressBar":"#1a73d9" },
  "l10n": { "start":"Commencer", "currentOfTotal":"@current sur @total", "skip":"Passer", "reset":"Recommencer" }
}
```
⚠️ `answers[].personality` doit reprendre **exactement** un `name` de `personalities` (plusieurs possibles, séparés par des virgules). Images en `{}` si non utilisées.

## Quiz d'arithmétique — `H5P.ArithmeticQuiz`  (maths, questions auto-générées)

Rien à rédiger : on **configure** seulement (hors thème « doc », inclus pour être complet).

```json
{
  "intro": "Entraîne-toi au calcul mental !",
  "quizType": "arithmetic",
  "arithmeticType": "addition",
  "equationType": "intermediate",
  "useFractions": false,
  "maxQuestions": 10
}
```
`arithmeticType` : addition / subtraction / multiplication / division · `equationType` : basic / intermediate / advanced · `quizType` : arithmetic / linearEquation.

À venir (différé) : **Page** (`H5P.Column`).
