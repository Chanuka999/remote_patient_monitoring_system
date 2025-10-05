<#
Start-all.ps1

Opens three PowerShell windows and starts:
- Python FastAPI (uvicorn) from the project root venv
- Node server (server/npm run dev)
- React dev server (client/npm run dev)

Usage: run this script from the project root PowerShell with: .\start-all.ps1

Make sure you have created the venv and installed requirements in `ml/requirements.txt` before running.
#>

$root = Split-Path -Parent $MyInvocation.MyCommand.Definition

Write-Host "Starting ML API (uvicorn) in new window..."
Start-Process -FilePath powershell -ArgumentList @(
  '-NoExit',
  '-Command',
  "Set-Location -Path '$root'; if (Test-Path '.\\.venv\\Scripts\\Activate.ps1') { .\\.venv\\Scripts\\Activate.ps1 } ; uvicorn ml.app:app --host 127.0.0.1 --port 8000 --reload"
)

Start-Sleep -Milliseconds 500

Write-Host "Starting Node server (server) in new window..."
Start-Process -FilePath powershell -ArgumentList @(
  '-NoExit',
  '-Command',
  "Set-Location -Path '$root\\server'; npm run dev"
)

Start-Sleep -Milliseconds 500

Write-Host "Starting React dev server (client) in new window..."
Start-Process -FilePath powershell -ArgumentList @(
  '-NoExit',
  '-Command',
  "Set-Location -Path '$root\\client'; npm run dev"
)

Write-Host "All processes started (watch the new windows)." -ForegroundColor Green
