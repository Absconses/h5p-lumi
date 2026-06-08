<#
.SYNOPSIS
  Déploie l'instantané de mémoire (_memory/*.md) de ce dépôt vers le dossier projet de
  Claude Code sur CE PC, pour que la mémoire soit chargée automatiquement.
.PARAMETER WorkingDir
  Le dossier de travail depuis lequel tu lances Claude Code (détermine la « clé » projet).
  Par défaut : %USERPROFILE%\Desktop\Claude\Sessions.
.EXAMPLE
  .\Deploy-Memory.ps1
  .\Deploy-Memory.ps1 -WorkingDir "D:\Cours\Claude"
#>
param([string]$WorkingDir = (Join-Path $env:USERPROFILE 'Desktop\Claude\Sessions'))
$ErrorActionPreference = 'Stop'

$src = Join-Path $PSScriptRoot '_memory'
if (-not (Test-Path $src)) { throw "Dossier _memory introuvable dans le dépôt." }

# Clé projet = chemin avec ':' et '\' remplacés par '-' (convention Claude Code)
$key = ($WorkingDir -replace '[:\\/]', '-')
$dest = Join-Path $env:USERPROFILE (".claude\projects\$key\memory")
New-Item -ItemType Directory -Force -Path $dest | Out-Null

# Sauvegarde de l'existant (.bak, ignoré par git)
Get-ChildItem -Path $dest -Filter *.md -ErrorAction SilentlyContinue | ForEach-Object {
  Copy-Item $_.FullName ($_.FullName + '.bak') -Force
}
Copy-Item (Join-Path $src '*.md') $dest -Force

Write-Host "Mémoire déployée vers : $dest"
Write-Host "Lance Claude Code depuis : $WorkingDir"
