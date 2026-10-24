# Onglets — `H5P.Tabs 1.1`

Un contenu **en onglets** : chaque onglet est une **Page (Column)** qui peut contenir du
texte, des images, de l'audio, de la vidéo **et des exercices notés**. L'élève passe d'un
onglet à l'autre librement ; un onglet terminé reçoit une coche, et le score total remonte
(xAPI `completed`) → utilisable dans **Lumi Nuage** pour suivre les résultats.

À utiliser quand le contenu se découpe en **parties de même niveau** qu'on peut consulter
dans n'importe quel ordre (critères, rubriques, étapes d'une méthode, documents d'un
dossier). Pour un parcours **linéaire** et long, préférer l'Interactive Book ; pour de
simples blocs de texte repliables, l'Accordéon.

- Gabarit : `assets/templates/gabarit-tabs.h5p` (Tabs 1.1.1 + Column 1.16 + éditeurs, et
  toutes les bibliothèques d'exercices de `gabarit-column.h5p`) → modifiable dans Lumi.
- Fabriques : `assets/lib/tabs.mjs` (`tab`, `tabs`) + les briques de `assets/lib/h5p-factories.mjs`.
- Module de démonstration : « Enquête sur une source » (EMI cycle 4, 6 onglets, 5 exercices),
  `assets/examples/enquete-source/`.

## Disponibilité (vérifiée le 2026-10-24)

| Plateforme | Tabs ? |
|---|---|
| **Hub H5P officiel** (`api.h5p.org`) | **Non** : Tabs n'est pas dans la liste du Hub (404). Le gabarit vient d'un export fourni par Pierre. |
| **Lumi Nuage** | Le fichier d'origine porte des versions récentes (Collage 0.3.30, Components 1.0, coreApi 1.28) qu'on ne trouve pas sur le Hub : signe qu'il vient de la plateforme en ligne. À confirmer à l'import. |
| **Digiquiz / La Digitale** | **Non** : pas de `H5P.Tabs` dans ses `libraries/`, et seulement Column 1.22 (Tabs exige 1.16). |
| **Lumi desktop** | Oui (gabarit importé avec ses bibliothèques). |

## Structure du `content.json`

```json
{
  "tabs": [
    { "library": "H5P.Column 1.16",
      "subContentId": "<uuid>",
      "metadata": { "contentType": "Column", "license": "U", "title": "2. Qui ?" },   // = LIBELLÉ DE L'ONGLET
      "params": { "content": [
        { "content": { "library": "H5P.AdvancedText 1.1", "params": { "text": "<p>…</p>" }, "subContentId": "<uuid>", "metadata": {…} },
          "useSeparator": "auto" },
        { "content": { "library": "H5P.MultiChoice 1.16", "params": {…}, … }, "useSeparator": "auto" }
      ] } }
  ],
  "behaviour": {
    "tabPlacement": "dynamic",            // "dynamic" (selon l'écran), "top", "left"
    "tabSpread": 70,                      // % de largeur occupé par la barre d'onglets (50-100)
    "colorBase": "#1a73d9",               // couleur des onglets
    "colorBackground": "rgba(255, 255, 255, 0)"
  },
  "l10n": { "tab": "onglet", "noContent": "Il n'y a aucun contenu à afficher." },
  "a11y": { "tabList": "Choisis un onglet." }
}
```

## Règles (vérifiées dans le code et par rendu)

1. **Chaque onglet est une `H5P.Column 1.16`**, pas 1.18 : c'est la seule version
   qu'accepte le `semantics.json` de Tabs 1.1. (La fabrique `chapter()` de
   `h5p-factories.mjs` produit du 1.18 : pour Tabs, utiliser `tab()` de `tabs.mjs`.)
2. **Libellé de l'onglet = `metadata.title` de la Column.** Sans titre → « Tab 1 ».
3. **Libellés courts** (≤ 12 caractères) ou `tabSpread: 100` : sinon ils sont tronqués
   (« 5. Pourqu… »). Six onglets courts tiennent sur une ligne à 1000 px.
4. **Types autorisés dans un onglet** = ceux de Column 1.16, aux versions du gabarit :
   AdvancedText, Image, Audio, Video, Link, IFrameEmbed, MultiChoice, TrueFalse, Blanks,
   DragText, MarkTheWords, DragQuestion, Essay, SingleChoiceSet, Summary, QuestionSet,
   Dialogcards, Accordion, Timeline, Chart, Collage, ImageHotspots, ImageHotspotQuestion,
   ImageSlider, MemoryGame, MultiMediaChoice, GuessTheAnswer, Questionnaire,
   DocumentationTool, AudioRecorder.
   **Indisponibles** (version du gabarit ≠ version exigée) : CoursePresentation,
   InteractiveVideo, Agamotto, Table.
5. Les fabriques de `h5p-factories.mjs` (`text`, `mc`, `tf`, `blanks`, `markWords`,
   `dragText`, `essay`, `dialogcards`, `questionSet`…) s'emploient telles quelles. Leurs
   boutons sont en anglais : traduire (voir la fonction `fr()` du module exemple).
6. **Score** : Tabs additionne les scores de tous les onglets ; il mémorise l'onglet actif
   et les onglets terminés (reprise où l'élève s'était arrêté).

## Empaqueter

```bash
node assets/examples/enquete-source/build.mjs content.json
python3 assets/examples/visite-coulisses-info/pack.py assets/templates/gabarit-tabs.h5p \
    content.json media/ sortie.h5p "Titre"            # complet, modifiable dans Lumi (~6,6 Mo)
# + --slim : seulement les bibliothèques utilisées (~1 Mo)
```

Sous Windows : `scripts/Build-H5PPackage.ps1 -Template assets/templates/gabarit-tabs.h5p …`.

Le paquet complet et le paquet `--slim` passent le `PackageValidator` de
`@lumieducation/h5p-server` (validateur de Lumi).
