# Corrige un export HTML (Lumi en ligne ou bureau) d'un Geography Quiz avec la lib
# d'origine H5P.GeoQuiz 1.1.9 (code minifie) : hauteur, pays embarques, test pays local.
# Usage : python3 geoquiz-fix-html.py <entree.html> <sortie.html> <dossier geojson-data>
#   (geojson-data : dans gabarit-geoquiz.h5p, dossier H5P.GeoQuizFix-1.1/geojson-data)
import sys, re, json, os
src, out, geodir = sys.argv[1:4]
s = open(src, encoding='utf-8').read()
def rep(a, b):
    global s
    n = s.count(a); assert n == 1, (n, a[:60]); s = s.replace(a, b)
# 1. hauteur de la carte
rep('e=parseInt(s(".h5p-actions").height()),t=parseInt(Math.round(t/16*9))-e;',
    'e=parseInt(s(".h5p-actions").height())||0,t=Math.max(300,Math.round(t/16*9)-e);')
rep('s("#h5p-geoquiz-answer-container").height(t),t},t.prototype.resize',
    's("#h5p-geoquiz-answer-container").height(t),this.map&&this.map.invalidateSize(),t},t.prototype.resize')
# 2. contours des pays embarques (le fichier HTML ne peut pas lire geojson-data/)
codes = sorted(set(re.findall(r'typeArea\\\\?":\\\\?"([A-Z-]+)', s)))
geo = {c: json.load(open(os.path.join(geodir, c + '.geo.json'))) for c in codes}
rep('s.getJSON(n.getLibraryFilePath("")+"geojson-data/"+t+".geo.json")',
    '(function(G){return G[t]?s.Deferred().resolve(G[t]):s.getJSON(n.getLibraryFilePath("")+"geojson-data/"+t+".geo.json")})(' + json.dumps(geo, separators=(',', ':')) + ')')
# 3. test point-dans-polygone local au lieu de Nominatim
rep('o.getNominatimCountry(i).then(function(t){e("isMarkerInsideArea worked!")})',
    '(function(){var p=i.getLatLng(),x=((p.lng+180)%360+360)%360-180,y=p.lat,f=!1,R=function(r){for(var c=!1,a=0,b=r.length-1;a<r.length;b=a++){var A=r[a],B=r[b];(A[1]>y)!=(B[1]>y)&&x<(B[0]-A[0])*(y-A[1])/(B[1]-A[1])+A[0]&&(c=!c)}return c},P=function(g){if(!R(g[0]))return!1;for(var k=1;k<g.length;k++)if(R(g[k]))return!1;return!0};o.mapLayers.correctAnswerArea&&o.mapLayers.correctAnswerArea.eachLayer(function(l){var g=l.feature&&l.feature.geometry;if(!g||f)return;if("Polygon"===g.type)f=P(g.coordinates);else for(var m=0;m<g.coordinates.length&&!f;m++)f=P(g.coordinates[m])});o.userAnswerCountry=f?o.correctAnswerCountry:"Unknow";e("isMarkerInsideArea worked!")})()')
open(out, 'w', encoding='utf-8').write(s)
print('OK', out, 'pays embarques :', codes)
