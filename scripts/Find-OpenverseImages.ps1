<#
.SYNOPSIS
    Recherche de vraies images sous licence ouverte via Openverse (Flickr, Wikimedia,
    musées…) et renvoie, pour chacune, l'URL directe, la licence et la mention de crédit.

.DESCRIPTION
    Interroge l'API publique d'Openverse (https://api.openverse.org/v1/images/), sans clé.
    Comme Find-WikimediaImages.ps1, ce script sert à ne JAMAIS inventer d'URL : on ne
    propose que des images qui existent réellement et dont la licence est connue.

    Par défaut, seules les licences compatibles avec un module vendu et retouché sont
    gardées : cc0, pdm (domaine public), by, by-sa. Les licences NC (pas d'usage
    commercial) et ND (pas de modification) sont écartées.

    Voir references/banques-images.md pour les règles de licence, de crédit et de
    non-réutilisation d'une image d'un module à l'autre.

.PARAMETER Query
    Un ou plusieurs termes de recherche. L'anglais donne plus de résultats.

.PARAMETER Limit
    Nombre de candidats par terme (défaut : 5 ; 20 au plus sans clé).

.PARAMETER License
    Licences acceptées, séparées par des virgules (défaut : "cc0,pdm,by,by-sa").

.PARAMETER Source
    Limiter à une ou plusieurs sources Openverse (ex : "flickr", "wikimedia").

.PARAMETER Registre
    Chemin d'un images-utilisees.json produit par registre-images.py : les images dont
    le crédit y figure déjà sont écartées, pour ne pas reprendre une image d'un autre module.

.PARAMETER Validate
    Si présent, teste chaque URL en HTTP HEAD et n'affiche que les images répondant 200.

.PARAMETER Json
    Si présent, renvoie le résultat en JSON (pour un usage programmatique).

.EXAMPLE
    .\Find-OpenverseImages.ps1 -Query "school newspaper","radio studio" -Validate

.EXAMPLE
    .\Find-OpenverseImages.ps1 -Query "newsstand" -Source flickr -Registre .\modules\images-utilisees.json -Json
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string[]] $Query,
    [int]      $Limit = 5,
    [string]   $License = "cc0,pdm,by,by-sa",
    [string]   $Source,
    [string]   $Registre,
    [switch]   $Validate,
    [switch]   $Json
)

$ErrorActionPreference = 'Stop'
# PowerShell 5.1 negocie TLS 1.0 par defaut : la plupart des API le refusent.
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$ua = @{ "User-Agent" = "ClaudeCode-H5P-Skill/1.0 (educational content; contact: teacher)" }
$okExt = '^(jpg|jpeg|png|gif|svg|webp)$'
if ($Limit -gt 20) { $Limit = 20 }   # plafond des requetes sans cle

# Credits deja utilises dans d'autres modules (registre-images.py --ecrire).
$dejaPris = @()
if ($Registre) {
    if (-not (Test-Path $Registre)) { throw "Registre introuvable : $Registre" }
    $reg = Get-Content -Raw -Encoding UTF8 $Registre | ConvertFrom-Json
    $dejaPris = @($reg.credits | ForEach-Object { $_.credit.ToLowerInvariant() })
}

function Get-NomLicence([string]$code, [string]$version) {
    switch ($code) {
        'cc0'   { return 'CC0' }
        'pdm'   { return 'domaine public' }
        default { return ("CC {0} {1}" -f $code.ToUpperInvariant(), $version).Trim() }
    }
}

$results = New-Object System.Collections.Generic.List[object]

foreach ($term in $Query) {
    $api = "https://api.openverse.org/v1/images/?q=" + [uri]::EscapeDataString($term) +
           "&license=" + [uri]::EscapeDataString($License) +
           "&page_size=$Limit&mature=false"
    if ($Source) { $api += "&source=" + [uri]::EscapeDataString($Source) }
    try {
        $r = Invoke-RestMethod -Uri $api -Headers $ua -TimeoutSec 25
    } catch {
        # 429 = limite de debit des requetes sans cle : attendre avant de relancer.
        Write-Warning "Recherche échouée pour '$term' : $($_.Exception.Message)"
        continue
    }
    if (-not $r.results -or $r.results.Count -eq 0) { Write-Warning "Aucun résultat pour '$term'."; continue }

    foreach ($x in $r.results) {
        if (-not $x.url) { continue }
        if ($x.filetype -and ($x.filetype -notmatch $okExt)) { continue }

        $auteur  = if ($x.creator) { [string]$x.creator } else { "auteur inconnu" }
        $licence = Get-NomLicence ([string]$x.license) ([string]$x.license_version)
        $titre   = if ($x.title) { [string]$x.title } else { "sans titre" }
        $credit  = "« {0} », {1}, {2}, {3}." -f $titre, $auteur, $x.source, $licence

        # Ecarte une image dont l'auteur ET le titre figurent deja dans un credit du registre.
        $pris = $false
        foreach ($c in $dejaPris) {
            if ($c.Contains($auteur.ToLowerInvariant()) -and $c.Contains($titre.ToLowerInvariant())) { $pris = $true; break }
        }
        if ($pris) { continue }

        $status = $null
        if ($Validate) {
            try {
                $status = [int](Invoke-WebRequest -Uri $x.url -Method Head -Headers $ua -TimeoutSec 20 -UseBasicParsing).StatusCode
            } catch { $status = -1 }
            Start-Sleep -Milliseconds 400   # politesse anti-429
            if ($status -ne 200) { continue }
        }

        $results.Add([pscustomobject]@{
            query      = $term
            title      = $titre
            url        = $x.url
            license    = $licence
            licenseUrl = $x.license_url
            artist     = $auteur
            source     = $x.source
            pageUrl    = $x.foreign_landing_url
            credit     = $credit
            width      = $x.width
            height     = $x.height
            httpStatus = $status
        })
    }
    Start-Sleep -Milliseconds 800   # les requetes sans cle sont limitees
}

if ($Json) {
    $results | ConvertTo-Json -Depth 5
} else {
    if ($results.Count -eq 0) { Write-Output "Aucune image exploitable trouvée."; return }
    foreach ($x in $results) {
        Write-Output ("• {0}" -f $x.title)
        Write-Output ("    url     : {0}" -f $x.url)
        Write-Output ("    page    : {0}" -f $x.pageUrl)
        Write-Output ("    licence : {0}" -f $x.license)
        Write-Output ("    crédit  : {0}" -f $x.credit)
        if ($Validate) { Write-Output ("    http    : {0}" -f $x.httpStatus) }
        Write-Output ""
    }
    Write-Output ("{0} image(s) trouvée(s)." -f $results.Count)
}
