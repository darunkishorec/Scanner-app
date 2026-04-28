# FastAPI Backend Deployment Guide

## Overview

You need to deploy the FastAPI backend so:
- Scanner App (Vercel) can connect to it
- POS system can connect after scanning
- No need to keep your PC running with ngrok

## Recommended: Deploy to Render.com (Free)

### Why Render.com?
- ✅ Free tier available
- ✅ Easy deployment from GitHub
- ✅ Automatic HTTPS
- ✅ Good for FastAPI/Python apps
- ✅ No credit card required for free tier

---

## Step 1: Set Up MongoDB Atlas (Cloud Database)

Your backend needs a cloud MongoDB database since Render can't access your local MongoDB.

### 1.1 Create MongoDB Atlas Account

1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up with email or Google
3. Choose **FREE** tier (M0 Sandbox)
4. Select a cloud provider (AWS recommended)
5. Choose region closest to you (e.g., Mumbai for India)
6. Click "Create Cluster"

### 1.2 Create Database User

1. In Atlas dashboard, click "Database Access" (left sidebar)
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Username: `smartcart_admin`
5. Password: Generate a strong password (save it!)
6. Database User Privileges: "Read and write to any database"
7. Click "Add User"

### 1.3 Allow Network Access

1. Click "Network Access" (left sidebar)
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (0.0.0.0/0)
4. Click "Confirm"

**Note:** For production, restrict to specific IPs. For demo, "anywhere" is fine.

### 1.4 Get Connection String

1. Click "Database" (left sidebar)
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string (looks like):
   ```
   mongodb+srv://smartcart_admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<password>` with your actual password
6. Save this connection string - you'll need it!

---

## Step 2: Deploy Backend to Render.com

### 2.1 Create Render Account

1. Go to: https://render.com/
2. Sign up with GitHub (recommended) or email
3. Authorize Render to access your GitHub

### 2.2 Create New Web Service

1. Click "New +" → "Web Service"
2. Connect your GitHub repository: `Scanner-app`
3. Configure the service:

**Basic Settings:**
- **Name:** `smartcart-backend`
- **Region:** Choose closest to you
- **Branch:** `main`
- **Root Directory:** `fastapi-server`
- **Runtime:** `Python 3`
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`

**Instance Type:**
- Select **Free** tier

### 2.3 Add Environment Variables

In the "Environment Variables" section, add:

| Key | Value |
|-----|-------|
| `MONGODB_URL` | Your MongoDB Atlas connection string |
| `DB_NAME` | `smartcart` |
| `STORE_ID` | `store-01` |
| `TOKEN_EXPIRE_MINUTES` | `10` |
| `PYTHON_VERSION` | `3.11.0` |

**Important:** Make sure `MONGODB_URL` has your actual password!

### 2.4 Deploy

1. Click "Create Web Service"
2. Wait 5-10 minutes for deployment
3. Render will:
   - Clone your repo
   - Install dependencies
   - Start the server
   - Give you a URL like: `https://smartcart-backend.onrender.com`

### 2.5 Verify Deployment

Once deployed, test the health endpoint:
```
https://smartcart-backend.onrender.com/api/health
```

Should return:
```json
{
  "status": "operational",
  "services": {
    "fastapi": {"status": "operational"},
    "mongodb": {"status": "operational"}
  }
}
```

---

## Step 3: Initialize Carts on Cloud Backend

After deployment, you need to create the 5 carts in the cloud database:

### Option A: Use Browser

Open in browser:
```
https://smartcart-backend.onrender.com/api/admin/reset-all-carts
```

**Note:** This is a POST request, so you'll need to use a tool like:
- Postman
- Thunder Client (VS Code extension)
- Or use curl in terminal

### Option B: Use curl

```bash
curl -X POST https://smartcart-backend.onrender.com/api/admin/reset-all-carts
```

Should return:
```json
{
  "success": true,
  "message": "All 5 carts have been reset successfully.",
  "cartsReset": 5
}
```

---

## Step 4: Update Vercel Environment Variable

Now update your Scanner App frontend to use the new backend URL:

1. Go to: https://vercel.com/darunkishorec-4458s-projects/scanner-app/settings/environment-variables

2. Edit `VITE_API_URL`:
   - **Old value:** `https://coffee-hesitate-hermit.ngrok-free.dev`
   - **New value:** `https://smartcart-backend.onrender.com`

3. Click "Save"

4. Redeploy:
   - Go to "Deployments" tab
   - Click "..." on latest deployment
   - Click "Redeploy"
   - Wait 1-2 minutes

---

## Step 5: Update POS System Backend URL

The POS system (at `2.1` folder) also needs to connect to the cloud backend.

### 5.1 Update POS Backend Environment

Edit: `C:\Users\darun\Desktop\2.1\backend\.env`

Change the Scanner Backend URL (if it connects to it):
```
SCANNER_BACKEND_URL=https://smartcart-backend.onrender.com
```

### 5.2 Update POS Frontend Environment

Edit: `C:\Users\darun\Desktop\2.1\frontend\.env.local`

Add or update:
```
NEXT_PUBLIC_SCANNER_API_URL=https://smartcart-backend.onrender.com
```

**Note:** The POS system might have its own backend (port 5001). The Scanner Backend is only for the Scanner App and cart management.

---

## Step 6: Test the Complete System

### 6.1 Test Scanner App (Mobile)

1. Open: https://scanner-app-olive.vercel.app/
2. Enter name and phone
3. Click "Open Scanner"
4. Should work without ngrok!

### 6.2 Test POS System (Desktop)

1. Open: http://localhost:3000
2. See QR code on lock screen
3. Scan with Scanner App
4. POS should unlock

---

## Architecture After Deployment

### Before (with ngrok):
```
Scanner App (Vercel)
    ↓
ngrok (your PC)
    ↓
FastAPI Backend (localhost:8000)
    ↓
MongoDB (localhost)
```

### After (fully cloud):
```
Scanner App (Vercel)
    ↓
FastAPI Backend (Render.com)
    ↓
MongoDB Atlas (Cloud)
```

**Benefits:**
- ✅ No need to keep PC running
- ✅ No need for ngrok
- ✅ Permanent URL (doesn't change)
- ✅ Accessible from anywhere
- ✅ Better for demo day

---

## Important Notes

### Free Tier Limitations

**Render.com Free Tier:**
- ⚠️ Service spins down after 15 minutes of inactivity
- ⚠️ First request after spin-down takes 30-60 seconds
- ⚠️ 750 hours/month (enough for demo)

**Solution for Demo Day:**
- Keep the backend "warm" by accessing it every 10 minutes
- Or upgrade to paid tier ($7/month) for always-on

**MongoDB Atlas Free Tier:**
- ✅ 512 MB storage (plenty for your app)
- ✅ Shared cluster (good performance)
- ✅ No time limit

### CORS Configuration

Your `main.py` already has:
```python
allow_origins=["*"]
```

This allows all origins, which is fine for demo. For production, restrict to:
```python
allow_origins=[
    "https://scanner-app-olive.vercel.app",
    "http://localhost:3000",
    "http://localhost:5173"
]
```

---

## Troubleshooting

### Error: "Cannot connect to MongoDB"
**Solution:** Check MongoDB Atlas connection string
- Verify password is correct (no special characters causing issues)
- Check IP whitelist includes 0.0.0.0/0
- Test connection string locally first

### Error: "Service unavailable" on Render
**Solution:** Service might be spinning down
- Wait 30-60 seconds for cold start
- Check Render logs for errors
- Verify all environment variables are set

### Error: "CORS policy" in browser
**Solution:** Check CORS configuration in `main.py`
- Ensure `allow_origins=["*"]` or includes your Vercel domain
- Redeploy after changes

---

## Alternative: Keep Using ngrok (Simpler for Demo)

If deployment seems complex, you can continue using ngrok for your demo:

**Pros:**
- ✅ Already working
- ✅ No cloud setup needed
- ✅ Free

**Cons:**
- ❌ PC must stay on during demo
- ❌ URL changes every restart
- ❌ Must update Vercel env variable each time

**For Demo Day with ngrok:**
1. Start all services (MongoDB, FastAPI, ngrok, POS)
2. Get ngrok URL
3. Update Vercel environment variable
4. Redeploy Vercel
5. Keep PC running during presentation

---

## Recommended Approach

**For Final Year Project Demo:**
- Use **Render.com + MongoDB Atlas** (cloud deployment)
- More professional
- No dependency on your PC
- Permanent URL
- Better for presentation

**Setup Time:**
- MongoDB Atlas: 10 minutes
- Render deployment: 15 minutes
- Testing: 10 minutes
- **Total: ~35 minutes**

---

## Quick Start Commands

### Push Backend Changes to GitHub
```bash
cd "C:\Users\darun\Desktop\scanner app"
git add fastapi-server/
git commit -m "Add deployment configuration for Render"
git push origin main
```

### Test Backend Locally with Cloud MongoDB
```bash
cd fastapi-server
# Update .env with MongoDB Atlas URL
python start.py
```

### Initialize Carts on Cloud
```bash
curl -X POST https://smartcart-backend.onrender.com/api/admin/reset-all-carts
```

---

## Next Steps

1. **Set up MongoDB Atlas** (10 min)
2. **Deploy to Render.com** (15 min)
3. **Initialize carts** (1 min)
4. **Update Vercel** (5 min)
5. **Test complete system** (10 min)

**Total time: ~40 minutes**

Let me know which approach you want to take:
- **Option A:** Deploy to Render.com (recommended for demo)
- **Option B:** Continue with ngrok (simpler, but PC must stay on)
