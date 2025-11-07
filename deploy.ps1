# KasiRent Deployment Script
# Run this to prepare for deployment

Write-Host "🚀 KasiRent Deployment Preparation" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

# Navigate to client directory
Set-Location -Path "client"

Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

Write-Host "🔨 Building for production..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📁 Your built files are in: client/dist" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "🌐 Next steps for Netlify deployment:" -ForegroundColor Cyan
    Write-Host "1. Go to https://netlify.com" -ForegroundColor White
    Write-Host "2. Drag and drop the 'client/dist' folder to deploy" -ForegroundColor White
    Write-Host "3. Set environment variables:" -ForegroundColor White
    Write-Host "   - VITE_SUPABASE_URL" -ForegroundColor Gray
    Write-Host "   - VITE_SUPABASE_PUBLISHABLE_KEY" -ForegroundColor Gray
    Write-Host ""
    Write-Host "📖 See DEPLOYMENT.md for detailed instructions" -ForegroundColor Cyan
} else {
    Write-Host "❌ Build failed! Check the errors above." -ForegroundColor Red
}