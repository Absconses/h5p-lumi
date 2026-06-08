# Référence — Jeux de mots (à partir d'une liste)

## Mots croisés — `H5P.Crossword`

Tu fournis une liste **indice → réponse** ; la grille est générée **automatiquement**.

```json
{
  "taskDescription": "<p>Complète la grille à l'aide des définitions.</p>",
  "words": [
    { "clue":"Réseau mondial reliant les ordinateurs", "answer":"INTERNET" },
    { "clue":"Inventeur du Web (nom de famille)", "answer":"BERNERSLEE" },
    { "clue":"Tout premier moteur de recherche", "answer":"ARCHIE" },
    { "clue":"Logiciel pour naviguer sur le Web", "answer":"NAVIGATEUR" }
  ],
  "solutionWord": "",
  "behaviour": { "enableInstantFeedback":false,"scoreWords":true,"applyPenalties":false,"enableRetry":true,"enableSolutionsButton":true },
  "l10n": { "across":"Horizontal","down":"Vertical","checkAnswer":"Vérifier","submitAnswer":"Valider","tryAgain":"Recommencer","showSolution":"Voir la solution","couldNotGenerateCrossword":"Impossible de générer la grille.","couldNotGenerateCrosswordTooFewWords":"Ajoute davantage de mots.","problematicWords":"Mots problématiques :","extraClue":"Indice supplémentaire","closeWindow":"Fermer" },
  "overallFeedback": { "overallFeedback": [ { "from":0,"to":100 } ] }
}
```
Conseils : réponses en **lettres A–Z, sans espaces ni accents** ; **4 mots minimum** partageant
des lettres communes (sinon la grille ne se forme pas). `solutionWord` (optionnel) = mot mystère.

## Mots mêlés — `H5P.FindTheWords`

Une grille où l'élève entoure les mots cachés.

```json
{
  "taskDescription": "<p>Retrouve les mots cachés sur le thème du Web.</p>",
  "wordList": "INTERNET,WEB,GOOGLE,NAVIGATEUR,LIEN,PAGE,SOURCE",
  "behaviour": { "fillPool":"abcdefghijklmnopqrstuvwxyz","preferOverlap":true,"showVocabulary":true,"enableShowSolution":true,"enableRetry":true },
  "l10n": { "check":"Vérifier","tryAgain":"Recommencer","showSolution":"Voir la solution","found":"Trouvés","timeSpent":"Temps écoulé","score":"Score","wordListHeader":"Mots à trouver" }
}
```
`wordList` = mots séparés par des **virgules**, en **lettres A–Z** (sans espaces ni accents).
