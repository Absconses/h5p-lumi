# Empaquette un content.json dans un .h5p a partir du gabarit Geography Quiz (H5P.GeoQuizFix).
# Usage : python3 pack.py <gabarit-geoquiz.h5p> <content.json> <sortie.h5p> "<titre>"
# Garde toutes les bibliotheques du gabarit (editeurs compris -> modifiable dans Lumi).
import json, sys, os, zipfile
TPL, CONTENT, OUT, TITLE = sys.argv[1:5]
zin = zipfile.ZipFile(TPL)
man = json.loads(zin.read('h5p.json'))
c = json.load(open(CONTENT, encoding='utf-8'))
man.update(title=TITLE, extraTitle=TITLE, language='fr', defaultLanguage='fr', embedTypes=['iframe'])
if os.path.exists(OUT): os.remove(OUT)
with zipfile.ZipFile(OUT, 'w', zipfile.ZIP_DEFLATED) as z:
    z.writestr('h5p.json', json.dumps(man, ensure_ascii=False))
    z.writestr('content/content.json', json.dumps(c, ensure_ascii=False))
    for x in zin.namelist():
        if x.startswith('content/') or x == 'h5p.json' or x.endswith('/'): continue
        z.writestr(x, zin.read(x))
print(OUT, round(os.path.getsize(OUT) / 1e6, 2), 'Mo')
