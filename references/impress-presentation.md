# Référence — Présentation 3D (H5P.ImpressPresentation, « Impressive Presentation »)

`machineName` : **H5P.ImpressPresentation** (v1.0, statut **ALPHA**, moteur
[impress.js](https://impress.js.org)). Une **toile infinie en 3D** : des « vues » (cadres)
placées librement avec `x/y/z` + rotations ; la caméra **zoome, glisse et pivote** de l'une à
l'autre (flèches du clavier, boutons, balayage). Effet « Prezi ».

Structure **vérifiée sur un vrai export** (exemple h5p.org n° 7141, copie dans
`assets/examples/impresspresentation-exemple.content.json`). Fabriques prêtes à l'emploi :
`assets/lib/impress-factories.mjs`.

## ⚠️ Avant de commencer : la bibliothèque n'est PAS sur le Hub

- Ce type n'est **pas proposé par le Hub H5P** : Lumi ne peut pas l'installer tout seul. Le
  gabarit **`assets/templates/gabarit-impresspresentation.h5p`** embarque tout ce qu'il faut
  (export h5p.org n° 7141 + `FontAwesome-4.5`, qui manquait à l'export et que réclament
  JoubelUI/Question) : `H5P.ImpressPresentation-1.0` (1.0.3), l'éditeur
  `H5PEditor.ImpressPresentation-1.0`, `H5P.AdvancedText-1.1`, `H5P.SingleChoiceSet-1.3`,
  `H5P.MarkTheWords-1.5`, `H5P.Blanks-1.4`, `H5P.JoubelUI-1.2`, etc. Empaquette **toujours**
  avec toutes ses bibliothèques : un `.h5p` « contenu seul » ne s'ouvre pas dans Lumi.
- Type **ALPHA, abandonné depuis 2016** : pas de score global ni de suivi xAPI de la
  présentation. Teste toujours le rendu avant de livrer (h5p-standalone + Playwright :
  rendu vérifié le 2026-10-23, quiz SingleChoiceSet compris).

## Le modèle mental : caméras + panneaux

Tout est une **vue**. Il y en a deux sortes, distinguées par `ordering.includeInPath` :

| Rôle | `includeInPath` | Fond | Contenu | Sert à |
|---|---|---|---|---|
| **Caméra** (étape) | `true` | transparent | aucun | définir un cadrage : position, angle, zoom |
| **Panneau** (décor) | `false` | couleur et/ou image | texte (`action`) ou image | ce que l'élève voit |

La présentation **saute de caméra en caméra** dans l'ordre de `route`. Les panneaux sont posés
**juste devant** une caméra, avec **la même rotation** — c'est exactement ce que fait l'exemple
officiel (« 1 Camera » + « 1 black » + « 1 Earth », etc.).

- **Cadrage fixe** : quelle que soit sa taille (`backgroundWidth/Height`), une caméra affiche
  **toujours 640 × 360 unités** autour de son centre (puis l'ensemble est agrandi à la largeur
  de l'iframe, en 16:9). La taille de la caméra **ne zoome pas** (vérifié dans `jmpress.js` :
  le zoom viendrait de `data-scale`, que la bibliothèque n'expose pas).
- **Zoom = profondeur** : un plan situé à `Z` unités **derrière** la caméra est réduit d'un
  facteur `P / (P + Z)`, avec **`P = 640 / perspectiveRatio`** (mesuré : un panneau à
  `d = −640` paraît 2 fois plus petit). Devant (`d > 0`), il grossit.
  - **Vue d'ensemble** = une caméra **reculée** (z plus grand) : fabrique `overview()`.
  - **Texte moins gros** : recule toute la carte (`depth(1.15)` → cartes 1,15 × plus grandes
    qui remplissent pile l'écran) ; c'est ce que fait `station()`.
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
- `uniqueId` n'a pas besoin d'être continu (l'export saute 4, 24, 27) mais doit être
  **strictement croissant dans l'ordre de `views`** : à l'exécution, la bibliothèque
  renumérote toute vue dont l'id n'est pas supérieur au précédent, et la `route` pointe alors
  dans le vide. Les fabriques numérotent dans l'ordre de création : ajoute les vues dans cet
  ordre (`p.add(...)`).
- `route` : chaînes `#h5p-impress-id-<uniqueId>`, **seulement** des vues `includeInPath: true`.
  Elle est utilisée **telle quelle** : `route[0]` est l'étape d'ouverture, puis on avance dans
  l'ordre (et on boucle). Dans l'exemple, elle commence par `#…-20` : la présentation s'ouvre
  sur la dernière caméra créée. Par défaut `presentation().toJSON()` suit l'ordre des caméras.
- L'image de fond est **étirée** à `backgroundWidth × backgroundHeight` : garde le ratio de
  l'image (`width/height` du fichier).
- Pas de `backgroundImage: {}` vide : on **omet** la clé (même règle que dans les autres types).
- `action` (contenu d'une vue) : **uniquement** `H5P.AdvancedText 1.1`, `H5P.MarkTheWords 1.5`,
  `H5P.SingleChoiceSet 1.3`, `H5P.Blanks 1.4` (liste du `semantics.json`). Un
  **SingleChoiceSet** marche très bien comme quiz final (mets `soundEffectsEnabled: false`).
- Un contenu est **centré** dans sa vue et prend **au plus la moitié de sa largeur** (conteneur
  en `position:absolute; left:50%`). Pour une colonne de texte de 300 unités, la vue doit faire
  600 de large : `textView()` double la largeur pour toi. Trop de texte déborde en haut **et** en
  bas (centrage vertical) : ~14 lignes maximum dans une carte de 360 de haut.
- **Tout ce qui se clique** (quiz, liens) doit être posé **devant** la caméra (`d > 0`) : la
  vue-caméra, transparente, est un rectangle de 640 × 360 qui intercepte les clics sur tout
  ce qui est derrière elle (vérifié au rendu : quiz inutilisable à `d < 0`). Le texte simple
  peut rester derrière (cartes « dézoomées »).
- Un **SingleChoiceSet** prend, lui, **toute** la largeur de sa vue (pas la moitié). Au
  premier clic dans la présentation, un calque de focus absorbe le clic : l'élève doit parfois
  cliquer deux fois sur sa première réponse.
- Le texte est **noir** par défaut : pose-le sur des **cartes claires**. Du texte blanc
  demanderait des `<span style="color:#FFFFFF">` partout (c'est ce que fait l'exemple). Évite
  `background`, jamais conservé par l'éditeur.

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
layouts.line(etapes.length).forEach((pos, i) =>
  p.add(...station(pos, etapes[i], { title: `Étape ${i + 1}` })));
p.add(overview(p.views));                       // dernière étape : vue d'ensemble

const content = p.toJSON();
const errs = validate(content);
if (errs.length) { console.error(errs); process.exit(1); }
fs.writeFileSync('content.json', JSON.stringify(content));
```

- `station(pos, { html?, image? }, { title, color, card, zoom })` = 1 caméra + cadre de
  couleur + carte claire + image à gauche / texte à droite, le tout reculé de `depth(zoom)`.
- `layouts` : `line`, `grid`, `circle` (les étapes tournent autour d'un centre),
  `spiral` (plongée en profondeur avec rotation). Chaque fonction renvoie des positions à
  passer à `station()`. Garde au moins **1000 unités** entre deux stations (une carte
  zoomée fait 736 de large) sinon la voisine apparaît dans le cadre.
- `overview(views)` : caméra reculée qui englobe toutes les vues **opaques** ; ajoute-la en
  dernier (ou en premier, avec `toJSON(route)`). Exemple complet (frise en « paravent »,
  synthèse, quiz, crédits) : module *Évolution des médias*,
  `sources/evolution-medias/build.mjs`.
- `panel(cam, { d, dx, dy, … })` pour poser un élément libre (étiquette, flèche, deuxième
  image) devant une caméra ; `view()` pour tout le reste.

## Mise en scène immersive (vérifiée au rendu)

Exemple complet : `sources/voyage-infox/build.mjs` (module « Le voyage d'une infox »).

- **Salle où l'on tourne sur soi** : pour un centre `C` et un cap `θ` (`rotateY`), place la
  caméra **à 750 du centre, du côté de son mur** (`x = C.x − 750·sin θ`, `z = C.z − 750·cos θ`)
  et sa carte devant elle. Deux caméras au **même point** avec des caps différents ne marchent
  pas : le mur voisin traverse le champ en biais.
- **Rien derrière l'« œil »** : un plan situé à plus de 640 unités **devant** le plan de la
  caméra (côté spectateur) est dessiné à l'envers, en géant, et masque tout. Donc **pas
  d'anneau complet** autour de la caméra : un arc de −60° à +90° suffit pour l'effet « bulle ».
- **Spirale** : avancer en `z` négatif en ajoutant 25–30° de `rotateZ` par étape (cartes
  sans image, `panel()` ne fait pas tourner `dx` avec `rotateZ`).
- **Carte du voyage** : `overview()` des vues opaques en 2e étape, grosses pastilles numérotées
  (`font-size:40em` dans une vue de 1500×1500) + une légende en haut du cadre.
- **Pas de « ciel » géant** : des vues de 30 000 px de côté figent le rendu. Le fond reste blanc.
- Une étape qui se clique (quiz, crédits avec liens) doit être **seule à son emplacement**.

## Règles pédagogiques et de mise en scène

- **5 à 12 étapes** (jusqu'à ~16 pour un « voyage » très court par étape, avec une carte). Au-delà, découpe.
- **Un message par étape** : un titre + 2 ou 3 phrases, ou une image légendée. Police assez
  grande (le texte est zoomé, pas re-mis en page).
- Le mouvement doit **avoir du sens** : rotation/zoom pour marquer un changement de partie,
  plongée (`spiral`) pour « entrer dans le détail », vue d'ensemble au début ou à la fin pour
  montrer la structure. Pas de rotation gratuite à chaque diapo (mal de mer garanti).
- Crédits d'image dans `backgroundImage.copyright` (licence, auteur, titre, source) **et**
  rappelés dans une dernière étape « Crédits ».
- Évaluation : un `H5P.SingleChoiceSet 1.3` (ou Blanks / MarkTheWords) dans une vue, en fin
  de parcours. Pas de score global remonté : pour un vrai suivi, enchaîne avec un Quiz
  (QuestionSet) à part.

## Validation

```powershell
.\scripts\Test-H5PJson.ps1 -Path .\content.json -Type impress
```

Ou côté Node : `validate(content)` dans `impress-factories.mjs` (mêmes contrôles : `viewsGroup`,
`uniqueId` uniques, positions numériques, couleurs sans `#`, pas d'image vide, `route`
cohérente).

## Empaquetage

Gabarit : `assets/templates/gabarit-impresspresentation.h5p` ; images dans `content/images/`
(`-Media`, voir `references/lumi-packaging.md`). Le `h5p.json` du gabarit liste déjà les bonnes
versions : reprends ses `preloadedDependencies` (et ajoute `H5P.SingleChoiceSet 1.3` etc. si tu
les utilises — `Build-H5PPackage.ps1` calcule la fermeture). Pour Digiquiz / La Digitale,
n'embarque que la fermeture des dépendances d'exécution (sans `H5PEditor.*`).

⚠️ **Digiquiz ne peut pas lire ce type.** Digiquiz ne garde que `h5p.json` et `content/` du
`.h5p` et charge les bibliothèques depuis **son propre dossier** (`libraries/` du dépôt
codeberg.org/ladigitale/digiquiz), qui ne contient ni `H5P.ImpressPresentation`, ni
`H5P.JoubelUI-1.2`, ni `FontAwesome-4.3` → « Ce contenu H5P n'a pas pu être chargé »
(`Unexpected token '<'` : un `library.json` renvoie une page 404). Pour diffuser en ligne :
export HTML de Lumi (fichier unique), ou une plateforme où l'on installe la bibliothèque
(Moodle, h5p.com…).

## Style « cinéma » (photos plein cadre)

- Fonds générés par `assets/lib/cinema-bg.py` (Pillow, polices Bebas Neue + Inter à placer dans `fonts/`) :
  photo recadrée 1600×900, dégradé nuit du côté du texte, titre et surtitre incrustés.
- Fond = panneau opaque à D = -96 de 640K×360K ; texte blanc (`<span style="color:#ffffff">`) à D + 8.
- Titre incrusté sur **une seule ligne** si le texte éditable suit (sinon il chevauche le texte).
- Vidéo YouTube : iframe youtube-nocookie dans un AdvancedText à d = 8 (devant la caméra), seule à sa place.
- Exemple complet : `voyage-infox-cinema` (sources dans les fichiers du projet, h5p/sources/).

## Clics et ordre des vues (vérifié 2026-10-24)

- Le navigateur donne le clic au **dernier élément du DOM** sous la souris, même s'il est derrière en 3D.
  Mettre le décor (grands aplats, lignes, étiquettes) **au début** de `views`, les exercices après.
- Blanks 1.4 et MarkTheWords 1.5 prennent **toute la largeur** de leur vue (comme SingleChoiceSet), avec une
  police assez grande : une vue de 590×300 à d = 8 sous un simple surtitre ; 3 phrases à trous maximum.
- Lignes de connexion : panneau fin (largeur = longueur, hauteur 18–36) tourné en `rotateZ = atan2(dy, dx)`.
- Exemple : `qu-est-ce-qu-internet` (coupe espace → fond de l'océan, photos Pixabay), sources dans les fichiers du projet.
- Décor illustré de la vue d'ensemble : UNE image derrière tout (`assets/lib/impress-map-backdrop.py`, exemple),
  à la profondeur ZB, de taille 640·(P+Z)/P × 360·(P+Z)/P où Z = z(caméra d'ensemble) − ZB. Pas de gel au rendu.
