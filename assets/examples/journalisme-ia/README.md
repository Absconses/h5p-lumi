# Exemple : livre « Qui t'informe ? Le journalisme à l'ère de l'IA » (EMI, 4e-3e)

Interactive Book dont chaque chapitre **découpe la notion avec une Course Presentation courte**
(3 à 5 diapos), suivie d'une activité notée native. D'après la tribune de Fabrice Fries,
président de l'AFP (*Le Monde*, 2 juin 2026) : idées reformulées, citations courtes et créditées.

| Chapitre | Présentation (logique des diapos) | Activité notée |
|---|---|---|
| 1. Tu demandes, il répond | situation vécue → contenus « liquides » → hallucinations → Vrai/Faux dans la diapo | (dans la CP) |
| 2. La machine, premier lecteur | **trajet** en 5 étapes, frise en bas de chaque diapo (ce qui se perd apparaît barré) | Drag Text + 2 distracteurs |
| 3. Le dividende du menteur | histoire heure par heure → définition (deepfake ≠ dividende du menteur) | QCM à distracteurs-pièges |
| 4. Des tâches, pas des responsabilités | ce que fait l'IA → ce qui prend de la valeur → la règle | Drag and Drop : tâche / responsabilité |
| 5. Remonter à la source | copies successives → boucle de la « bouillie IA » → ce que le journalisme garantit | Mark the Words (dépêche inventée) + QCM |
| 6. Et toi ? | — | Essay (mots-clés) |

## Reconstruire

```bash
python3 graphics.py raw media     # recadrages Pixabay, frise trajet-1..5.png, boucle-slop.png
node build.mjs <gabarit_interactivebook_extrait> c.json
python3 ../visite-coulisses-info/validate.py <gabarit_extrait> c.json "H5P.InteractiveBook 1.11"
python3 ../visite-coulisses-info/pack.py assets/templates/gabarit-interactivebook.h5p c.json media sortie.h5p "Qui t’informe ? …"
node render.mjs <paquet_extrait> captures/r 1000   # une capture par chapitre et par diapo
```

`cp.mjs` : fabriques Course Presentation (`el`, `pic` qui calcule la hauteur depuis le ratio de
l'image, `txt`, `slide`, `cp`), Drag Text avec distracteurs, Mark the Words, Drag and Drop
(`sortInto` : étiquettes en haut, zones en bas, géométrie en em) et Essay, en français.
Sources complètes (images, captures) : dossier projet `h5p/sources/journalisme-ia/`.
