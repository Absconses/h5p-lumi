<#
.SYNOPSIS
  Fabrique le lien h5p-offline-player d'un .h5p heberge dans un depot GitHub public.
.EXAMPLE
  .\scripts\New-H5PShareLink.ps1 -Path partage\mon-module.h5p -Test
  .\scripts\New-H5PShareLink.ps1 -Path partage\ma-presentation.h5p -Narrow   # Impress / Virtual Tour
#>
param(
    [Parameter(Mandatory)] [string]$Path,
    [string]$Repo = 'Absconses/h5p-lumi',
    [string]$Branch = 'main',
    [string]$Player = 'https://h5p-offline-player.vercel.app/embed',
    [switch]$Test,
    # Types dont la hauteur suit la largeur (Impressive Presentation, Virtual Tour 360) :
    # limite la scene a 960 px, sinon elle est trop zoomee en pleine largeur
    [Alias('Impress')] [switch]$Narrow
)

$rel = ($Path -replace '\\', '/') -replace '^\./', ''
$segments = $rel.Split('/') | ForEach-Object { [Uri]::EscapeDataString($_) }
$raw = "https://raw.githubusercontent.com/$Repo/$Branch/" + ($segments -join '/')
$link = $Player + '?src=' + [Uri]::EscapeDataString($raw)
if ($Narrow) {
    # jsDelivr sert le CSS en text/css ; l'URL raw (text/plain + nosniff) est refusee par le navigateur
    $css = "https://cdn.jsdelivr.net/gh/$Repo@$Branch/partage/embed-960.css"
    $link += '&custom-css=' + [Uri]::EscapeDataString($css)
}

if ($Test) {
    try {
        $r = Invoke-WebRequest -Uri $raw -Method Head -UseBasicParsing
        $cors = $r.Headers['Access-Control-Allow-Origin']
        Write-Host "OK $($r.StatusCode), CORS: $cors, taille: $($r.Headers['Content-Length']) octets"
    } catch {
        Write-Warning "Le fichier ne repond pas ($raw). Depot public ? Fichier pousse sur '$Branch' ?"
    }
}

Write-Host "URL brute : $raw"
Write-Host "Lien eleves : $link"
$link
