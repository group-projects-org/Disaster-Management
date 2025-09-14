# Disaster Management Server Startup Script
Write-Host "🚀 Starting Disaster Management Server..." -ForegroundColor Green
Write-Host ""

# Check if Python is available
try {
    $pythonVersion = python --version
    Write-Host "✅ Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python not found! Please install Python first." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if required packages are installed
Write-Host "📦 Checking dependencies..." -ForegroundColor Yellow
try {
    python -c "import fastapi, uvicorn" 2>$null
    Write-Host "✅ Dependencies are installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Missing dependencies! Installing..." -ForegroundColor Red
    pip install -r requirements.txt
}

Write-Host ""
Write-Host "🌐 Server will run on: http://127.0.0.1:8000" -ForegroundColor Cyan
Write-Host "📱 Government Dashboard: http://127.0.0.1:8000/sos-dashboard" -ForegroundColor Cyan
Write-Host "📊 API Documentation: http://127.0.0.1:8000/docs" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Start the server
try {
    python app.py
} catch {
    Write-Host "❌ Error starting server: $_" -ForegroundColor Red
    Read-Host "Press Enter to exit"
}
