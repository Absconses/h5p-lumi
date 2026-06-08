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
