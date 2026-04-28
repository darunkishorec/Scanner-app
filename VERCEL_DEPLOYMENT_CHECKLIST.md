# Vercel Deployment Checklist

## Pre-Deployment Setup

### 1. Local Testing
- [ ] Verify `client/.env` exists with `VITE_API_URL=http://localhost:8000`
- [ ] Test app locally: `cd client && npm run dev`
- [ ] Test admin dashboard at `http://localhost:5173/admin`
- [ ] Test scanner app at `http://localhost:5173`
- [ ] Verify backend is running at `http://localhost:8000`

### 2. Git Repository Setup
- [ ] Initialize Git: `git init`
- [ ] Verify `.gitignore` exists in `client` folder
- [ ] Verify `.env` is listed in `.gitignore`
- [ ] Verify `.env.example` is NOT in `.gitignore`
- [ ] Add files: `git add .`
- [ ] Commit: `git commit -m "Initial commit - Scanner App ready for deployment"`
- [ ] Create GitHub repository
- [ ] Push to GitHub: `git push -u origin main`
- [ ] Verify `.env` was NOT pushed (check GitHub repo)
- [ ] Verify `.env.example` IS visible on GitHub

## Vercel Deployment

### 3. Deploy to Vercel
- [ ] Go to [vercel.com](https://vercel.com) and sign in
- [ ] Click "New Project"
- [ ] Import your GitHub repository
- [ ] **Important:** Set Root Directory to `client`
- [ ] Framework Preset should auto-detect as "Vite"
- [ ] Click "Deploy"
- [ ] Wait for deployment to complete
- [ ] Copy your Vercel app URL (e.g., `https://smartcart-scanner.vercel.app`)

### 4. Configure Environment Variables
- [ ] In Vercel project, go to Settings → Environment Variables
- [ ] Add new variable:
  - **Name:** `VITE_API_URL`
  - **Value:** `https://your-ngrok-url.ngrok.io` (temporary - will update on demo day)
  - **Environment:** Production, Preview, Development (select all)
- [ ] Click "Save"
- [ ] Go to Deployments tab
- [ ] Click "..." on latest deployment → "Redeploy"
- [ ] Wait for redeployment to complete

## Demo Day Setup

### 5. Backend Preparation (On Your PC)
- [ ] Ensure MongoDB is running
- [ ] Start FastAPI backend:
  ```bash
  cd "C:\Users\darun\Desktop\scanner app\fastapi-server"
  python start.py
  ```
- [ ] Verify backend is running at `http://localhost:8000`
- [ ] Test health endpoint: `http://localhost:8000/api/health`

### 6. ngrok Setup
- [ ] Download and install ngrok from [ngrok.com](https://ngrok.com/download)
- [ ] Open new terminal
- [ ] Run: `ngrok http 8000`
- [ ] Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)
- [ ] **Important:** Keep this terminal window open during demo

### 7. Update Vercel Environment Variable
- [ ] Go to Vercel project → Settings → Environment Variables
- [ ] Find `VITE_API_URL` variable
- [ ] Click "Edit"
- [ ] Update value to your new ngrok URL: `https://abc123.ngrok.io`
- [ ] Click "Save"
- [ ] Go to Deployments tab
- [ ] Click "..." on latest deployment → "Redeploy"
- [ ] Wait for redeployment (usually 1-2 minutes)

### 8. Final Testing
- [ ] Open your Vercel app URL in browser
- [ ] Test scanner app homepage loads
- [ ] Test admin login at `/admin`
  - Username: `smartcart_admin`
  - Password: `admin@2025`
- [ ] Verify admin dashboard loads and shows carts
- [ ] Test QR code scanning (if you have QR codes generated)
- [ ] Check browser console for any errors
- [ ] Verify no CORS errors

## During Demo

### 9. Keep Running
- [ ] Keep your PC on and connected to internet
- [ ] Keep MongoDB running
- [ ] Keep FastAPI backend running
- [ ] Keep ngrok terminal open
- [ ] Monitor ngrok terminal for incoming requests

### 10. If ngrok Disconnects
- [ ] Restart ngrok: `ngrok http 8000`
- [ ] Copy new HTTPS URL
- [ ] Update Vercel environment variable
- [ ] Redeploy Vercel project
- [ ] Wait 1-2 minutes for deployment
- [ ] Test the app again

## Troubleshooting

### App shows "Network Error" or "Failed to fetch"
- **Check:** Is ngrok running?
- **Check:** Is the ngrok URL in Vercel environment variables correct?
- **Check:** Did you redeploy after updating the environment variable?
- **Check:** Is your PC connected to internet?

### Admin dashboard shows empty carts
- **Check:** Is MongoDB running?
- **Check:** Is FastAPI backend running?
- **Check:** Check backend terminal for errors

### QR scanner doesn't work
- **Check:** Camera permissions in browser
- **Check:** HTTPS is required for camera access (Vercel provides HTTPS)
- **Check:** Try manual entry option

### CORS errors in browser console
- **Check:** Verify `fastapi-server/main.py` has `allow_origins=["*"]`
- **Check:** Restart FastAPI backend if you changed CORS settings

## Post-Demo Cleanup

### 11. Optional: Stop Services
- [ ] Stop ngrok (Ctrl+C in terminal)
- [ ] Stop FastAPI backend (Ctrl+C in terminal)
- [ ] Stop MongoDB (if desired)
- [ ] Vercel app will remain live but won't connect to backend

### 12. For Next Demo
- [ ] Repeat steps 5-8 (Backend + ngrok + Update Vercel)
- [ ] ngrok URL will be different each time (unless you have paid plan)

---

## Quick Reference

### Important URLs
- **Vercel App:** `https://your-app-name.vercel.app`
- **Admin Login:** `https://your-app-name.vercel.app/admin`
- **Local Backend:** `http://localhost:8000`
- **ngrok Dashboard:** `http://localhost:4040` (when ngrok is running)

### Admin Credentials
- **Username:** `smartcart_admin`
- **Password:** `admin@2025`

### Key Files
- **Environment Config:** `client/.env` (local), Vercel dashboard (production)
- **Vercel Config:** `client/vercel.json`
- **Backend CORS:** `fastapi-server/main.py`
- **Git Ignore:** `client/.gitignore`

---

**Estimated Time:**
- Initial setup: 30 minutes
- Demo day setup: 5 minutes
- Troubleshooting (if needed): 5-10 minutes

**Good luck with your demo! 🚀**
