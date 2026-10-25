# Intégrer un type « interdit » dans un livre ou une page (iframe)

Une page (`H5P.Column`) et donc chaque chapitre d'un **Interactive Book** n'acceptent qu'une
liste fermée de types (voir le `semantics.json` de `H5P.Column-1.18`). Sont **refusés**, entre
autres : Personality Quiz, Image Sequencing, Sort the Paragraphs, Flashcards, Crossword, Find the
Words, Image Multiple Hotspot Question, Dictation, Game Map, Tabs, Impressive Presentation,
Virtual Tour 360, Branching Scenario.

Sur Lumi Nuage on ne peut pas patcher la Column (bibliothèques modifiées ignorées). La seule porte
est **Iframe Embedder** (`H5P.IFrameEmbed 1.0`, accepté par la Column) : il affiche dans un cadre
le module publié ailleurs. Technique trouvée par Pierre dans « Wikipédia en 1 heure »
(octobre 2026), étudiée et refaite proprement dans `partage/wiki-1h/`.

## Avant d'utiliser l'iframe : le type existe-t-il en natif ?

Une activité en iframe **ne compte jamais dans le score du livre** ni dans le rapport Nuage du
livre (le livre la marque « Aucune interaction »). Donc :

1. Si l'activité doit être **notée**, choisir un type natif équivalent, même moins joli :
   - Flashcards « acceptée / refusée » → `H5P.SingleChoiceSet` ;
   - Sort the Paragraphs court → `H5P.DragText` (une phrase par étape) ;
   - Image Multiple Hotspot → `H5P.ImageHotspotQuestion` (une zone) ou Drag and Drop.
   Attention : Image **Multiple** Hotspot Question n'est pas dans la Column, Image Hotspot
   Question (une seule zone) y est.
2. Garder l'iframe pour ce qui n'a pas besoin d'être noté : mise en route (questionnaire de
   personnalité), entraînement, jeu de fin (mots croisés), ordre d'images.

## La recette

```json
{ "library": "H5P.IFrameEmbed 1.0",
  "params": { "source": "https://h5p-offline-player.vercel.app/embed?src=https://raw.githubusercontent.com/Absconses/h5p-lumi/main/partage/mon-module.h5p",
              "width": "1000", "height": "1250", "minWidth": "280", "resizeSupported": true } }
```

Lu dans le code de la bibliothèque (`iframe-embed.js`) :

- **Le cadre a `scrolling="no"`** : ce qui dépasse est coupé, l'élève ne peut pas faire défiler.
- **La hauteur suit un ratio fixe** : hauteur = largeur du cadre × `height` / `width`.
  `width` et `height` ne sont donc PAS des tailles, mais un **ratio**. Laissés vides, ils valent
  500/500, soit un carré.
- **`minWidth` impose une largeur minimale** : à 500 (valeur de Lumi), le cadre déborde d'un
  téléphone. Mettre **280**.
- Aucun redimensionnement automatique : le cadre ne s'adapte pas au contenu. Choisir le ratio en
  mesurant la hauteur réelle du module à ~800–1000 px de large (rendu Playwright) puis ajouter 10 %.
  Le contenu de la plupart des types grandit beaucoup plus vite que le ratio sur téléphone
  (ex. Image Sequencing : 735 px à 800 px de large, 2 150 px à 390 px) : on vise l'ordinateur ou
  le Chromebook du CDI, et on met un lien « Ouvrir en grand » sous le cadre.

Ratios mesurés (largeur 1000) : Personality Quiz 4 réponses en images 1000/1050 ·
Image Sequencing 8 images 1000/820 · Sort the Paragraphs 7 cartes 1000/1400 ·
Image Multiple Hotspot (capture d'écran pleine page) 1000/1250 · Crossword 8 mots 1000/850 ·
vidéo 16:9 1600/900.

**Toujours** entourer le cadre de deux textes dans la Column :

1. au-dessus, la **consigne** en gras (le cadre n'a pas de titre accessible : un lecteur d'écran
   n'annonce rien) ;
2. en dessous, un lien `<a href="…" target="_blank">Ouvrir l'activité en grand</a>`, en
   précisant que l'activité n'est pas comptée dans le score.

## Quelle source mettre dans le cadre ?

| Source | Avantages | Limites |
|---|---|---|
| **Lien offline player** (`/embed?src=` + `.h5p` dans `partage/`) — **par défaut** | Aucun bandeau ; fichier versionné dans le dépôt ; on peut corriger et republier | Aucun résultat ; dépôt public ; un type hors catalogue affiche d'abord « Open with its own scripts » |
| Lien « run » Lumi (`app.lumi.education/run/xxxx`) | Rapide à créer depuis Nuage | Bandeau « Login / Register » dans le cadre ; collecte de données **désactivée** par défaut (`collectData:false`), même activée les résultats arrivent dans le rapport du run, pas dans celui du livre ; dépend du compte Nuage |
| Digiquiz | Hébergement gratuit | Beaucoup de types manquent ; moins fiable |
| Vidéo (Digiview, YouTube nocookie) | Rien à héberger | Ratio 16:9 |

### Offline player dans un cadre : le service worker

Le lecteur a besoin d'un *service worker*. Dans une page web normale (Nuage, ENT, autre site),
il démarre bien dans le cadre (testé : les 5 modules de `partage/wiki-1h/` s'affichent).
Si le navigateur bloque les stockages « tiers » (réglage strict, certains Chromebooks gérés), le
cadre affiche « This browser does not run the player inside another site's page. Open it on its
own. » : c'est exactement pour ce cas que le lien « Ouvrir l'activité en grand » est obligatoire
sous chaque cadre. Les rendus de test peuvent aussi rester blancs quand le cadre est chargé dans
une page `about:blank` : tester depuis une vraie URL `http://`.

## Récupérer un module déjà publié sur Lumi Nuage

`scripts/Get-LumiRun.py` reconstruit un `.h5p` autonome à partir d'un lien run public :
il interroge l'API GraphQL de Lumi (`getRun` → `contentId`, affiche aussi `collectData`), lit les
paramètres dans la page de rendu (`H5PIntegration`), télécharge les bibliothèques (closure de
`library.json`, JS/CSS, polices des `url()` CSS, `language/fr.json`) et les médias.

```bash
python3 -I scripts/Get-LumiRun.py https://app.lumi.education/run/I0_wkf mots-croises.h5p
python3 -I scripts/Slim-H5PImages.py <dossier_extrait> 1200   # images > 250 Ko : redimensionnées, PNG opaques → JPEG
```

Les images générées par IA font souvent 2 à 5 Mo en PNG : le livre d'origine pesait 54 Mo
d'images, 7 Mo après allègement, sans différence visible.

## Vérifier

- Rendre le livre (h5p-standalone + Playwright) en attendant ~10 s par page : l'offline player
  télécharge le `.h5p` avant d'afficher.
- Vérifier qu'aucun cadre n'est coupé en bas et qu'il n'y a pas de grand vide.
- Ouvrir le lien « en grand » sur téléphone.
- Les liens pointent vers `main` : ils ne marchent qu'une fois la PR fusionnée (pour tester avant,
  construire une variante qui pointe vers la branche).

Exemple complet : `partage/wiki-1h/` (5 modules) et le livre « Wikipédia en 1 heure » v2.
