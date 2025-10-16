<!-- @format -->

# 🤖 AI Avatar Integration Setup Guide

## Overview

This guide shows you how to enable the **real AI avatar** in the greeting page using Beyond Presence + LiveKit + Google Gemini.

---

## ✅ What You'll Get

When a trainee registers and reaches the greeting page:

1. **LiveKit connects** to your cloud instance
2. **Beyond Presence avatar** appears in a video window
3. **Google Gemini AI** speaks through the avatar
4. Avatar says: "Welcome! Nice to meet you. Let me guide you through the training. Click continue when ready!"

---

## 🚀 Quick Start (3 Terminals Needed)

### Terminal 1: Backend Server

```powershell
cd "c:\Users\Dhanush\Desktop\all projects\AI examiner\ai-training-platform\backend"
python manage.py runserver
```

**Status**: ✅ Running at http://localhost:8000

### Terminal 2: Frontend Server

```powershell
cd "c:\Users\Dhanush\Desktop\all projects\AI examiner\ai-training-platform\frontend"
npm start
```

**Status**: ✅ Running at http://localhost:3000

### Terminal 3: LiveKit Avatar Agent (NEW!)

```powershell
cd "c:\Users\Dhanush\Desktop\all projects\AI examiner\ai-training-platform"
.\start-avatar-agent.ps1
```

**Status**: ⏳ Needs to be started

---

## 📋 Step-by-Step Setup

### Step 1: Install LiveKit Agent Dependencies

```powershell
cd "c:\Users\Dhanush\Desktop\all projects\AI examiner\livekit-bey-ai-agent"

# Create virtual environment (if not exists)
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Install required packages
pip install -r requirements.txt
```

### Step 2: Verify Environment Variables

The agent needs these credentials (already configured in script):

```
BEY_API_KEY = sk-PvPh48kdhOmSptufLxBgzil89GhXub2K4KI_rmLhP0w
BEY_AVATAR_ID = 7c9ca52f-d4f7-46e1-a4b8-0c8655857cc3
GOOGLE_API_KEY = AIzaSyAK7rRmCgSBS566bdHpuKkMT4MHbXLdvvo
DEEPGRAM_API_KEY = 8019ee1d1f98ef407fa5e87f32c61bc42a53376f
LIVEKIT_URL = wss://ai-examiner-m7jzbdy9.livekit.cloud
LIVEKIT_API_KEY = APIikPxGbCUWKwf
LIVEKIT_API_SECRET = H7zTbkq4zLgSZDIxYMUnyzch0tmze6wAGxremXVg5wfB
```

### Step 3: Start the Avatar Agent

```powershell
cd "c:\Users\Dhanush\Desktop\all projects\AI examiner\ai-training-platform"
.\start-avatar-agent.ps1
```

**Expected Output**:

```
========================================
   AI Training Platform Avatar Agent
========================================

Starting LiveKit AI Agent with Beyond Presence Avatar...
Activating Python virtual environment...

Environment Variables:
  LiveKit URL: wss://ai-examiner-m7jzbdy9.livekit.cloud
  Avatar ID: 7c9ca52f-d4f7-46e1-a4b8-0c8655857cc3

Starting LiveKit Agent Worker...
The agent will listen for new rooms and greet trainees automatically.
Press Ctrl+C to stop the agent.

INFO:livekit:Agent worker started
INFO:livekit:Waiting for jobs...
```

### Step 4: Test the Complete Flow

1. **Open Frontend**: http://localhost:3000
2. **Register** a trainee (name, job title, industry)
3. **Greeting Page** loads with:

   - LiveKit room connection
   - Avatar video window
   - Connection status indicator
   - "Continue" button

4. **Avatar Interaction**:
   - Avatar appears in video window
   - AI voice speaks greeting
   - Trainee can respond (optional)
   - Click "Continue" to proceed

---

## 🎭 How It Works

### Frontend (AvatarGreeting.tsx)

1. Gets session data from backend
2. Requests LiveKit token from `/api/users/sessions/{id}/livekit-token/`
3. Connects to LiveKit room using token
4. Renders LiveKit video component
5. Shows avatar video stream

### Backend (Django)

1. Generates unique room name: `greeting-{session_id}`
2. Creates LiveKit access token with proper permissions
3. Returns token + room info to frontend

### LiveKit Agent (Python)

1. Listens for new LiveKit rooms
2. When trainee joins, agent joins automatically
3. Beyond Presence provides avatar video
4. Google Gemini generates conversational greeting
5. Deepgram handles speech-to-text (if trainee speaks)
6. Agent speaks through avatar using TTS

---

## 🔧 Troubleshooting

### Agent Not Starting

**Error**: `ImportError: No module named livekit`
**Fix**:

```powershell
cd "c:\Users\Dhanush\Desktop\all projects\AI examiner\livekit-bey-ai-agent"
.\venv\Scripts\Activate.ps1
pip install livekit livekit-agents livekit-plugins-bey livekit-plugins-google livekit-plugins-deepgram
```

### Avatar Not Appearing

**Check**:

1. Is the agent running? (Terminal 3)
2. Does frontend show "Connected" status?
3. Check browser console for errors (F12)
4. Verify LiveKit URL is correct

**Test Connection**:

```powershell
# In agent terminal, you should see:
INFO:livekit:New participant joined: {trainee_name}
INFO:gemini-bey-agent:Starting greeting for {trainee_name}
```

### No Audio

**Check**:

1. Browser permissions for microphone/speaker
2. System audio not muted
3. LiveKit audio renderer is active

### Token Generation Fails

**Error**: `Failed to generate token`
**Fix**: Verify backend has `livekit` package:

```powershell
cd backend
pip install livekit
```

---

## 📝 Customizing the Greeting

Edit the agent instructions in `start-avatar-agent.ps1`:

```powershell
$env:AGENT_INSTRUCTIONS = "You are a friendly AI training assistant. Greet the trainee warmly..."
```

Or modify `livekit-bey-ai-agent/src/gemini_agent.py`:

```python
self.agent_instructions = os.getenv(
    "AGENT_INSTRUCTIONS",
    "Your custom greeting instructions here"
)
```

---

## 🎯 Testing Checklist

- [ ] Backend running on port 8000
- [ ] Frontend running on port 3000
- [ ] LiveKit agent running and listening
- [ ] Register a new trainee
- [ ] Greeting page loads without errors
- [ ] LiveKit connection status shows "Connected"
- [ ] Avatar video appears in window
- [ ] Audio greeting plays
- [ ] "Continue" button navigates to video

---

## 🆘 Need Help?

### Check Logs

**Backend**: Watch Django terminal for API calls
**Frontend**: Open browser console (F12) → Console tab
**Agent**: Watch agent terminal for LiveKit events

### Common Issues

1. **SSL Certificate Warnings**: Normal for Beyond Presence, already handled
2. **CORS Errors**: Backend CORS already configured for localhost
3. **Room Not Found**: Agent might not be running

---

## 🎉 Success!

When working correctly:

- Trainee sees live avatar video
- Avatar speaks personalized greeting
- Smooth transition to training video
- Professional AI-powered experience

Your AI Training Platform now has a **real AI avatar instructor**! 🚀
