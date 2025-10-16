<!-- @format -->

# Railway Deployment Guide - AI Training Platform

## Overview

This guide will help you deploy both the **Backend (Django)** and **Frontend (React)** to Railway.

---

## Prerequisites

1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **GitHub Account**: Your code should be pushed to GitHub
3. **Environment Variables Ready**: Have your API keys ready (Gemini API, etc.)

---

## Part 1: Deploy Backend (Django)

### Step 1: Push Code to GitHub

```bash
cd "C:\Users\Dhanush\Desktop\all projects\AI examiner\ai-training-platform"
git init
git add .
git commit -m "Initial commit - AI Training Platform"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

### Step 2: Create New Railway Project

1. Go to [railway.app](https://railway.app)
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Authorize Railway to access your GitHub
5. Select your `ai-training-platform` repository

### Step 3: Deploy Backend Service

1. Railway will detect your repository
2. Click **"Add a new service"** → **"GitHub Repo"**
3. Select the repository and **specify root directory**: `backend`
4. Railway will automatically detect Django and use `railway.json` config

### Step 4: Add PostgreSQL Database

1. In your Railway project, click **"New"** → **"Database"** → **"Add PostgreSQL"**
2. Railway will automatically create a database and provide connection details
3. The `DATABASE_URL` will be automatically added to your backend service

### Step 5: Configure Backend Environment Variables

Click on your **backend service** → **"Variables"** tab → Add these:

```env
# Django Settings
SECRET_KEY=your-super-secret-key-here-change-this-in-production
DEBUG=False
ALLOWED_HOSTS=.railway.app,localhost,127.0.0.1

# Database (automatically set by Railway)
DATABASE_URL=<automatically-provided-by-railway>

# CORS Settings
CORS_ALLOWED_ORIGINS=https://your-frontend-url.railway.app,http://localhost:3000

# AI API Keys
GEMINI_API_KEY=your-gemini-api-key-here

# Optional: LiveKit (if using avatar features)
LIVEKIT_API_KEY=your-livekit-api-key
LIVEKIT_API_SECRET=your-livekit-api-secret
LIVEKIT_URL=wss://your-livekit-server.livekit.cloud
```

**Important Notes:**

- Replace `your-super-secret-key-here` with a secure secret key
- Replace `your-gemini-api-key-here` with your actual Gemini API key
- After frontend is deployed, update `CORS_ALLOWED_ORIGINS` with the actual frontend URL

### Step 6: Deploy Backend

1. Click **"Deploy"** (or it may auto-deploy)
2. Wait for build to complete (3-5 minutes)
3. Once deployed, you'll get a URL like: `https://ai-training-backend.railway.app`
4. Test it by visiting: `https://your-backend-url.railway.app/admin/`

---

## Part 2: Deploy Frontend (React)

### Step 1: Update Frontend API URL

Before deploying frontend, update the API base URL:

**File**: `frontend/src/services/api.ts`

Find the line:

```typescript
const API_BASE_URL = "http://localhost:8000/api";
```

Replace with:

```typescript
const API_BASE_URL =
	process.env.REACT_APP_API_URL || "http://localhost:8000/api";
```

Commit this change:

```bash
git add .
git commit -m "Update API URL for production"
git push
```

### Step 2: Create Frontend Service in Railway

1. In the same Railway project, click **"New"** → **"GitHub Repo"**
2. Select the same repository
3. **Specify root directory**: `frontend`
4. Railway will detect it's a React app (package.json)

### Step 3: Configure Frontend Environment Variables

Click on your **frontend service** → **"Variables"** tab → Add:

```env
REACT_APP_API_URL=https://your-backend-url.railway.app/api
NODE_VERSION=18
```

**Important**: Replace `your-backend-url` with your actual backend URL from Part 1, Step 6.

### Step 4: Configure Build Settings

Railway should automatically detect the build command from `package.json`, but verify:

**Build Command**: `npm run build`
**Start Command**: `npx serve -s build -l $PORT`

If not automatically detected, you can add a `railway.json` in the `frontend` folder:

```json
{
	"$schema": "https://railway.app/railway.schema.json",
	"build": {
		"builder": "NIXPACKS"
	},
	"deploy": {
		"startCommand": "npx serve -s build -l $PORT",
		"restartPolicyType": "ON_FAILURE",
		"restartPolicyMaxRetries": 10
	}
}
```

### Step 5: Add `serve` Package

Add `serve` to your frontend dependencies:

```bash
cd frontend
npm install --save serve
```

Update `package.json` to include:

```json
{
	"scripts": {
		"start": "react-scripts start",
		"build": "react-scripts build",
		"serve": "serve -s build -l 3000"
	}
}
```

Commit and push:

```bash
git add .
git commit -m "Add serve for production"
git push
```

### Step 6: Deploy Frontend

1. Railway will auto-deploy after detecting changes
2. Wait for build (5-10 minutes for React build)
3. You'll get a URL like: `https://ai-training-frontend.railway.app`

---

## Part 3: Final Configuration

### Step 1: Update Backend CORS

Go back to **backend service** → **Variables** → Update:

```env
CORS_ALLOWED_ORIGINS=https://your-actual-frontend-url.railway.app,http://localhost:3000
ALLOWED_HOSTS=your-backend-url.railway.app,localhost,127.0.0.1
```

Click **"Deploy"** to restart with new settings.

### Step 2: Run Migrations (if needed)

If migrations didn't run automatically:

1. Go to backend service → **"Deployments"** tab
2. Click on latest deployment → **"View Logs"**
3. Or use Railway CLI:

```bash
railway login
railway link
railway run python manage.py migrate
railway run python manage.py createsuperuser
```

### Step 3: Upload Training Video

Since Railway doesn't persist uploaded files by default, you have two options:

**Option A: Use S3/Cloudinary (Recommended for Production)**

- Set up AWS S3 or Cloudinary
- Update Django settings to use cloud storage

**Option B: Keep in Public Folder (Current Setup)**

- Your `training-video.mp4` is in `frontend/public/`
- It will be bundled with the build
- This works fine for a single training video

---

## Part 4: Testing Your Deployment

### Test Backend:

1. Visit: `https://your-backend-url.railway.app/admin/`
2. Login with superuser credentials
3. Test API: `https://your-backend-url.railway.app/api/users/`

### Test Frontend:

1. Visit: `https://your-frontend-url.railway.app/`
2. Register a new user
3. Complete the full training flow:
   - Registration → Greeting → Video → MCQ → Feedback

### Test Video Playback:

- Ensure the training video loads and plays
- Laura's pre-video and post-video speech should work
- MCQ generation should work

---

## Part 5: Monitoring & Logs

### View Logs:

1. Go to Railway dashboard
2. Click on service (backend or frontend)
3. Go to **"Deployments"** → Click deployment → **"View Logs"**

### Monitor Usage:

- Railway provides usage metrics in the dashboard
- Free tier includes: $5 credit/month
- Monitor database size and bandwidth

---

## Troubleshooting

### Issue: Backend 500 Error

**Solution**: Check backend logs for errors. Common issues:

- Missing environment variables
- Database connection issues
- CORS configuration

### Issue: Frontend Can't Connect to Backend

**Solution**:

- Verify `REACT_APP_API_URL` is correct
- Check backend CORS settings
- Check browser console for CORS errors

### Issue: Video Won't Play

**Solution**:

- Check if video file is in `frontend/public/`
- Verify video file size (Railway has limits)
- Check browser console for 404 errors

### Issue: Database Reset

**Solution**: Railway's free tier may reset database. To prevent:

- Upgrade to paid tier for persistent storage
- Or regularly backup database:

```bash
railway run python manage.py dumpdata > backup.json
```

---

## Railway CLI Commands (Optional)

Install Railway CLI:

```bash
npm install -g @railway/cli
```

Useful commands:

```bash
railway login                    # Login to Railway
railway link                     # Link to your project
railway status                   # Check deployment status
railway logs                     # View logs
railway run python manage.py migrate    # Run Django commands
railway variables                # View environment variables
```

---

## Cost Estimation

**Railway Free Tier:**

- $5 credit/month
- Enough for small projects
- No credit card required

**Typical Usage:**

- Backend: ~$3-4/month
- Frontend: ~$1-2/month
- Database: Included in backend usage

**Upgrade to Developer Plan ($5/month) for:**

- More resources
- Persistent storage
- Priority support

---

## Summary of URLs

After deployment, you'll have:

1. **Backend API**: `https://your-backend.railway.app`
2. **Frontend App**: `https://your-frontend.railway.app`
3. **Database**: Managed by Railway (internal)

Save these URLs and update all environment variables accordingly!

---

## Next Steps

1. ✅ Set up custom domain (optional)
2. ✅ Enable SSL (automatic with Railway)
3. ✅ Set up monitoring/alerts
4. ✅ Configure automated backups
5. ✅ Add CI/CD pipeline (Railway auto-deploys on push)

---

## Support

- Railway Docs: https://docs.railway.app/
- Railway Discord: https://discord.gg/railway
- Django Deployment: https://docs.djangoproject.com/en/4.2/howto/deployment/

---

**Good luck with your deployment! 🚀**
