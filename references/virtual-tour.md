# Virtual Tour 360 (`H5P.ThreeImage 0.5`)

Une **visite virtuelle** : l'élève est placé au centre d'une photo 360° et regarde autour
de lui. Des **points d'intérêt** (+) ouvrent un texte, une image, une vidéo, un audio ou un
petit quiz ; des **portes** mènent à une autre scène. Idéal pour « visiter » un lieu
(CDI, studio, musée, site historique) et y semer des explications et des questions.

- Gabarit : `assets/templates/gabarit-virtualtour.h5p` (version officielle du Hub H5P,
  ThreeImage 0.5.8, éditeurs compris → modifiable dans Lumi).
- Fabriques : `assets/lib/virtual-tour.mjs` (positions, scènes, actions, l10n français).
- Module de démonstration : « Dans les coulisses de l'info et des images » (EMI collège,
  4 scènes, 2 quiz, bilan), sources dans `assets/examples/visite-coulisses-info/`.
- **Lumi** : OK. **Digiquiz / La Digitale** : OK aussi, ses `libraries/` contiennent
  ThreeImage 0.5 et toutes ses dépendances (vérifié 2026-10-24). Livrer une version
  `--slim` et allégée (panoramas en 2560 px) pour rester sous ~4 Mo.

## Où trouver le gabarit si on le perd

Le Hub H5P donne le paquet complet (bibliothèques comprises) :
`https://api.h5p.org/v1/content-types/H5P.ThreeImage` (GET, ~1,5 Mo). Un `.h5p`
d'exemple téléchargé depuis h5p.org peut, lui, ne contenir **que** `content/` sans aucune
bibliothèque : il ne sert alors que de modèle de contenu.

## Structure du `content.json`

```json
{
  "threeImage": {
    "scenes": [ {
      "sceneId": 0,
      "sceneType": "360",                 // "360" (photo équirectangulaire 2:1) ou "static" (photo normale)
      "showBackButton": true,
      "scenename": "1. Le CDI",
      "scenesrc": { "path": "images/cdi.jpg", "mime": "image/jpeg", "width": 3840, "height": 1920,
                    "copyright": { "license": "CC BY-SA", "version": "4.0", "author": "…", "title": "…", "source": "https://…" } },
      "scenedescription": "<p>Consigne de la scène (bouton i)</p>",
      "cameraStartPosition": "yaw,pitch",  // où regarde l'élève en arrivant
      "iconType": "plus",                  // "plus" ou "arrow"
      "interactions": [ {
        "interactionpos": "yaw,pitch",     // en 360 ; "x%,y%" en scène statique
        "labelText": "Le fond vert",       // étiquette affichée à côté du +
        "label": { "labelPosition": "inherit", "showLabel": "inherit" },
        "action": { "library": "H5P.AdvancedText 1.1", "params": { "text": "<p>…</p>" },
                    "subContentId": "<uuid>", "metadata": { "contentType": "Text", "license": "U", "title": "…" } }
      } ]
    } ],
    "startSceneId": 0
  },
  "behaviour": { "sceneRenderingQuality": "high", "label": { "labelPosition": "right", "showLabel": true } },
  "l10n": { "title": "…", "sceneDescription": "Description de la scène", "resetCamera": "Recentrer la vue", … }
}
```

Actions autorisées (semantics) : `H5P.GoToScene 0.1` (`{nextSceneId}`), `H5P.AdvancedText 1.1`,
`H5P.Image 1.1`, `H5P.Audio 1.5`, `H5P.Video 1.6`, `H5P.Summary 1.10`, `H5P.SingleChoiceSet 1.11`.
Rien d'autre (pas de MultiChoice, Blanks…).

## Placer un point d'intérêt : la formule (vérifiée par rendu)

Ouvre le panorama équirectangulaire avec une grille en % (u de gauche à droite, v de haut
en bas) et lis la position de l'objet. Puis :

```
yaw   = π/2 + 2π · u        (u entre 0 et 1)
pitch = π · (0,5 − v)       (v entre 0 et 1 ; v = 0,5 = horizon)
interactionpos = "yaw,pitch"
```

`pos360(u, v)` de la fabrique fait ce calcul (u, v en %). La même formule sert pour
`cameraStartPosition`. Test : un point en `pos360(25, 50)` avec la caméra au même endroit
apparaît pile au centre de l'écran, sur la ligne 25 % de l'image.

Champ de vision ≈ 90° en largeur, soit **~25 % de l'image** : un point à plus de ±12 %
du `cameraStartPosition` n'est pas visible à l'arrivée. Place les portes principales dans
ce champ, garde le reste pour l'exploration.

Scène **statique** : `interactionpos = "x%,y%"` (`posStatic(x, y)`), coin haut-gauche
de l'image.

## Règles

1. **Bonne réponse en premier** : SingleChoiceSet (`answers[0]`) et Summary
   (`summary[0]`) ; le lecteur mélange.
2. Toute image référencée (`scenesrc`, `H5P.Image`) doit être dans `content/images/`.
   `pack.py` refuse d'empaqueter s'il en manque une.
3. Les panoramas doivent être **équirectangulaires 2:1**. Une photo « double fisheye »
   (deux cercles côte à côte) ne marche pas, même si elle est étiquetée 360.
4. Taille : 3840×1920 suffit (~1–2 Mo par scène). Pour Digiquiz, réduire à 2560×1280.
5. Pas de score global : les quiz sont des points d'intérêt indépendants. Pour évaluer,
   préférer un Summary « bilan » dans une dernière scène.
6. Mettre une scène **hub** (ex. le CDI) avec une porte vers chaque salle, et une porte
   « Retour » dans chaque salle : la navigation reste simple pour des collégiens.

## Trouver des photos 360 libres

- **Wikimedia Commons** : recherche `hastemplate:Pano360 <mot>` (API `list=search`,
  `srnamespace=6`) ; garder les ratios 2:1. Les panoramas **Poly Haven** (CC0, très
  propres : studios photo/TV, ateliers, cinéma, paysages) y sont copiés. L'API répond
  souvent 429 : espacer les appels (≥ 8 s) et télécharger par
  `Special:FilePath/<Fichier>?width=3840`.
- **Pixabay** : peu de vrais 360 (chercher `equirectangular`, `360 panorama`, filtrer le
  ratio 2:1). Utile pour les images des scènes statiques.

## Empaqueter

Windows : `scripts/Build-H5PPackage.ps1 -Template assets/templates/gabarit-virtualtour.h5p
-Content content.json -Media <images…> -OutputPath visite.h5p -Title "…"`.

Cloud (sans PowerShell) : `assets/examples/visite-coulisses-info/` contient `build.mjs`
(le module de démo complet, à copier comme modèle),
`validate.py` (contrôle contre chaque `semantics.json`) et `pack.py` (fermeture des
dépendances, `--slim` pour Digiquiz). Rendu de test : `h5p-standalone@3` +
playwright avec `--use-gl=swiftshader` (WebGL logiciel) ; les points d'intérêt sont des
`.nav-button[aria-label="<labelText>"]` cliquables.
