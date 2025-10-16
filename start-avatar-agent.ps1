# AI Training Platform - LiveKit Avatar Agent Startup Script

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   AI Training Platform Avatar Agent   " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Set the working directory
$agentPath = "C:\Users\Dhanush\Desktop\all projects\AI examiner\livekit-bey-ai-agent"
Set-Location $agentPath

Write-Host "Starting LiveKit AI Agent with Beyond Presence Avatar..." -ForegroundColor Yellow
Write-Host ""

# Check if virtual environment exists
if (Test-Path ".\venv\Scripts\Activate.ps1") {
    Write-Host "Activating Python virtual environment..." -ForegroundColor Green
    & .\venv\Scripts\Activate.ps1
} else {
    Write-Host "Virtual environment not found. Creating one..." -ForegroundColor Yellow
    python -m venv venv
    & .\venv\Scripts\Activate.ps1
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    pip install -r requirements.txt
}

Write-Host ""
Write-Host "Environment Variables:" -ForegroundColor Cyan
Write-Host "  LiveKit URL: wss://ai-examiner-m7jzbdy9.livekit.cloud" -ForegroundColor White
Write-Host "  Avatar ID: 7c9ca52f-d4f7-46e1-a4b8-0c8655857cc3" -ForegroundColor White
Write-Host ""

# Set environment variables
$env:BEY_API_KEY = "sk-PvPh48kdhOmSptufLxBgzil89GhXub2K4KI_rmLhP0w"
$env:BEY_AVATAR_ID = "7c9ca52f-d4f7-46e1-a4b8-0c8655857cc3"
$env:GOOGLE_API_KEY = "AIzaSyBmhEYXn1dqD_PiRlnVWtp5XOII50uLuYM"
$env:DEEPGRAM_API_KEY = "8019ee1d1f98ef407fa5e87f32c61bc42a53376f"
$env:LIVEKIT_URL = "wss://ai-examiner-m7jzbdy9.livekit.cloud"
$env:LIVEKIT_API_KEY = "APIikPxGbCUWKwf"
$env:LIVEKIT_API_SECRET = "H7zTbkq4zLgSZDIxYMUnyzch0tmze6wAGxremXVg5wfB"
$env:AGENT_NAME = "Training Assistant"
$env:AGENT_INSTRUCTIONS = "You are a friendly AI training assistant. Greet the trainee warmly, introduce yourself, and explain that you'll guide them through the training. Keep your greeting brief and welcoming. Tell them to click Continue when ready for the training video."
$env:LOG_LEVEL = "INFO"

Write-Host "Starting LiveKit Agent Worker..." -ForegroundColor Green
Write-Host "The agent will listen for new rooms and greet trainees automatically." -ForegroundColor White
Write-Host "Press Ctrl+C to stop the agent." -ForegroundColor Yellow
Write-Host ""

# Start the agent
python src\gemini_agent.py dev
