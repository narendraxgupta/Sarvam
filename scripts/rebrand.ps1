# One-shot rebrand: Sanskrit/Hindi-derived names + Indian-themed color
# tokens get renamed to neutral English brand. Run from project root.

$ErrorActionPreference = "Stop"

# Order matters: replace longest/most-specific tokens BEFORE shorter
# ones so we don't double-rewrite a previous substitution.
$rules = @(
    # ---- model identifiers (longest first) ----
    @{ from = "Sarvam-M";       to = "Helix-M" }
    @{ from = "Sarvam-1";       to = "Helix-1" }
    @{ from = "sarvam-m";       to = "helix-m" }
    @{ from = "sarvam-1";       to = "helix-1" }
    @{ from = "saaras-v2";      to = "echo-v2" }
    @{ from = "Saaras v2";      to = "Echo v2" }
    @{ from = "Saaras";         to = "Echo" }
    @{ from = "saaras";         to = "echo" }
    @{ from = "mayura-translate"; to = "lyra-translate" }
    @{ from = "Mayura";         to = "Lyra" }
    @{ from = "mayura";         to = "lyra" }
    # ---- emails ----
    @{ from = "@sarvam.ai";     to = "@helix.ai" }
    @{ from = "@pravaah.ai";    to = "@helix.ai" }
    # ---- company / product name ----
    @{ from = "Sarvam AI";      to = "Helix AI" }
    @{ from = "Sarvam";         to = "Helix" }
    @{ from = "sarvam";         to = "helix" }
    # ---- product name ----
    @{ from = "Pravaah";        to = "Helix" }
    @{ from = "pravaah-";       to = "hx-" }
    @{ from = "pravaah";        to = "helix" }
    # ---- color tokens ----
    @{ from = "saffron";        to = "amber" }
    @{ from = "Saffron";        to = "Amber" }
    @{ from = "peacock";        to = "azure" }
    @{ from = "Peacock";        to = "Azure" }
)

$roots = @("src", "docs", "scripts")
$rootFiles = @(
    "README.md",
    "index.html",
    "package.json",
    "tailwind.config.ts",
    "LICENSE"
)

$exts = @("*.ts","*.tsx","*.js","*.jsx","*.css","*.md","*.html","*.json","*.svg")

$files = @()
foreach ($r in $roots) {
    if (Test-Path $r) {
        foreach ($e in $exts) {
            $files += Get-ChildItem -Path $r -Filter $e -Recurse -File |
                ForEach-Object { $_.FullName }
        }
    }
}
foreach ($f in $rootFiles) {
    if (Test-Path $f) { $files += (Resolve-Path $f).Path }
}

$files = $files | Sort-Object -Unique

$changedCount = 0
foreach ($file in $files) {
    $orig = Get-Content -Path $file -Raw -Encoding UTF8
    if ($null -eq $orig) { continue }
    $new = $orig
    foreach ($rule in $rules) {
        $new = $new.Replace($rule.from, $rule.to)
    }
    if ($new -ne $orig) {
        # Preserve UTF-8 without BOM (which is what these files already use).
        $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
        [System.IO.File]::WriteAllText($file, $new, $utf8NoBom)
        $changedCount += 1
        Write-Host "  rewrote $file"
    }
}

Write-Host ""
Write-Host "Rebrand complete: $changedCount files modified."
