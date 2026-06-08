# Référence — Famille Quiz (questions auto-générables)

Types de questions générables depuis une simple consigne. Chacun fonctionne **seul** (type
H5P autonome) **ou** regroupé dans un **Quiz** (`H5P.QuestionSet`, voir `question-multichoice.md`).
Structures vérifiées sur les `semantics.json` officiels.

## Conventions communes

- Les champs de texte (`question`, `textField`, `questions[]`…) sont du **HTML** (`<p>`, `<strong>`…).
- **Astérisques** (Fill in the Blanks, Mark the Words, Drag the Words) : on entoure
  d'`*astérisques*` les éléments-réponses. Variantes (Blanks) : `*bon1/bon2*` (plusieurs
  bonnes réponses), `*réponse:indice*` (indice).
- **Première = correcte** : dans Single Choice Set et Summary, la **première** proposition de
  la liste est la bonne (H5P mélange l'affichage).
- Les libellés `l10n` / boutons sont donnés en français ci-dessous.

## Vrai / Faux — `H5P.TrueFalse`

```json
{
  "question": "<p>Le Web et Internet, c'est exactement la même chose.</p>",
  "correct": "false",
  "l10n": { "trueText":"Vrai","falseText":"Faux","checkAnswer":"Vérifier","showSolutionButton":"Voir la solution","tryAgain":"Recommencer","score":"Tu as obtenu @score sur @total points","correctAnswerMessage":"Bonne réponse !","wrongAnswerMessage":"Réponse incorrecte." },
  "behaviour": { "enableRetry":true,"enableSolutionsButton":true,"confirmCheckDialog":false,"confirmRetryDialog":false,"autoCheck":false,"feedbackOnCorrect":"Exact : Internet est le réseau, le Web un service.","feedbackOnWrong":"Revois la différence Internet / Web." },
  "media": { "disableImageZooming": false }
}
```
⚠️ `correct` est une **chaîne** : `"true"` ou `"false"`.

## Choix unique en série — `H5P.SingleChoiceSet`

```json
{
  "choices": [
    { "question":"<p>Qui a inventé le Web ?</p>", "answers":["<p>Tim Berners-Lee</p>","<p>Bill Gates</p>","<p>Steve Jobs</p>"] }
  ],
  "behaviour": { "timeoutCorrect":2000,"timeoutWrong":3000,"soundEffectsEnabled":true,"enableRetry":true,"enableSolutionsButton":true,"passPercentage":100 },
  "l10n": { "resultSlideTitle":"Bravo !","showSolutionButtonLabel":"Voir la solution","retryButtonLabel":"Recommencer","solutionViewTitle":"Solution","correctText":"Correct !","incorrectText":"Incorrect !","closeButtonLabel":"Fermer","slideOfTotal":"Question :num sur :total","muteButtonLabel":"Couper le son" }
}
```
⚠️ Dans chaque `answers`, mets la **bonne réponse en premier**.

## Texte à trous — `H5P.Blanks`

```json
{
  "text": "<p>Complète les phrases.</p>",
  "questions": [
    "<p>Le Web a été inventé en *1989* par *Tim Berners-Lee*.</p>",
    "<p>Le tout premier moteur de recherche s'appelait *Archie*.</p>"
  ],
  "behaviour": { "caseSensitive":false,"enableRetry":true,"enableSolutionsButton":true,"autoCheck":false,"showSolutionsRequiresInput":true,"separateLines":false,"confirmCheckDialog":false,"confirmRetryDialog":false },
  "score":"Tu as obtenu @score sur @total","showSolutions":"Voir la solution","tryAgain":"Recommencer","checkAnswer":"Vérifier","notFilledOut":"Remplis d'abord les trous.",
  "confirmCheck": { "header":"Terminer ?","body":"Es-tu sûr de vouloir terminer ?","cancelLabel":"Annuler","confirmLabel":"Terminer" },
  "confirmRetry": { "header":"Recommencer ?","body":"Es-tu sûr de vouloir recommencer ?","cancelLabel":"Annuler","confirmLabel":"Recommencer" }
}
```
Trou = `*réponse*`. Plusieurs bonnes réponses : `*toile/web*`. Indice : `*réponse:indice*`.

## Marquer les mots — `H5P.MarkTheWords`

```json
{
  "taskDescription": "<p>Clique sur tous les <strong>moteurs de recherche</strong>.</p>",
  "textField": "<p>Pour chercher, j'utilise *Google* ou *Qwant* ; je les ouvre avec le navigateur Firefox.</p>",
  "behaviour": { "enableRetry":true,"enableSolutionsButton":true },
  "checkAnswerButton":"Vérifier","tryAgainButton":"Recommencer","showSolutionButton":"Voir la solution","score":"@score sur @total","correctAnswer":"Bonne réponse !","incorrectAnswer":"Mauvaise réponse !","missedAnswer":"Réponse oubliée !","displaySolutionDescription":"La tâche est corrigée."
}
```
Seuls les **bons** mots sont entourés d'`*astérisques*` dans `textField`.

## Glisser les mots — `H5P.DragText`

```json
{
  "taskDescription": "<p>Glisse chaque mot à la bonne place.</p>",
  "textField": "*Internet* est le réseau ; le *Web* est un service qui fonctionne grâce à lui.",
  "behaviour": { "enableRetry":true,"enableSolutionsButton":true,"instantFeedback":false },
  "checkAnswer":"Vérifier","tryAgain":"Recommencer","showSolution":"Voir la solution","score":"@score sur @total"
}
```
Les mots à glisser sont en `*astérisques*` (leur emplacement devient un trou). Indice : `*mot:indice*`.

## Affirmations correctes — `H5P.Summary`

```json
{
  "intro": "<p>À chaque étape, choisis l'affirmation correcte.</p>",
  "summaries": [
    { "summary": [
      "<p>Internet est un réseau qui relie des ordinateurs.</p>",
      "<p>Internet est un site web géant.</p>",
      "<p>Internet est un moteur de recherche.</p>"
    ] },
    { "summary": [
      "<p>Le Web permet de consulter des pages reliées par des liens.</p>",
      "<p>Le Web sert à fabriquer des ordinateurs.</p>"
    ] }
  ],
  "overallFeedback":[{"from":0,"to":100}],
  "solvedLabel":"Progression :","scoreLabel":"Erreurs :","resultLabel":"Ton résultat :",
  "labelCorrect":"Correct.","labelIncorrect":"Incorrect, réessaie.","alternativeIncorrectLabel":"Incorrect",
  "labelCorrectAnswers":"Réponses correctes.","tipButtonLabel":"Montrer l'indice",
  "scoreBarLabel":"Tu as :num points sur :total","progressText":"Affirmation :num sur :total"
}
```
Dans chaque `summary`, la **première** affirmation est la correcte. ⚠️ **Tous** les champs ci-dessus
(notamment `overallFeedback` + les 8 libellés) sont **OBLIGATOIRES** : s'il en manque un, le module
plante (et, dans un Livre/Column, fait planter tout le composite). En cas de doute, **clone les params
d'une Summary depuis un gabarit réel**.

## Les regrouper en un Quiz (`H5P.QuestionSet`)

Chaque entrée `questions[]` du QuestionSet est :
`{ "library":"H5P.TrueFalse 1.1", "params":{ … un des blocs ci-dessus … }, "subContentId":"<guid>", "metadata":{ "contentType":"True/False","license":"U","title":"Q1" } }`.
Voir `references/question-multichoice.md` pour le squelette complet du QuestionSet.
Les **versions** de bibliothèque (`1.1`, `1.7`…) = celles présentes dans ton gabarit.
