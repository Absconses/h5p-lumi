---
name: h5p-lumi
description: >-
  Génère du contenu pédagogique H5P prêt à importer dans Lumi : frises
  chronologiques (Timeline), quiz/QCM (MultiChoice, Question Set), cartes de
  révision, images interactives et tout autre type du catalogue H5P. À partir
  d'un brief (sujet, public, objectif), ce skill recherche de VRAIES images
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
importer dans **Lumi**. Il code en dur un savoir-faire en 5 étapes : on ne devine pas, on
**vérifie** (images réelles, JSON valide, paquet conforme) — c'est ce qui distingue un
contenu utilisable d'un copier-coller qui casse à l'import.

## Ce que tu produis (livrables)

1. Un `content.json` **valide** et conforme au type de contenu demandé.
2. (Si demandé / possible) un fichier **`.h5p` importable dans Lumi**.
3. Un court récapitulatif : type, sujet, public, sources des images + licences.

## Workflow en 5 étapes

### Étape 1 — Cadrer le brief

Identifie (et complète si besoin avec l'utilisateur) :
- **Type d'activité** H5P (frise ? QCM ? autre ?).
- **Sujet** et **objectif pédagogique**.
- **Public** (niveau scolaire / adultes) → détermine ton, vocabulaire, difficulté.
- **Contraintes** (nombre d'éléments, durée, références au programme…).

Si le type ou le public manque et que ça change le résultat, **demande** avant de produire.

### Étape 2 — Choisir le type et lire sa fiche

Lis la fiche de référence correspondante (structure exacte + exemple) :

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
| **Sur image** : Image Hotspots · Find the Hotspot · Memory Game · Collage · Agamotto · Image Slider · Multimedia Choice · Drag and Drop · Guess the Answer | voir fiche | `references/image-activities.md` |
| **Médias & outils** : Iframe Embedder · Audio Recorder · Documentation Tool · Interactive Video · Course Presentation | voir fiche | `references/media-and-tools.md` |
| **Tout autre type** (Dictation, Branching Scenario, Virtual Tour 360…) | variable | `references/extending-new-types.md` |

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
   (`-Type` : `timeline`, `multichoice`, `questionset`, `truefalse`, `singlechoiceset`, `blanks`, `markthewords`, `dragtext`, `summary`, `accordion`, `dialogcards`, `flashcards`, `crossword`, `findthewords`, `essay`, `sortparagraphs`, `questionnaire`, `chart`, ou `generic`.) Corrige jusqu'à obtenir « VALIDE ».
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

- Ne jamais inventer d'URL d'image : toujours passer par `Find-WikimediaImages.ps1` + `-Validate`.
- Toujours valider le JSON avant d'empaqueter.
- Signaler honnêtement toute approximation (date incertaine, image illustrative non
  contemporaine, etc.) dans le récapitulatif.
- Respecter le format strict des dates des frises (`YYYY` ou `YYYY,MM,DD`).

## Fichiers du skill

- `scripts/Find-WikimediaImages.ps1` — recherche + validation d'images libres (Wikimedia).
- `scripts/Test-H5PJson.ps1` — validation syntaxe + règles par type.
- `scripts/Build-H5PPackage.ps1` — assemblage du `.h5p` à partir d'un gabarit (option `-Media` pour images/sons embarqués).
- `scripts/Graft-H5PLibraries.ps1` — greffe une bibliothèque (+ ses dépendances) d'un gabarit riche (ex. `gabarit-column.h5p`) vers un gabarit pauvre. Sert à enrichir une **Game Map** (ou une Page/un Book) avec de nouveaux types d'exercices : `-Target … -Source … -Libraries "H5P.MultiChoice-1.16",… -OutputPath …`. Reconstruit `preloadedDependencies` proprement (aucune entrée vide).
- `references/timeline.md` — structure + exemple de frise.
- `references/question-multichoice.md` — QCM (MultiChoice) + squelette du Quiz (QuestionSet).
- `references/quiz-family.md` — Vrai/Faux, Choix unique, Texte à trous, Marquer/Glisser les mots, Summary.
- `references/text-cards.md` — Accordéon, Dialog Cards, Flashcards.
- `references/word-games.md` — Mots croisés, Mots mêlés.
- `references/tier2-text.md` — Rédaction (Essay), Remettre dans l'ordre, Questionnaire, Graphique.
- `references/composites.md` — Page (Column) & Interactive Book : assembler une séquence complète.
- `references/image-activities.md` — activités sur image (Image Hotspots, Memory Game, Agamotto, Collage, Multimedia Choice…).
- `references/media-and-tools.md` — Iframe, Audio Recorder, Documentation Tool, Interactive Video, Course Presentation.
- `references/extending-new-types.md` — méthode universelle pour tout autre type.
- `references/lumi-packaging.md` — format `.h5p`, gabarits, import dans Lumi.
- `assets/templates/` — y déposer les gabarits `.h5p` exportés de Lumi.
