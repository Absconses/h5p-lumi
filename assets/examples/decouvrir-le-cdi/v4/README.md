# Découvrir le CDI, comme Matilda (v4, EMI 6e, 1 h)

Une heure d'exploration menée par l'élève seul, quelques jours après le cours dialogué. Le livre suit
l'enseignement explicite (« je découvre, je m'entraîne avec de l'aide, je fais seul ») sans l'imposer
partout. Il se termine par une tâche finale dans les rayons.

- **Fil rouge :** Matilda (Roald Dahl) et Mme Phelps, résumées en quelques lignes par chapitre, sans extrait long ni couverture.
- **Repères :** ⭐ étape indispensable pour la mission, 🌿 chemin buissonnier (le circuit du livre, non noté), ⚡ défi bonus pour les rapides, 🆘 coup de pouce placé *sous* l'exercice, 🚶 aller-retour dans les rayons.
- **Tâche finale :** « Mon parcours de lecteur ». Je me repère, je creuse, je m'aventure, j'emprunte. Elle se fait sur la fiche papier `fiche-parcours.html` (PDF dans `partage/decouvrir-le-cdi/`), avec 3 cartes (Boussole, Explorateur, Mme Phelps) et une grille de 3 critères.
- **Variété :** il ne reste que 5 Drag Text (contre 9 dans la v3). S'y ajoutent un Drag and Drop sur le schéma du livre, 2 textes à trous (production), une Mark the Words sur une nouvelle 4e de couverture et des QCM de couvertures dont les options changent (plus d'élimination possible).

## Reconstruire

Les médias sont ceux de la v3, plus `parties-livre-vierge.jpg` : le schéma avec ses étiquettes effacées et une bande en bas.

```bash
cat lib-head.mjs body.mjs > build.mjs
node build.mjs <gabarit-interactivebook_extrait> out/content.json media/
python3 validate.py <gabarit_extrait> out/content.json      # seule alerte attendue : backgroundImage du hotspot (déjà présente en v3)
python3 pack.py <gabarit_extrait> out/content.json out/decouvrir-le-cdi-v4.h5p "Découvrir le CDI, comme Matilda" media/
python3 ../../../../scripts/audit-reponses.py out/decouvrir-le-cdi-v4.h5p   # 0 biaisée
```

Le `pack.py` ignore `H5P.DragQuestionDropzone 0.1` : c'est un nom de zone interne à DragQuestion, pas une bibliothèque. La déclarer ferait échouer l'installation sur Nuage.
