<!-- @format -->

# 🚀 AI Training Platform - Quick Start Guide

## ✅ Project Status: READY TO RUN

All components have been implemented! Here's how to get started.

---

## 📋 Prerequisites Completed

- ✅ Backend: Django 4.2 with all models, APIs, and AI integration
- ✅ Frontend: React 18 with TypeScript - all components built
- ✅ Dependencies: npm packages installed (1353 packages)
- ✅ Database: Migrations applied
- ✅ Configuration: All API keys configured in settings.py

---

## 🎬 Training Flow

The platform provides a complete training experience:

1. **Registration** → User fills form with name, email, job title, industry, company
2. **Avatar Greeting** → Personalized AI greeting (8-second intro)
3. **Video Training** → YouTube video playback (ZK-rNEhJIDs)
4. **MCQ Assessment** → AI-generated questions from training PDF
5. **Results & Feedback** → Score display with personalized AI feedback

---

## 🖥️ Starting the Application

### Option 1: Using Batch Scripts (Easiest)

**Terminal 1 - Backend:**

```batch
cd "c:\Users\Dhanush\Desktop\all projects\AI examiner\ai-training-platform"
start-backend.bat
```

**Terminal 2 - Frontend:**

```batch
cd "c:\Users\Dhanush\Desktop\all projects\AI examiner\ai-training-platform"
start-frontend.bat
```

### Option 2: Manual Commands

**Terminal 1 - Backend:**

```batch
cd "c:\Users\Dhanush\Desktop\all projects\AI examiner\ai-training-platform\backend"
python manage.py runserver
```

**Terminal 2 - Frontend:**

```batch
cd "c:\Users\Dhanush\Desktop\all projects\AI examiner\ai-training-platform\frontend"
npm start
```

---

## 🌐 Access URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api/
- **Django Admin**: http://localhost:8000/admin/

---

## 🧪 Testing the Complete Flow

### 1. Test Registration

1. Open http://localhost:3000
2. Fill the registration form:
   - Name: "John Doe"
   - Email: "john.doe@example.com"
   - Job Title: "Product Manager"
   - Industry: "Technology"
   - Company: "Tech Corp"
3. Click "Start Training"
4. You should be redirected to `/greeting/{sessionId}`

### 2. Test Avatar Greeting

- Avatar greeting page should load
- Personalized greeting message appears
- After 8 seconds, auto-redirect to video page
- Or click "Continue" button to proceed

### 3. Test Video Playback

- YouTube video loads (ID: ZK-rNEhJIDs)
- Video plays in 16:9 aspect ratio
- After watching, click "Continue to Assessment"
- Or click "Skip Video" to proceed directly

### 4. Generate MCQ Questions

**Important**: Questions must be generated ONCE before taking the exam.

**Using the Backend API:**

```powershell
# Get the session ID from the URL (e.g., /video/1 → session ID is 1)
$sessionId = 1

# Generate questions (use the actual PDF path)
curl -X POST http://localhost:8000/api/assessments/sessions/$sessionId/generate/ `
  -H "Content-Type: multipart/form-data" `
  -F "pdf=@c:\Users\Dhanush\Desktop\all projects\AI examiner\ai-training-platform\backend\ACE Accelerator_Business case development training_6Oct25_vShare.pdf" `
  -F "num_questions=10"
```

### 5. Test MCQ Assessment

- Questions display one at a time
- Select answer (A/B/C/D) for each question
- Navigate with "Previous" and "Next" buttons
- Click "Submit Exam" after all questions
- Results page shows:
  - Score circle with percentage
  - Personalized AI feedback
  - Question review with correct/incorrect badges

---

## 📁 Training Material

The training PDF is located at:

```
backend/ACE Accelerator_Business case development training_6Oct25_vShare.pdf
```

This document is used to generate context-aware MCQ questions via Google Gemini API.

---

## 🔑 API Endpoints Reference

### User Management

- `POST /api/users/register/` - Register trainee
- `GET /api/users/sessions/{id}/` - Get session details
- `PATCH /api/users/sessions/{id}/` - Update session
- `POST /api/users/sessions/{id}/status/` - Update status

### Assessment

- `POST /api/assessments/sessions/{id}/generate/` - Generate MCQs from PDF
- `GET /api/assessments/sessions/{id}/questions/` - Get all questions
- `POST /api/assessments/sessions/{id}/answer/` - Submit single answer
- `POST /api/assessments/sessions/{id}/submit/` - Submit exam & get feedback

---

## 🔧 Configuration

All API keys are already configured in `backend/config/settings.py`:

```python
# Google Gemini
GEMINI_API_KEY = "AIzaSyAK7rRmCgSBS566bdHpuKkMT4MHbXLdvvo"

# Beyond Presence Avatar
BEYOND_PRESENCE_API_KEY = "sk-PvPh48kdhOmSptufLxBgzil89GhXub2K4KI_rmLhP0w"
BEYOND_PRESENCE_AVATAR_ID = "7c9ca52f-d4f7-46e1-a4b8-0c8655857cc3"

# LiveKit
LIVEKIT_URL = "wss://ai-examiner-m7jzbdy9.livekit.cloud"
LIVEKIT_API_KEY = "APIikPxGbCUWKwf"
LIVEKIT_API_SECRET = "H7zTbkq4zLgSZDIxYMUnyzch0tmze6wAGxremXVg5wfB"

# Deepgram STT
DEEPGRAM_API_KEY = "8019ee1d1f98ef407fa5e87f32c61bc42a53376f"
```

---

## 🐛 Troubleshooting

### Backend Issues

**Port already in use:**

```batch
# Find and kill process on port 8000
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

**Database issues:**

```batch
cd backend
del db.sqlite3
python manage.py migrate
```

**Import errors:**

```batch
cd backend
pip install -r requirements.txt
```

### Frontend Issues

**Compilation errors:**

```batch
cd frontend
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

**Port already in use:**

```batch
# Kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**API connection errors:**

- Verify backend is running at http://localhost:8000
- Check CORS settings in `backend/config/settings.py`
- Inspect browser console for error messages

---

## 📊 Database Admin

Create a superuser to access Django admin:

```batch
cd backend
python manage.py createsuperuser
```

Access admin panel: http://localhost:8000/admin/

You can view/manage:

- Trainees
- Training Sessions
- MCQ Questions
- MCQ Answers

---

## 🎯 Next Steps

### Testing Checklist

- [ ] Registration form saves trainee data
- [ ] Avatar greeting displays correctly
- [ ] Video plays without errors
- [ ] MCQ questions generate from PDF
- [ ] Answer submission works
- [ ] Exam submission returns feedback
- [ ] Score calculation is accurate

### Optional Enhancements

- [ ] Add user authentication
- [ ] Implement session timeout
- [ ] Add progress saving
- [ ] Email notifications
- [ ] Analytics dashboard
- [ ] Multiple training videos
- [ ] Quiz retry functionality

---

## 📚 Documentation Files

- `README.md` - Project overview and setup
- `IMPLEMENTATION_GUIDE.md` - Detailed technical guide
- `ARCHITECTURE.md` - System architecture
- `TESTING_GUIDE.md` - API testing examples
- `CURRENT_STATUS.md` - Project status and features

---

## 🎉 You're All Set!

Your AI Training Platform is ready to use. Start both servers and navigate to http://localhost:3000 to begin training!

For questions or issues, refer to the documentation files or check the code comments.
