# ngrok Setup Fix - Microsoft Store Version Issue

## Problem
The Microsoft Store version of ngrok (3.39.0-msix-stable) has a bug with the updater component that causes it to crash with:
```
panic: disabled updater should never run
```

## Solution: Use Standalone ngrok

### Option 1: Download Standalone Version (Recommended)

1. **Uninstall Microsoft Store version** (optional but recommended):
   - Open Settings → Apps → Installed apps
   - Search for "ngrok"
   - Click "..." → Uninstall

2. **Download standalone ngrok:**
   - Go to: https://ngrok.com/download
   - Click "Download for Windows"
   - Extract the ZIP file to a folder like `C:\ngrok\`

3. **Add to PATH** (optional but convenient):
   - Right-click "This PC" → Properties → Advanced system settings
   - Click "Environment Variables"
   - Under "System variables", find "Path" and click "Edit"
   - Click "New" and add `C:\ngrok\` (or wherever you extracted it)
   - Click OK on all dialogs

4. **Test it:**
   ```bash
   ngrok version
   ```

### Option 2: Manual Workaround (Quick Fix)

If you want to keep the Microsoft Store version, you need to manually open ngrok in a separate terminal:

1. **Open a NEW terminal window** (separate from this one)

2. **Run this command:**
   ```bash
   ngrok http 8000
   ```

3. **Look for the forwarding URL** in the output:
   ```
   Forwarding    https://abc123-456-789.ngrok-free.app -> http://localhost:8000
   ```

4. **Copy the HTTPS URL** (the one that looks like `https://abc123-456-789.ngrok-free.app`)

5. **Keep that terminal window open!** Don't close it during your demo.

## Next Steps After Getting ngrok URL

Once you have the ngrok HTTPS URL:

### 1. Update Vercel Environment Variable

Go to: https://vercel.com/darunkishorec-4458s-projects/scanner-app/settings/environment-variables

- Find `VITE_API_URL`
- Click "..." → "Edit"
- Change value to your ngrok URL: `https://YOUR-URL-HERE.ngrok-free.app`
- Click "Save"

### 2. Redeploy Vercel App

Go to: https://vercel.com/darunkishorec-4458s-projects/scanner-app

- Click "Deployments" tab
- Click "..." on the latest deployment
- Click "Redeploy"
- Wait 1-2 minutes

### 3. Test Your Live App

Open: https://scanner-app-olive.vercel.app/

- Scanner app should load
- Admin dashboard should work
- Backend API calls should work through ngrok

## Important Notes

⚠️ **ngrok URL changes every restart** (free tier)
- Each time you restart ngrok, you get a new URL
- You must update Vercel environment variable with the new URL
- You must redeploy Vercel app after updating

⚠️ **Keep terminal open during demo**
- Don't close the ngrok terminal window
- If it closes, you need to restart and update Vercel again

⚠️ **PC must stay on and connected**
- Your PC is running the backend
- ngrok is tunneling to your PC
- If PC sleeps or disconnects, the app won't work

## Demo Day Checklist

Before your presentation:

- [ ] Start MongoDB
- [ ] Start FastAPI backend: `cd fastapi-server && python start.py`
- [ ] Open NEW terminal window
- [ ] Start ngrok: `ngrok http 8000`
- [ ] Copy ngrok HTTPS URL from terminal output
- [ ] Update Vercel environment variable with ngrok URL
- [ ] Redeploy Vercel app
- [ ] Wait 1-2 minutes for deployment
- [ ] Test: https://scanner-app-olive.vercel.app/
- [ ] Keep PC running and ngrok terminal open during demo!

## Current Status

✅ Backend running: http://localhost:8000 (confirmed working)
✅ Frontend deployed: https://scanner-app-olive.vercel.app/
⏳ ngrok tunnel: **You need to start this manually in a NEW terminal**
⏳ Vercel env variable: **Update with ngrok URL after starting ngrok**

---

**What to do RIGHT NOW:**

1. Open a NEW terminal window (separate from this one)
2. Run: `ngrok http 8000`
3. Copy the HTTPS forwarding URL
4. Come back and tell me the URL, or proceed to update Vercel yourself

The ngrok terminal will show something like:
```
Session Status                online
Account                       Free (Version: 3.x)
Forwarding                    https://abc123-456-789.ngrok-free.app -> http://localhost:8000
```

Copy that HTTPS URL and use it in Vercel!
