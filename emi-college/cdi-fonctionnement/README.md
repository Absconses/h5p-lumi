# EMI 6e — Espace n°1 : le CDI (« Le CDI : comment ça marche ? »)

**Fichier à importer dans Lumi :** `cdi-comment-ca-marche.h5p` (Livre interactif, ~6,5 Mo).

- **Public :** 6e (cycle 3), séance 2 (1 h), en **réinvestissement** de la séance 1 (cours dialogué, sans H5P).
- **Règle d'or respectée :** on ne parle que du CDI, sans le comparer aux autres espaces.

## Déroulé (matrice en 4 étapes)

| Chapitre | Question | Activités | Durée |
|---|---|---|---|
| 1. Genèse | Qui a inventé le CDI, et pourquoi ? | QCM sigle · texte à trous (Marcel Sire 1958, années 1970, professeur documentaliste, CAPES 1989) · 2 vrai/faux | ~6-8 min |
| 2. Mécanique | Qui choisit ce que je trouve, comment je le retrouve ? | QCM politique documentaire · Dewey (portrait + glisser les 5 classes) · QCM cote « R BRI » · QCM catalogue · vrai/faux rangement | ~8 min |
| 3. Économie | Qui paie ? | QCM gratuité · QCM financement public · texte à trous · vrai/faux « un livre perdu » | ~6 min |
| 4. Praxis | Comment je me sers du CDI sans me tromper ? | **Fiche de recherche exportable** (Outil de documentation, 5 pages + export) : sujet et mots-clés → catalogue, classe Dewey, cote → vérifier auteur/éditeur/année → 2 notes avec la page → bilan | ~20-25 min |

Tous les feedbacks **réexpliquent** la notion (principe de la récupération en mémoire). Les options des QCM ont
une longueur et un style comparables : aucune mise en gras sur la bonne réponse.

## À vérifier / adapter avant la séance

- **Sujets de la Praxis** (requins, pyramides, volcans, planètes, JO) : vérifie que ton fonds contient au moins
  un documentaire sur chacun. Sinon, change la liste `SUJETS` dans `build/build.mjs`.
- **Exemple de cote** « 597.3 REQ » et l'expression « catalogue du CDI » : adapte-les à ton logiciel (e-sidoc, BCDI, PMB…).
- **Rangement** : le vrai/faux sur le rangement accepte les deux usages, « à sa cote » ou « chariot / bac de retour ».
- **Dates de la Genèse** : Marcel Sire, lycée Janson-de-Sailly, 1958 ; nom « CDI » dans les années 1970 (date
  volontairement non précisée) ; CAPES de documentation en 1989. Ces dates correspondent à ce que l'on enseigne
  habituellement en séance 1, mais relis-les par rapport à ton propre cours.
- **Financement** : le chapitre dit « l'établissement, avec de l'argent public (par exemple le Département pour
  les collèges) ». La formulation reste valable dans un établissement privé sous contrat.

## Image

`build/media/melvil-dewey.jpg` : *Melvil Dewey*, vers 1890, auteur inconnu. Wikimedia Commons
(`File:Melvil_Dewey.jpg`), **domaine public** (PD-old). L'image a été recadrée en bandeau 1200×600.

## Régénérer

```bash
cd emi-college/cdi-fonctionnement/build
node build.mjs
node ../../../scripts/build-h5p.mjs \
  --template ../../../assets/templates/gabarit-interactivebook-reporter.h5p \
  --content content.json --media media/melvil-dewey.jpg \
  --out ../cdi-comment-ca-marche.h5p --title "Le CDI : comment ça marche ?"
```

Sous Windows, fais de même avec `Build-H5PPackage.ps1 -Template …-reporter.h5p -Content content.json -Media media\melvil-dewey.jpg`.
Le gabarit **reporter** est obligatoire : il est le seul à embarquer `H5P.DocumentExportPage`, qui sert à exporter la fiche.

## Vérification faite

J'ai fait un rendu réel dans Chromium avec h5p-standalone 3.8.2. Les 4 chapitres s'affichent, chacun avec tous
ses modules, et le portrait se charge. La fiche va jusqu'à la page d'export (« Créer mon document ») et la
console ne montre aucune erreur JS. **Il reste à la confirmer dans Lumi.**
