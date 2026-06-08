# Couvrir N'IMPORTE QUEL type de contenu du catalogue Lumi

Le catalogue H5P/Lumi compte des dizaines de types (Flashcards, Dialog Cards, Image
Hotspots, Drag and Drop, Find the Hotspot, Mark the Words, Summary, Dictation, Image
Sequencing, Branching Scenario, Course Presentation, Interactive Book…).

On n'a PAS besoin d'écrire une fiche pour chacun à l'avance. Chaque bibliothèque H5P
embarque son **propre modèle de données** dans un fichier `semantics.json`. Et ce fichier
se trouve **à l'intérieur du gabarit que tu exportes depuis Lumi**. On peut donc déduire
la structure exacte du `content.json` de n'importe quel type, à la demande.

## Méthode (5 étapes)

1. **Obtenir un gabarit du type voulu** : dans Lumi, crée une activité de ce type
   (même vide), puis exporte-la en `.h5p` (voir `references/lumi-packaging.md`).

2. **Extraire le `semantics.json` du type principal.** Un `.h5p` est un ZIP : le dossier
   de la bibliothèque principale (ex: `H5P.DialogCards-1.5/`) contient `semantics.json`.

   ```powershell
   # Liste les bibliothèques et lit le semantics.json du type principal
   Add-Type -AssemblyName System.IO.Compression.FileSystem
   $zip = [System.IO.Compression.ZipFile]::OpenRead("C:\chemin\gabarit.h5p")
   # 1) trouver mainLibrary dans h5p.json
   $h = $zip.Entries | Where-Object { $_.FullName -eq 'h5p.json' }
   $sr = New-Object System.IO.StreamReader($h.Open()); $main = ($sr.ReadToEnd() | ConvertFrom-Json).mainLibrary; $sr.Close()
   # 2) lire le semantics.json du dossier correspondant
   $sem = $zip.Entries | Where-Object { $_.FullName -match "^$([regex]::Escape($main))-[\d.]+/semantics\.json$" }
   $sr = New-Object System.IO.StreamReader($sem.Open()); $sr.ReadToEnd() | Out-File "C:\chemin\semantics.json" -Encoding utf8; $sr.Close()
   $zip.Dispose()
   ```

3. **Lire le `semantics.json`** (avec l'outil Read) et le traduire en structure JSON.
   Le `semantics.json` est un *tableau de définitions de champs*. Correspondance directe :

   | `type` dans semantics | Ce que ça donne dans content.json |
   |---|---|
   | `text`                | une chaîne (HTML si `"widget":"html"`) |
   | `number` / `boolean`  | un nombre / un booléen |
   | `select`              | une des valeurs de `options[].value` |
   | `group`               | un objet `{ … }` contenant les sous-`fields` |
   | `list`                | un tableau `[ … ]` d'éléments selon `field` |
   | `library`             | un objet `{ "library": "H5P.X 1.y", "params": {…}, "subContentId": "<guid>" }` |
   | `image`/`video`/`audio` (via `library`) | média ; URL externe possible, sinon fichier empaqueté |

   Le `name` de chaque champ = la **clé** dans le JSON. Les champs sans `"optional": true`
   sont requis. Les `default` indiquent les valeurs habituelles.

4. **Générer le `content.json`** en suivant cette structure, puis **valider** la syntaxe :
   `\.\scripts\Test-H5PJson.ps1 -Path .\content.json -Type generic` (au minimum la syntaxe ;
   ajoute un `-Type` dédié si tu en crées un).

5. **Empaqueter** avec le gabarit de ce type (`scripts/Build-H5PPackage.ps1`).

## Bonne pratique

Quand tu viens de décoder un nouveau type, **écris une fiche** `references/<type>.md`
(sur le modèle de `timeline.md`) avec la structure et un exemple. Le skill devient ainsi
plus riche à chaque usage, sans avoir à tout re-déduire la fois suivante.

## Astuce : un gabarit peut contenir plusieurs bibliothèques

Certains gros types (Course Presentation, Interactive Book) embarquent déjà des dizaines de
bibliothèques (MultiChoice, TrueFalse, Blanks, DragText, DialogCards, Summary, Table…).
Si tu disposes d'un tel gabarit, tu peux lire le `semantics.json` de ces sous-types sans
réexporter quoi que ce soit.
