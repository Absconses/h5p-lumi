# Exemple : « Ma première visite au CDI » (EMI 6e, 45 min)

Livre-parcours pour le lecteur hors ligne. Les 6 étapes suivent l'ordre d'une vraie première
visite : trouver le CDI, comprendre à quoi il sert, choisir un roman, trouver un documentaire,
l'emprunter, puis une mission dans les rayons avec un passeport lecteur à exporter.

| Étape | Activité | Pourquoi cette forme |
|---|---|---|
| 1. Trouver le CDI | Find the Hotspot sur un plan simplifié dessiné | savoir spatial : l'élève localise, guidé par un repère (le hall rond) |
| 2. À quoi sert le CDI ? | Drag and Drop de 8 situations dans 4 missions | catégories : trier des situations concrètes |
| 3. Choisir un roman | Personality Quiz *(cadre, non noté)*, Image Hotspots sur un livre, Drag Text, Drag and Drop de 6 couvertures vers les rayons, Drag Text (surnaturel), Mark the Words (4e de couverture) | repérer des indices sur un objet, puis distinguer des genres proches |
| 4. Trouver un documentaire | Single Choice Set « Dewey éclair », Drag and Drop « ranger le rayon » (5 dos de livres) | classer vite, puis appliquer la règle d'ordre des cotes (551.21 avant 551.5) |
| 5. Emprunter | Drag Text (ordre du prêt), Vrai/Faux | procédure |
| 6. Bilan et mission | Summary, Documentation Tool + page d'export | vérifier, puis produire dans le vrai CDI (relever des pastilles, choisir un livre) |

Tous les visuels sont dessinés par `draw.py` (plan simplifié, couvertures inventées, livre à
observer, tableau Dewey, étagère et dos de livres, couverture). Seules la carte mentale et les
3 affiches de genres viennent du professeur-documentaliste (`carte-mentale-cdi.jpg`,
`affiches-3-genres.jpg`, à déposer dans le dossier médias).

Les couleurs des pastilles ne sont écrites nulle part : elles dépendent du CDI, l'élève les relève
lui-même pendant la mission (étape 6).

## Reconstruire

```bash
python3 draw.py <dossier_polices_avec_Bebas.ttf> media/          # images + geo.json (positions des zones)
node build.mjs <repo_h5p-lumi> <gabarit-interactivebook-reporter_extrait> media/ out/ <gabarit-personalityquiz_extrait>
python3 ../vitrine-emi-2/pack2.py ../../templates/gabarit-interactivebook-reporter.h5p out/livre.json media/ out/ma-premiere-visite-au-cdi.h5p "Ma première visite au CDI" --slim
# Quiz en format Personality Quiz 1.0 (le lecteur hors ligne plante sur du 1.1) :
# remplacer content/content.json dans partage/decouvrir-le-cdi/quel-lecteur.h5p, qui embarque la bibliothèque 1.0
cp ../../../partage/decouvrir-le-cdi/quel-lecteur.h5p out/ && mkdir -p out/content && cp out/quel-lecteur.json out/content/content.json && (cd out && zip -q quel-lecteur.h5p content/content.json)
python3 ../../../scripts/audit-reponses.py out/ma-premiere-visite-au-cdi.h5p   # 0 biaisée
```

- Drag and Drop d'images : les tailles des éléments et des zones sont en **em** (1 em = 16 px du
  canevas `settings.size`), les positions en %. `geo.json` donne les zones calculées au dessin.
- Find the Hotspot : `backgroundImageSettings` reçoit directement l'image (groupe à un champ).
