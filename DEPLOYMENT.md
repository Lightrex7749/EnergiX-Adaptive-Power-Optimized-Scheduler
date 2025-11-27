# EnergiX Deployment Guide

## 🚀 Deployment Setup: Vercel + Railway

This guide will help you deploy the EnergiX CPU Scheduler on **Vercel** (frontend) and **Railway** (backend).

---

## 📋 Prerequisites

- GitHub account
- Vercel account (sign up at https://vercel.com)
- Railway account (sign up at https://railway.app)

---

## 🔧 Part 1: Deploy Backend to Railway

### Step 1: Sign Up/Login to Railway
1. Go to https://railway.app
2. Click "Login with GitHub"
3. Authorize Railway to access your GitHub

### Step 2: Create New Project
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your repository: `EnergiX-Adaptive-Power-Optimized-Scheduler`

### Step 3: Configure Backend Service
1. Railway will detect it's a Python project
2. Click on the service → Settings
3. Set **Root Directory**: `backend`
4. Set **Build Command**: `pip install -r requirements.txt`
5. Set **Start Command**: `uvicorn server:app --host 0.0.0.0 --port $PORT`

### Step 4: Add Environment Variables
1. Go to Variables tab
2. Add these variables:
   ```
   PORT=8001
   PYTHON_VERSION=3.11.0
   MONGO_URL=mongodb://localhost:27017
   DB_NAME=energix
   ```

### Step 5: Deploy
1. Click "Deploy"
2. Wait for deployment to complete
3. Copy your backend URL (looks like: `https://energix-backend-production.up.railway.app`)

---

## 🌐 Part 2: Deploy Frontend to Vercel

### Step 1: Update Frontend Environment Variable
1. Open `frontend/.env.production`
2. Replace the backend URL with your Railway URL:
   ```
   REACT_APP_BACKEND_URL=https://your-actual-backend-url.up.railway.app
   ```
3. Commit and push changes:
   ```bash
   git add .
   git commit -m "Update backend URL for production"
   git push origin main
   ```

### Step 2: Sign Up/Login to Vercel
1. Go to https://vercel.com
2. Click "Sign Up" or "Login"
3. Choose "Continue with GitHub"

### Step 3: Import Project
1. Click "Add New..." → "Project"
2. Import your GitHub repository
3. Vercel will detect it's a React app

### Step 4: Configure Build Settings
1. **Framework Preset**: Create React App
2. **Root Directory**: `frontend`
3. **Build Command**: `npm run build` (default)
4. **Output Directory**: `build` (default)
5. **Install Command**: `npm install` (default)

### Step 5: Add Environment Variables
1. Go to "Environment Variables" section
2. Add:
   ```
   REACT_APP_BACKEND_URL=https://your-railway-backend-url.up.railway.app
   ```

### Step 6: Deploy
1. Click "Deploy"
2. Wait 2-3 minutes for build to complete
3. You'll get a URL like: `https://energix-frontend.vercel.app`

---

## ✅ Part 3: Test Your Deployment

### Test Backend
```bash
# Replace with your Railway URL
curl https://your-backend.up.railway.app/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "CPU Scheduler API"
}
```

### Test Frontend
1. Open your Vercel URL in browser
2. Navigate to `/scheduler-index.html`
3. Try running a scheduling algorithm
4. Check if charts and results appear

---

## 🔄 Auto-Deployment

Both platforms are now configured for **automatic deployment**:

- **Push to GitHub** → Railway & Vercel automatically redeploy
- **No manual intervention** needed
- **Build logs** available in both dashboards

---

## 🐛 Troubleshooting

### Backend Issues

**Problem**: Backend not responding
```bash
# Check Railway logs
# Go to Railway dashboard → Your service → Deployments → View logs
```

**Problem**: CORS errors
- Ensure backend CORS is configured for your Vercel domain
- Check `server.py` for CORS middleware settings

### Frontend Issues

**Problem**: Can't connect to backend
1. Check `frontend/.env.production` has correct backend URL
2. Verify environment variable in Vercel dashboard
3. Redeploy frontend

**Problem**: Build fails
- Check Vercel build logs
- Ensure all dependencies are in `package.json`
- Try building locally first: `npm run build`

### Common Fixes

**Railway sleeping:**
- Free tier sleeps after inactivity
- First request takes ~30 seconds to wake up
- Consider upgrading or using a health check service

**Environment variables not working:**
1. Redeploy after adding variables
2. Check variable names match exactly
3. Restart services

---

## 💰 Cost & Limits

### Railway Free Tier
- $5 credit per month
- Usually enough for small apps
- Sleeps after inactivity
- Can upgrade if needed

### Vercel Free Tier
- 100 GB bandwidth/month
- Unlimited deployments
- Perfect for frontend
- More than enough for your project

---

## 📝 Custom Domains (Optional)

### Vercel Custom Domain
1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

### Railway Custom Domain
1. Go to Service Settings → Domains
2. Add custom domain
3. Update CNAME record

---

## 🎉 Success!

Your app is now live:
- **Frontend**: https://your-app.vercel.app
- **Backend**: https://your-backend.up.railway.app
- **Scheduler**: https://your-app.vercel.app/scheduler-index.html

Share the link for your academic project submission! 🚀

---

## 📞 Support

- **Railway**: https://help.railway.app
- **Vercel**: https://vercel.com/docs

---

**Deployment Date**: November 2025  
**Status**: Production Ready ✅
