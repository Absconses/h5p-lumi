# Grille à cocher — `H5P.GridChecker 1.0`

Un **tableau lignes × colonnes** où l'élève coche des cases : une seule par ligne (boutons
radio), plusieurs par ligne (cases à cocher) ou du texte libre dans chaque case. Bouton
« Vérifier » : les cases justes passent au vert, les fausses au rouge ; « Voir la solution »
surligne celles qui manquaient. Auteur : Pjotr Savitski (licence MIT).

## Limites à annoncer AVANT de proposer ce type

Vérifiées dans le code (`scripts/grid-checker.js`, 400 lignes) et par rendu, 2026-10-24 :

1. **Aucun résultat envoyé à la plateforme** : pas de score, pas d'événement xAPI, pas de
   `getScore()`. **Lumi Nuage n'enregistre rien** pour l'élève. Plus limité encore que Tabs.
2. **Aucun score ni bilan affiché** : seulement des couleurs dans la grille, pas de
   « 5/7 », pas d'écran de fin.
3. **Ne s'imbrique pas dans un Interactive Book** (ni dans une Page / Column, un Question
   Set, des Onglets, une Course Presentation) : GridChecker n'est dans la liste des types
   autorisés d'aucun conteneur. Activité **autonome** uniquement.
4. **Pas de sauvegarde de l'état** : si l'élève recharge la page, la grille est vide.
5. **Type « texte »** : le bouton « Télécharger mes réponses » produit un CSV, en chargeant
   PapaParse et FileSaver depuis `cdnjs.cloudflare.com` → **ne marche pas hors ligne**. Les
   réponses ne sont pas corrigées, ni envoyées à l'enseignant.

**Conséquence** : à réserver à un **support de travail en classe** (vidéoprojeté, ou
autocorrection immédiate), jamais à une évaluation dont on veut les résultats. Pour une
grille **notée** et **dans un Book**, proposer plutôt :

| Besoin | Alternative notée, dans un Book |
|---|---|
| Classer des éléments dans des colonnes | `H5P.DragQuestion` (glisser dans des zones) ou `H5P.DragText` |
| Une bonne réponse par ligne | `H5P.SingleChoiceSet` ou un `H5P.QuestionSet` de `H5P.MultiChoice` |
| Vrai / Faux par affirmation | `H5P.TrueFalse` (dans un Question Set) |
| Plusieurs bonnes réponses par ligne | une `H5P.MultiChoice` par ligne (`singleAnswer: false`) |
| Auto-positionnement, avis | `H5P.Questionnaire` (non noté mais intégré au Book) |

## Disponibilité (vérifiée le 2026-10-24)

| Plateforme | GridChecker ? |
|---|---|
| **Hub H5P officiel** (`api.h5p.org`) | **Non** : absent des 53 types du Hub. Le gabarit vient d'un export fourni par Pierre. |
| **Lumi Nuage** | **Probablement** (export de Pierre avec bibliothèques récentes, JoubelUI 1.3.45) : importer le module démo pour confirmer. Même s'il s'installe : **aucun résultat** remonté (voir limites). |
| **Digiquiz / La Digitale** | **Non** : pas de `H5P.GridChecker` dans ses `libraries/`. |
| **Lumi desktop** | Oui. Le gabarit remplace JoubelUI 1.3.45 (coreApi 1.28, refusé par Lumi desktop) par la 1.3.19 des autres gabarits (coreApi 1.3). |

## Cas d'usage (professeur documentaliste, EMI)

Tous en **activité autonome**, corrigée à l'écran, sans note enregistrée :

| Activité | Type de grille | Lignes × colonnes |
|---|---|---|
| **Licences Creative Commons** (module démo) | `multiple` | CC0, BY, BY-SA, BY-NC, BY-ND, BY-NC-ND, © × partager / modifier / vendre / ne pas citer |
| **Info, intox, opinion ou pub ?** | `single` | 6 à 8 titres ou captures × Information / Rumeur / Opinion / Publicité / Satire |
| **Quel outil pour quelle recherche ?** | `multiple` | besoins (« un livre sur les volcans au CDI », « la date d'un événement »…) × e-sidoc / Wikipédia / moteur de recherche / dictionnaire / encyclopédie papier |
| **Classer les documents du CDI** | `single` | titres ou couvertures × roman / documentaire / BD / périodique / ouvrage de référence |
| **Repérer les indices de fiabilité** sur une page projetée | `multiple` | 3 sites (fictifs) × auteur identifié / date / sources citées / mentions légales / publicité |
| **Indexation Dewey** | `single` | sujets × classes 000 à 900 |
| **Auto-positionnement** (Pix, CRCN, fin de séquence) | `single` sans corrigé | compétences × « Je sais faire » / « En cours » / « Pas encore » |
| **Grille de lecture d'une source** (QQOQCP) | `text` | documents × Qui ? Quoi ? Où ? Quand ? Pourquoi ? → CSV (Internet requis) |

Idée pratique : projeter la grille au tableau et faire voter la classe ligne par ligne,
puis « Vérifier » ensemble. C'est là que l'absence de score ne gêne pas.

## Structure du `content.json`

```json
{
  "headline": "Que puis-je faire avec cette image ?",
  "bodyText": "<p>Consigne (HTML : strong, em, u, a, ul, ol, h2, h3…)</p>",   // optionnel
  "gridBoxType": "multiple",                 // "single" (radio) | "multiple" (cases) | "text"
  "rowsAndColumns": {
    "rows":    [ { "rowId": "<uuid>", "rowText": "CC BY" } ],
    "columns": [ { "columnId": "<uuid>", "columnText": "La partager" } ]
  },
  "requireResponse": false,                  // true : refuse la vérification si une ligne est vide
  "grid": [                                  // corrigé : LISTE directe (groupe à 1 champ aplati)
    { "gridRowId": "<uuid de la ligne>", "gridRowColumns": ["<uuid de colonne juste>", "…"] }
  ],
  "l10n": { "checkAnswers": "Vérifier", "tryAgain": "Recommencer", "showSolutions": "Voir la solution",
            "downloadResponses": "Télécharger mes réponses",
            "missingAnswersHeading": "Il manque des réponses", "missingAnswersBody": "…" }
}
```

## Règles (vérifiées dans le code et par rendu)

1. **`grid` est une liste**, pas un objet `{ gridRows: [...] }` : le `semantics.json` déclare
   un groupe à un seul champ, que H5P aplatit (c'est ce que produit l'éditeur).
2. **Ligne absente de `grid` = ligne non corrigée** : toute case cochée y devient **verte**.
   Pour une ligne où **rien** n'est juste (« © Tous droits réservés »), mettre
   `gridRowColumns: []` : toute case cochée devient rouge.
3. **Identifiants = UUID** : ils servent dans des sélecteurs CSS (`input[name="row-<id>"]`).
4. **`single`** : exactement une colonne juste par ligne (la fabrique le vérifie).
5. Les libellés sont insérés en HTML : écrire `&amp;` pour « & ».
6. 4 ou 5 colonnes maximum à libellés courts : au-delà, le tableau défile horizontalement
   sur mobile (`.h5p-grid-checker-responsive`).
7. Les boutons sont en anglais par défaut : la fabrique met `L10N_FR`.

- Gabarit : `assets/templates/gabarit-gridchecker.h5p` (GridChecker 1.0.4 + éditeur 1.0.3,
  JoubelUI 1.3.19, FontAwesome 4.5, Transition 1.0, FontIcons 1.0) → modifiable dans Lumi.
- Fabrique : `assets/lib/grid-checker.mjs` (`gridChecker`, `L10N_FR`).
- Module de démonstration : « Que puis-je faire avec cette image ? » (licences CC),
  `assets/examples/licences-cc/`.

## Empaqueter

```bash
node assets/examples/licences-cc/build.mjs content.json
python3 assets/examples/visite-coulisses-info/validate.py <gabarit_extrait> content.json "H5P.GridChecker 1.0"
mkdir -p media
python3 assets/examples/visite-coulisses-info/pack.py assets/templates/gabarit-gridchecker.h5p \
    content.json media/ sortie.h5p "Titre"           # complet, modifiable dans Lumi (~0,6 Mo)
```

Le gabarit et le paquet `--slim` passent le `PackageValidator` de
`@lumieducation/h5p-server` (validateur de Lumi).
