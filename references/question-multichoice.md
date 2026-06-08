# Référence — QCM (H5P.MultiChoice) et Quiz (H5P.QuestionSet)

Structure dérivée du `semantics.json` officiel de H5P.MultiChoice.

## Une question seule : H5P.MultiChoice

`machineName` : **H5P.MultiChoice**. `content.json` :

```jsonc
{
  "question": "<p>Qui a inventé le World Wide Web&nbsp;?</p>",   // HTML, encadré de <p>…</p>
  "answers": [
    {
      "text": "<div>Tim Berners-Lee</div>",                       // HTML, encadré de <div>…</div>
      "correct": true,
      "tipsAndFeedback": {
        "tip": "",                                                // indice avant validation
        "chosenFeedback": "<div>Exact&nbsp;! Au CERN en 1989.</div>",
        "notChosenFeedback": ""
      }
    },
    {
      "text": "<div>Bill Gates</div>",
      "correct": false,
      "tipsAndFeedback": { "tip": "", "chosenFeedback": "<div>Non : lui, c'est Microsoft.</div>", "notChosenFeedback": "" }
    }
  ],
  "behaviour": {
    "enableRetry": true,
    "enableSolutionsButton": true,
    "enableCheckButton": true,
    "type": "auto",            // "auto" | "multi" (cases à cocher) | "single" (boutons radio)
    "singlePoint": false,
    "randomAnswers": true,
    "showSolutionsRequiresInput": true,
    "confirmCheckDialog": false,
    "confirmRetryDialog": false,
    "autoCheck": false,
    "passPercentage": 100,
    "showScorePoints": true
  },
  "UI": {                       // libellés en français
    "checkAnswerButton": "Vérifier",
    "showSolutionButton": "Voir la solution",
    "tryAgainButton": "Recommencer",
    "tipsLabel": "Indice",
    "scoreBarLabel": "Tu as obtenu :num sur :total points",
    "correctAnswer": "Bonne réponse",
    "wrongAnswer": "Mauvaise réponse"
  },
  "overallFeedback": [ { "from": 0, "to": 100, "feedback": "" } ],
  "media": { "disableImageZooming": false }
}
```

### Règles de qualité QCM

- Au moins **une** réponse `"correct": true` (le validateur le vérifie).
- Pour un QCM à réponse unique → `behaviour.type` = `"single"` ; à réponses multiples → `"multi"`.
- Donne un **feedback formatif** dans `chosenFeedback` (pas juste « faux » : explique *pourquoi*).
- Construis des distracteurs **plausibles** (erreurs typiques de l'élève), pas absurdes.
- **Aucun « tell »** : pas de gras/italique (ni une formulation plus longue ou plus précise)
  réservé à la bonne réponse — les options doivent être **uniformes** en style et en longueur.
  Le gras se met dans la consigne et le feedback, jamais sur l'option correcte.

### Validation

```powershell
.\scripts\Test-H5PJson.ps1 -Path .\content.json -Type multichoice
```

## Un quiz de plusieurs questions : H5P.QuestionSet

`machineName` : **H5P.QuestionSet**. Il *enveloppe* plusieurs questions (MultiChoice,
TrueFalse…). Forme générale :

```jsonc
{
  "introPage": { "showIntroPage": false },
  "progressType": "dots",
  "passPercentage": 50,
  "questions": [
    {
      "library": "H5P.MultiChoice 1.9",     // version = celle présente dans ton gabarit Lumi
      "subContentId": "GÉNÈRE-UN-GUID-ICI",  // identifiant unique par question
      "metadata": { "contentType": "Multiple Choice", "license": "U", "title": "Q1" },
      "params": { /* … exactement le content.json d'un H5P.MultiChoice ci-dessus … */ }
    }
  ],
  "texts": {
    "prevButton": "Précédent", "nextButton": "Suivant", "finishButton": "Terminer",
    "scoreBarLabel": "Score : :num sur :total"
  }
}
```

**Important** : la version dans `"library": "H5P.MultiChoice 1.9"` doit correspondre à celle
embarquée dans ton gabarit Lumi. Vérifie-la en regardant le nom du dossier de bibliothèque
(`H5P.MultiChoice-1.9/`) à l'intérieur du `.h5p` exporté. Pour le `subContentId`, génère un GUID :
`[guid]::NewGuid().ToString()` en PowerShell.
