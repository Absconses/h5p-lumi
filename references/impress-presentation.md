# Référence — Présentation 3D (H5P.ImpressPresentation, « Impressive Presentation »)

`machineName` : **H5P.ImpressPresentation** (v1.0, statut **ALPHA**, moteur
[impress.js](https://impress.js.org)). Une **toile infinie en 3D** : des « vues » (cadres)
placées librement avec `x/y/z` + rotations ; la caméra **zoome, glisse et pivote** de l'une à
l'autre (flèches du clavier, boutons, balayage). Effet « Prezi ».

Structure **vérifiée sur un vrai export** (exemple h5p.org n° 7141, copie dans
`assets/examples/impresspresentation-exemple.content.json`). Fabriques prêtes à l'emploi :
`assets/lib/impress-factories.mjs`.

## ⚠️ Avant de commencer : la bibliothèque n'est PAS sur le Hub

- Ce type n'est **pas proposé par le Hub H5P** : Lumi ne peut pas l'installer tout seul. Il
  faut un `.h5p` qui **embarque les bibliothèques** (`H5P.ImpressPresentation-1.0/`,
  `H5P.AdvancedText-1.1/`, et l'éditeur `H5PEditor.ImpressPresentationEditor-…/` pour le
  modifier dans Lumi). Sources : dépôt GitHub `h5p/h5p-impress-presentation` (+ éditeur), ou un
  export h5p.org **avec** bibliothèques.
- Un export « contenu seul » (juste `h5p.json` + `content/`) **ne s'ouvre pas** dans Lumi tant
  que la bibliothèque n'y est pas installée.
- Dès qu'un `.h5p` complet est disponible, dépose-le comme gabarit :
  `assets/templates/gabarit-impresspresentation.h5p`, puis lis son `semantics.json`
  (méthode de `extending-new-types.md`) pour **confirmer** la liste des bibliothèques autorisées
  dans `action` et compléter cette fiche.
- Type **ALPHA, abandonné depuis 2016** : pas de score, pas de suivi xAPI, comportement mobile
  imprévisible. À réserver aux **présentations / récits** (pas d'évaluation) ; teste toujours le
  rendu avant de livrer.

## Le modèle mental : caméras + panneaux

Tout est une **vue**. Il y en a deux sortes, distinguées par `ordering.includeInPath` :

| Rôle | `includeInPath` | Fond | Contenu | Sert à |
|---|---|---|---|---|
| **Caméra** (étape) | `true` | transparent | aucun | définir un cadrage : position, angle, zoom |
| **Panneau** (décor) | `false` | couleur et/ou image | texte (`action`) ou image | ce que l'élève voit |

La présentation **saute de caméra en caméra** dans l'ordre de `route`. Les panneaux sont posés
**juste devant** une caméra, avec **la même rotation** — c'est exactement ce que fait l'exemple
officiel (« 1 Camera » + « 1 black » + « 1 Earth », etc.).

- **Zoom** = taille de la caméra : une caméra de 640×360 cadre une zone de 640×360 px ; une
  caméra de 3000×1700 donne une **vue d'ensemble** (fabrique `overview()`).
- **Profondeur** : un panneau dont la position est décalée de `d` **vers l'avant** de la
  caméra (le long de son axe de visée) paraît plus **grand / proche**. Exemple : fond à
  `d = 10`, image à `d = 80`. Dans l'export, les décalages vont de ~10 à ~400.
- **Axe de visée** d'une vue tournée (vérifié sur l'export) :
  `(sin rotY, −sin rotX·cos rotY, cos rotX·cos rotY)`. Pour `rotY = −102°`, avancer de `d`
  revient à `x += −0,98·d ; z += −0,21·d`. La fabrique `panel()` fait ce calcul.

## Structure du content.json (vérifiée)

```jsonc
{
  "viewsGroup": {
    "perspectiveRatio": 0.918,          // nombre ; force de la perspective (1 = défaut conseillé)
    "views": [
      {                                 // --- CAMÉRA ---
        "backgroundGroup": {
          "transparentBackground": true,
          "backgroundColor": "fff",     // hex SANS « # »
          "backgroundWidth": 640,       // = cadrage (zoom)
          "backgroundHeight": 360
        },
        "positioning": {
          "centerText": true,
          "y": -5, "x": 3, "z": -80,    // px, nombres (décimales OK)
          "rotateX": 0, "rotateY": 0, "rotateZ": 0   // degrés
        },
        "ordering": {
          "includeInPath": true,        // ⬅️ étape du parcours
          "uniqueId": 0,                // entier unique
          "userDefinedName": "1 Camera" // nom vu dans l'éditeur seulement
        }
      },
      {                                 // --- PANNEAU TEXTE ---
        "action": {                     // optionnel : contenu de la vue
          "library": "H5P.AdvancedText 1.1",
          "params": { "text": "<h2>Titre</h2><p>Texte HTML.</p>" },
          "subContentId": "<guid>",
          "metadata": { "contentType": "Text", "license": "U", "title": "…" }
        },
        "backgroundGroup": {
          "transparentBackground": false,
          "backgroundColor": "000000",
          "backgroundWidth": 643, "backgroundHeight": 456
        },
        "positioning": { "centerText": true, "x": 319, "y": 12, "z": 90,
                         "rotateX": -3.6, "rotateY": -98.9, "rotateZ": -1 },
        "ordering": { "includeInPath": false, "uniqueId": 6, "userDefinedName": "2 black" }
      },
      {                                 // --- PANNEAU IMAGE ---
        "backgroundGroup": {
          "transparentBackground": false,
          "backgroundColor": "000000",
          "backgroundWidth": 341, "backgroundHeight": 296,
          "backgroundImage": {          // fichier EMBARQUÉ (content/images/…)
            "path": "images/terre.jpg", "mime": "image/jpeg",
            "width": 980, "height": 980,
            "copyright": { "license": "PD", "title": "…", "author": "…", "source": "https://…" }
          }
        },
        "positioning": { "centerText": true, "x": 0, "y": 0, "z": 0,
                         "rotateX": 0, "rotateY": 0, "rotateZ": 0 },
        "ordering": { "includeInPath": false, "uniqueId": 1, "userDefinedName": "1 Earth" }
      }
    ],
    "route": [                          // ordre du parcours : caméras uniquement
      "#h5p-impress-id-0", "#h5p-impress-id-3", "#h5p-impress-id-8"
    ]
  }
}
```

Notes :
- L'ordre des clés n'a pas d'importance ici (contrairement à Game Map), mais les fabriques
  reproduisent celui de l'export.
- `uniqueId` n'a pas besoin d'être continu (l'export saute 4, 24, 27) : il doit être **unique**.
- `route` : chaînes `#h5p-impress-id-<uniqueId>`, **seulement** des vues `includeInPath: true`.
  Dans l'exemple, `route` commence par `#…-20` (la dernière caméra) puis 0, 3, 8… : l'ordre
  exact utilisé à l'exécution (route vs ordre des vues) reste **à confirmer** dans le code de la
  bibliothèque. En attendant, garde `route` **dans le même ordre** que les caméras de `views`
  (c'est ce que fait `presentation().toJSON()`), ce qui est correct dans les deux cas.
- L'image de fond est **étirée** à `backgroundWidth × backgroundHeight` : garde le ratio de
  l'image (`width/height` du fichier).
- Pas de `backgroundImage: {}` vide : on **omet** la clé (même règle que dans les autres types).
- Le texte : HTML. L'exemple utilise `font-size:0.625em` et `color` / `background-color`
  en ligne. Utilise `background-color`, jamais le raccourci `background` (Lumi le supprime).

## Générer avec les fabriques (Node)

```js
import fs from 'fs';
import { presentation, station, layouts, overview, validate }
  from '../../assets/lib/impress-factories.mjs';

const IMG = { carte: { path: 'images/carte.jpg', mime: 'image/jpeg', width: 1200, height: 800,
  copyright: { license: 'CC BY-SA 4.0', author: '…', title: '…', source: 'https://commons…' } } };

const etapes = [
  { html: '<h2>La Révolution française</h2><p>Un voyage en 5 étapes.</p>' },
  { html: '<h3>1789</h3><p>…</p>', image: IMG.carte },
  { image: IMG.carte },
];

const p = presentation();
layouts.circle(etapes.length).forEach((pos, i) =>
  p.add(...station(pos, etapes[i], { title: `Étape ${i + 1}` })));
p.add(overview(p.views));                       // dernière étape : vue d'ensemble

const content = p.toJSON();
const errs = validate(content);
if (errs.length) { console.error(errs); process.exit(1); }
fs.writeFileSync('content.json', JSON.stringify(content));
```

- `station(pos, { html?, image? })` = 1 caméra + fond + texte et/ou image, tous orientés comme
  la caméra.
- `layouts` : `line`, `grid`, `circle` (les étapes tournent autour d'un centre),
  `spiral` (plongée en profondeur avec rotation). Chaque fonction renvoie des positions à
  passer à `station()`.
- `panel(cam, { d, dx, dy, … })` pour poser un élément libre (étiquette, flèche, deuxième
  image) devant une caméra ; `view()` pour tout le reste.

## Règles pédagogiques et de mise en scène

- **5 à 12 étapes**. Au-delà, l'élève se perd : découpe en plusieurs présentations.
- **Un message par étape** : un titre + 2 ou 3 phrases, ou une image légendée. Police assez
  grande (le texte est zoomé, pas re-mis en page).
- Le mouvement doit **avoir du sens** : rotation/zoom pour marquer un changement de partie,
  plongée (`spiral`) pour « entrer dans le détail », vue d'ensemble au début ou à la fin pour
  montrer la structure. Pas de rotation gratuite à chaque diapo (mal de mer garanti).
- Crédits d'image dans `backgroundImage.copyright` (licence, auteur, titre, source) **et**
  rappelés dans une dernière étape « Crédits ».
- Pas d'évaluation dans ce type : pour vérifier la compréhension, enchaîne avec un Quiz
  (QuestionSet) ou intègre la présentation à côté d'exercices dans une Page (Column).

## Validation

```powershell
.\scripts\Test-H5PJson.ps1 -Path .\content.json -Type impress
```

Ou côté Node : `validate(content)` dans `impress-factories.mjs` (mêmes contrôles : `viewsGroup`,
`uniqueId` uniques, positions numériques, couleurs sans `#`, pas d'image vide, `route`
cohérente).

## Empaquetage

Comme les autres types (`references/lumi-packaging.md`), avec
`gabarit-impresspresentation.h5p` (à obtenir, voir l'avertissement en haut) et `-Media` pour
les images de `content/images/`. `h5p.json` minimal :

```json
{ "title": "…", "language": "fr", "mainLibrary": "H5P.ImpressPresentation",
  "embedTypes": ["iframe"], "license": "U",
  "preloadedDependencies": [ { "machineName": "H5P.ImpressPresentation",
                               "majorVersion": "1", "minorVersion": "0" } ] }
```

Les versions exactes des dépendances (AdvancedText, JoubelUI, etc.) sont à reprendre du
`library.json` du gabarit, pas à deviner.
