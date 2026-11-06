# Le circuit d’un livre (Impressive Presentation, 6e)

Reprise de « La vie d’un livre » (24/10/2026) pour le livre « Découvrir le CDI » :
on suit « Le Secret du phare » de l’autrice à la boîte à livres, sur la carte de la ville du livre.
Ajout du 06/11/2026 : le rangement **selon la nature** du livre (étape « Les romans » : genre et
pastille ; nouvelle étape « Les documentaires » : sujet et Dewey). Le plan du CDI sur la carte
n’a pas changé : l’étape documentaires est posée le long des rayons, entre les deux rangées.

- `retitle.py <dossier des couvertures>` : dessine le fond « romans » (couvertures inventées du
  module CDI) et retitre les fonds déjà cuits (numéros d’étape décalés, « Les documentaires »).
- `node build.mjs` → `content.json` ; `python3 pack.py <gabarit_impress_extrait> content.json media out.h5p "Le circuit d’un livre" --slim`.
- Les photos (Pixabay) et la carte (`map.py`) sont dans `media/` des sources du projet
  (`h5p/sources/decouvrir-le-cdi-v3/circuit`), pas dans ce dépôt.

Dans le livre, la présentation passe par un cadre (Iframe Embedder, ratio 1000/650) vers le
lecteur hors ligne, avec `custom-css=embed-960.css`. Elle n’est donc pas notée : le chapitre
ajoute deux Drag Text notés (ordre du voyage, roman ou documentaire).
