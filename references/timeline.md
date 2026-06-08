# Référence — Frise chronologique (H5P.Timeline)

`machineName` : **H5P.Timeline** (v1.1) + dépendance **TimelineJS** (v1.1, le moteur de Knight Lab).
Structure **vérifiée sur un vrai export Lumi**.

## ⚠️ Le texte est du HTML, PAS du Markdown

H5P.Timeline rend les champs `text` en **HTML**. Si tu écris `**gras**`, les astérisques
s'affichent littéralement. Utilise donc :

- `<strong>…</strong>` pour le gras, `<em>…</em>` pour l'italique ;
- `<br>` pour un saut de ligne, et enveloppe les paragraphes dans `<p>…</p>` ;
- les emojis et entités (`&nbsp;`, `&laquo;`) passent très bien.

(Les `headline` restent en **texte brut** : pas de balises.)

## Structure du content.json (vérifiée)

```jsonc
{
  "timeline": {
    "headline": "Titre de la frise",        // texte brut
    "text": "<p>Introduction en <strong>HTML</strong>.</p>",
    "defaultZoomLevel": "0",                  // niveau de zoom initial
    "height": 600,                            // hauteur en px
    "language": "fr",
    "asset": {                                // média du panneau-titre (optionnel) ; {} si aucun
      "media":   "https://.../image.jpg",     // URL DIRECTE validée (pas de fichier embarqué)
      "caption": "Légende.",
      "credit":  "Auteur / Wikimedia Commons — Licence"
    },
    "date": [ /* événements */ ],
    "era":  [ /* périodes de fond */ ]
  }
}
```

> Remarque : quand on téléverse une image dans l'éditeur Lumi, elle est stockée en
> `backgroundImage` (fichier embarqué `images/…` + objet `copyright`). Nous, on préfère
> `asset.media` avec une **URL externe** (Wikimedia) : rien à embarquer, paquet léger.

### Objet `date` (un événement)

```jsonc
{
  "startDate": "1969,10,29",   // OBLIGATOIRE — "YYYY" ou "YYYY,MM,DD" (virgules, pas de tirets)
  "endDate":   "1972",          // optionnel
  "headline":  "Titre de l'événement",         // texte brut
  "text":      "<p>Narration en <strong>HTML</strong>.<br>Ligne suivante.</p>",
  "asset":     {},              // {} si pas de média ; sinon {media,caption,credit}
  "tag":       "Réseau"         // optionnel — permet le filtrage dans la frise
}
```

### Objet `era` (période de fond colorée)

```jsonc
{
  "startDate": "1969",
  "endDate":   "1988",
  "headline":  "Nom de la période",
  "text":      "<p>Contexte en HTML.</p>",
  "tag":       "Contexte"
}
```

## Règles de qualité

- **Dates** : strictement `YYYY` ou `YYYY,MM,DD`. Cause n°1 de frises cassées.
- **text en HTML** (voir l'avertissement plus haut).
- **Périodes** : chaque `era` englobe réellement un groupe d'événements (cohérence pédago).
- **Médias** : URL directe **validée** (`scripts/Find-WikimediaImages.ps1 -Validate`), avec
  `caption` ET `credit`. Jamais d'URL inventée. Les événements sans image ont `"asset": {}`.

## Validation

```powershell
.\scripts\Test-H5PJson.ps1 -Path .\content.json -Type timeline -MinEvents 5 -MinEras 2
```

## Astuce de production

Si tu rédiges d'abord en Markdown (plus lisible), convertis avant d'écrire le JSON :
`**x**`→`<strong>x</strong>`, `*x*`→`<em>x</em>`, double saut de ligne→nouveau `<p>`,
simple saut→`<br>`.

## Exemple minimal (HTML, modèle à imiter)

```json
{
  "timeline": {
    "headline": "D'ARPANET à Google",
    "text": "<p>Les grandes étapes d'<strong>Internet</strong> et du <strong>Web</strong>.</p>",
    "defaultZoomLevel": "0",
    "height": 600,
    "language": "fr",
    "asset": {
      "media": "https://upload.wikimedia.org/wikipedia/commons/d/d1/First_Web_Server.jpg",
      "caption": "Le premier serveur web au CERN.",
      "credit": "Coolcaesar / Wikimedia Commons — CC BY-SA 3.0"
    },
    "date": [
      {
        "startDate": "1969,10,29",
        "headline": "ARPANET, l'ancêtre d'Internet",
        "text": "<p>Premier message entre deux ordinateurs sur <strong>ARPANET</strong>.</p>",
        "asset": {},
        "tag": "Réseau"
      },
      {
        "startDate": "1989,03,12",
        "headline": "Tim Berners-Lee invente le Web",
        "text": "<p>Naissance du <strong>World Wide Web</strong> au CERN.</p>",
        "asset": {
          "media": "https://upload.wikimedia.org/wikipedia/commons/4/4e/Sir_Tim_Berners-Lee_%28cropped%29.jpg",
          "caption": "Tim Berners-Lee.",
          "credit": "Paul Clarke / Wikimedia Commons — CC BY-SA 4.0"
        },
        "tag": "Web"
      }
    ],
    "era": [
      {
        "startDate": "1969",
        "endDate": "1988",
        "headline": "Les pionniers des réseaux",
        "text": "<p>Internet se construit dans les universités et l'armée.</p>",
        "tag": "Contexte"
      }
    ]
  }
}
```
