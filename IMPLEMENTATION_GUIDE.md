<!-- @format -->

# AI Training Platform - Setup and Implementation Guide

## Project Overview

A comprehensive AI-powered corporate training platform with:

- **Frontend**: React + TypeScript
- **Backend**: Django + Django REST Framework
- **Database**: MySQL
- **AI Components**: Google Gemini (LLM), Beyond Presence (Avatar), Deepgram (STT), LiveKit (Real-time)

## Phase 1 Implementation Status

### ✅ COMPLETED: Backend

#### 1. Django Models Created

- **Trainee Model** (`apps/users/models.py`):

  - name, email, job_title, industry, company
  - Tracks trainee registration information

- **TrainingSession Model** (`apps/users/models.py`):

  - Links to trainee
  - Tracks progress through: registration → greeting → video → mcq → feedback → qa → completed
  - Stores scores and completion status

- **MCQQuestion Model** (`apps/assessments/models.py`):

  - Stores generated questions with 4 options
  - Links to training session
  - Includes correct answer and explanation

- **MCQAnswer Model** (`apps/assessments/models.py`):
  - Tracks trainee answers
  - Auto-validates correctness

#### 2. API Endpoints Created

**User/Session APIs:**

- `POST /api/users/register/` - Register new trainee
- `GET /api/users/sessions/{id}/` - Get session details
- `PATCH /api/users/sessions/{id}/` - Update session
- `POST /api/users/sessions/{id}/status/` - Update session status

**Assessment APIs:**

- `POST /api/assessments/sessions/{id}/generate/` - Generate MCQ questions from PDF
- `GET /api/assessments/sessions/{id}/questions/` - Get all questions
- `POST /api/assessments/sessions/{id}/answer/` - Submit single answer
- `POST /api/assessments/sessions/{id}/submit/` - Submit exam and get results

#### 3. AI Integration (Backend)

- **PDF Parser** (`apps/assessments/utils.py`):
  - Extracts text from PDF using PyPDF2
- **Gemini MCQ Generator** (`apps/assessments/utils.py`):

  - Generates contextual questions based on:
    - Trainee's job title
    - Trainee's industry
    - PDF training material content
  - Returns structured JSON with questions, options, answers, explanations

- **Personalized Feedback Generator** (`apps/assessments/utils.py`):
  - Uses Gemini to create custom feedback
  - Considers trainee profile and incorrect answers

### ✅ COMPLETED: Frontend Structure

#### 1. API Service (`src/services/api.ts`)

- Complete TypeScript interfaces
- All API endpoint functions
- Error handling

#### 2. Registration Form Component

- Full form with validation
- Calls backend API
- Stores session in localStorage
- Navigates to greeting page

### 🔨 TODO: Frontend Components

#### 3. Avatar Greeting Component (`src/components/AvatarGreeting/`)

- Integrate LiveKit + Beyond Presence
- Display personalized welcome
- Navigate to video page

#### 4. Video Player Component (`src/components/VideoPlayer/`)

- Embed training video
- Track completion
- Avatar navigation to MCQ

#### 5. MCQ Flow Component (`src/components/MCQFlow/`)

- Display questions from backend
- Submit answers
- Show results and feedback

---

## Setup Instructions

### Backend Setup

1. **Navigate to backend directory:**

   ```bash
   cd backend
   ```

2. **Create virtual environment:**

   ```bash
   python -m venv venv
   venv\Scripts\activate  # Windows
   ```

3. **Install dependencies:**

   ```bash
   pip install -r requirements.txt
   ```

4. **Configure database in `config/settings.py`:**

   ```python
   DATABASES = {
       'default': {
           'ENGINE': 'django.db.backends.mysql',
           'NAME': 'ai_training_db',
           'USER': 'your_mysql_user',
           'PASSWORD': 'your_mysql_password',
           'HOST': 'localhost',
           'PORT': '3306',
       }
   }
   ```

5. **Run migrations:**

   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

6. **Create superuser:**

   ```bash
   python manage.py createsuperuser
   ```

7. **Run server:**
   ```bash
   python manage.py runserver
   ```

### Frontend Setup

1. **Navigate to frontend directory:**

   ```bash
   cd frontend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Create `.env` file:**

   ```
   REACT_APP_API_URL=http://localhost:8000/api
   ```

4. **Start development server:**
   ```bash
   npm start
   ```

---

## API Usage Examples

### 1. Register Trainee

```bash
curl -X POST http://localhost:8000/api/users/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "job_title": "Software Engineer",
    "industry": "Technology",
    "company": "Tech Corp"
  }'
```

**Response:**

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

### 2. Generate MCQ Questions

```bash
curl -X POST http://localhost:8000/api/assessments/sessions/1/generate/ \
  -F "pdf_file=@training_material.pdf" \
  -F "num_questions=10"
```

**Response:**

```json
{
	"session_id": 1,
	"questions": [
		{
			"id": 1,
			"question_text": "What is the primary benefit of cloud computing?",
			"option_a": "Lower costs",
			"option_b": "Scalability",
			"option_c": "Security",
			"option_d": "All of the above"
		}
	],
	"total_questions": 10
}
```

### 3. Submit Answer

```bash
curl -X POST http://localhost:8000/api/assessments/sessions/1/answer/ \
  -H "Content-Type: application/json" \
  -d '{
    "question_id": 1,
    "selected_answer": "D"
  }'
```

### 4. Submit Exam

```bash
curl -X POST http://localhost:8000/api/assessments/sessions/1/submit/ \
  -H "Content-Type: application/json"
```

**Response:**

```json
{
  "score": 8,
  "total": 10,
  "percentage": 80.0,
  "feedback": "Dear John Doe, Excellent work! You scored 8 out of 10...",
  "questions_review": [...]
}
```

---

## Next Steps

### Phase 2: Avatar Integration

1. **Create LiveKit Token Generation Endpoint:**

   - Add to `apps/users/views.py`
   - Generate secure LiveKit tokens

2. **Build Avatar Greeting Component:**

   - Use LiveKit React SDK
   - Integrate Beyond Presence avatar
   - Personalized greeting with Gemini

3. **Build Video Player with Avatar Navigation:**
   - Embed video
   - Avatar announces next section

### Phase 3: Complete MCQ Flow

1. **MCQ Exam Interface:**

   - Display questions one by one
   - Progress indicator
   - Submit functionality

2. **Results & Feedback:**

   - Show score
   - Display AI-generated feedback
   - Review incorrect answers

3. **Q&A Session:**
   - Interactive chat with avatar
   - Context-aware responses about training

---

## Configuration Files

### Environment Variables Required

Create `.env` file in backend root:

```
GOOGLE_API_KEY=AIzaSyAK7rRmCgSBS566bdHpuKkMT4MHbXLdvvo
BEY_API_KEY=sk-PvPh48kdhOmSptufLxBgzil89GhXub2K4KI_rmLhP0w
BEY_AVATAR_ID=7c9ca52f-d4f7-46e1-a4b8-0c8655857cc3
DEEPGRAM_API_KEY=8019ee1d1f98ef407fa5e87f32c61bc42a53376f
LIVEKIT_URL=wss://ai-examiner-m7jzbdy9.livekit.cloud
LIVEKIT_API_KEY=APIikPxGbCUWKwf
LIVEKIT_API_SECRET=H7zTbkq4zLgSZDIxYMUnyzch0tmze6wAGxremXVg5wfB
```

---

## Testing the Flow

1. **Start Backend:**

   ```bash
   cd backend
   python manage.py runserver
   ```

2. **Start Frontend:**

   ```bash
   cd frontend
   npm start
   ```

3. **Test Registration:**

   - Go to `http://localhost:3000`
   - Fill registration form
   - Check session created in Django admin

4. **Test MCQ Generation:**
   - Use API endpoint with a PDF file
   - Verify questions generated
   - Check database for saved questions

---

## Troubleshooting

### Common Issues:

1. **CORS Errors:**

   - Ensure `django-cors-headers` is installed
   - Check `CORS_ALLOWED_ORIGINS` in settings

2. **PDF Parsing Fails:**

   - Install PyPDF2: `pip install PyPDF2`
   - Check PDF file is not password-protected

3. **Gemini API Errors:**

   - Verify API key is correct
   - Check API quotas/limits
   - Ensure proper model name: `gemini-2.0-flash-exp`

4. **Database Migration Issues:**
   - Delete `db.sqlite3` and `migrations` folders
   - Run fresh migrations

---

## Project Structure Reference

```
ai-training-platform/
├── backend/
│   ├── apps/
│   │   ├── users/          # Trainee, Session models & APIs
│   │   ├── assessments/    # MCQ, Answer models & AI generation
│   │   ├── courses/        # Future: course management
│   │   └── videos/         # Future: video metadata
│   ├── config/             # Django settings & URLs
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── RegistrationForm/
│   │   │   ├── AvatarGreeting/
│   │   │   ├── VideoPlayer/
│   │   │   └── MCQFlow/
│   │   ├── services/       # API calls
│   │   ├── pages/          # Page components
│   │   └── types/          # TypeScript types
│   └── package.json
└── README.md (this file)
```

---

## Credits

- **AI LLM**: Google Gemini 2.0 Flash
- **Avatar**: Beyond Presence
- **Real-time**: LiveKit
- **STT**: Deepgram
- **Backend**: Django + DRF
- **Frontend**: React + TypeScript

---

## Contact & Support

For questions or issues during implementation, refer to:

- Django Docs: https://docs.djangoproject.com/
- React Docs: https://react.dev/
- LiveKit Docs: https://docs.livekit.io/
- Gemini API Docs: https://ai.google.dev/docs
