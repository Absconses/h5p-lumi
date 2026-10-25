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
        "chosenFeedback": "<div>Exact&nbsp;! Il l'a inventé au CERN en 1989 pour partager des documents entre chercheurs.</div>",
        "notChosenFeedback": ""
      }
    },
    {
      "text": "<div>Bill Gates</div>",                           // erreur réelle : « l'informatique = Microsoft »
      "correct": false,
      "tipsAndFeedback": { "tip": "", "chosenFeedback": "<div>Piège fréquent : Bill Gates a fondé Microsoft (logiciels), mais il n'a pas inventé le Web. Cherche qui travaillait au CERN.</div>", "notChosenFeedback": "" }
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
- **Distracteurs intelligents** : voir la section suivante. Chaque mauvaise réponse a un
  `chosenFeedback` qui nomme le piège.
- **Aucun « tell »** : pas de gras/italique (ni une formulation plus longue ou plus précise)
  réservé à la bonne réponse — les options doivent être **uniformes** en style et en longueur.
  Le gras se met dans la consigne et le feedback, jamais sur l'option correcte.

### Distracteurs intelligents (règle de Pierre, 2026-10-25)

Une mauvaise réponse sert à **révéler une erreur réelle**, pas à remplir la liste. Pour chaque
distracteur, demande-toi : *quel élève choisirait ça, et pourquoi ?* S'il n'y a pas de réponse,
remplace-le.

- **Partir des erreurs que les élèves font vraiment** sur cette notion. Exemples de sources
  d'erreur fréquentes (des pistes, pas une grille à remplir) :
  - mot proche ou confondu (Internet / Web, auteur / éditeur) ;
  - idée reçue ou intuition trompeuse (« ce qui est en tête de Google est fiable ») ;
  - vérité partielle mal conclue (vrai fait, mauvaise déduction) ;
  - erreur de méthode (lire le titre sans le texte, confondre date de publication et date
    des faits).
- **Pas de distracteur absurde ni humoristique** : il ne piège personne et donne la réponse
  par élimination. Mieux vaut **2 distracteurs solides que 3 dont un faible**.
- **`chosenFeedback` de chaque distracteur = le piège nommé + la remise sur la voie**, en
  1 ou 2 phrases, sans redonner la bonne réponse mot pour mot. Exemple :
  *« Piège classique : Google classe selon la popularité et la publicité, pas selon la
  fiabilité. Regarde plutôt qui a écrit la page. »* — et non *« Faux. »*
- **`chosenFeedback` de la bonne réponse** : confirme **pourquoi** c'est juste (l'élève a
  pu deviner).
- Garde la règle « aucun tell » ci-dessus : un bon distracteur a la même longueur et le même
  style que la bonne réponse.

**Où mettre le retour selon le type :**

| Type | Retour par réponse ? | Où écrire le piège |
|---|---|---|
| `H5P.MultiChoice` | oui | `answers[].tipsAndFeedback.chosenFeedback` |
| `H5P.TrueFalse` | non (un seul retour) | `behaviour.feedbackOnWrong` : nomme l'idée reçue visée |
| `H5P.SingleChoiceSet`, `H5P.Summary` | **non** | aucun champ : si le piège mérite une explication, utilise plutôt `H5P.MultiChoice` |
| `H5P.Blanks`, `H5P.DragText` | non | l'indice `*réponse:indice*` (Blanks) ou la consigne |

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

### ⚠️ Piège vérifié : `introPage.backgroundImage` vide fait planter tout le composite

Dans `questionset.js`, le test est `if (params.introPage.backgroundImage !== undefined)`.
Un **objet vide `{}` passe ce test** (il n'est pas `undefined`), puis le code appelle
`H5P.getPath(bgImg.path, contentId)` avec `path === undefined` →
`Uncaught TypeError: Cannot read properties of undefined (reading 'match')`.
Le QuestionSet ne s'affiche pas — et comme l'exception remonte par
`Column.attach` → `InteractiveBook.initializeChapter`, **tout le chapitre reste blanc**.

➡️ **N'écris jamais `backgroundImage: {}`** : omets purement et simplement la clé.
Même règle pour `params.backgroundImage` (racine), `endGame.successVideo` et
`endGame.failVideo` : ou bien un média réel avec un `path`, ou bien **rien du tout**.

Règle générale pour les composites : un champ média déclaré mais vide est **pire**
qu'un champ absent. Après génération, vérifie qu'aucun objet média ne sort sans `path` :

```powershell
node -e "const c=require('./content.json');const w=(n,p='')=>{if(Array.isArray(n))return n.forEach((x,i)=>w(x,p+'['+i+']'));if(n&&typeof n=='object')for(const[k,v]of Object.entries(n)){if(['backgroundImage','successVideo','failVideo','coverMedium'].includes(k)&&!(v&&(v.path||v.library||(Array.isArray(v)&&v.length))))console.log('PIEGE',p+'.'+k);w(v,p+'.'+k)}};w(c)"
```
