$ErrorActionPreference = 'Stop'

$projectRoot = $PSScriptRoot
$runtimeRoot = Join-Path (Split-Path $projectRoot -Parent) '.runtime'
$runtimeConfig = Join-Path $runtimeRoot 'php.ini'

if (Test-Path -LiteralPath $runtimeConfig) {
    $env:PHPRC = $runtimeRoot
}

$phpExecutable = Get-ChildItem `
    -Path (Join-Path $env:LOCALAPPDATA 'Microsoft\WinGet\Packages\PHP.PHP.8.4_*') `
    -Filter 'php.exe' `
    -Recurse `
    -ErrorAction SilentlyContinue |
    Select-Object -First 1 -ExpandProperty FullName

if (-not $phpExecutable) {
    $phpExecutable = (Get-Command php -ErrorAction Stop).Source
}

$router = Join-Path $projectRoot 'vendor\laravel\framework\src\Illuminate\Foundation\resources\server.php'
$publicRoot = Join-Path $projectRoot 'public'

Write-Host 'CareFlow is available at http://127.0.0.1:8000' -ForegroundColor Green

Push-Location $publicRoot
try {
    & $phpExecutable -S 127.0.0.1:8000 $router
} finally {
    Pop-Location
}
