param($Path, $Content)
Set-Content -LiteralPath $Path -Value $Content -Encoding UTF8
Write-Host "Wrote $($Content.Length) chars to $Path"