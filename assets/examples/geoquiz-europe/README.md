# Démo Geography Quiz : « L'Union européenne sur la carte »

10 questions (6 villes, 4 pays), plan clair sans noms, centré sur l'Europe (zoom 4).

```bash
G=../../templates/gabarit-geoquiz.h5p
mkdir -p /tmp/gq && unzip -o -q $G -d /tmp/gq
node build.mjs content.json /tmp/gq/H5P.GeoQuiz-1.1/geojson-data
python3 pack.py $G content.json geoquiz-europe.h5p "L'Union européenne sur la carte"
```

Lumi seulement (Digiquiz n'a pas la bibliothèque GeoQuiz). Pour partager : Lumi >
Exporter en HTML.
