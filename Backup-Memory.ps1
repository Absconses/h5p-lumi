<#
.SYNOPSIS
  Copie la mémoire VIVANTE de ce PC (le dossier projet de Claude Code) vers _memory/ du
  dépôt, pour pouvoir la committer/pusher. À lancer avant un commit si la mémoire a évolué.
.PARAMETER WorkingDir
  Le dossier de travail depuis lequel tu lances Claude Code (détermine la « clé » projet).
  Par défaut : %USERPROFILE%\Desktop\Claude\Sessions.
#>
param([string]$WorkingDir = (Join-Path $env:USERPROFILE 'Desktop\Claude\Sessions'))
$ErrorActionPreference = 'Stop'

$key = ($WorkingDir -replace '[:\\/]', '-')
$live = Join-Path $env:USERPROFILE (".claude\projects\$key\memory")
if (-not (Test-Path $live)) { throw "Mémoire vivante introuvable : $live" }

$dest = Join-Path $PSScriptRoot '_memory'
New-Item -ItemType Directory -Force -Path $dest | Out-Null
Copy-Item (Join-Path $live '*.md') $dest -Force

Write-Host "Mémoire vivante copiée dans le dépôt (_memory)."
Write-Host "Étape suivante :  git add -A ; git commit -m 'maj mémoire' ; git push"
