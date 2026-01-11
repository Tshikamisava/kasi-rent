# Check Users Table PowerShell Script
# This script runs the check-users-table.js utility to verify the users table structure

Write-Host "🔍 Checking Users Table Structure" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to server directory
$serverPath = Join-Path $PSScriptRoot "server"
Set-Location -Path $serverPath

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
    Write-Host ""
}

# Run the check script
Write-Host "Running check-users-table.js..." -ForegroundColor Yellow
Write-Host ""
node check-users-table.js

# Return to original directory
Set-Location -Path $PSScriptRoot
