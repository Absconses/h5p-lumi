<#
.SYNOPSIS
    Valide un fichier content.json H5P : syntaxe + règles propres au type de contenu.

.DESCRIPTION
    Un JSON invalide ou incomplet produit un .h5p que Lumi refuse d'importer (ou qui
    s'affiche vide). Ce script attrape ces problèmes AVANT l'empaquetage.

    Validation générique (tous types) : le JSON parse sans erreur.
    Validation spécifique (selon -Type) : présence des champs requis, formats, mini-quotas.

.PARAMETER Path
    Chemin du fichier JSON à valider.

.PARAMETER Type
    Type de contenu. Valeurs : timeline, multichoice, questionset, truefalse,
    singlechoiceset, blanks, markthewords, dragtext, summary, accordion, dialogcards,
    flashcards, crossword, findthewords, impress, generic (défaut).

.PARAMETER MinEvents / MinEras
    (timeline uniquement) quotas minimaux.

.EXAMPLE
    .\Test-H5PJson.ps1 -Path .\content.json -Type timeline -MinEvents 5 -MinEras 2
.EXAMPLE
    .\Test-H5PJson.ps1 -Path .\content.json -Type dialogcards
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)] [string] $Path,
    [ValidateSet('timeline','multichoice','questionset','truefalse','singlechoiceset',
                 'blanks','markthewords','dragtext','summary','accordion','dialogcards',
                 'flashcards','crossword','findthewords','essay','sortparagraphs',
                 'questionnaire','chart','impress','generic')]
    [string] $Type = 'generic',
    [int] $MinEvents = 5,
    [int] $MinEras = 2
)

$ErrorActionPreference = 'Stop'
$problems = New-Object System.Collections.Generic.List[string]
$ok       = New-Object System.Collections.Generic.List[string]

# --- 1) Syntaxe ---
if (-not (Test-Path $Path)) { Write-Output "❌ Fichier introuvable : $Path"; exit 1 }
try {
    $raw = Get-Content $Path -Raw -Encoding UTF8
    $o   = $raw | ConvertFrom-Json
    $ok.Add("JSON syntaxiquement valide (parse réussi)")
} catch {
    Write-Output "❌ JSON INVALIDE : $($_.Exception.Message)"
    exit 1
}

$dateRegex = '^\d{4}(,\d{1,2},\d{1,2})?$'

function Need-Key($obj, $key, $asList) {
    if ($obj.PSObject.Properties.Name -notcontains $key) { return "clé '$key' manquante." }
    if ($asList -and @($obj.$key).Count -lt 1) { return "'$key' est vide." }
    return $null
}

switch ($Type) {
    'timeline' {
        $tl = $o.timeline
        if (-not $tl) { $problems.Add("Clé racine 'timeline' absente.") }
        else {
            if (-not $tl.headline) { $problems.Add("'headline' (titre) manquant.") } else { $ok.Add("Titre présent") }
            $nbDate = @($tl.date).Count; $nbEra = @($tl.era).Count
            if ($nbDate -lt $MinEvents) { $problems.Add("Seulement $nbDate événement(s) (min : $MinEvents).") } else { $ok.Add("$nbDate événements (>= $MinEvents)") }
            if ($nbEra  -lt $MinEras)   { $problems.Add("Seulement $nbEra période(s) (min : $MinEras).") }   else { $ok.Add("$nbEra périodes (>= $MinEras)") }
            $i = 0
            foreach ($d in @($tl.date)) {
                $i++
                if (-not $d.startDate) { $problems.Add("Événement $i : 'startDate' manquant.") }
                elseif ($d.startDate -notmatch $dateRegex) { $problems.Add("Événement $i : startDate '$($d.startDate)' au mauvais format (YYYY ou YYYY,MM,DD).") }
                if (-not $d.headline) { $problems.Add("Événement $i : 'headline' manquant.") }
                if ($d.asset.media -and $d.asset.media -notmatch '^https?://') { $problems.Add("Événement $i : asset.media n'est pas une URL http(s).") }
            }
            $j = 0
            foreach ($e in @($tl.era)) {
                $j++
                if ($e.startDate -notmatch $dateRegex) { $problems.Add("Période $j : startDate au mauvais format.") }
                if ($e.endDate -and $e.endDate -notmatch $dateRegex) { $problems.Add("Période $j : endDate au mauvais format.") }
            }
            if ($tl.asset.media -and $tl.asset.media -notmatch '^https?://') { $problems.Add("Couverture : media n'est pas une URL http(s).") }
        }
    }
    'impress' {
        $vg = $o.viewsGroup
        if (-not $vg) { $problems.Add("Clé racine 'viewsGroup' absente.") }
        else {
            if ($vg.perspectiveRatio -isnot [double] -and $vg.perspectiveRatio -isnot [int] -and $vg.perspectiveRatio -isnot [long] -and $vg.perspectiveRatio -isnot [decimal]) { $problems.Add("'perspectiveRatio' doit être un nombre.") }
            $views = @($vg.views)
            if ($views.Count -lt 1) { $problems.Add("'views' est vide.") } else { $ok.Add("$($views.Count) vues") }
            $ids = @{}; $nbPath = 0; $i = 0; $prevId = -1
            $allowed = 'H5P.AdvancedText 1.1','H5P.MarkTheWords 1.5','H5P.SingleChoiceSet 1.3','H5P.Blanks 1.4'
            foreach ($v in $views) {
                $i++
                $n = "Vue $i ($($v.ordering.userDefinedName))"
                $id = $v.ordering.uniqueId
                if ($null -eq $id -or "$id" -notmatch '^\d+$') { $problems.Add("$n : 'ordering.uniqueId' entier manquant.") }
                elseif ($ids.ContainsKey("$id")) { $problems.Add("$n : uniqueId $id en double.") }
                else {
                    $ids["$id"] = $true
                    # la bibliothèque renumérote toute vue dont l'id n'est pas > au précédent -> route cassée
                    if ([int]$id -le $prevId) { $problems.Add("$n : uniqueId $id doit être strictement croissant dans l'ordre des vues (précédent : $prevId).") }
                    $prevId = [int]$id
                }
                if ($v.ordering.includeInPath -eq $true) { $nbPath++ }
                foreach ($k in 'x','y','z','rotateX','rotateY','rotateZ') {
                    if ($v.positioning.PSObject.Properties.Name -notcontains $k) { $problems.Add("$n : positioning.$k manquant.") }
                }
                $b = $v.backgroundGroup
                if (-not ($b.backgroundWidth -gt 0 -and $b.backgroundHeight -gt 0)) { $problems.Add("$n : backgroundWidth/Height > 0 requis.") }
                if ("$($b.backgroundColor)" -match '^#') { $problems.Add("$n : backgroundColor doit être sans '#'.") }
                if ($b.PSObject.Properties.Name -contains 'backgroundImage' -and -not $b.backgroundImage.path) { $problems.Add("$n : backgroundImage vide (omettre la clé).") }
                if ($v.action -and -not ($v.action.library -and $v.action.params)) { $problems.Add("$n : 'action' sans library/params.") }
                elseif ($v.action -and $allowed -notcontains $v.action.library) { $problems.Add("$n : '$($v.action.library)' non autorisé dans une vue ($($allowed -join ', ')).") }
            }
            if ($nbPath -lt 1) { $problems.Add("Aucune vue dans le parcours (includeInPath).") } else { $ok.Add("$nbPath étape(s) dans le parcours") }
            foreach ($r in @($vg.route)) {
                if ("$r" -notmatch '^#h5p-impress-id-(\d+)$') { $problems.Add("route : '$r' au mauvais format.") }
                elseif (-not $ids.ContainsKey($Matches[1])) { $problems.Add("route : '$r' ne correspond à aucune vue.") }
            }
        }
    }
    'multichoice' {
        if (-not $o.question) { $problems.Add("'question' manquante.") } else { $ok.Add("Question présente") }
        $ans = @($o.answers)
        if ($ans.Count -lt 1) { $problems.Add("Aucune réponse ('answers' vide).") } else { $ok.Add("$($ans.Count) réponses") }
        $correct = @($ans | Where-Object { $_.correct -eq $true }).Count
        if ($correct -lt 1) { $problems.Add("Aucune réponse correcte (au moins une 'correct': true requise).") } else { $ok.Add("$correct réponse(s) correcte(s)") }
    }
    default {
        $req = @{
            'questionset'     = @{ questions = $true }
            'truefalse'       = @{ question = $false; correct = $false }
            'singlechoiceset' = @{ choices = $true }
            'blanks'          = @{ questions = $true }
            'markthewords'    = @{ taskDescription = $false; textField = $false }
            'dragtext'        = @{ taskDescription = $false; textField = $false }
            'summary'         = @{ summaries = $true }
            'accordion'       = @{ panels = $true }
            'dialogcards'     = @{ dialogs = $true }
            'flashcards'      = @{ cards = $true }
            'crossword'       = @{ words = $true }
            'findthewords'    = @{ taskDescription = $false; wordList = $false }
            'essay'           = @{ taskDescription = $false; keywords = $true }
            'sortparagraphs'  = @{ taskDescription = $false; paragraphs = $true }
            'questionnaire'   = @{ questionnaireElements = $true }
            'chart'           = @{ graphMode = $false; listOfTypes = $true }
        }
        if ($Type -eq 'generic') {
            $ok.Add("Validation générique uniquement (syntaxe). Précise -Type pour des contrôles métier.")
        } elseif ($req.ContainsKey($Type)) {
            foreach ($k in $req[$Type].Keys) {
                $msg = Need-Key $o $k $req[$Type][$k]
                if ($msg) { $problems.Add($msg) } else { $ok.Add("'$k' présent") }
            }
            switch ($Type) {
                'truefalse'       { if ($o.correct -and @('true','false') -notcontains "$($o.correct)") { $problems.Add("'correct' doit valoir `"true`" ou `"false`".") } }
                'singlechoiceset' { foreach ($c in @($o.choices)) { if (@($c.answers).Count -lt 2) { $problems.Add("Une question a moins de 2 réponses."); break } } }
                'crossword'       { if (@($o.words).Count -lt 2) { $problems.Add("Mets au moins 2 mots.") } }
                'questionset'     { foreach ($q in @($o.questions)) { if (-not $q.library) { $problems.Add("Une question du Quiz n'a pas de 'library'."); break } } }
                'blanks'          { if ($raw -notmatch '\*[^*]+\*') { $problems.Add("Aucun trou *…* détecté.") } }
                'markthewords'    { if ($o.textField -and $o.textField -notmatch '\*[^*]+\*') { $problems.Add("Aucun mot *…* à cliquer détecté.") } }
                'dragtext'        { if ($o.textField -and $o.textField -notmatch '\*[^*]+\*') { $problems.Add("Aucun mot *…* à glisser détecté.") } }
                'chart'           { if ($o.graphMode -and @('pieChart','barChart') -notcontains "$($o.graphMode)") { $problems.Add("graphMode doit valoir 'pieChart' ou 'barChart'.") } }
                'sortparagraphs'  { if (@($o.paragraphs).Count -lt 2) { $problems.Add("Mets au moins 2 paragraphes.") } }
            }
        }
    }
}

# --- 3) Rapport ---
Write-Output "===== Validation H5P ($Type) : $Path ====="
foreach ($m in $ok)       { Write-Output "  ✅ $m" }
foreach ($p in $problems) { Write-Output "  ❌ $p" }
Write-Output ""
if ($problems.Count -eq 0) {
    Write-Output "RÉSULTAT : ✅ VALIDE — prêt pour l'empaquetage."
    exit 0
} else {
    Write-Output ("RÉSULTAT : ❌ {0} problème(s) à corriger." -f $problems.Count)
    exit 1
}
