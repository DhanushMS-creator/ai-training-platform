<!-- @format -->

# 🎯 MCQ System Upgrade - Global Question Pool

## ✅ CHANGES COMPLETED

### 📊 New Database Structure

**Before:**

- Each session generated 5 unique questions
- Questions stored per session (wasteful)
- Every user got AI-generated questions (expensive)

**After:**

- 20 questions generated ONCE from PDF → `GlobalMCQQuestion` table
- Each user gets 5 RANDOM questions from pool → `SessionQuestion` links
- One-time AI generation → infinite reuse

---

## 🗄️ New Database Models

### 1. **GlobalMCQQuestion** (New!)

```python
- question_text
- option_a, option_b, option_c, option_d
- correct_answer
- explanation
- is_active (can deactivate bad questions)
- created_at
```

**Purpose:** Stores 20 master questions from PDF

### 2. **SessionQuestion** (New!)

```python
- session (FK)
- question (FK to GlobalMCQQuestion)
- order (display order 1-5)
- created_at
```

**Purpose:** Links sessions to their 5 random questions

### 3. **MCQAnswer** (Updated)

```python
- question (FK to GlobalMCQQuestion) ← Changed!
- session
- selected_answer
- is_correct
- answered_at
```

**Purpose:** Stores user answers (now references global questions)

### 4. **MCQQuestion** (Deprecated)

- Kept for backward compatibility
- Will be removed after migration

---

## 🔄 New Flow

### **First Time Setup:**

```
1. System starts
2. Check: Do 20 global questions exist?
3. NO → Call initialize_global_question_pool()
   - Read training_material.pdf
   - Call Gemini AI: Generate 20 questions
   - Save to GlobalMCQQuestion table
4. YES → Skip generation
```

### **User Gets Questions:**

```
1. User reaches MCQ page
2. Check: Does this session have assigned questions?
3. NO → Assign 5 random questions:
   - SELECT 5 random from GlobalMCQQuestion WHERE is_active=True
   - Create SessionQuestion records (links)
   - Return questions to user
4. YES → Return existing SessionQuestion assignments
```

### **User Submits Answers:**

```
1. Answer submitted
2. Save to MCQAnswer (references GlobalMCQQuestion)
3. Check correctness
4. Return feedback
```

---

## 📝 Updated Code Files

✅ **models.py** - New models added
✅ **views.py** - All endpoints updated
✅ **admin.py** - Admin interface for new models
✅ **Migration created** - 0002_globalmcqquestion_alter_mcqanswer_question_and_more.py

---

## ⚠️ IMPORTANT: Migration Steps

**OPTION 1: Fresh Start (Recommended for Development)**

```bash
# Stop backend server (Ctrl+C)
cd backend
Remove-Item db.sqlite3 -Force
python manage.py migrate
python manage.py createsuperuser  # Create admin again
# Restart backend
```

**OPTION 2: Keep Existing Data**

```bash
# More complex - requires data migration script
# Not recommended unless you have production data
```

---

## 🎯 Benefits

| Aspect            | Before                             | After                                  |
| ----------------- | ---------------------------------- | -------------------------------------- |
| **AI Calls**      | Every session (5 questions)        | Once (20 questions)                    |
| **Cost**          | High (repeated API calls)          | Low (one-time generation)              |
| **Speed**         | 3-5 seconds per session            | Instant (random select)                |
| **Quality**       | Varies per generation              | Consistent across users                |
| **Scalability**   | Poor (1000 users = 1000 API calls) | Excellent (unlimited users)            |
| **Question Pool** | 5 per user                         | 20 shared (users get different combos) |

---

## 🚀 How to Use

### **Initialize Question Pool (Admin)**

```python
# In Django shell or management command
from apps.assessments.views import initialize_global_question_pool
initialize_global_question_pool()
# Generates 20 questions from training_material.pdf
```

### **View Questions (Admin Panel)**

```
http://localhost:8000/admin/assessments/globalmcqquestion/
- View all 20 questions
- Edit/Delete/Deactivate questions
- Add more questions manually
```

### **User Experience (No Change!)**

```
- User completes video
- Navigates to MCQ page
- Gets 5 random questions
- Submits answers
- Gets feedback
# User sees no difference - backend magic!
```

---

## 📊 Question Distribution

With 20 questions in pool:

- **Total possible combinations:** C(20,5) = 15,504 unique question sets
- **Same questions chance:** Very low (user gets different sets each time)
- **Coverage:** All 20 questions get used evenly over time

---

## 🔧 Customization

### **Change Number of Questions:**

```python
# In views.py - auto_generate_questions()
selected_questions = random.sample(all_questions, 5)  # Change 5 to any number
```

### **Regenerate Pool:**

```python
# Delete all global questions
GlobalMCQQuestion.objects.all().delete()
# Reinitialize
initialize_global_question_pool()
```

### **Add More Questions:**

```python
# In Django admin or shell
GlobalMCQQuestion.objects.create(
    question_text="Your question?",
    option_a="Option A",
    option_b="Option B",
    option_c="Option C",
    option_d="Option D",
    correct_answer="A",
    explanation="Why A is correct",
    is_active=True
)
```

---

## ✅ Testing Checklist

- [ ] Stop backend server
- [ ] Delete db.sqlite3 (or migrate)
- [ ] Run migrations
- [ ] Start backend
- [ ] Register new user
- [ ] Complete video
- [ ] Check MCQ page loads
- [ ] Verify 5 questions appear
- [ ] Submit answers
- [ ] Check feedback works
- [ ] Register another user
- [ ] Verify they get different 5 questions

---

## 🐛 Troubleshooting

**Error: "Not enough questions in global pool"**
→ Run `initialize_global_question_pool()`

**Error: "Question pool already exists"**
→ System working correctly - questions already generated

**Error: Foreign key constraint**
→ Old data conflicts - delete db.sqlite3 and migrate fresh

**Questions seem repetitive**
→ Increase pool size in initialize function (20 → 50)

---

## 📌 Next Steps

1. ✅ Stop backend server
2. ✅ Delete old database (or migrate carefully)
3. ✅ Run: `python manage.py migrate`
4. ✅ Create superuser again
5. ✅ Start backend
6. ✅ Test full flow
7. ✅ Push to GitHub
8. ✅ Deploy to Railway

---

**Monish - This is a MAJOR improvement! 🎉**

- One-time AI generation
- Infinite scalability
- Consistent quality
- Random variety for users
