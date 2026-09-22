# Empaqueter pour Lumi : le fichier .h5p et la méthode du « gabarit »

## Ce qu'est un fichier .h5p

Un `.h5p` est une **archive ZIP** contenant :

```
mon-activite.h5p
├── h5p.json                 ← manifeste : titre, langue, mainLibrary, preloadedDependencies
├── content/
│   └── content.json         ← LE contenu (ce que le skill génère)
│   └── (médias éventuels)
├── H5P.Timeline-1.1/        ← le code (JS/CSS) de la bibliothèque principale
├── H5P.JoubelUI-1.2/        ← + toutes ses dépendances
└── … (un dossier par bibliothèque)
```

On **ne peut pas fabriquer les bibliothèques** (le code JS/CSS) à partir de rien. D'où la
méthode du gabarit.

## La méthode du « gabarit » (fiable et compatible)

L'idée : réutiliser les bibliothèques d'une activité **du même type** exportée depuis **ton**
Lumi. Comme elles viennent de ton installation, la version est forcément compatible.

### Étape unique (à faire une fois par type de contenu)

1. Dans **Lumi Desktop**, crée une nouvelle activité du type voulu (ex: *Timeline*).
   Mets-y n'importe quoi (un événement bidon suffit) puis enregistre.
2. Exporte-la : menu de l'activité ▸ **Download / Exporter en .h5p**.
3. Range ce fichier comme gabarit, p.ex. :
   `C:\Users\ppempie\.claude\skills\h5p-lumi\assets\templates\gabarit-timeline.h5p`

> Tu réutiliseras ce même gabarit pour TOUTES les futures frises. Idem un
> `gabarit-multichoice.h5p` pour les QCM, etc. (Astuce : un gabarit *Course Presentation*
> embarque déjà des dizaines de bibliothèques — pratique comme réserve.)

### Production d'une activité

```powershell
# 1) (le skill a déjà généré et validé content.json)
.\scripts\Test-H5PJson.ps1 -Path .\content.json -Type timeline

# 2) assembler le .h5p à partir du gabarit
.\scripts\Build-H5PPackage.ps1 `
    -Template .\assets\templates\gabarit-timeline.h5p `
    -Content  .\content.json `
    -OutputPath "C:\Users\ppempie\Desktop\frise-internet.h5p" `
    -Title "D'ARPANET à Google"
```

Le script remplace `content/content.json`, met à jour le titre + la langue `fr`, et
re-zippe avec des séparateurs `/` conformes à H5P.

### Réimporter dans Lumi

Ouvre Lumi ▸ **Fichier ▸ Ouvrir** (ou glisse-dépose le `.h5p`). L'activité s'ouvre,
éditable, prête à être prévisualisée ou ré-exportée pour ton ENT / Moodle.

## Notes importantes

- **Images** : nos médias sont des **URL externes** (Wikimedia) → rien à empaqueter, le
  paquet reste léger et les images se chargent à distance. (Si tu préfères des images
  *embarquées*, il faut les copier dans `content/` et les référencer en chemin relatif avec
  un objet de copyright — non géré par défaut ici.)
- **Versions** : si Lumi propose de « mettre à jour le contenu » à l'import, accepte —
  c'est normal quand la version du gabarit est un peu ancienne.
- **content.json sans BOM** : le script l'écrit en UTF-8 sans BOM (ce qu'attend H5P). Ne le
  réenregistre pas en UTF-8 avec BOM avec un éditeur Windows.

## ⚠️ Lumi assainit le HTML à l'import — Digiquiz non

Vérifié dans `@lumieducation/h5p-server` (`build/src/SemanticsEnforcer.js`), la
bibliothèque sur laquelle Lumi est construit. À l'import d'un `.h5p`, chaque champ
texte en `widget:"html"` passe par `sanitize-html` avec ces règles :

| | Ce qui passe | Ce qui est supprimé |
|---|---|---|
| **Balises** | `div`, `span`, `p`, `br` + celles de `semantics.tags` | `<style>`, `<script>`, `<sup>`, `<blockquote>`, `<details>`… |
| **Attributs** | `style` seulement (+ `href`/`target`/`rel` sur `a`) | **`class`, `id`, `title`, `tabindex`, `data-*`** |
| **Propriétés CSS** | `text-align`, `font-size`, `color`, `background-color` | tout le reste : `padding`, `margin`, `border`, `display`, `position`… |

Trois conséquences à connaître avant de générer :

1. **Aucune interaction CSS n'est possible dans un texte.** Pas de `:hover`, pas de
   `class` : la balise `<style>` est explicitement retirée (`uniqueTags.delete('style')`)
   et `class` n'est pas dans la liste blanche. Une infobulle au survol marchera sur
   Digiquiz (qui sert le paquet tel quel) mais **jamais** sur Lumi.
2. **`background` (raccourci) est supprimé, `background-color` est conservé.** Un bandeau
   écrit `style="background:#1d3557;color:#fff"` devient du **texte blanc sur fond blanc**,
   donc invisible. Toujours écrire `background-color`.
3. **Le filtre s'applique à l'import, pas seulement à l'enregistrement.** Rien ne prévient :
   le paquet s'importe sans erreur, et le contenu est déjà appauvri.

### La règle : concevoir en dégradation élégante

Ne jamais faire porter le SENS par le CSS. Le style utile va **en ligne**, dans les quatre
propriétés qui survivent ; la feuille de style n'ajoute que du confort. Exemple d'une
traduction au survol qui reste lisible même une fois le CSS supprimé :

```html
<span class="gl" tabindex="0">gloomy<span class="glt"
  style="font-size:0.85em;color:#c1121f">&nbsp;(sombre, lugubre)</span></span>
```
```css
.gl .glt{display:none}                       /* Digiquiz : masque jusqu'au survol */
.gl:hover .glt,.gl:focus .glt{display:inline;background-color:#fff3cd}
```
- CSS présent  → « gloomy », la traduction apparaît au survol.
- CSS supprimé → « gloomy (sombre, lugubre) », toujours lisible.

Sans les parenthèses et l'espace insécable, la version dégradée donnerait
« gloomysombre, lugubre » : illisible.

### Tester le rendu Lumi sans ouvrir Lumi

```bash
npm install @lumieducation/h5p-server    # embarque sanitize-html
# puis rejouer sanitize() avec allowedTags = ['div','span','p','br', ...semantics.tags]
# et allowedAttributes = { '*':['style'], a:['href','hreflang','media','rel','target'] }
```
Comparer le texte avant/après : ce qu'affiche `sanitize()` est exactement ce que verront
les élèves dans Lumi.
