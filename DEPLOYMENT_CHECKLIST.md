<!-- @format -->

# 📋 Railway Deployment Checklist

Use this checklist to ensure smooth deployment!

---

## 🔲 Pre-Deployment (Do This First)

- [ ] Install `serve` package in frontend

  ```bash
  cd frontend
  npm install --save serve
  ```

- [ ] Get your Gemini API key from https://makersuite.google.com/app/apikey

- [ ] Generate Django secret key:

  ```bash
  cd backend
  python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
  ```

- [ ] Commit all changes:

  ```bash
  git add .
  git commit -m "Ready for Railway deployment"
  ```

- [ ] Create GitHub repository and push code:
  ```bash
  git remote add origin <your-github-repo-url>
  git push -u origin main
  ```

---

## 🔲 Railway Setup

- [ ] Create Railway account at https://railway.app
- [ ] Click "New Project"
- [ ] Select "Deploy from GitHub repo"
- [ ] Authorize Railway to access GitHub
- [ ] Select your `ai-training-platform` repository

---

## 🔲 Backend Deployment

- [ ] Add service from GitHub repo
- [ ] Set root directory to `backend`
- [ ] Add PostgreSQL database
- [ ] Configure environment variables:
  - [ ] `SECRET_KEY` = (your generated secret key)
  - [ ] `DEBUG` = `False`
  - [ ] `ALLOWED_HOSTS` = `.railway.app`
  - [ ] `GEMINI_API_KEY` = (your Gemini API key)
- [ ] Click "Deploy"
- [ ] Wait for deployment (~3-5 minutes)
- [ ] Copy backend URL (e.g., `https://xxx.railway.app`)
- [ ] Test backend: Visit `https://your-backend-url/admin/`

---

## 🔲 Frontend Deployment

- [ ] Add another service from same GitHub repo
- [ ] Set root directory to `frontend`
- [ ] Configure environment variables:
  - [ ] `REACT_APP_API_URL` = `https://your-backend-url/api`
  - [ ] `NODE_VERSION` = `18`
- [ ] Click "Deploy"
- [ ] Wait for deployment (~5-10 minutes)
- [ ] Copy frontend URL (e.g., `https://yyy.railway.app`)

---

## 🔲 Update Backend CORS

- [ ] Go to backend service → Variables
- [ ] Add/Update:
  - [ ] `CORS_ALLOWED_ORIGINS` = `https://your-frontend-url.railway.app`
- [ ] Redeploy backend
- [ ] Wait for restart (~1 minute)

---

## 🔲 Create Admin User (Optional)

- [ ] Install Railway CLI: `npm install -g @railway/cli`
- [ ] Login: `railway login`
- [ ] Link project: `railway link`
- [ ] Create superuser:
  ```bash
  railway run -s backend python manage.py createsuperuser
  ```

---

## 🔲 Testing

- [ ] Visit frontend URL
- [ ] Test user registration
- [ ] Test Laura's greeting (voice should work)
- [ ] Test video playback
- [ ] Test MCQ generation (takes ~30 seconds)
- [ ] Test answering questions
- [ ] Test feedback page (Laura should speak)
- [ ] Verify score shows as X/5

---

## 🔲 Final Verification

- [ ] Check backend logs (no errors)
- [ ] Check frontend logs (no errors)
- [ ] Test on different browsers
- [ ] Test on mobile device
- [ ] Verify video file plays correctly
- [ ] Verify all Laura voice features work
- [ ] Check Railway usage dashboard

---

## 🔲 Post-Deployment

- [ ] Save both URLs:

  - Backend: `___________________________`
  - Frontend: `___________________________`

- [ ] Document admin credentials safely

- [ ] Set up monitoring/alerts (optional)

- [ ] Share app with users

- [ ] Monitor usage in Railway dashboard

---

## 📊 Expected Deployment Times

| Service          | Time     | Status |
| ---------------- | -------- | ------ |
| Backend Build    | 3-5 min  | ⏳     |
| Frontend Build   | 5-10 min | ⏳     |
| PostgreSQL Setup | 1 min    | ⏳     |
| Total            | ~15 min  | ⏳     |

---

## ⚠️ Troubleshooting

If something doesn't work:

1. ✅ Check deployment logs in Railway
2. ✅ Verify all environment variables are set
3. ✅ Ensure both URLs are HTTPS
4. ✅ Check browser console for errors
5. ✅ Verify video file is in frontend/public folder

---

## 🎉 Success!

If all checkboxes are ✅, your app is live!

**Frontend URL**: `https://your-app.railway.app`

Share it with your users and enjoy! 🚀

---

**Need Help?**

- Read: `QUICK_RAILWAY_DEPLOY.md`
- Or: `RAILWAY_DEPLOYMENT_GUIDE.md`
