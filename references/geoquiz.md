# Geography Quiz (`H5P.GeoQuiz 1.1`)

Un **quiz sur carte** : une question s'affiche en haut (« Où se trouve Sofia ? »),
l'élève **clique sur la carte**. Deux sortes de questions :

- **Lieu** (`location`) : un point précis (ville, monument, site). Score = 1000 − distance
  en km (0 au-delà de 1000 km). Marqueur vert à moins de 250 km, puis jaune, orange, rouge.
- **Pays** (`area`) : un pays entier. 1000 si le clic tombe dedans, 0 sinon.

À la fin : total des points et bouton « Recommencer ». Les questions sont mélangées.
Pas d'image, pas de média : le contenu tient dans le `content.json`.

- Gabarit : `assets/templates/gabarit-geoquiz.h5p`, avec la **bibliothèque patchée par le
  skill** (GeoQuiz 1.1.10, CoordinateSelector 1.0.4) et les éditeurs (modifiable dans Lumi).
- Fabriques : `assets/lib/geoquiz.mjs` (`lieu`, `pays`, `quiz`, `FONDS`, `validate`, libellés FR).
- Démo : « L'Union européenne sur la carte » (6 villes, 4 pays), dans
  `assets/examples/geoquiz-europe/` (`build.mjs`, `pack.py`).
- **Lumi** : OK avec le gabarit patché. **Digiquiz / La Digitale** : NON, ses `libraries/`
  n'ont pas GeoQuiz (et seulement H5P.Question 1.5, pas 1.3 ; vérifié 2026-10-24). Pour
  partager : Lumi > Exporter en HTML.
- Bibliothèque communautaire (fabforge), **absente du Hub H5P** (`api.h5p.org` renvoie 404).
  Si on perd le gabarit, repartir d'un `.h5p` GeoQuiz exporté de Lumi et réappliquer
  `assets/lib/geoquiz-patch.diff` (`patch -p1` dans le dossier dézippé).

## Pourquoi un patch : la version d'origine (1.1.9) est cassée dans Lumi

Vécu (2026-10-24) : dans l'onglet *View* de Lumi, la carte faisait **18 px de haut**, la
question chevauchait l'attribution, impossible de jouer. Trois défauts, tous corrigés dans
le gabarit :

1. **Hauteur nulle.** `setContainerHeight()` retire la hauteur de la barre d'actions H5P
   (`.h5p-actions`). Lumi (comme h5p-standalone) n'affiche pas cette barre →
   `parseInt(undefined)` = `NaN` → jQuery ignore `height(NaN)` → carte à 0 px. Patch :
   `|| 0`, hauteur minimale 300 px, `map.invalidateSize()` après chaque redimensionnement.
   Aucun réglage de Lumi ou du contenu ne contourne ce bug : il faut la lib patchée.
2. **Fonds de carte morts.** Hydda (serveur fermé), Stamen (plus servi sur fastly) et CARTO
   (filigrane « API KEY REQUIRED » sans clé depuis 2026) donnent une carte vide ou
   barrée. Patch : `CartoDB.VoyagerNoLabels` et `Hydda.Base` → **fond muet** dessiné avec
   les contours de pays de la lib (mer bleue, pays beiges, frontières grises, sans noms,
   sans internet) ; `Stamen.TerrainBackground` → relief ombré Esri ; `Stamen.Watercolor` →
   carte physique Esri. `Esri.WorldImagery` (satellite) marchait déjà.
3. **Pays mal reconnus.** Le mode `area` demandait le pays cliqué à Nominatim (internet) et
   comparait son nom anglais à celui du geojson : « United States » ≠ « United States of
   America », « Czechia » ≠ « Czech Republic »… → bonne réponse notée 0. Patch : test
   point-dans-polygone local sur le geojson (marche hors ligne).

Bonus : `isCorrect` (xAPI) comparait `icons.greenIcon` (inexistant), corrigé en `icons.green`.

Les numéros de patch montent (1.1.9 → 1.1.10, 1.0.3 → 1.0.4) : à l'import, **Lumi remplace
la bibliothèque installée**, ce qui répare aussi les anciens GeoQuiz déjà dans Lumi.

## Structure du `content.json`

```json
{
  "intro": "<p>Réponds aux questions en cliquant au bon endroit sur la carte.</p>",
  "mapType": "CartoDB.VoyagerNoLabels",    // voir « Fonds de carte »
  "mapCenter": "52,12",                    // "lat,lng" : centre au départ
  "mapZoom": 4,                            // 1-20 (entier)
  "questions": [
    { "locationType": "location", "text": "Où se trouve Paris ?", "locationLabel": "Paris",
      "typeLocation": "48.8566,2.3522" },  // CHAÎNE "lat,lng", pas un objet
    { "locationType": "area", "text": "Clique sur la Pologne.", "locationLabel": "Pologne",
      "typeArea": "POL" }                  // CHAÎNE : code ISO 3166-1 alpha-3
  ],
  "behaviour": { "enableRetry": true, "enableSolutionsButton": true },
  "overallFeedback": "Tu as obtenu @score points sur @total.",
  "nextBtnLabel": "Suivant", "startBtnLabel": "Commencer",
  "retryBtnLabel": "Recommencer", "showSolutionsBtnLabel": "Voir la solution"
}
```

- `typeLocation` / `typeArea` sont des **groupes à un seul champ** dans le `semantics.json`
  → H5P les aplatit en **chaîne**. Un objet `{coordinate: …}` ne marche pas.
- Codes pays : un fichier `geojson-data/<CODE>.geo.json` doit exister dans la lib (≈ 180
  pays, plus `CS-KM` pour le Kosovo). `validate(content, { areas })` le vérifie.
- `locationLabel` s'affiche en infobulle sur la solution.

## Fonds de carte (`mapType`, avec le gabarit patché)

| `mapType` | Rendu | Usage |
|---|---|---|
| `CartoDB.VoyagerNoLabels` (ou `Hydda.Base`) | **fond muet** : pays + frontières, aucun nom | pays, capitales ; zoom ≤ 5 (contours simplifiés) |
| `Esri.WorldImagery` | photo satellite, sans noms | villes, fleuves, reliefs, sites |
| `Stamen.TerrainBackground` | relief ombré Esri, sans noms ni frontières | montagnes, plaines (zoom ≤ 13) |
| `Stamen.Watercolor` | carte physique Esri | grands ensembles (zoom ≤ 8) |

Aucun fond n'affiche de noms : la carte ne donne pas la réponse.

## Règles de mise en page (vérifiées par rendu)

- La carte est en **16:9** de la largeur (540 px pour 960 px de large).
- **Zoom 1 = monde de 512 px de haut** : plus petit que la carte → bandes grises. Monde
  entier : zoom 2. Europe : zoom 4, centre `52,12`. France : zoom 5-6, centre `46.6,2.4`.
- La **question occupe le haut** de la carte (~40 px) et intercepte les clics : garder les
  cibles loin du bord haut (un pays coupé par le bandeau, comme le nord de la Suède à
  `50,10`, devient injouable). L'élève peut faire glisser la carte et zoomer à la molette.
- Après un clic, la barre de score et les boutons couvrent le milieu de la carte ;
  « Voir la solution » recadre sur la réponse.

## Recette (cloud, Node + Python)

```bash
G=assets/templates/gabarit-geoquiz.h5p
unzip -o -q $G -d /tmp/gq                          # pour la liste des pays
node mon-build.mjs content.json                    # gq.quiz([...]) puis gq.validate(c, { areas })
python3 assets/examples/geoquiz-europe/pack.py $G content.json sortie.h5p "Titre"
```

Test de rendu : `h5p-standalone@3` + playwright (comme pour les autres types en cloud) ;
`H5P.instances[0].map.latLngToContainerPoint([lat, lng])` donne le point à cliquer,
`H5P.instances[0].userScore` le score.

## Idées pédagogiques

- Capitales de l'UE, préfectures de sa région, sites du patrimoine mondial.
- Histoire : lieux de batailles, routes des explorateurs (une question par étape).
- EMI : sièges des grands médias, localiser le lieu d'une photo d'actualité (satellite).
- Pour des points précis à l'échelle d'une ville, préférer `Esri.WorldImagery` et un zoom
  élevé : la notation au km est alors très sévère (1 km = 1 point sur 1000), à expliquer
  dans l'intro.
