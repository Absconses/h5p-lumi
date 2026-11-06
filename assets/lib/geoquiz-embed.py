#!/usr/bin/env python3
"""Genere js/geojson-data.js et js/marker-icons.js dans une lib H5P.GeoQuizFix.

Un export HTML (Lumi > Exporter > HTML tout-en-un) ne peut pas lire les fichiers
geojson-data/ ni css/images/ de la lib : le code les prend alors dans ces deux
fichiers JS, charges avant js/GeoQuiz.js (voir preloadedJs de library.json).

Usage : python3 geoquiz-embed.py <dossier H5P.GeoQuizFix-1.1>
"""
import base64, json, pathlib, sys

lib = pathlib.Path(sys.argv[1])
geo = {}
for f in sorted((lib / 'geojson-data').glob('*.geo.json')):
    geo[f.name[:-len('.geo.json')]] = json.loads(f.read_text(encoding='utf-8'))
(lib / 'js' / 'geojson-data.js').write_text(
    '// Patch h5p-lumi : contours des pays embarques (un export HTML ne peut pas lire geojson-data/).\n'
    'H5P.GeoQuizFixGeo = ' + json.dumps(geo, separators=(',', ':')) + ';\n', encoding='utf-8')

names = ['marker-icon-2x-%s.png' % c for c in ('green', 'yellow', 'orange', 'red', 'blue')] + ['marker-shadow.png']
icons = {n: 'data:image/png;base64,' + base64.b64encode((lib / 'css' / 'images' / n).read_bytes()).decode() for n in names}
(lib / 'js' / 'marker-icons.js').write_text(
    '// Patch h5p-lumi : icones des marqueurs embarquees (un export HTML ne retrouve pas css/images/)\n'
    'H5P.GeoQuizFixIcons = ' + json.dumps(icons) + ';\n', encoding='utf-8')
print(len(geo), 'pays,', len(icons), 'icones')
