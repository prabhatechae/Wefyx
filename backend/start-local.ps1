$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot
$bundledMaven = Join-Path $PSScriptRoot '..\.tools\apache-maven-3.9.9\bin\mvn.cmd'
$maven = if (Test-Path -LiteralPath $bundledMaven) { $bundledMaven } else { (Get-Command mvn.cmd -ErrorAction Stop).Source }
if ($env:DATABASE_URL -and -not $env:DATABASE_URL.StartsWith("jdbc:")) {
    $env:DATABASE_URL = $null
}
# Uses application.yml and the caller's environment, including the persistent
# local database. Keep this process running while using the Vite frontend.
& $maven '-q' 'spring-boot:run'
exit $LASTEXITCODE

