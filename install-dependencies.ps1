# InfraHub - Automatic Dependency Installation Script
# Run as Administrator

Write-Host "╔════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  InfraHub - Dependency Installation Script        ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Check if running as Admin
$isAdmin = [bool]([System.Security.Principal.WindowsIdentity]::GetCurrent().Groups -match 'S-1-5-32-544')
if (-not $isAdmin) {
    Write-Host "⚠️  This script requires Administrator privileges!" -ForegroundColor Yellow
    Write-Host "Please run PowerShell as Administrator and try again." -ForegroundColor Yellow
    exit
}

Write-Host "✓ Running as Administrator" -ForegroundColor Green
Write-Host ""

# Check Node.js
Write-Host "Checking Node.js..." -ForegroundColor Yellow
$nodeVersion = node --version 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Node.js already installed: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "Installing Node.js..." -ForegroundColor Cyan
    winget install -e --id OpenJS.NodeJS --accept-package-agreements --accept-source-agreements
    Write-Host "✓ Node.js installed" -ForegroundColor Green
}

Write-Host ""

# Check Python
Write-Host "Checking Python..." -ForegroundColor Yellow
$pythonVersion = python --version 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Python already installed: $pythonVersion" -ForegroundColor Green
} else {
    Write-Host "Installing Python 3.12..." -ForegroundColor Cyan
    winget install -e --id Python.Python.3.12 --accept-package-agreements --accept-source-agreements
    Write-Host "✓ Python installed" -ForegroundColor Green
}

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Installation Complete!                           ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Green
Write-Host "1. Close and reopen PowerShell (important!)" -ForegroundColor Cyan
Write-Host "2. Run: cd 'c:\Users\PrachiYash(IdentiqaL\Desktop\Website\backend'" -ForegroundColor Cyan
Write-Host "3. Run: python -m venv venv" -ForegroundColor Cyan
Write-Host "4. Run: venv\Scripts\activate" -ForegroundColor Cyan
Write-Host "5. Run: pip install -r requirements.txt" -ForegroundColor Cyan
Write-Host "6. Run: flask --app app init-db && flask --app app seed-db" -ForegroundColor Cyan
Write-Host "7. Run: python run.py" -ForegroundColor Cyan
Write-Host ""
Write-Host "In a NEW PowerShell window:" -ForegroundColor Green
Write-Host "1. Run: cd 'c:\Users\PrachiYash(IdentiqaL\Desktop\Website\frontend'" -ForegroundColor Cyan
Write-Host "2. Run: npm install" -ForegroundColor Cyan
Write-Host "3. Run: npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "Then open: http://localhost:5173" -ForegroundColor Green
Write-Host ""
