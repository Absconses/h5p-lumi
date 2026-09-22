<#
.SYNOPSIS
    Recherche de vraies images libres de droits sur Wikimedia Commons et renvoie,
    pour chacune, l'URL directe + la licence (et, en option, une validation HTTP 200).

.DESCRIPTION
    Interroge l'API publique de Wikimedia Commons (generator=search dans l'espace
    de noms Fichier) pour ne JAMAIS inventer d'URL : on ne propose que des images
    qui existent réellement et dont la licence est connue.

    À utiliser avant de remplir les champs "asset" / "media" d'un contenu H5P.

.PARAMETER Query
    Un ou plusieurs termes de recherche (ex: "Tim Berners-Lee", "ARPANET map").
    Donne des termes en ANGLAIS de préférence : Commons est surtout indexé en anglais.

.PARAMETER Limit
    Nombre de candidats par terme (défaut : 3).

.PARAMETER Validate
    Si présent, teste chaque URL en HTTP HEAD et n'affiche que les images répondant 200.

.PARAMETER Json
    Si présent, renvoie le résultat en JSON (pour un usage programmatique).

.EXAMPLE
    .\Find-WikimediaImages.ps1 -Query "Tim Berners-Lee","ARPANET logical map" -Validate

.EXAMPLE
    .\Find-WikimediaImages.ps1 -Query "Gutenberg printing press" -Limit 5 -Json
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string[]] $Query,
    [int]      $Limit = 3,
    [switch]   $Validate,
    [switch]   $Json
)

$ErrorActionPreference = 'Stop'
# PowerShell 5.1 negocie TLS 1.0 par defaut : Wikimedia refuse.
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$ua = @{ "User-Agent" = "ClaudeCode-H5P-Skill/1.0 (educational content; contact: teacher)" }
# Extensions d'images réellement affichables dans H5P / un navigateur.
# Commons ajoute desormais '?utm_source=...' a iiprop=url : le test doit ignorer la query string.
$okExt = '\.(jpg|jpeg|png|gif|svg|webp)(\?|$)'

function Clean-Html([string]$s) {
    if (-not $s) { return "" }
    return (($s -replace '<[^>]+>', '') -replace '\s+', ' ').Trim()
}

$results = New-Object System.Collections.Generic.List[object]

foreach ($term in $Query) {
    $enc = [uri]::EscapeDataString($term)
    $api = "https://commons.wikimedia.org/w/api.php?action=query&generator=search" +
           "&gsrsearch=$enc&gsrnamespace=6&gsrlimit=$Limit" +
           "&prop=imageinfo&iiprop=url%7Cextmetadata&format=json"   # %7C : un '|' brut fait renvoyer imageinfo vide
    try {
        $r = Invoke-RestMethod -Uri $api -Headers $ua -TimeoutSec 25
    } catch {
        Write-Warning "Recherche échouée pour '$term' : $($_.Exception.Message)"
        continue
    }
    if (-not $r.query.pages) { Write-Warning "Aucun résultat pour '$term'."; continue }

    foreach ($p in ($r.query.pages.PSObject.Properties.Value | Sort-Object index)) {
        $ii = $p.imageinfo[0]
        if (-not $ii) { continue }
        if ($ii.url -notmatch $okExt) { continue }   # écarte PDF, etc.

        $status = $null
        if ($Validate) {
            try {
                $resp = Invoke-WebRequest -Uri $ii.url -Method Head -Headers $ua -TimeoutSec 20
                $status = [int]$resp.StatusCode
            } catch {
                # 429 = limite de débit (l'image existe quand même) ; on réessaie une fois.
                Start-Sleep -Milliseconds 1200
                try { $status = [int](Invoke-WebRequest -Uri $ii.url -Method Head -Headers $ua -TimeoutSec 20).StatusCode }
                catch { $status = -1 }
            }
            Start-Sleep -Milliseconds 400   # politesse anti-429
            if ($status -ne 200) { continue }
        }

        $results.Add([pscustomobject]@{
            query          = $term
            title          = $p.title
            url            = $ii.url
            license        = Clean-Html $ii.extmetadata.LicenseShortName.value
            artist         = Clean-Html $ii.extmetadata.Artist.value
            descriptionUrl = $ii.descriptionurl
            httpStatus     = $status
        })
    }
}

if ($Json) {
    $results | ConvertTo-Json -Depth 5
} else {
    if ($results.Count -eq 0) { Write-Output "Aucune image exploitable trouvée."; return }
    foreach ($x in $results) {
        Write-Output ("• {0}" -f $x.title)
        Write-Output ("    url     : {0}" -f $x.url)
        Write-Output ("    licence : {0}" -f $x.license)
        if ($x.artist)  { Write-Output ("    auteur  : {0}" -f $x.artist) }
        if ($Validate)  { Write-Output ("    http    : {0}" -f $x.httpStatus) }
        Write-Output ""
    }
    Write-Output ("{0} image(s) trouvée(s)." -f $results.Count)
}
