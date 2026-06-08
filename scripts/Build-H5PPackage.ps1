<#
.SYNOPSIS
    Assemble un fichier .h5p importable dans Lumi à partir d'un "gabarit" et d'un content.json.

.DESCRIPTION
    Un .h5p est une archive ZIP qui contient : h5p.json (manifeste) + content/content.json
    + un dossier par bibliothèque (le code JS/CSS du type de contenu).

    On ne peut PAS fabriquer les bibliothèques à partir de rien. L'astuce robuste :
    réutiliser celles d'un GABARIT — une activité du MÊME type exportée une fois depuis
    Lumi (Menu ▸ Exporter / "Download .h5p"). Cela garantit la compatibilité de version
    avec TON installation de Lumi.

    Ce script :
      1. extrait le gabarit,
      2. remplace content/content.json par le tien,
      3. met à jour le titre dans h5p.json (langue 'fr'),
      4. re-zippe le tout en .h5p avec des séparateurs '/' conformes à H5P.

    Les images en URL externe (Wikimedia) n'ont PAS besoin d'être empaquetées : H5P les
    charge à distance. Le contenu reste donc léger.

.PARAMETER Template
    Chemin du gabarit .h5p (exporté depuis Lumi) du bon type de contenu.

.PARAMETER Content
    Chemin du content.json à injecter (déjà validé avec Test-H5PJson.ps1).

.PARAMETER OutputPath
    Chemin du .h5p à produire.

.PARAMETER Title
    Titre de l'activité (affiché dans Lumi). Défaut : nom du fichier de sortie.

.PARAMETER KeepMedia
    Conserve les fichiers médias présents dans content/ du gabarit (par défaut on ne
    garde que content.json, car nos médias sont des URL externes).

.EXAMPLE
    .\Build-H5PPackage.ps1 -Template .\gabarit-timeline.h5p -Content .\content.json `
                           -OutputPath .\frise-internet.h5p -Title "Naissance d'Internet"
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)] [string] $Template,
    [Parameter(Mandatory = $true)] [string] $Content,
    [Parameter(Mandatory = $true)] [string] $OutputPath,
    [string] $Title,
    [switch] $KeepMedia,
    [string[]] $Media
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem

foreach ($f in @($Template, $Content)) {
    if (-not (Test-Path $f)) { throw "Fichier introuvable : $f" }
}
if (-not $Title) { $Title = [System.IO.Path]::GetFileNameWithoutExtension($OutputPath) }

# Dossier de travail temporaire unique (sans Get-Random : compatible et déterministe via GUID)
$work = Join-Path $env:TEMP ("h5pbuild_" + [Guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Force -Path $work | Out-Null

try {
    # 1) Extraction du gabarit
    [System.IO.Compression.ZipFile]::ExtractToDirectory((Resolve-Path $Template), $work)

    $manifestPath = Join-Path $work "h5p.json"
    if (-not (Test-Path $manifestPath)) { throw "Gabarit invalide : h5p.json absent. Ce n'est pas un .h5p valide." }

    # 2) content/content.json
    $contentDir = Join-Path $work "content"
    if (-not (Test-Path $contentDir)) { New-Item -ItemType Directory -Force -Path $contentDir | Out-Null }
    if (-not $KeepMedia) {
        Get-ChildItem $contentDir -Recurse -Force | Remove-Item -Recurse -Force
    }
    # Vérifie que le content.json fourni parse, puis l'écrit en UTF-8 sans BOM
    $contentRaw = Get-Content $Content -Raw -Encoding UTF8
    $null = $contentRaw | ConvertFrom-Json   # lève une erreur si invalide
    [System.IO.File]::WriteAllText((Join-Path $contentDir "content.json"), $contentRaw, (New-Object System.Text.UTF8Encoding($false)))

    # Injecter les fichiers médias fournis dans content/images/ (pour les types à image embarquée)
    if ($Media) {
        $imgDir = Join-Path $contentDir "images"
        New-Item -ItemType Directory -Force -Path $imgDir | Out-Null
        foreach ($mf in $Media) {
            if (Test-Path $mf) { Copy-Item $mf $imgDir -Force }
            else { Write-Warning "Média introuvable : $mf" }
        }
    }

    # 3) Mise à jour du manifeste (titre + langue), en conservant mainLibrary & dépendances
    $manifest = Get-Content $manifestPath -Raw -Encoding UTF8 | ConvertFrom-Json
    $manifest.title = $Title
    if ($manifest.PSObject.Properties.Name -contains 'language') { $manifest.language = 'fr' }
    else { $manifest | Add-Member -NotePropertyName 'language' -NotePropertyValue 'fr' }
    $manifestJson = $manifest | ConvertTo-Json -Depth 10 -Compress
    [System.IO.File]::WriteAllText($manifestPath, $manifestJson, (New-Object System.Text.UTF8Encoding($false)))
    $mainLib = $manifest.mainLibrary

    # 4) Re-zip avec séparateurs '/' (entrées créées manuellement pour garantir la conformité)
    if (Test-Path $OutputPath) { Remove-Item $OutputPath -Force }
    $fs  = [System.IO.File]::Open((New-Item -ItemType File -Force -Path $OutputPath).FullName, [System.IO.FileMode]::Create)
    $zip = New-Object System.IO.Compression.ZipArchive($fs, [System.IO.Compression.ZipArchiveMode]::Create)
    try {
        $root = (Resolve-Path $work).Path.TrimEnd('\')
        Get-ChildItem $work -Recurse -File -Force | ForEach-Object {
            $rel = $_.FullName.Substring($root.Length + 1) -replace '\\', '/'
            [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $_.FullName, $rel) | Out-Null
        }
    } finally {
        $zip.Dispose(); $fs.Dispose()
    }

    $sizeKo = [math]::Round((Get-Item $OutputPath).Length / 1024, 1)
    Write-Output "✅ Paquet créé : $OutputPath ($sizeKo Ko)"
    Write-Output "   Type principal : $mainLib"
    Write-Output "   Titre          : $Title"
    Write-Output "   → Importe-le dans Lumi via : Fichier ▸ Ouvrir (ou glisser-déposer)."
}
finally {
    if (Test-Path $work) { Remove-Item $work -Recurse -Force -ErrorAction SilentlyContinue }
}
