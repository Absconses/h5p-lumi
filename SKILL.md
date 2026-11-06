---
name: h5p-lumi
description: >-
  Génère du contenu pédagogique H5P prêt à importer dans Lumi : frises
  chronologiques (Timeline), quiz/QCM (MultiChoice, Question Set), cartes de
  révision, images interactives, visites virtuelles 360, contenus en onglets
  (Tabs), grilles à cocher (Grid Checker) et tout autre type du
  catalogue H5P. À partir
  d'un brief (sujet, public, objectif), ce skill part du fond (ce que l'élève
  doit comprendre et faire) pour choisir la forme, recherche de VRAIES images
  libres de droits (Wikimedia Commons), rédige un contenu adapté au public
  (programmes Eduscol par défaut), produit un JSON conforme au type de contenu,
  le VALIDE, puis assemble un fichier .h5p importable dans Lumi. Utilise ce
  skill dès qu'on te demande de créer une activité H5P, une frise interactive ou
  timeline, un quiz/QCM H5P, un exercice interactif, du contenu pour Lumi ou
  H5P, ou de générer un JSON H5P / un fichier .h5p — même si le mot « H5P »
  n'est pas prononcé mais que le contexte est clairement une activité
  interactive de ce genre.
---

# Génération de contenu H5P pour Lumi

Ce skill transforme un **brief pédagogique** en une **activité H5P fiable**, prête à
importer dans **Lumi**. Il code en dur un savoir-faire en 6 étapes : on **part du fond**
(ce que l'élève doit comprendre et faire) pour trouver une forme qui le sert, puis on ne
devine pas, on **vérifie** (images réelles, JSON valide, paquet conforme).

**Règle de fond : le contenu informe la forme.** La tentation d'une IA est la forme la plus
facile à générer (QCM, accordéon, texte + quiz). Elle n'est pas interdite, mais elle doit être
un choix justifié par le contenu, jamais un réflexe. À l'inverse, aucun habillage
(décor, bandeau, métaphore) n'est imposé : il n'existe que s'il porte du sens.

## Ce que tu produis (livrables)

1. Un `content.json` **valide** et conforme au type de contenu demandé.
2. (Si demandé / possible) un fichier **`.h5p` importable dans Lumi**.
3. Un court récapitulatif : type, sujet, public, sources des images + licences, et **une
   phrase par activité sur pourquoi cette forme** (le lien fond → forme).

## Workflow en 6 étapes

### Étape 0 — Partir du fond (obligatoire)

Avant de penser à un type H5P, lis `references/conception-fond-forme.md` et analyse le
contenu :
- ce que l'élève doit savoir **faire** à la fin (un verbe observable : situer, ordonner,
  distinguer, relier, repérer, justifier, produire…) ;
- la **nature du savoir** (chronologie, chaîne d'étapes, spatial, catégories, système en
  couches, confusions, analyse de document, décision, procédure, lexique…) ;
- **où les élèves se trompent** vraiment ;
- la **situation ou l'image** que le contenu porte déjà (un lieu, un trajet, une coupe, une
  enquête…), s'il en porte une. Sinon, n'en invente pas.

Puis déduis les formes qui font faire ce verbe (tableau de la fiche). **Si la demande ne
fixe pas le type**, présente à l'utilisateur 2 ou 3 pistes contrastées (dont au moins une
qui n'est pas un questionnaire), chacune en quelques lignes : la forme, ce que l'élève y
fait, la contrainte (notée ou non, Nuage ou lien). Recommande-en une, puis construis.
**Si l'utilisateur impose un type**, respecte-le et applique l'analyse à l'intérieur (ce que
chaque question teste, distracteurs, feedbacks).

### Étape 1 — Cadrer le brief

Identifie (et complète si besoin avec l'utilisateur) :
- **Sujet**, **objectif pédagogique** (le verbe de l'étape 0) et **public** (niveau scolaire
  / adultes) → détermine ton, vocabulaire, difficulté.
- **Usage** : autonomie ou classe, durée, besoin de suivre les résultats (Lumi Nuage +
  types notés) ou simple lien.
- **Contraintes** (nombre d'éléments, références au programme…).

Si le public ou l'usage manque et que ça change le résultat, **demande** avant de produire.

### Étape 2 — Choisir le type et lire sa fiche

Le type découle de l'étape 0. Avant de générer, passe le **contrôle anti-moindre-effort** de
`references/conception-fond-forme.md` (§4) : le verbe est-il servi ? ai-je pris ce type parce
qu'il est facile ? l'habillage porte-t-il du sens ? Puis lis la fiche de référence
correspondante (structure exacte + exemple) :

| Besoin | Type(s) H5P | Fiche à lire |
|---|---|---|
| Frise chronologique / timeline | `H5P.Timeline` | `references/timeline.md` |
| QCM (1 question) | `H5P.MultiChoice` | `references/question-multichoice.md` |
| Quiz multi-questions | `H5P.QuestionSet` | `references/question-multichoice.md` |
| Vrai/Faux · Choix unique · Texte à trous · Marquer les mots · Glisser les mots · Summary | `H5P.TrueFalse`, `SingleChoiceSet`, `Blanks`, `MarkTheWords`, `DragText`, `Summary` | `references/quiz-family.md` |
| Accordéon · Dialog Cards · Flashcards | `H5P.Accordion`, `Dialogcards`, `Flashcards` | `references/text-cards.md` |
| Mots croisés · Mots mêlés | `H5P.Crossword`, `FindTheWords` | `references/word-games.md` |
| Rédaction · Ordre · Questionnaire · Graphique · Mur d'infos · Trous avancés · Quiz de perso · Arithmétique | `H5P.Essay`, `SortParagraphs`, `Questionnaire`, `Chart`, `InfoWall`, `AdvancedBlanks`, `PersonalityQuiz`, `ArithmeticQuiz` | `references/tier2-text.md` |
| **Séquence complète** : Page (empile des activités) · Interactive Book (chapitres) | `H5P.Column`, `H5P.InteractiveBook` | `references/composites.md` |
| **Parcours / carte de jeu** : étapes reliées sur une carte, chacune avec un exercice | `H5P.GameMap` | `references/gamemap.md` |
| **Sur image** : Image Hotspots · Find the Hotspot · Memory Game · Collage · Agamotto · Image Slider · Multimedia Choice · Drag and Drop · Guess the Answer | voir fiche | `references/image-activities.md` |
| **Présentation 3D « Prezi »** : vues placées dans l'espace, zoom/rotation de l'une à l'autre (Impressive Presentation, ALPHA) | `H5P.ImpressPresentation` | `references/impress-presentation.md` |
| **Type refusé dans un livre/une page** (Crossword, Flashcards, Sort Paragraphs, Personality Quiz, Image Sequencing…) : l'intégrer par un cadre | `H5P.IFrameEmbed` | `references/iframe-modules.md` |
| **Médias & outils** : Iframe Embedder · Audio Recorder · Documentation Tool · Interactive Video · Course Presentation | voir fiche | `references/media-and-tools.md` |
| **Onglets** : une page par onglet (texte, médias, exercices notés), consultables dans n'importe quel ordre | `H5P.Tabs` | `references/tabs.md` |
| **Grille à cocher** : tableau lignes × colonnes, cases corrigées en couleur (non noté, hors Book) | `H5P.GridChecker` | `references/grid-checker.md` |
| **Visite virtuelle 360** : photos 360° reliées, points d'intérêt (texte, image, quiz) | `H5P.ThreeImage` | `references/virtual-tour.md` |
| **Quiz sur carte** : « Où se trouve… ? », clic sur une carte (villes notées à la distance, pays) | `H5P.GeoQuiz` | `references/geoquiz.md` |
| **Tout autre type** (Dictation, Branching Scenario…) | variable | `references/extending-new-types.md` |

Le catalogue Lumi est vaste : **n'importe quel type** se traite via la méthode décrite dans
`references/extending-new-types.md` (lecture du `semantics.json` contenu dans le gabarit).
Tu n'es donc jamais bloqué par un type « non prévu ».

### Étape 3 — Rechercher et valider les médias

Pourquoi : une URL inventée = une image cassée dans la frise. On part donc toujours de
sources **réelles et libres**.

```powershell
.\scripts\Find-WikimediaImages.ps1 -Query "Tim Berners-Lee","ARPANET logical map" -Validate
```

- Donne des termes de recherche en **anglais** (Commons est surtout indexé en anglais).
- `-Validate` ne garde que les images répondant **HTTP 200**.
- Récupère pour chaque média retenu : l'**URL directe**, la **licence** et l'**auteur** →
  ils alimentent les champs `caption` / `credit`. Préfère **domaine public / CC**.

### Étape 4 — Rédiger le contenu pédagogique

- **Adaptation au public** : ajuste ton, vocabulaire et difficulté au niveau indiqué
  (un texte pour des 6ᵉ n'est pas un texte pour des BTS). Sois engageant, concret, imagé.
- **Conformité** : aligne-toi sur les **référentiels officiels en vigueur** — par défaut les
  programmes **Eduscol** pour le scolaire français, les textes de la formation
  professionnelle pour les adultes. Adapte si l'utilisateur précise un autre cadre.
- **Feedback constructif** : consignes et remarques encourageantes, tournées vers
  l'apprentissage (surtout dans les quiz : explique *pourquoi* une réponse est fausse).
- **Pas d'indice involontaire (« tell »)** : dans les questions à choix, toutes les réponses
  doivent se ressembler (style ET longueur comparables). NE mets JAMAIS de gras/italique — ni
  une formulation plus longue/précise — uniquement sur la **bonne** réponse : ce serait trop
  évident. Le gras va dans la **consigne**, les **feedbacks** et les **textes explicatifs**
  (frises, cartes), jamais dans une option « gagnante ».
  **Biais n° 1 constaté par l'utilisateur sur tous les premiers modules : la bonne réponse était
  presque toujours la plus longue et la plus « construite »** (nuance, justification « : … »,
  parenthèse d'exemples). Remèdes : la justification va dans le **feedback**, pas dans l'option ;
  les distracteurs reçoivent la même construction (« X, car … » faux mais plausible) ; la bonne
  réponse est parfois la plus **courte**. Contrôle obligatoire avant livraison :
  `python3 scripts/audit-reponses.py <paquet.h5p>` → 0 ligne `LONGUE`.
- **Langue** : rédige dans la langue cible (français par défaut).
- **LaTeX** : formules encapsulées par `\\( ... \\)` exclusivement, jamais de `$` seul.
- **Crédits** : pour chaque média, une `caption` (légende pédagogique) ET un `credit`
  (auteur + source + licence), à partir des données récupérées à l'étape 3.

### Étape 5 — Générer, valider, empaqueter

1. **Écris** le `content.json` selon la fiche du type (Write, en UTF-8).
2. **Valide** :
   ```powershell
   .\scripts\Test-H5PJson.ps1 -Path .\content.json -Type timeline -MinEvents 5 -MinEras 2
   ```
   (`-Type` : `timeline`, `multichoice`, `questionset`, `truefalse`, `singlechoiceset`, `blanks`, `markthewords`, `dragtext`, `summary`, `accordion`, `dialogcards`, `flashcards`, `crossword`, `findthewords`, `essay`, `sortparagraphs`, `questionnaire`, `chart`, `impress`, ou `generic`.) Corrige jusqu'à obtenir « VALIDE ».
3. **Empaquette** le `.h5p` (si demandé) — voir `references/lumi-packaging.md` :
   ```powershell
   .\scripts\Build-H5PPackage.ps1 -Template .\assets\templates\gabarit-timeline.h5p `
       -Content .\content.json -OutputPath "C:\...\mon-activite.h5p" -Title "…"
   ```
   L'empaquetage exige un **gabarit** (`.h5p` du même type exporté une fois depuis Lumi).
   Si aucun gabarit n'est disponible, livre le `content.json` validé et explique à
   l'utilisateur comment exporter un gabarit (procédure dans `references/lumi-packaging.md`).

## Environnement Windows / PowerShell

- Le shell est **Windows PowerShell 5.1**. Il lit les fichiers `.ps1` **sans BOM** comme de
  l'ANSI : tout script contenant des accents/emojis doit être enregistré en **UTF-8 AVEC
  BOM**, sinon il plante à l'analyse. Si tu crées un nouveau script `.ps1`, convertis-le :
  ```powershell
  $p="script.ps1"; [IO.File]::WriteAllText($p,[IO.File]::ReadAllText($p),(New-Object Text.UTF8Encoding($true)))
  ```
- Les fichiers `content.json` / `h5p.json` restent en UTF-8 **sans** BOM (exigence H5P) ;
  les scripts fournis s'en chargent déjà.

## Garde-fous

- Ne jamais choisir un type avant d'avoir fait l'étape 0. Une majorité de QCM / Vrai-Faux
  doit être justifiée par le contenu (confusions à démêler, diagnostic rapide).
- Ne jamais inventer d'URL d'image : toujours passer par `Find-WikimediaImages.ps1` + `-Validate`.
- Toujours valider le JSON avant d'empaqueter.
- Signaler honnêtement toute approximation (date incertaine, image illustrative non
  contemporaine, etc.) dans le récapitulatif.
- Respecter le format strict des dates des frises (`YYYY` ou `YYYY,MM,DD`).

## Fichiers du skill

- `scripts/Find-WikimediaImages.ps1` — recherche + validation d'images libres (Wikimedia).
- `scripts/Test-H5PJson.ps1` — validation syntaxe + règles par type.
- `scripts/Build-H5PPackage.ps1` — assemblage du `.h5p` à partir d'un gabarit (option `-Media` pour images/sons embarqués).
- `scripts/New-H5PShareLink.ps1` — lien cliquable vers **h5p-offline-player** pour un `.h5p` rangé dans `partage/` (dépôt public) : `-Path partage\x.h5p [-Test]`. Voir `references/partage-offline-player.md`.
- `scripts/Graft-H5PLibraries.ps1` — greffe une bibliothèque (+ ses dépendances) d'un gabarit riche (ex. `gabarit-column.h5p`) vers un gabarit pauvre. Sert à enrichir une **Game Map** (ou une Page/un Book) avec de nouveaux types d'exercices : `-Target … -Source … -Libraries "H5P.MultiChoice-1.16",… -OutputPath …`. Reconstruit `preloadedDependencies` proprement (aucune entrée vide).
- `references/conception-fond-forme.md` — **à lire en premier** : interroger le contenu, nature du savoir → formes qui la servent, proposer des pistes, contrôle anti-moindre-effort. Grille de réflexion, pas gabarit.
- `references/timeline.md` — structure + exemple de frise.
- `references/question-multichoice.md` — QCM (MultiChoice) + squelette du Quiz (QuestionSet).
- `references/quiz-family.md` — Vrai/Faux, Choix unique, Texte à trous, Marquer/Glisser les mots, Summary.
- `references/text-cards.md` — Accordéon, Dialog Cards, Flashcards.
- `references/word-games.md` — Mots croisés, Mots mêlés.
- `references/tier2-text.md` — Rédaction (Essay), Remettre dans l'ordre, Questionnaire, Graphique.
- `references/composites.md` — Page (Column) & Interactive Book : assembler une séquence complète.
- `references/gamemap.md` — Carte de jeu (Game Map) : parcours d'étapes ; pièges telemetry (x/y en premier) & fond empaqueté.
- `references/image-activities.md` — activités sur image (Image Hotspots, Memory Game, Agamotto, Collage, Multimedia Choice…).
- `references/impress-presentation.md` — Présentation 3D (Impressive Presentation) : caméras + panneaux, zoom par la profondeur, `route` ; bibliothèque hors Hub, fournie par `gabarit-impresspresentation.h5p`.
- `references/media-and-tools.md` — Iframe, Audio Recorder, Documentation Tool, Interactive Video, Course Presentation.
- `references/tabs.md` — Onglets (Tabs 1.1) : chaque onglet = Column **1.16** dont le titre fait le libellé ; gabarit `gabarit-tabs.h5p`, fabriques `assets/lib/tabs.mjs`, exemple `assets/examples/enquete-source/`. Absent de Digiquiz et du Hub officiel.
- `references/grid-checker.md` — Grille à cocher (GridChecker 1.0) : radio, cases ou texte par ligne ; **aucun score ni xAPI** (rien dans Lumi Nuage), **pas dans un Book** ; gabarit `gabarit-gridchecker.h5p`, fabrique `assets/lib/grid-checker.mjs`, exemple `assets/examples/licences-cc/`, cas d'usage prof doc. Absent de Digiquiz et du Hub officiel.
- `references/geoquiz.md` — Geography Quiz (quiz sur carte) : lib d'origine cassée dans Lumi (carte à 0 px), utiliser `gabarit-geoquiz.h5p` patché ; fabriques `assets/lib/geoquiz.mjs`.
- `references/iframe-modules.md` — intégrer un type refusé par la Column via Iframe Embedder : ratio (pas de taille), `minWidth` 280, aucun score remonté, source offline player par défaut ; `scripts/Get-LumiRun.py` récupère un module Nuage publié, `scripts/Slim-H5PImages.py` allège les images.
- `references/partage-offline-player.md` — diffuser un `.h5p` par un simple lien (h5p-offline-player + GitHub) : quand le proposer plutôt que Nuage, limites (aucun résultat prof, 25/100 Mo, bouton « Open with its own scripts » pour les types hors catalogue).
- `references/extending-new-types.md` — méthode universelle pour tout autre type.
- `references/lumi-packaging.md` — format `.h5p`, gabarits, import dans Lumi.
- `assets/lib/impress-factories.mjs` — fabriques Node pour Impressive Presentation (`station`, `textView`, `depth`, `layouts`, `overview`, `validate`).
- `assets/examples/impresspresentation-exemple.content.json` — content.json de l'exemple officiel (référence de structure).
- `assets/examples/vitrine-emi/` — livre **vitrine** « S'informer, vérifier, publier » (EMI, cycle 4) :
  18 chapitres, **un type H5P différent par chapitre** (dont Interactive Video fabriquée, Agamotto,
  Branching Scenario, Documentation Tool avec export Word, Timeline, Dialog Cards), chacun précédé
  d'une *fiche technique* pour l'adulte (type, apport, noté ou non). Modèle à reprendre pour
  présenter le skill à une direction ou en formation.
- `assets/examples/vitrine-emi-2/` — **tome 2** de la vitrine (22 chapitres, les 28 autres types
  fiables : Image Juxtaposition, Multimedia Choice, Collage, Image Pairing, Image Slider, Image Hotspots,
  Find the Hotspot, Dictation, Audio Recorder, Speak the Words, Questionnaire, Guess the Answer, Chart,
  Arithmetic Quiz, Advanced Blanks, Memory Game, Flashcards, Find the Words, Information Wall, KewAr Code,
  Game Map, Cornell Notes, Structure Strip, Essay, Question Set…) ; `defaults.mjs` génère les paramètres
  français d'un type depuis `semantics.json` + `language/fr.json`.
- `assets/templates/` — y déposer les gabarits `.h5p` exportés de Lumi.
