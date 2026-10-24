# Dans les coulisses de l'info et des images (Virtual Tour 360, EMI collège)

- `build.mjs` : génère `content.json` avec `assets/lib/virtual-tour.mjs` du skill h5p-lumi
  (`node build.mjs <repo>/assets/lib/virtual-tour.mjs content.json`).
- `validate.py <gabarit_extrait> content.json` : contrôle contre les semantics.json.
- `pack.py <gabarit.h5p> content.json media <sortie.h5p> "<titre>" [--slim]`.
- `media/` : panoramas 3840×1920 + images. Pour la version Digiquiz, panoramas réduits
  à 2560×1280 et `--slim` (3,3 Mo).

Crédits : bibliothèque de Murcie (GALoPaX, CC BY-SA 4.0), plateau TV et studio photo
(Sergej Majboroda via Poly Haven, CC0), photo retouchée de 1937 (domaine public),
loupe et journal (Anatoly777, Pixabay). Tous via Wikimedia Commons sauf Pixabay.
