<#
.SYNOPSIS
  Fabrique le lien h5p-offline-player d'un .h5p heberge dans un depot GitHub public.
.EXAMPLE
  .\scripts\New-H5PShareLink.ps1 -Path partage\mon-module.h5p -Test
  .\scripts\New-H5PShareLink.ps1 -Path partage\ma-presentation.h5p -Impress
#>
param(
    [Parameter(Mandatory)] [string]$Path,
    [string]$Repo = 'Absconses/h5p-lumi',
    [string]$Branch = 'main',
    [string]$Player = 'https://h5p-offline-player.vercel.app/embed',
    [switch]$Test,
    # Impressive Presentation : limite la scene a 960 px (sinon trop zoomee en pleine largeur)
    [switch]$Impress
)

$rel = ($Path -replace '\\', '/') -replace '^\./', ''
$segments = $rel.Split('/') | ForEach-Object { [Uri]::EscapeDataString($_) }
$raw = "https://raw.githubusercontent.com/$Repo/$Branch/" + ($segments -join '/')
$link = $Player + '?src=' + [Uri]::EscapeDataString($raw)
if ($Impress) {
    # jsDelivr sert le CSS en text/css ; l'URL raw (text/plain + nosniff) est refusee par le navigateur
    $css = "https://cdn.jsdelivr.net/gh/$Repo@$Branch/partage/impress-embed.css"
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
