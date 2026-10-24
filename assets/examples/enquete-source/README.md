# Enquête sur une source (H5P.Tabs)

Module de démonstration du type **Onglets** (`H5P.Tabs 1.1`), EMI cycle 4.
Une publication virale (fictive) est examinée onglet par onglet : l'info, Qui ?, Quand ?,
D'où ?, Pourquoi ?, Verdict. Chaque onglet = un court texte + un exercice noté
(Vrai/Faux, QCM, texte à trous) ; le score total remonte à la plateforme.

```bash
node build.mjs /tmp/content.json
mkdir -p /tmp/media
python3 ../visite-coulisses-info/pack.py ../../templates/gabarit-tabs.h5p \
    /tmp/content.json /tmp/media enquete-source.h5p "Enquête sur une source"   # + --slim
```

Fiche : `references/tabs.md`.
