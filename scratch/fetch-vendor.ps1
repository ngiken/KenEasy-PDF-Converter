# Optional: re-fetch vendored JS into web/vendor (run from project root)

$ErrorActionPreference = 'Stop'
$vendor = Join-Path $PSScriptRoot '..\web\vendor'
New-Item -ItemType Directory -Force -Path $vendor | Out-Null

$files = @{
  'Sortable.min.js'        = 'https://cdn.jsdelivr.net/npm/sortablejs@1.15.6/Sortable.min.js'
  'jspdf.umd.min.js'       = 'https://cdn.jsdelivr.net/npm/jspdf@2.5.2/dist/jspdf.umd.min.js'
  'pdf-lib.min.js'         = 'https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js'
  'mammoth.browser.min.js' = 'https://cdn.jsdelivr.net/npm/mammoth@1.9.0/mammoth.browser.min.js'
  'html2canvas.min.js'     = 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js'
}

foreach ($name in $files.Keys) {
  $out = Join-Path $vendor $name
  Write-Host "GET $name"
  Invoke-WebRequest -Uri $files[$name] -OutFile $out -UseBasicParsing
  Write-Host ('  {0} bytes' -f (Get-Item $out).Length)
}

Write-Host "Done -> $vendor"
