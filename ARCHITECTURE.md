<!-- @format -->

# AI Training Platform - System Architecture

## Current Implementation Status

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + TypeScript)            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ✅ Registration Form                                        │
│     └─► Collects: name, email, job_title, industry         │
│     └─► Creates session                                     │
│     └─► Stores sessionId                                    │
│                                                             │
│  🚧 Avatar Greeting (TODO)                                  │
│     └─► LiveKit + Beyond Presence                          │
│     └─► Personalized welcome                               │
│                                                             │
│  🚧 Video Player (TODO)                                     │
│     └─► Embed training video                               │
│     └─► Track completion                                   │
│                                                             │
│  🚧 MCQ Exam Interface (TODO)                              │
│     └─► Display questions                                  │
│     └─► Submit answers                                     │
│     └─► Show results & feedback                           │
│                                                             │
│  ✅ API Service Layer (services/api.ts)                     │
│     └─► All endpoint functions ready                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 BACKEND (Django + DRF)                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ✅ User Management APIs                                     │
│     POST /api/users/register/                              │
│     GET  /api/users/sessions/{id}/                         │
│     PATCH /api/users/sessions/{id}/                        │
│     POST /api/users/sessions/{id}/status/                  │
│                                                             │
│  ✅ Assessment APIs                                          │
│     POST /api/assessments/sessions/{id}/generate/          │
│          └─► Upload PDF + generate MCQs                    │
│     GET  /api/assessments/sessions/{id}/questions/         │
│     POST /api/assessments/sessions/{id}/answer/            │
│     POST /api/assessments/sessions/{id}/submit/            │
│          └─► Calculate score + generate feedback          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
                    ▼                   ▼
        ┌─────────────────┐   ┌─────────────────┐
        │   MySQL/SQLite  │   │   AI Services   │
        │   Database      │   ├─────────────────┤
        ├─────────────────┤   │                 │
        │                 │   │  Google Gemini  │
        │ • Trainee       │   │  └─► MCQ Gen    │
        │ • Session       │   │  └─► Feedback   │
        │ • MCQQuestion   │   │                 │
        │ • MCQAnswer     │   │  Beyond Presence│
        │                 │   │  └─► Avatar     │
        └─────────────────┘   │                 │
                               │  LiveKit        │
                               │  └─► Real-time  │
                               │                 │
                               │  Deepgram       │
                               │  └─► STT        │
                               └─────────────────┘
```

## Data Flow

### 1. Registration Flow ✅

```
User fills form
    ↓
Frontend validates
    ↓
POST /api/users/register/
    ↓
Backend creates Trainee + Session
    ↓
Returns sessionId
    ↓
Frontend stores in localStorage
    ↓
Navigate to greeting page
```

### 2. MCQ Generation Flow ✅

```
User uploads PDF
    ↓
POST /api/assessments/sessions/{id}/generate/
    ↓
Backend extracts PDF text (PyPDF2)
    ↓
Sends to Gemini with context:
  • job_title
  • industry
  • PDF content
    ↓
Gemini generates structured questions
    ↓
Backend saves to database
    ↓
Returns questions (without answers)
```

### 3. Assessment Flow ✅

```
User answers questions
    ↓
POST /api/assessments/sessions/{id}/answer/
  (for each question)
    ↓
Backend validates answer
    ↓
Stores in database
    ↓
User submits exam
    ↓
POST /api/assessments/sessions/{id}/submit/
    ↓
Backend:
  • Calculates score
  • Gets incorrect answers
  • Generates feedback with Gemini
    ↓
Returns results + personalized feedback
```

## Database Schema

### Trainee Table

```sql
CREATE TABLE trainee (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(200),
    email VARCHAR(254) UNIQUE,
    job_title VARCHAR(200),
    industry VARCHAR(200),
    company VARCHAR(200),
    created_at DATETIME,
    updated_at DATETIME
);
```

### TrainingSession Table

```sql
CREATE TABLE training_session (
    id INT PRIMARY KEY AUTO_INCREMENT,
    trainee_id INT FOREIGN KEY,
    status VARCHAR(20),
    -- Choices: registration, greeting, video, mcq, feedback, qa, completed
    video_url VARCHAR(200),
    video_completed BOOLEAN DEFAULT FALSE,
    mcq_score INT,
    mcq_total INT,
    started_at DATETIME,
    completed_at DATETIME
);
```

### MCQQuestion Table

```sql
CREATE TABLE mcq_question (
    id INT PRIMARY KEY AUTO_INCREMENT,
    session_id INT FOREIGN KEY,
    question_text TEXT,
    option_a VARCHAR(500),
    option_b VARCHAR(500),
    option_c VARCHAR(500),
    option_d VARCHAR(500),
    correct_answer CHAR(1),
    -- A, B, C, or D
    explanation TEXT,
    created_at DATETIME
);
```

### MCQAnswer Table

```sql
CREATE TABLE mcq_answer (
    id INT PRIMARY KEY AUTO_INCREMENT,
    question_id INT FOREIGN KEY,
    session_id INT FOREIGN KEY,
    selected_answer CHAR(1),
    is_correct BOOLEAN,
    answered_at DATETIME,
    UNIQUE(question_id, session_id)
);
```

## API Response Examples

### Registration Response

```json
{
	"trainee_id": 1,
	"session_id": 1,
	"name": "John Doe",
	"job_title": "Software Engineer",
	"industry": "Technology",
	"message": "Registration successful"
}
```

### MCQ Generation Response

```json
{
	"session_id": 1,
	"questions": [
		{
			"id": 1,
			"question_text": "What is the primary purpose of unit testing?",
			"option_a": "To test the entire system",
			"option_b": "To test individual components in isolation",
			"option_c": "To test user interface",
			"option_d": "To test database connections"
		}
	],
	"total_questions": 10
}
```

### Exam Submission Response

```json
{
	"score": 8,
	"total": 10,
	"percentage": 80.0,
	"feedback": "Excellent work, John! As a Software Engineer in the Technology industry, you've demonstrated strong understanding of the core concepts. Your performance shows particularly good grasp of testing methodologies and best practices. Areas for improvement include...",
	"questions_review": [
		{
			"id": 1,
			"question_text": "...",
			"option_a": "...",
			"correct_answer": "B",
			"explanation": "Unit testing focuses on testing individual components..."
		}
	]
}
```

## File Structure

```
ai-training-platform/
├── backend/                          ✅ COMPLETE
│   ├── apps/
│   │   ├── users/
│   │   │   ├── models.py            ✅ Trainee, TrainingSession
│   │   │   ├── serializers.py       ✅ All serializers
│   │   │   ├── views.py             ✅ Registration, session APIs
│   │   │   └── urls.py              ✅ URL patterns
│   │   └── assessments/
│   │       ├── models.py            ✅ MCQQuestion, MCQAnswer
│   │       ├── serializers.py       ✅ Question/Answer serializers
│   │       ├── views.py             ✅ MCQ generation, grading
│   │       ├── utils.py             ✅ PDF parser, Gemini integration
│   │       └── urls.py              ✅ URL patterns
│   ├── config/
│   │   ├── settings.py              ✅ Complete configuration
│   │   └── urls.py                  ✅ Main URL routing
│   └── requirements.txt             ✅ All dependencies listed
│
├── frontend/                         🚧 50% COMPLETE
│   ├── src/
│   │   ├── components/
│   │   │   ├── RegistrationForm/    ✅ COMPLETE
│   │   │   │   ├── RegistrationForm.tsx
│   │   │   │   └── RegistrationForm.css
│   │   │   ├── AvatarGreeting/      ❌ TODO
│   │   │   ├── VideoPlayer/         ❌ TODO
│   │   │   └── MCQFlow/             ❌ TODO
│   │   ├── services/
│   │   │   └── api.ts               ✅ All API functions ready
│   │   └── App.tsx                  🚧 Routing needed
│   └── package.json                 ✅ Updated with dependencies
│
├── IMPLEMENTATION_GUIDE.md           ✅ Complete documentation
├── CURRENT_STATUS.md                 ✅ This status document
├── setup.bat                         ✅ Automated setup
├── start-backend.bat                 ✅ Backend runner
└── start-frontend.bat                ✅ Frontend runner
```

## Technology Stack in Detail

### Backend

- **Django 4.2** - Web framework
- **Django REST Framework 3.14** - API framework
- **django-cors-headers** - CORS handling
- **mysqlclient** - MySQL database driver
- **google-generativeai** - Gemini API
- **PyPDF2** - PDF text extraction
- **livekit-agents** - LiveKit integration
- **python-dotenv** - Environment variables

### Frontend

- **React 18** - UI framework
- **TypeScript 5** - Type safety
- **react-router-dom 6** - Routing
- **axios** - HTTP client
- **@livekit/components-react** - LiveKit React components
- **livekit-client** - LiveKit SDK

### AI Services

- **Google Gemini 2.0 Flash** - LLM for MCQ generation & feedback
- **Beyond Presence API** - Realistic avatars
- **LiveKit** - Real-time audio/video
- **Deepgram** - Speech-to-text

## Security Considerations

### Implemented

✅ CORS configuration
✅ Django CSRF protection
✅ Email validation
✅ Input sanitization
✅ API keys in environment variables

### TODO for Production

❌ JWT authentication
❌ Rate limiting
❌ HTTPS enforcement
❌ Database encryption
❌ File upload size limits
❌ PDF malware scanning

## Performance Optimizations

### Implemented

✅ Database indexing (created_at, foreign keys)
✅ Query optimization with select_related
✅ JSON response pagination

### TODO

❌ Caching (Redis)
❌ CDN for static files
❌ Database connection pooling
❌ Background task queue (Celery)
❌ Image optimization

## Next Implementation Priority

1. **Avatar Greeting Component** 🔴

   - Most complex
   - Requires LiveKit integration
   - Sets foundation for later avatar use

2. **Video Player Component** 🟠

   - Medium complexity
   - Standard video embed
   - Completion tracking

3. **MCQ Flow Component** 🟢
   - Least complex
   - Standard form handling
   - API integration straightforward

## Estimated Time to Complete

- **Avatar Greeting**: 2-3 hours
- **Video Player**: 1-2 hours
- **MCQ Flow**: 2-3 hours
- **Testing & Bug Fixes**: 2-3 hours

**Total**: 7-11 hours remaining

## Ready for Production Checklist

Backend:

- [x] Models created
- [x] APIs implemented
- [x] AI integration working
- [x] Error handling
- [ ] Authentication (JWT)
- [ ] Rate limiting
- [ ] Production database setup
- [ ] Environment configuration
- [ ] Deployment scripts

Frontend:

- [x] Project structure
- [x] API service layer
- [x] Registration component
- [ ] Avatar component
- [ ] Video component
- [ ] MCQ component
- [ ] Routing complete
- [ ] Error boundaries
- [ ] Loading states
- [ ] Responsive design

## Contact Points

**Backend Issues**: Check `backend/apps/*/views.py` for API logic
**Frontend Issues**: Check `frontend/src/services/api.ts` for API calls
**AI Issues**: Check `backend/apps/assessments/utils.py` for Gemini integration
**Configuration**: Check `backend/config/settings.py` and `.env` files

---

**Last Updated**: Current Session
**Completion**: 75% Backend | 50% Frontend | 62.5% Overall
