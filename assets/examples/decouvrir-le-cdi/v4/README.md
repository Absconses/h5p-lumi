# Découvrir le CDI (v4, EMI 6e, 1 h)

Une heure d'exploration menée par l'élève seul, quelques jours après le cours dialogué. Le livre suit
l'enseignement explicite (« je découvre, je m'entraîne avec de l'aide, je fais seul ») sans l'imposer
partout. Il se termine par une tâche finale dans les rayons.

- **Repères :** ⭐ étape indispensable pour la mission, 🌿 chemin buissonnier (le circuit du livre, non noté), ⚡ défi bonus pour les rapides, 🆘 coup de pouce placé *sous* l'exercice, 🚶 aller-retour dans les rayons.
- **Cartes des genres** (« roadmaps » du professeur documentaliste, du niveau 1 au niveau 4) : un Image Slider à la fin de l'étape 6. L'élève s'y situe, puis y choisit le livre suivant pendant la mission.
- **Tâche finale « Mon parcours de lecteur » :** un Documentation Tool exportable en 6 pages (je me repère, je me situe, je creuse, je m'aventure, je conseille et j'emprunte, je repense à mon heure), avec 3 cartes missions (Boussole, Explorateur, Conseiller) et une grille de 3 critères.
- **Variété :** il ne reste que 5 Drag Text (contre 9 dans la v3). S'y ajoutent un Drag and Drop sur le schéma du livre, 2 textes à trous (production), une Mark the Words sur une nouvelle 4e de couverture et des QCM de couvertures dont les options changent (plus d'élimination possible).

## Reconstruire

Les médias sont ceux de la v3, plus `parties-livre-vierge.jpg` (le schéma, étiquettes effacées, avec une bande en bas) et les `roadmap-*.jpg`. Le gabarit est `gabarit-interactivebook`, auquel on ajoute `H5P.DocumentExportPage-1.5`, pris dans `gabarit-interactivebook-reporter`.

```bash
cat lib-head.mjs body.mjs > build.mjs
node build.mjs <gabarit_extrait> out/content.json media/              # version complète (fichier, Nuage)
NOMAPS=1 node build.mjs <gabarit_extrait> out/public.json media/     # version publique, sans les cartes (couvertures réelles)
python3 validate.py <gabarit_extrait> out/content.json      # seule alerte attendue : backgroundImage du hotspot (déjà présente en v3)
python3 pack.py <gabarit_extrait> out/content.json out/decouvrir-le-cdi-v4.h5p "Découvrir le CDI" media/
python3 ../../../../scripts/audit-reponses.py out/decouvrir-le-cdi-v4.h5p   # 0 biaisée
```

- `pack.py` ignore `H5P.DragQuestionDropzone 0.1` : c'est un nom de zone interne à DragQuestion, pas une bibliothèque. La déclarer ferait échouer l'installation sur Nuage.
- Image Slider : `imageSlides` est une liste à un seul champ, donc chaque élément **est** l'objet `H5P.ImageSlide`. Envelopper chaque élément dans `{ imageSlide: … }` fait planter le diaporama (« reading 'addClass' »).
