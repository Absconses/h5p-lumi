# Que puis-je faire avec cette image ? (H5P.GridChecker)

Module de démonstration du type **Grille à cocher** (`H5P.GridChecker 1.0`), EMI cycle 4.
Sept licences (CC0 → © Tous droits réservés) × quatre usages (partager, modifier, vendre,
ne pas citer l'auteur) : l'élève coche tout ce qui est permis, puis vérifie.
Corrigé à l'écran uniquement : aucun score n'est envoyé à la plateforme.

```bash
node build.mjs /tmp/content.json
mkdir -p /tmp/media
python3 ../visite-coulisses-info/pack.py ../../templates/gabarit-gridchecker.h5p \
    /tmp/content.json /tmp/media licences-cc.h5p "Que puis-je faire avec cette image ?"
```

Fiche : `references/grid-checker.md`.
