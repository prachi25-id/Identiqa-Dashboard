Write-Host "Starting InfraHub Backend and Frontend..." -ForegroundColor Cyan
$root = Split-Path -Parent $MyInvocation.MyCommand.Path

Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root\backend'; .\venv\Scripts\python.exe run.py"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root\frontend'; npm.cmd run dev -- --host 0.0.0.0 --port 8501"

Write-Host "Servers launched!" -ForegroundColor Green
Write-Host "Frontend: http://localhost:8501 or http://192.168.1.108:8501" -ForegroundColor Yellow
Write-Host "Backend:  http://localhost:5000 or http://192.168.1.108:5000" -ForegroundColor Yellow
