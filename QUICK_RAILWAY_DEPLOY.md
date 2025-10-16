<!-- @format -->

# Quick Railway Deployment Steps

## 🚀 Quick Start (15 minutes)

### 1️⃣ Prepare Your Code

```bash
cd "C:\Users\Dhanush\Desktop\all projects\AI examiner\ai-training-platform"

# Install serve for frontend
cd frontend
npm install --save serve
cd ..

# Commit all changes
git add .
git commit -m "Prepare for Railway deployment"
```

### 2️⃣ Push to GitHub

```bash
# If you haven't created a GitHub repo yet:
# 1. Go to github.com
# 2. Create a new repository (e.g., "ai-training-platform")
# 3. Copy the repo URL

git remote add origin <your-github-repo-url>
git push -u origin main
```

### 3️⃣ Deploy on Railway

**A. Create Account & Project:**

1. Go to https://railway.app and sign up
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Authorize Railway to access your GitHub
5. Select your `ai-training-platform` repository

**B. Deploy Backend:**

1. Railway detects your repo
2. Click **"Add variables"** (we'll add them in next step)
3. Set **Root Directory** to `backend`
4. Click **"Deploy"**

**C. Add PostgreSQL Database:**

1. In the project, click **"New"** → **"Database"** → **"PostgreSQL"**
2. Railway will automatically link it to your backend

**D. Configure Backend Environment Variables:**

Click backend service → **Variables** → Add these:

```env
SECRET_KEY=django-insecure-change-this-to-something-random-and-secure-123456
DEBUG=False
ALLOWED_HOSTS=.railway.app
GEMINI_API_KEY=<your-actual-gemini-api-key>
```

Click **"Deploy"** to restart.

**E. Deploy Frontend:**

1. In the same project, click **"New"** → **"GitHub Repo"**
2. Select the same repository
3. Set **Root Directory** to `frontend`
4. Add Environment Variable:
   ```env
   REACT_APP_API_URL=https://<your-backend-url>.railway.app/api
   ```
   (Replace with your actual backend URL from step D)
5. Click **"Deploy"**

### 4️⃣ Update CORS Settings

Once frontend is deployed:

1. Copy the frontend URL (e.g., `https://ai-training-frontend.railway.app`)
2. Go to backend service → **Variables**
3. Update:
   ```env
   CORS_ALLOWED_ORIGINS=https://your-frontend-url.railway.app
   ```
4. Click **"Deploy"** to restart backend

### 5️⃣ Test Your App! 🎉

Visit your frontend URL and test:

- ✅ User registration
- ✅ Laura's greeting
- ✅ Video playback
- ✅ MCQ generation
- ✅ Feedback from Laura

---

## 📝 Important Notes

### Video File Size

- Your `training-video.mp4` is in `frontend/public/`
- It will be included in the build
- If the video is very large (>100MB), consider using YouTube or cloud storage

### Free Tier Limits

- Railway gives $5 credit/month (free tier)
- Typically enough for:
  - Backend service
  - Frontend service
  - PostgreSQL database
- Monitor usage in Railway dashboard

### Database Migrations

Railway automatically runs migrations from `railway.json`:

```bash
python manage.py migrate && python manage.py collectstatic --noinput
```

If you need to create a superuser:

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and link
railway login
railway link

# Create superuser
railway run -s backend python manage.py createsuperuser
```

---

## 🔧 Troubleshooting

### Issue: "Application failed to respond"

**Solution**: Check backend logs in Railway dashboard

- Click backend service → Deployments → View Logs
- Look for errors in Django startup

### Issue: Frontend can't reach backend

**Solution**:

1. Verify `REACT_APP_API_URL` is correct in frontend variables
2. Check `CORS_ALLOWED_ORIGINS` in backend variables
3. Make sure both URLs are HTTPS (Railway provides SSL automatically)

### Issue: MCQ generation fails

**Solution**: Check if `GEMINI_API_KEY` is set correctly

- Go to backend service → Variables
- Verify the API key is valid

### Issue: Video won't play

**Solution**:

- Check if video file exists in `frontend/public/training-video.mp4`
- Verify video file size isn't too large
- Check browser console for 404 errors

---

## 📊 Expected URLs

After deployment, you'll have:

| Service      | Example URL                                              |
| ------------ | -------------------------------------------------------- |
| Backend API  | `https://ai-training-backend-production.up.railway.app`  |
| Frontend App | `https://ai-training-frontend-production.up.railway.app` |
| Admin Panel  | `https://[backend-url]/admin/`                           |

---

## 🎯 Next Steps

After successful deployment:

1. **Create Admin User**: Use Railway CLI to create superuser
2. **Test Full Flow**: Register → Greeting → Video → MCQ → Feedback
3. **Monitor Usage**: Check Railway dashboard for resource usage
4. **Custom Domain** (Optional): Add your own domain in Railway settings
5. **Set Up Backups**: Regularly backup your PostgreSQL database

---

## 💡 Pro Tips

1. **Auto-Deploy**: Railway automatically deploys when you push to GitHub
2. **Environment Variables**: Never commit `.env` files - use Railway variables
3. **Logs**: Always check logs if something doesn't work
4. **Staging**: Consider creating a separate Railway project for staging/testing

---

## 📚 Useful Links

- Railway Dashboard: https://railway.app/dashboard
- Railway Docs: https://docs.railway.app/
- Railway CLI: https://docs.railway.app/develop/cli

---

**That's it! Your AI Training Platform is now live! 🚀**
