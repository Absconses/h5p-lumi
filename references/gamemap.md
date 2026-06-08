# Référence — Carte de jeu (H5P.GameMap)

`machineName` : **H5P.GameMap** (v1.5). Une **carte** où des **étapes** (pastilles) sont
reliées par des **chemins** ; chaque étape contient un ou plusieurs **exercices** (n'importe
quel type H5P présent dans le gabarit). Idéale pour un **parcours pédagogique** ludique.
Structure **vérifiée sur un vrai export Lumi** + lecture du `dist/h5p-game-map.js`.

## ⚠️ Les deux pièges qui font tout planter

### 1. `telemetry` : `x` et `y` doivent être les PREMIÈRES clés

Le code positionne chaque pastille ainsi (extrait de `h5p-game-map.js`) :

```js
update(e) {                       // e = l'objet telemetry de l'étape
  for (let t in e) {
    if (typeof e[t] === "string") e[t] = parseFloat(e[t]);
    let s;
    if ("x" === t) s = "left";
    else { if ("y" !== t) return; s = "top"; }   // ⬅️ clé autre que x/y → RETURN
    this.dom.style.setProperty(`--stage-${s}`, `${e[t]}%`);
  }
}
```

La boucle parcourt les clés **dans l'ordre** et **s'arrête net** à la première clé qui n'est
ni `x` ni `y`. Donc si `telemetry` est `{ y, width, height, x }`, elle pose `--stage-top`
puis sort sur `width` **avant** d'atteindre `x` → `--stage-left` jamais défini → **toutes les
pastilles s'empilent à gauche** (le chemin, lui, s'affiche correctement car il calcule sa
position autrement). L'ordre **`x, y`** d'abord est donc obligatoire.

> En PowerShell, `@{ x=…; y=…; … }` **ne conserve PAS l'ordre d'insertion**. Utilise
> **`[ordered]@{ x=…; y=…; width=…; height=… }`** pour garantir `x, y` en tête.
> (`x`/`y` peuvent être des nombres **ou** des chaînes : `parseFloat` gère les deux. Le
> problème n'a jamais été le type, mais **l'ordre**.)

### 2. Image de fond **empaquetée** (pas une URL externe)

La carte tire ses dimensions de l'image de fond. Fournis une **vraie image empaquetée**
(`path: "images/fond.png"`) injectée avec `-Media`, comme dans un export Lumi normal. Une
image de fond en URL externe est à éviter (carte sans hauteur / rendu aléatoire).

> Pastille **ronde** : `largeur%` est en % de la largeur de la carte, `hauteur%` en % de sa
> hauteur. Pour un cercle : **`hauteur% = largeur% × (largeurFond ÷ hauteurFond)`**.
> Ex. fond 1600×900, largeur 4.5 → hauteur = 4.5 × (1600/900) = **8**.

## ⚠️ Choix du gabarit

Empaquette avec un **vrai export Game Map** (ex. `gabarit-gamemap-rich.h5p`), **pas** un
bundle assemblé artificiellement (`gabarit-gamemap.h5p`, ~60 bibliothèques) : ce dernier
provoque l'erreur `Unexpected token '<' … is not valid JSON` (le lecteur réclame un fichier
de bibliothèque absent et reçoit une page HTML). N'utilise donc **que les types présents dans
le gabarit choisi**. `gabarit-gamemap-rich.h5p` contient : AdvancedText, MultiChoice,
TrueFalse, Blanks, MarkTheWords, DragText, SingleChoiceSet, QuestionSet, **Crossword** —
**mais pas Summary**.

## Structure du content.json (vérifiée)

```jsonc
{
  "showTitleScreen": true,
  "titleScreen": { "titleScreenIntroduction": "<p>…HTML…</p>" },
  "gamemapSteps": {
    "backgroundImageSettings": {
      "backgroundColor": "rgb(238, 244, 250)",
      "backgroundImage": {                      // image EMPAQUETÉE
        "path": "images/fond.png", "mime": "image/png",
        "copyright": { "license": "CC BY-SA 3.0", "author": "…", "source": "…" },
        "width": 1600, "height": 900
      }
    },
    "gamemap": {
      "elements": [ /* … étapes … */ ],
      "paths":    [ /* … chemins … */ ]
    }
  },
  "endScreen": {
    "noSuccess": { "endScreenTextNoSuccess": "<p>…</p>" },
    "success":   { "endScreenTextSuccess":   "<p>Bravo …</p>" },
    "overallFeedback": [ { "from": 0, "to": 100 } ]
  },
  "visual":    { /* repris d'un export réel : couleurs des pastilles, chemins… */ },
  "audio":     { /* idem */ },
  "behaviour": { "enableRetry": true, "enableSolutionsButton": true,
                 "map": { "showLabels": true, "roaming": "free" } },
  "l10n":      { /* libellés FR — reprends ceux d'un export réel */ },
  "a11y":      { /* idem */ },
  "headline":  "Titre de la carte"
}
```

### Une étape (`gamemap.elements[]`)

```jsonc
{
  "id": "<guid>",
  "label": "Qui ecrit Wikipedia ?",          // affiché si behaviour.map.showLabels
  "content": { "params": {}, "dom": {} },     // laisser tel quel
  "telemetry": { "x": 25, "y": 12, "width": 4.5, "height": 8 },  // x,y EN PREMIER
  "neighbors": ["0", "2"],                     // indices (chaînes) des étapes reliées
  "canBeStartStage": false,                    // true pour l'étape de départ
  "time": {},
  "accessRestrictions": { /* défaut « ouvert » repris d'un export ; voir note */ },
  "contentsList": [
    { "contentType": {
        "params":  { /* le content.json de l'exercice (cf. autres fiches) */ },
        "library": "H5P.MultiChoice 1.16",     // version = dossier présent dans le gabarit
        "metadata": { "contentType": "Multiple Choice", "license": "U", "title": "…",
                      "authors": [], "changes": [] },
        "subContentId": "<guid>"
    } }
  ],
  "specialStageExtraLives": 1, "specialStageExtraTime": 1,
  "specialStageLinkTarget": "_blank", "alwaysVisible": false, "overrideSymbol": false
}
```

- **Étape de fin** : `"specialStageType": "finish"` et `contentsList: [ {} ]` (vide). Atteindre
  cette étape termine le jeu et affiche l'`endScreen`.
- **Étape d'info** (un `H5P.AdvancedText`, sans score) : elle **se valide toute seule**
  (`isTask() || (toggleCompleted(true), toggleSuccess(true))`). Parfaite comme **départ** :
  en progression verrouillée elle débloque la 1ʳᵉ vraie étape sans bloquer.

### Un chemin (`gamemap.paths[]`)

```jsonc
{ "from": 0, "to": 1,                          // indices d'étapes (NOMBRES)
  "customVisuals": { "colorPath": "rgba(0,0,0,0.7)", "pathWidth": "0.2", "pathStyle": "dotted" },
  "visualsType": "global" }
```

Pour un parcours linéaire : un chemin `from:i, to:i+1` pour chaque étape.

## Progression : `behaviour.map.roaming`

| Valeur | Effet |
|---|---|
| `free`     | Toutes les étapes ouvertes (exploration libre). |
| `complete` | Il faut **terminer** une étape pour débloquer ses voisines (progression verrouillée). |
| `success`  | Il faut **réussir** (avoir le score) une étape pour débloquer ses voisines. |

Définir aussi une étape de départ (`canBeStartStage: true`). Les voisines se débloquent via
`neighbors`.

## Couleurs des pastilles (`visual.stages`)

`colorStage` = ouverte (jaune), `colorStageLocked` = verrouillée (rouge),
`colorStageCleared` = réussie (verte). Reprends le bloc d'un export réel.

## Méthode de génération (résumé)

1. Pars d'un **vrai gabarit** Game Map et **réutilise** ses blocs `visual` / `audio` /
   `behaviour` / `l10n` / `a11y` (déjà conformes et en français).
2. Construis `elements[]` (étapes) avec **`[ordered]@{ x; y; width; height }`** et des
   `contentsList` reprenant les `params` des autres fiches (QCM, frise, etc.).
3. Image de fond **empaquetée** (`-Media fond.png`, `path: images/fond.png`).
4. Valide la syntaxe : `\.\scripts\Test-H5PJson.ps1 -Path .\content.json -Type generic`
   (plus, au cas par cas, chaque exercice avec son `-Type` dédié).
5. Empaquette : `\.\scripts\Build-H5PPackage.ps1 -Template .\assets\templates\gabarit-gamemap-rich.h5p
   -Content .\content.json -OutputPath "…\carte.h5p" -Media .\fond.png -Title "…"`.

> Le `Build-H5PPackage.ps1` ajoute automatiquement au manifeste toutes les bibliothèques
> utilisées (closure) — à condition que leur dossier soit présent dans le gabarit.
