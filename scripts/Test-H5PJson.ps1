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
    flashcards, crossword, findthewords, generic (défaut).

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
                 'questionnaire','chart','generic')]
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
