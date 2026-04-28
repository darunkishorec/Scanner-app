# Update Vercel Environment Variable

## Step-by-Step Instructions

### 1. Get your ngrok URL
Open a new terminal and run:
```bash
ngrok http 8000
```

Look for the line that says:
```
Forwarding    https://YOUR-URL-HERE.ngrok-free.app -> http://localhost:8000
```

Copy the HTTPS URL (e.g., `https://abc123-456-789.ngrok-free.app`)

### 2. Update Vercel Environment Variable

**Option A: Via Vercel Dashboard (Recommended)**

1. Go to: https://vercel.com/darunkishorec-4458s-projects/scanner-app/settings/environment-variables

2. Find the `VITE_API_URL` variable

3. Click the "..." menu → "Edit"

4. Change the value to your ngrok URL:
   ```
   https://YOUR-URL-HERE.ngrok-free.app
   ```
   (Replace with your actual ngrok URL)

5. Click "Save"

### 3. Redeploy Your App

1. Go to: https://vercel.com/darunkishorec-4458s-projects/scanner-app

2. Click "Deployments" tab

3. Click "..." on the latest deployment

4. Click "Redeploy"

5. Wait 1-2 minutes for deployment to complete

### 4. Test Your App

Open: https://scanner-app-olive.vercel.app/

- Scanner app should load
- Admin dashboard should work at: https://scanner-app-olive.vercel.app/admin
- Backend API calls should work through ngrok

---

## Important Notes

⚠️ **ngrok URL changes every time you restart ngrok** (unless you have a paid plan)

When you restart ngrok:
1. Get the new URL
2. Update Vercel environment variable
3. Redeploy

---

## Demo Day Checklist

Before your presentation:

- [ ] Start MongoDB
- [ ] Start FastAPI backend: `cd fastapi-server && python start.py`
- [ ] Start ngrok: `ngrok http 8000`
- [ ] Copy ngrok HTTPS URL
- [ ] Update Vercel environment variable with new ngrok URL
- [ ] Redeploy Vercel app
- [ ] Test: https://scanner-app-olive.vercel.app/
- [ ] Keep your PC running during demo!

---

## Current Status

✅ Frontend deployed: https://scanner-app-olive.vercel.app/
✅ Backend running: http://localhost:8000
⏳ ngrok tunnel: **You need to start this manually**
⏳ Vercel env variable: **Update with ngrok URL**

---

## Quick Test (Without ngrok)

If you want to test locally without ngrok:

1. Open terminal in `scanner app/client`
2. Run: `npm run dev`
3. Open: http://localhost:5173
4. Everything will work locally!
