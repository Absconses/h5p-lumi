# Mission finale en scénario à embranchements (Branching Scenario à vidéos)

Méthode tirée de « Conseiller un ami », la mission finale de *Découvrir le CDI* v4
(`assets/examples/decouvrir-le-cdi/v4/scenario/`, paquet `partage/decouvrir-le-cdi/conseiller-un-ami-v2.h5p`).
La structure JSON du type est dans `references/composites.md` (section Branching Scenario) ; cette fiche
traite de la **conception** et du **pipeline vidéo**.

## Quand la proposer (et quand ne pas le faire)

Une mission en scénario sert la phase « je fais seul » de l'enseignement explicite : l'élève
**réinvestit** ce que le module a construit dans une situation proche du réel. Elle convient quand
le contenu est une **compétence de conduite** : conseiller, vérifier, réagir, enquêter, argumenter,
lire une situation de jeu. Elle ne convient pas à un contenu de connaissances pures (conjugaison,
repères chronologiques, carte) : là, la décision serait un QCM déguisé.

Règle de Pierre (Étape 0, `conception-fond-forme.md`) : ce n'est **jamais** un gabarit plaqué sur
chaque module. Le test : peut-on écrire une situation où un personnage **a besoin** de l'élève, avec
des choix qui sont des **comportements** plausibles (pas des définitions) ? Sinon, autre forme.

## Le modèle pédagogique (« Skills Practice: A Home Visit »)

1. **Fiche du personnage d'abord** (classe, demande, ce qu'il lit/sait, ce qu'on sait de lui). Les
   bons choix se déduisent de la fiche : l'élève apprend à **écouter avant d'agir**.
2. 2 ou 3 personnages, chacun portant **une facette différente** de la compétence
   (Sam = roman par les goûts, Lina = documentaire et cote, Noé = passer du manga au roman).
   Un **carrefour** permet de les aider dans l'ordre voulu, puis « J'ai aidé tout le monde ».
3. Chaque décision : une scène (le personnage parle), puis une question à **3 comportements courts**
   (verbe à l'infinitif, 3 à 6 mots) + « Revoir la scène ».
4. **Mauvais choix bloqué** : écran « Mauvaise piste » = pourquoi + une question réflexive, puis
   **retour au même choix** (on n'avance pas sur une erreur). Bon choix : écran « Bonne piste » = pourquoi,
   puis scène suivante. Pas de fin ratée : la mission se termine quand tout le monde est aidé.
5. Distracteurs = erreurs réelles d'élèves, **même longueur** que la bonne piste ; varier la plus
   longue. `scripts/audit-reponses.py` audite aussi les Branching Scenario de ce modèle : 0 ligne LONGUE.
6. Volume repère : 3 personnages × 5 décisions ≈ 45 nœuds, 15 à 20 min.

## Construire le graphe

`scenario.mjs` donne des helpers à copier : `T` (texte), `I` (image), `S` (scène : image ou vidéo selon
`VIDEOS=1`), `Q` (question), `D(k, scène, alt, question, choix)` (scène + décision au modèle ci-dessus).
Les nœuds sont **nommés** ; les index sont calculés à la fin, avec un contrôle des cibles inconnues et
des nœuds jamais atteints. `play-tout.mjs` joue tous les chemins dans le lecteur.
Les répliques vivent à **un seul endroit** (`bs-render.mjs`, champ `bubble`) : elles servent aux images,
aux sous-titres et à la liste des scènes.

## Le style visuel : assumé, jamais le « défaut IA »

Pierre a rejeté les scènes Canva par défaut (dessin animé plat et chaleureux) : « trop IA slop ». Choisir
un style **assumé** qui a du sens pour le sujet, puis le tenir sur tous les clips :
- **papier découpé** (stop-motion, palette limitée orange, sarcelle, moutarde, bleu marine sur crème) :
  retenu pour le CDI ;
- autres pistes proposées : risographie, photos du vrai lieu (sans visage d'élève), scènes dessinées en HTML.
Pour un nouveau module, proposer 2 ou 3 styles qui découlent du contenu (archive, presse, carnet de
terrain…) plutôt que recopier le papier découpé.

## Pipeline vidéo (Google Flow / Veo, généré par Pierre)

Il n'y a pas de connecteur Flow : on écrit les prompts, Pierre génère les clips et les dépose.

1. **Personnages constants** : une image de référence par personnage, en pied, fond uni, dans le style
   choisi (`ingredients-flow/perso-<nom>.jpg`). Dans Flow : *Ingredients to Video*, l'image en ingrédient.
2. **Bloc STYLE** commun collé avant chaque prompt : technique, palette, cadrage (personnage sur le tiers
   gauche, moitié droite vide pour le sous-titre), lieu, **« No on-screen text, no letters, no subtitles,
   no logos »**, voix (« speaks French with a natural 11-year-old voice; no music »).
3. **Un prompt par scène** : action visible + « He says in French: « … » ». 16:9, 8 s, audio activé.
   Réplique de **15 mots au plus** (les clips sortent à 6 s et coupent la fin des phrases longues).
   Modèle complet : `/mnt/project-files/h5p/conseiller-un-ami-canva/prompts-flow.md`.
4. Pierre garde le meilleur de 2-3 essais. Les clips arrivent souvent **mal nommés** : faire la
   correspondance scène → clip (`map.json`) par transcription (`pip install faster-whisper`, wav 16 kHz).
5. `node scenario/video-build.mjs <clips> <map.json> out/` : réplique complète incrustée en sous-titre
   (les postes n'ont pas toujours le son), 720p CRF 27, affiche = première image. 17 clips ≈ 8,6 Mo.
6. `VIDEOS=1 node scenario/scenario.mjs <paquet>/content/content.json` : les scènes deviennent des
   nœuds `H5P.Video 1.6` (autoplay), le graphe ne change pas.

## Pièges connus

- Flow **ignore parfois l'ingrédient** : le visage change d'un clip à l'autre (Lina). Vérifier la
  cohérence planche par planche avant d'intégrer ; faire régénérer les clips fautifs.
- Clip avec **texte ou lettres** à l'écran : le jeter. Titres de livres, cotes, étiquettes sont
  ajoutés par incrustation (`cote` dans `video-build.mjs`), nets et en français correct.
- Le lecteur hors ligne garde le paquet en **cache par URL** : changer le nom du fichier à chaque
  version (`-v2`, `-v3`) et mettre à jour le cadre du livre et `partage/README.md`.
- Le Chromium de test (Playwright) ne lit pas le H.264 : on vérifie le graphe et le chargement, la
  lecture se vérifie chez Pierre.
- Dans un Interactive Book, le scénario s'intègre **en cadre** (`references/iframe-modules.md`) :
  aucun score ne remonte. Le scénario seul sur Nuage reste en `no-score` (modèle sans échec).
- Images générées : Gamma coûte 70 crédits par image et son CDN est bloqué depuis le cloud ;
  Canva `generate-image` avec `imageReferences` a échoué plusieurs fois (sans référence, ça marche).

## Sortir du « QCM déguisé » : activités dans le scénario

Pierre (2026-11-25) : un scénario où l'élève ne fait que cliquer une proposition est un QCM déguisé.
Le chemin ne dépend **que** des clics sur les `BranchingQuestion`, mais une étape peut être une
**Course Presentation 1.25** ou une **Interactive Video 1.26**, qui portent des activités :

- Étapes directes (BS 1.8) : AdvancedText, Image, Video, ImageHotspots, CoursePresentation, InteractiveVideo.
- Dans la CP : ExportableTextArea (écrire), AudioRecorder (parler), MarkTheWords, DragText, Blanks,
  DragQuestion, MultiChoice, SingleChoiceSet, TrueFalse, Summary, MultiMediaChoice, Dialogcards, Audio, Video, Table, Link.
- Dans l'IV : FreeTextQuestion, Questionnaire (écrire), MarkTheWords, DragText, Blanks, DragQuestion,
  MultiChoice, SingleChoiceSet, TrueFalse, Summary, MultiMediaChoice, GoToQuestion (Crossroads : saut dans la vidéo), IVHotspot.
- Impossible : Essay, Crossword, FindTheWords, SortParagraphs, ImageSequencing, Memory, Documentation Tool, Book, GameMap, Iframe Embedder.

Patron validé par Pierre (« très convaincant ») : **écris d'abord, compare ensuite**. Une CP (diapo 1 : Mark the
Words sur le document à exploiter ; diapo 2 : zone de texte « Mon conseil à … »), puis une question
« Lequel de ces trois conseils ressemble le plus au tien ? » : mauvais conseil → retour à la CP pour réécrire ;
« Le mien ne ressemble à aucun » → grille de 3 critères puis suite. Démo :
`partage/decouvrir-le-cdi/conseiller-un-ami-demo-ecriture.h5p` (scène de Sam, deux livres).
Limites : la CP repart de zéro quand on y revient (texte effacé) ; le texte n'est ni corrigé ni enregistré.
Penser `proceedButtonText` explicite (« J'ai écrit mon conseil »). Tester chaque activité seule avant de l'intégrer.

## Énigme bloquante (cadenas à code)

Le scénario ne lit pas les scores : impossible de bifurquer selon la réussite d'une activité. Deux voies :

1. **Le code EST la réponse** (version retenue, plus élégante) : une énigme sans correction (Dewey : un
   documentaire sur les volcans → 5, un récit de Pompéi → 9, des poèmes sur le feu → 8 ; code 5-9-8).
   Le cadenas est le **seul moment de vérification**. Trois questions-roues à 10 chiffres : un mauvais
   chiffre bascule sur une piste « fausse » sans le dire, l'échec n'est annoncé qu'au bout (« Clac. »,
   sans dire lequel), retour aux indices. 1000 combinaisons : on ne devine pas chiffre par chiffre.
   Démo : `partage/decouvrir-le-cdi/cadenas-de-la-reserve-demo-v2.h5p`, source `scenario/demos/cadenas.mjs`.
2. Code révélé dans le retour à 100 % (`overallFeedback from:100`) d'une activité notée, sans « Voir la
   solution » : marche, mais moins élégant (première version de la démo).

Vrai exercice bloquant sans cadenas (testé 2026-11-25) : un nœud **Interactive Video 1.26** dans le scénario,
avec une interaction `displayType:'poster'`, `pause:true` et `adaptivity:{ requireCompletion:true,
wrong:{ seekTo:0, allowOptOut:false, message, seekLabel:'Revoir la scène' }, correct:{ allowOptOut:false } }`,
`override.preventSkippingMode:'both'`, et le nœud en `forceContentFinished:'enabled'` : la vidéo reste figée
(même en cliquant Lecture) tant que le score n'est pas complet, et le « Continuer » du scénario reste grisé
jusqu'à la fin de la vidéo. Base des paramètres IV : celle du livre vitrine EMI (IV 1.27 relabellisée 1.26).
Pas de bouton « Voir la solution » dans l'activité. Livrer mp4 + webm. Erreur console bénigne en fin de vidéo
(« this.pause is not a function »). Démo : `partage/decouvrir-le-cdi/video-bloquante-demo.h5p`, source `scenario/demos/video-bloquante.mjs`.
Démo d'écriture : `scenario/demos/ecriture-sam.mjs`. Sélecteurs de test : étiquettes Drag Text `.ui-draggable`.
Pierre est **professeur documentaliste** (un homme) : ne jamais écrire « la documentaliste » dans ses modules.

## Parcours différencié (apprentissage échelonné)

Autre usage du type, hors mission finale : un scénario qui **aide les élèves en difficulté sans ralentir les
autres**. Exemple complet : `assets/examples/polar-differencie/` (« L’affaire des livres sans pastille »,
reconnaître un polar, 6e/5e), paquet `partage/polar/polar-differencie.h5p`.

Le scénario ne lit pas les scores : **ce sont les réponses qui choisissent le chemin**.
1. **Diagnostic sans correction immédiate** : deux questions de suite (le genre, puis ce qui le prouve).
   Deux bonnes réponses → raccourci **proposé** (l’élève peut quand même voir la méthode). Sinon → détour.
   Deux questions au lieu d’une : on ne tombe pas dans le raccourci par chance (1 sur 9).
2. **Détour = enseignement explicite** : Je découvre (Image Hotspots, l’élève clique, rien à répondre),
   Je retiens, Je suis accompagné (Course Presentation avec Drag Text et coups de pouce), puis une question
   à retour immédiat.
3. **« Je fais seul » avec remédiation ciblée** : chaque mauvaise réponse est une erreur type d’élève et mène
   à **sa** remédiation (texte court, contre-exemple), puis à un **cas jumeau** qui tend le même piège
   (modèle « mauvais choix bloqué »). Bonne réponse du premier coup → on avance directement.
4. **Fin commune** : « écris d’abord, compare ensuite », Je retiens, puis un **défi bonus facultatif** pour
   ceux qui ont du temps (le scénario n’ayant pas de mémoire, on le propose à tous).
`audit-reponses.py` ne reconnaît pas les bonnes réponses des questions qui renvoient vers une remédiation :
contrôler leurs longueurs à la main.
