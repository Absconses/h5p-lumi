<#
.SYNOPSIS
  Greffe des bibliotheques H5P (et leurs dependances runtime) d'un gabarit source vers un gabarit cible.
.DESCRIPTION
  Enrichit un gabarit pauvre (ex: une Game Map qui n'embarque que TrueFalse) avec d'autres
  types d'exercices (MultiChoice, Blanks, DragText, MarkTheWords, SingleChoiceSet...) en :
   1) copiant les DOSSIERS de bibliotheques manquants depuis un gabarit source riche
      (typiquement gabarit-column.h5p, qui contient ~64 bibliotheques) ;
   2) suivant en BFS les preloadedDependencies de chaque lib pour ne rien oublier ;
   3) reconstruisant preloadedDependencies de h5p.json a partir des library.json (autoritaire),
      donc SANS entree vide {machineName:""} qui ferait planter le chargement.
.PARAMETER Target
  Gabarit a enrichir (.h5p). Reste inchange ; le resultat va dans -OutputPath.
.PARAMETER Source
  Gabarit riche fournissant les bibliotheques (.h5p), ex: gabarit-column.h5p.
.PARAMETER Libraries
  Noms de DOSSIERS de bibliotheques a greffer, ex: "H5P.MultiChoice-1.16","H5P.Blanks-1.14".
.PARAMETER OutputPath
  Chemin du .h5p enrichi a produire.
.EXAMPLE
  .\Graft-H5PLibraries.ps1 -Target .\assets\templates\gabarit-gamemap-working.h5p `
     -Source .\assets\templates\gabarit-column.h5p `
     -Libraries "H5P.MultiChoice-1.16","H5P.Blanks-1.14","H5P.DragText-1.10","H5P.MarkTheWords-1.11","H5P.SingleChoiceSet-1.11" `
     -OutputPath .\assets\templates\gabarit-gamemap-multi.h5p
#>
param(
  [Parameter(Mandatory)][string]$Target,
  [Parameter(Mandatory)][string]$Source,
  [Parameter(Mandatory)][string[]]$Libraries,
  [Parameter(Mandatory)][string]$OutputPath
)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem

function New-TempDir {
  $p = Join-Path $env:TEMP ('h5pgraft_' + [guid]::NewGuid().ToString('N'))
  New-Item -ItemType Directory -Force -Path $p | Out-Null
  $p
}

$work = New-TempDir
$src  = New-TempDir
[IO.Compression.ZipFile]::ExtractToDirectory((Resolve-Path $Target).Path, $work)
[IO.Compression.ZipFile]::ExtractToDirectory((Resolve-Path $Source).Path, $src)

function Get-LibDeps([string]$root, [string]$folder) {
  $lj = Join-Path $root (Join-Path $folder 'library.json')
  if (-not (Test-Path $lj)) { return @() }
  $j = Get-Content -LiteralPath $lj -Raw -Encoding UTF8 | ConvertFrom-Json
  $out = @()
  foreach ($d in @($j.preloadedDependencies)) {
    if ($d -and $d.machineName) { $out += ('{0}-{1}.{2}' -f $d.machineName, $d.majorVersion, $d.minorVersion) }
  }
  $out
}

# --- BFS : fermeture des dependances runtime ---
$needed = [ordered]@{}
$queue = New-Object System.Collections.Queue
foreach ($l in $Libraries) { [void]$queue.Enqueue($l) }
while ($queue.Count -gt 0) {
  $cur = [string]$queue.Dequeue()
  if ($needed.Contains($cur)) { continue }
  if (-not (Test-Path (Join-Path $src $cur))) { Write-Warning "Bibliotheque absente du source : $cur"; continue }
  $needed[$cur] = $true
  foreach ($d in (Get-LibDeps $src $cur)) { if (-not $needed.Contains($d)) { [void]$queue.Enqueue($d) } }
}

# --- Copie des dossiers manquants ---
$copied = 0
foreach ($f in $needed.Keys) {
  $dest = Join-Path $work $f
  if (-not (Test-Path $dest)) { Copy-Item -LiteralPath (Join-Path $src $f) -Destination $dest -Recurse -Force; $copied++ }
}

# --- h5p.json : union preloadedDependencies (lue depuis library.json = autoritaire) ---
$h5pPath = Join-Path $work 'h5p.json'
$h5p = Get-Content -LiteralPath $h5pPath -Raw -Encoding UTF8 | ConvertFrom-Json
$set = [ordered]@{}
foreach ($d in @($h5p.preloadedDependencies)) {
  if ($d -and $d.machineName) {
    $set["$($d.machineName)-$($d.majorVersion).$($d.minorVersion)"] = [pscustomobject]@{ machineName=$d.machineName; majorVersion=$d.majorVersion; minorVersion=$d.minorVersion }
  }
}
foreach ($f in $needed.Keys) {
  $lj = Join-Path $src (Join-Path $f 'library.json')
  if (-not (Test-Path $lj)) { continue }
  $j = Get-Content -LiteralPath $lj -Raw -Encoding UTF8 | ConvertFrom-Json
  $set["$($j.machineName)-$($j.majorVersion).$($j.minorVersion)"] = [pscustomobject]@{ machineName=$j.machineName; majorVersion=$j.majorVersion; minorVersion=$j.minorVersion }
}
$h5p.preloadedDependencies = @($set.Values)
$h5p.embedTypes = @($h5p.embedTypes)   # garde un tableau meme a 1 element
$json = $h5p | ConvertTo-Json -Depth 30 -Compress
[IO.File]::WriteAllText($h5pPath, $json, (New-Object Text.UTF8Encoding($false)))  # h5p.json SANS BOM

# --- Re-zip (separateurs / obligatoires pour H5P) ---
if (Test-Path $OutputPath) { [IO.File]::Delete((Resolve-Path $OutputPath).Path) }
$fs = [IO.File]::Open($OutputPath, [IO.FileMode]::Create)
$zip = New-Object IO.Compression.ZipArchive($fs, [IO.Compression.ZipArchiveMode]::Create)
$rootPath = (Resolve-Path $work).Path.TrimEnd('\') + '\'
Get-ChildItem -LiteralPath $work -Recurse -File | ForEach-Object {
  $rel = $_.FullName.Substring($rootPath.Length).Replace('\','/')
  $entry = $zip.CreateEntry($rel, [IO.Compression.CompressionLevel]::Optimal)
  $es = $entry.Open()
  $bytes = [IO.File]::ReadAllBytes($_.FullName)
  $es.Write($bytes, 0, $bytes.Length)
  $es.Close()
}
$zip.Dispose(); $fs.Dispose()

Write-Host ("Greffe OK -> {0}" -f $OutputPath)
Write-Host ("Dossiers copies : {0} | preloadedDependencies : {1}" -f $copied, $h5p.preloadedDependencies.Count)
Write-Host ('Libs runtime : ' + (($set.Keys) -join ', '))
