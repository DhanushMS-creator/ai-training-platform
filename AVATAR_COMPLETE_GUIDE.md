<!-- @format -->

# 🎭 Avatar Integration - Complete Setup Guide

## ✅ What's Been Implemented

The AI Training Platform now has **FULL Beyond Presence Avatar integration** using LiveKit Agents!

### Architecture

```
Frontend (React + LiveKit) ←→ LiveKit Cloud Room ←→ Avatar Agent (Python)
         ↓                            ↑
    Django Backend              Beyond Presence
    (Token Generation)          (Avatar Worker)
```

## 🚀 Complete Setup (3 Terminals)

### Terminal 1: Backend Server

```powershell
cd "c:\Users\Dhanush\Desktop\all projects\AI examiner\ai-training-platform\backend"
python manage.py runserver
```

### Terminal 2: Frontend Server

```powershell
cd "c:\Users\Dhanush\Desktop\all projects\AI examiner\ai-training-platform\frontend"
npm start
```

### Terminal 3: Avatar Agent (NEW!)

```powershell
cd "c:\Users\Dhanush\Desktop\all projects\AI examiner\livekit-bey-ai-agent"

# Install dependencies (first time only)
pip install -r requirements.txt

# Start the avatar agent
python start_agent.py
```

## 🎯 How It Works

### 1. User Flow

```
Register → Avatar Greeting → Video → MCQ → Results
             ↓ (Live AI Avatar speaks here!)
```

### 2. Technical Flow

**When user reaches greeting page:**

1. **Frontend**: Requests LiveKit credentials from backend
2. **Backend**: Generates LiveKit token for room `training-session-{id}`
3. **Frontend**: Joins LiveKit room with token
4. **Avatar Agent** (running in Terminal 3):
   - Detects new room
   - Joins same room
   - Brings Beyond Presence avatar
   - Avatar appears on screen!
   - Greets the trainee by name
   - Explains the training process

### 3. What Happens

- ✅ **Real-time video** of AI avatar
- ✅ **Audio greeting** personalized to trainee
- ✅ **Interactive** - avatar can respond to speech (if STT enabled)
- ✅ **Professional** - uses Google Gemini + Deepgram + Beyond Presence

## 📁 Files Changed

### Backend

- `apps/users/avatar_views.py` - Simplified to just generate LiveKit token
- `apps/users/urls.py` - Avatar endpoint registered

### Frontend

- `components/AvatarGreeting/AvatarGreeting.tsx` - LiveKit room with avatar video

### Avatar Agent (New!)

- `livekit-bey-ai-agent/src/training_avatar_agent.py` - Main agent
- `livekit-bey-ai-agent/.env` - Configuration
- `livekit-bey-ai-agent/start_agent.py` - Start script

## 🧪 Testing

### Start All 3 Servers

1. **Backend** (Terminal 1): `python manage.py runserver`
2. **Frontend** (Terminal 2): `npm start`
3. **Avatar Agent** (Terminal 3): `python start_agent.py`

### Test the Flow

1. Open http://localhost:3000
2. Register a new trainee (name: "John Doe", etc.)
3. Click "Start Training"
4. **Avatar Greeting Page**:
   - Shows "Connecting..."
   - Within 5-10 seconds: **Avatar video appears!**
   - Avatar speaks: "Hello John Doe! Welcome to your training..."
   - Audio plays automatically
   - Status shows "● Connected"

### Expected Console Output

**Avatar Agent Terminal**:

```
============================================================
AI Training Platform - Avatar Agent
============================================================
LiveKit URL: wss://ai-examiner-m7jzbdy9.livekit.cloud
Avatar ID: 7c9ca52f-d4f7-46e1-a4b8-0c8655857cc3
============================================================
Avatar agent worker starting...
Waiting for room requests...

[INFO] Avatar agent starting in room: training-session-1
[INFO] Participant joined: John Doe
[INFO] Starting avatar session...
[INFO] Avatar joined successfully!
[INFO] Starting agent session...
[INFO] Avatar agent is now active and listening
```

## 🎛️ Configuration

### Avatar Behavior

Edit `livekit-bey-ai-agent/src/training_avatar_agent.py`:

**Greeting Message** (line ~53):

```python
greeting_message = f"""Hello {trainee_name}! Welcome to your training..."""
```

**System Prompt** (line ~86):

```python
content=f"""You are a friendly AI training assistant...
Keep responses brief and encouraging..."""
```

**Voice** (line ~77):

```python
tts = google.TTS(
    voice_name="en-US-Journey-F",  # Female voice
    # Change to: "en-US-Journey-M" for male voice
)
```

### API Keys

All configured in `.env`:

- ✅ Beyond Presence: `sk-PvPh48kdhOmSptufLxBgzil89GhXub2K4KI_rmLhP0w`
- ✅ Gemini: `AIzaSyAK7rRmCgSBS566bdHpuKkMT4MHbXLdvvo`
- ✅ Deepgram: `8019ee1d1f98ef407fa5e87f32c61bc42a53376f`
- ✅ LiveKit: Configured

## 🐛 Troubleshooting

### Avatar Doesn't Appear

**Check Avatar Agent Terminal**:

- Should show "Avatar joined successfully!"
- If errors, check API keys in `.env`

**Check Frontend Console**:

- Should show "Connected to LiveKit room"
- Check for WebSocket errors

**Check Backend**:

- Should show "Generated LiveKit credentials for room: training-session-X"

### Common Issues

1. **"ModuleNotFoundError: No module named 'livekit'"**

   ```powershell
   cd livekit-bey-ai-agent
   pip install -r requirements.txt
   ```

2. **Avatar agent not starting**

   - Check `.env` file exists
   - Verify all API keys are set
   - Check Python version (3.10+ required)

3. **No video, only placeholder**

   - Avatar agent must be running (Terminal 3)
   - Check agent logs for errors
   - Verify Beyond Presence API key is valid

4. **Connection issues**
   - Check LiveKit URL is correct
   - Verify firewall allows WebSocket (wss://)
   - Check internet connection

## 🎨 Customization

### Different Avatars

Change avatar ID in `.env`:

```bash
BEY_AVATAR_ID=your-avatar-id-here
```

### Different Greeting

Edit `training_avatar_agent.py` line 53:

```python
greeting_message = f"""Your custom message here..."""
```

### Interactive Mode

The avatar can already:

- ✅ Hear user (via Deepgram STT)
- ✅ Think (via Gemini LLM)
- ✅ Respond (via Google TTS + Beyond Presence)

Users can speak and the avatar will respond!

## 📊 What Works Now

✅ Registration form  
✅ **Live AI Avatar greeting with video and audio**  
✅ Training video playback  
✅ Auto-generated MCQ from PDF  
✅ Assessment with scoring  
✅ Personalized results

## 🎯 Next Steps

### To Start Using:

1. **Open 3 terminals** and start all services
2. **Test the flow** - register and see the avatar!
3. **Customize greeting** if desired
4. **Deploy** when ready

### Optional Enhancements:

- Multiple avatar personalities
- Different greetings per industry
- Avatar can ask trainee questions
- Record avatar interactions
- Multi-language support

## 💡 Production Deployment

### For Production:

1. **Deploy Avatar Agent** to cloud server
2. **Keep it running** 24/7 (use PM2, systemd, or Docker)
3. **Monitor** with logging/alerts
4. **Scale** by running multiple agent workers

### Recommended:

- Railway, Render, or AWS EC2 for agent
- Docker container for easy deployment
- Environment variables for configuration

## 🎉 Success!

Your AI Training Platform now has a **fully functional AI avatar** that:

- Greets trainees personally
- Appears in real-time video
- Speaks with natural voice
- Can interact (respond to questions)
- Looks professional and polished

**The platform is complete and ready to use!** 🚀
