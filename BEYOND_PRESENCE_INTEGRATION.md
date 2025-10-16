<!-- @format -->

# Beyond Presence Avatar Integration - Complete Guide

## Overview

This implementation uses Beyond Presence AI with LiveKit for live speech-to-video avatar sessions in the AI Training Platform.

## How It Works

### Architecture

```
User → Frontend (React + LiveKit) → Backend (Django) → Beyond Presence API → LiveKit Room
                                                                              ↓
                                                                        AI Avatar appears
```

### Flow

1. User completes registration
2. Frontend requests avatar session from backend
3. Backend creates LiveKit token and calls Beyond Presence API
4. Beyond Presence avatar joins the LiveKit room
5. User sees and hears AI avatar in real-time
6. Avatar can speak and respond (if configured with STT/LLM)

## Implementation Details

### Backend (`apps/users/avatar_views.py`)

**Endpoint**: `POST /api/users/sessions/{session_id}/avatar-greeting/`

**What it does**:

1. Generates LiveKit token for the session
2. Calls Beyond Presence API `/v1/sessions` endpoint
3. Creates a LiveKit speech-to-video session
4. Returns LiveKit credentials to frontend

**Request to Beyond Presence**:

```json
{
	"avatar_id": "7c9ca52f-d4f7-46e1-a4b8-0c8655857cc3",
	"livekit_url": "wss://ai-examiner-m7jzbdy9.livekit.cloud",
	"livekit_token": "<generated-token>",
	"transport_type": "livekit"
}
```

**Response**:

```json
{
	"success": true,
	"session_id": "beyond-presence-session-id",
	"room_name": "training-session-123",
	"livekit_url": "wss://ai-examiner-m7jzbdy9.livekit.cloud",
	"livekit_token": "<token>"
}
```

### Frontend (`components/AvatarGreeting/AvatarGreeting.tsx`)

**Components**:

- `AvatarVideo`: Renders the remote participant's video track
- `AvatarGreeting`: Main component with LiveKitRoom

**What it does**:

1. Calls backend to start avatar session
2. Receives LiveKit credentials
3. Connects to LiveKit room using `LiveKitRoom` component
4. Waits for Beyond Presence avatar to join as remote participant
5. Displays avatar video when available

**Key Features**:

- ✅ Auto-connects when credentials available
- ✅ Shows loading state while waiting
- ✅ Graceful fallback if avatar fails
- ✅ Audio + Video support
- ✅ Connection status indicator

## Configuration

### Environment Variables

**Backend** (`.env` or `settings.py`):

```bash
BEYOND_PRESENCE_API_KEY=sk-PvPh48kdhOmSptufLxBgzil89GhXub2K4KI_rmLhP0w
BEYOND_PRESENCE_AVATAR_ID=7c9ca52f-d4f7-46e1-a4b8-0c8655857cc3
LIVEKIT_URL=wss://ai-examiner-m7jzbdy9.livekit.cloud
LIVEKIT_API_KEY=APIikPxGbCUWKwf
LIVEKIT_API_SECRET=H7zTbkq4zLgSZDIxYMUnyzch0tmze6wAGxremXVg5wfB
```

### Dependencies

**Backend**:

- `requests` - For API calls
- `PyJWT` - For LiveKit token generation

**Frontend**:

- `@livekit/components-react` - LiveKit UI components
- `@livekit/components-styles` - Styles
- `livekit-client` - LiveKit client SDK

## Testing

### 1. Start Backend

```powershell
cd backend
python manage.py runserver
```

### 2. Start Frontend

```powershell
cd frontend
npm start
```

### 3. Test Flow

1. Register new trainee
2. Navigate to greeting page
3. Watch for:
   - "Connecting..." status
   - Avatar video appears
   - Audio plays
   - Connection status shows "● Connected"

### Expected Behavior

**Success**:

- Avatar video appears in ~5-10 seconds
- Audio works
- Status shows "Connected"

**Failure (Graceful)**:

- Shows welcome message
- "Continue to Training Video" button works
- No blocking errors

## Troubleshooting

### Avatar Doesn't Appear

**Check Backend Logs**:

```
Beyond Presence API Response Status: 201
Beyond Presence API Response: {"id": "...", ...}
```

**Status 201 = Success**: Avatar session created

**Status 4xx/5xx = Error**: Check:

- API key valid
- Avatar ID exists
- LiveKit URL correct
- LiveKit token valid

### Console Errors

**Frontend Console**:

```javascript
// Good:
"Connected to LiveKit room";
"Avatar session created successfully";

// Bad:
"Error starting avatar session";
// Check backend logs for details
```

### Connection Issues

1. **Verify LiveKit credentials**

   - URL format: `wss://your-domain.livekit.cloud`
   - Token not expired
   - Room name matches

2. **Check Network**

   - WebSocket connections allowed
   - No firewall blocking wss://

3. **Verify Beyond Presence**
   - API key active
   - Avatar ID exists
   - Account has credits/quota

## Advanced: Adding Speech Interaction

To make the avatar interactive (respond to user speech):

### Backend

Add Deepgram STT and Gemini LLM integration:

```python
# In avatar session creation
"stt_provider": "deepgram",
"llm_provider": "gemini",
"system_prompt": "You are a friendly training assistant..."
```

### Frontend

Enable microphone:

```tsx
<LiveKitRoom
  audio={true}  // Already enabled
  video={true}
  // ... other props
>
```

## API Reference

### Beyond Presence API

**Create Session**:

```
POST https://api.beyondpresence.ai/v1/sessions
Headers:
  x-api-key: YOUR_API_KEY
  Content-Type: application/json
Body:
  {
    "avatar_id": "string",
    "livekit_url": "wss://...",
    "livekit_token": "string",
    "transport_type": "livekit"
  }
Response: 201 Created
  {
    "id": "session-id",
    "avatar_id": "...",
    "started_at": "ISO-8601"
  }
```

### LiveKit Token Generation

**Function**: `generate_livekit_token(room_name, participant_name)`

**Returns**: JWT token with:

- Room access grant
- Participant identity
- 24-hour expiration

## Cost Considerations

**Beyond Presence**:

- Charged per minute of avatar session
- Check your plan limits

**LiveKit**:

- Free tier available
- Pay for bandwidth beyond free tier

**Recommendation**:

- Set session timeout (5-10 minutes)
- End session when user continues to video

## Future Enhancements

1. **Interactive Greetings**: Avatar asks questions
2. **Personalized Scripts**: Custom greeting per role/industry
3. **Session Recording**: Save avatar interactions
4. **Multi-language**: Support different languages
5. **Custom Avatars**: Different avatars per training type

## Support

- **Beyond Presence Docs**: https://docs.beyondpresence.ai
- **LiveKit Docs**: https://docs.livekit.io
- **LiveKit + Beyond Presence**: https://docs.livekit.io/agents/integrations/avatar/bey

## Status

✅ **Backend**: Fully implemented
✅ **Frontend**: LiveKit integration complete
✅ **Token Generation**: Working
✅ **Graceful Fallback**: Implemented
⏳ **Testing**: Pending Beyond Presence API response

**Next Step**: Restart servers and test!
