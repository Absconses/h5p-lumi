# Référence — Partir du fond pour trouver la forme

> « C'est toujours le fond qui informe la forme. »

Cette fiche sert l'**Étape 0** du workflow (voir `SKILL.md`). Ce n'est **pas un gabarit** :
aucune structure de page n'est imposée, aucun habillage n'est systématique. C'est une façon
de réfléchir avant de choisir un type H5P, pour ne pas tomber par défaut sur la forme la plus
facile à générer (QCM, accordéon, texte + quiz).

Le QCM n'est pas l'ennemi : il est excellent pour faire **distinguer** des notions proches,
vérifier vite un rappel, ou diagnostiquer une erreur fréquente (avec des distracteurs tirés
des vraies erreurs d'élèves, voir `question-multichoice.md`). Il devient paresseux quand on
le choisit parce qu'il est simple à produire, alors que le savoir demande de *situer*,
*ordonner*, *relier*, *explorer* ou *produire*.

---

## 1. Interroger le contenu (avant tout type)

Réponds pour toi, en quelques mots, à ces questions. Toutes n'ont pas une réponse
intéressante ; celles qui en ont une guident la forme.

1. **Que doit savoir FAIRE l'élève à la fin ?** Un verbe observable : situer, ordonner,
   distinguer, relier une cause à sa conséquence, repérer dans un document, justifier,
   produire, choisir… « Connaître » ou « comprendre » ne suffit pas : précise.
2. **Quelle est la nature du savoir ?** Chronologique, spatial, une chaîne d'étapes, des
   catégories, un contraste, un système à plusieurs couches, une procédure, du lexique, une
   méthode d'analyse, un débat, un savoir sur soi… (tableau §2).
3. **Où les élèves se trompent-ils vraiment ?** La confusion typique est souvent le cœur de
   l'activité (deux notions voisines, une étape oubliée, une idée reçue).
4. **Le contenu porte-t-il déjà une image ou une situation ?** Un lieu que l'on visite, un
   objet dont on suit la vie, une enquête, une coupe, un iceberg, une carte, un trajet. Si
   oui, elle peut devenir la mise en scène, *et l'ensemble doit se lire comme une vue
   d'ensemble qui a du sens* (la carte de la « ville du livre », la coupe d'Internet de
   l'espace au fond de l'océan). Si non, **n'en invente pas** : un décor plaqué devient
   kitsch. Une mise en page sobre est un choix légitime.
5. **Quel usage ?** Autonomie ou classe, durée, besoin de suivre les résultats
   (→ Lumi Nuage + types notés) ou simple lien (offline player). Ces contraintes éliminent
   des formes ; elles ne doivent pas être le point de départ.

---

## 2. Nature du savoir → formes qui la servent

Pistes, pas recettes. Chaque ligne dit ce que la forme fait *faire* à l'élève.

| Nature du savoir | Ce que l'élève doit faire | Formes qui le servent | Exemples déjà réalisés |
|---|---|---|---|
| **Chronologie, évolution** | situer dans le temps, voir une transformation | `Timeline` (consulter) ; `SortParagraphs` / `ImageSequencing` (remettre dans l'ordre) ; Impress dont le chemin suit le temps ; `Agamotto` / `ImageJuxtaposition` (avant/après) | L'évolution des médias (Impress) |
| **Chaîne, processus, trajet** | suivre des étapes reliées, savoir qui fait quoi à quel moment | Impress sur une **carte-chemin** (chaque étape = un lieu, la vue d'ensemble = le trajet entier) ; `GameMap` ; `ImageSequencing` ; `DragQuestion` sur un schéma | La vie d'un livre (ville du livre), Le voyage d'une infox |
| **Spatial, géographique** | localiser, s'orienter | `GeoQuiz` (cliquer où se trouve…) ; `ImageHotspots` sur un plan ; `ImageHotspotQuestion` (trouver la zone) ; `VirtualTour` pour un lieu réel | GeoQuiz Europe, Découvrir le CDI (plan) |
| **Un lieu, un milieu professionnel** | explorer, repérer qui/quoi est où | `VirtualTour` 360 avec points d'intérêt et questions sur place ; `ImageHotspots` | Métiers de la télé, Visite des coulisses |
| **Système en couches, partie cachée** | voir ce qui est visible / invisible, descendre d'un niveau | Impress avec **un décor unique** (iceberg, coupe) et une caméra qui descend ; `ImageHotspots` sur un schéma | Qu'est-ce qu'Internet ? (coupe), iceberg de l'identité numérique |
| **Catégories, classement** | trier, ranger dans la bonne case | `DragQuestion` (zones de dépôt) ; `DragText` ; Grid Checker si non noté (voir `iframe-modules.md`) ; `InfoWall` filtrable pour consulter | genres au CDI, « qui voit quoi » (Grid Checker) |
| **Notions proches, confusions** | distinguer, éviter le piège | **QCM / `SingleChoiceSet` avec distracteurs-pièges** et feedback qui explique ; `MarkTheWords` ; `Summary` | homophones (Français 4e), fantasy / fantastique / SF (CDI) |
| **Analyse de document** | repérer des indices dans une source | `MarkTheWords` sur le texte ; `ImageHotspots` / `ImageHotspotQuestion` sur l'image ; enquête en `Tabs` ou en chapitres de Book | Enquête sur une source (aigle) |
| **Enquête, résolution** | rassembler des indices, conclure | `Tabs` (pièces du dossier consultables dans le désordre) ; `BranchingScenario` ; Book par étapes, conclusion en `Essay` | Enquête sur une source |
| **Décision, dilemme, comportement** | choisir et voir les conséquences | `BranchingScenario` ; `SingleChoiceSet` en situation ; `PersonalityQuiz` pour un profil (non noté) | identité numérique (profil) |
| **Procédure, méthode** | appliquer des étapes dans l'ordre | `SortParagraphs` ; `DragText` ; `StructureStrip` / `DocumentationTool` pour produire en suivant le guide | retirer une photo (identité numérique) |
| **Lexique, mémorisation** | retrouver, réemployer | `Dialogcards` / `Flashcards` ; `Crossword` ; `Blanks` en contexte (le mot dans une phrase qui a du sens, pas isolé) | IA est-elle sexiste ? (cartes de vocabulaire) |
| **Données, proportions** | lire, comparer, interpréter | `Chart` puis question d'interprétation ; `DragQuestion` sur un graphique | — |
| **Opinion, débat, ressenti** | se positionner, argumenter | `Questionnaire` (sans bonne réponse) ; `Essay` ; `PersonalityQuiz` | — |
| **Production, création** | écrire, dire, fabriquer | `Essay`, `AudioRecorder`, `StructureStrip`, `DocumentationTool` | IA est-elle sexiste ? (fiche) |

Pour **assembler** plusieurs activités : `Interactive Book` pour un parcours autonome noté
(Nuage), `Course Presentation` pour une notion courte projetée ou un document à annoter
(voir `media-and-tools.md`), `Tabs` quand l'ordre de consultation est libre, `Column` pour une
page simple. Le conteneur se choisit aussi pour le sens : un Book linéaire raconte, des
onglets laissent explorer.

---

## 3. Proposer avant de construire

Quand la demande ne fixe pas le type, présente à l'utilisateur **2 ou 3 pistes contrastées**
avant de produire, en quelques lignes chacune :

- l'idée de forme (et la mise en scène si le contenu en porte une),
- ce que l'élève y **fait**, rattaché au verbe visé,
- la contrainte qu'elle implique (notée ou non, Nuage / lien, nestable dans un Book…).

Au moins une piste ne doit pas être un questionnaire. Recommande-en une et dis pourquoi.
Si l'utilisateur impose un type (« fais-moi un QCM »), respecte-le : la réflexion porte alors
sur l'intérieur (ce que chaque question teste, distracteurs, feedbacks, ordre).

---

## 4. Contrôle anti-moindre-effort (juste avant de générer)

Relis ton plan avec ces questions. Une réponse gênante = revoir la forme, pas la cacher.

- **Le verbe est-il servi ?** Chaque activité fait-elle *faire* à l'élève ce qui est visé ?
  Un QCM fait *reconnaître* ; il ne fait ni ordonner, ni situer, ni produire.
- **Ai-je choisi ce type parce qu'il est facile à générer ?** Si plus de la moitié des
  activités sont des QCM / Vrai-Faux / choix unique, justifie-le par le contenu (confusions à
  démêler, diagnostic rapide) ou change.
- **L'habillage porte-t-il du sens ?** Si on enlève le décor (carte, iceberg, bandeau,
  ambiance) et que rien ne change pour l'élève, c'est de la décoration : retire-la ou rends-la
  signifiante (la position sur la carte *est* l'étape, la profondeur *est* le niveau caché).
- **La variété est-elle un but ?** Un échantillon de 8 types différents n'est pas une
  séquence. Mieux vaut deux formes bien choisies qu'un catalogue.
- **Les contraintes sont-elles respectées ?** Besoin de notes → types notés, dans un Book,
  sur Nuage. Types exotiques en cadre (Impress, Grid Checker, GeoQuiz, Personality Quiz…)
  seulement si le contenu les appelle **et** si l'activité n'a pas besoin d'être notée
  (`iframe-modules.md`).
- **La vue d'ensemble a-t-elle un sens ?** Pour un parcours (Impress, Game Map, Book), les
  étapes forment-elles un tout que l'élève peut saisir, ou une suite de diapos sans lien ?

Dans le récapitulatif final, une phrase par activité suffit pour dire **pourquoi cette
forme** (le lien fond → forme). C'est ce qui permet à l'enseignant de juger le choix.
