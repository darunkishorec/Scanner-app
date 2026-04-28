# Start All Systems - Complete Guide

## You Have TWO Separate Backend Systems!

### System 1: Scanner App (Customer App)
- **Backend:** FastAPI on port 8000
- **Frontend:** Deployed on Vercel
- **Purpose:** Customers scan QR codes

### System 2: POS System (Staff App)
- **Backend:** Node.js on port 5001
- **Frontend:** Next.js on port 3000
- **Purpose:** Staff manage carts and checkout

**BOTH backends must be running!**

---

## Current Status

✅ **POS Backend:** Running on port 5001
✅ **POS Frontend:** Running on port 3000
✅ **ngrok:** Running, forwarding to port 8000
❌ **Scanner Backend:** NOT running on port 8000 (THIS IS THE PROBLEM!)

---

## How to Start Everything

### Terminal 1: Scanner Backend (FastAPI)
```bash
cd C:\Users\darun\Desktop\scanner app\fastapi-server
python start.py
```
**Expected:** `Uvicorn running on http://127.0.0.1:8000`

### Terminal 2: ngrok (Tunnel for Scanner Backend)
```bash
cd C:\Users\darun\Downloads\ngrok-v3-stable-windows-amd64
ngrok http 8000
```
**Expected:** `Forwarding https://coffee-hesitate-hermit.ngrok-free.dev -> http://localhost:8000`

### Terminal 3: POS Backend (Node.js)
```bash
cd C:\Users\darun\Desktop\2.1\backend
npm start
```
**Expected:** `✅ MongoDB Connected` and `🚀 Server running on port 5001`

### Terminal 4: POS Frontend (Next.js)
```bash
cd C:\Users\darun\Desktop\2.1\frontend
npm run dev
```
**Expected:** `ready - started server on 0.0.0.0:3000`

---

## Access URLs

| Service | URL | Purpose |
|---------|-----|---------|
| Scanner App (Mobile) | https://scanner-app-olive.vercel.app/ | Customer scans QR |
| POS System (Desktop) | http://localhost:3000 | Staff interface |
| Scanner Backend | http://localhost:8000 | Scanner API |
| POS Backend | http://localhost:5001 | POS API |
| ngrok Tunnel | https://coffee-hesitate-hermit.ngrok-free.dev | Public access to Scanner Backend |

---

## What to Do RIGHT NOW

### 1. Start Scanner Backend (MISSING!)

Open a new terminal:
```bash
cd C:\Users\darun\Desktop\scanner app\fastapi-server
python start.py
```

Wait for: `Uvicorn running on http://127.0.0.1:8000`

### 2. Keep ngrok Running

Your ngrok is already running - keep that terminal open!

### 3. Keep POS System Running

Your POS system is already running - keep those terminals open!

### 4. Test Scanner App

Open on your mobile: https://scanner-app-olive.vercel.app/
- Enter name and phone
- Click "Open Scanner"
- Scan the QR code from POS screen (http://localhost:3000)
- Should connect successfully!

---

## System Architecture

```
Customer Mobile Phone
    ↓
https://scanner-app-olive.vercel.app/ (Vercel)
    ↓
https://coffee-hesitate-hermit.ngrok-free.dev (ngrok)
    ↓
http://localhost:8000 (Scanner Backend - FastAPI) ← YOU NEED TO START THIS!
    ↓
MongoDB (scanner database)

Staff Desktop Computer
    ↓
http://localhost:3000 (POS Frontend - Next.js)
    ↓
http://localhost:5001 (POS Backend - Node.js)
    ↓
MongoDB (smartcart database)
```

---

## Complete Startup Checklist

Before your demo, start these in order:

- [ ] **MongoDB** - `net start MongoDB`
- [ ] **Scanner Backend** - `cd scanner app\fastapi-server && python start.py`
- [ ] **ngrok** - `ngrok http 8000`
- [ ] **POS Backend** - `cd 2.1\backend && npm start`
- [ ] **POS Frontend** - `cd 2.1\frontend && npm run dev`
- [ ] **Update Vercel** - Set `VITE_API_URL` to ngrok URL (if changed)
- [ ] **Test Scanner App** - https://scanner-app-olive.vercel.app/
- [ ] **Test POS** - http://localhost:3000

---

## Troubleshooting

### Error: "502 Bad Gateway" in ngrok
**Cause:** Scanner Backend (port 8000) is not running
**Solution:** Start Scanner Backend
```bash
cd C:\Users\darun\Desktop\scanner app\fastapi-server
python start.py
```

### Error: "Cannot connect to server" on Scanner App
**Cause:** ngrok not running or wrong URL in Vercel
**Solution:** 
1. Check ngrok is running
2. Verify Vercel `VITE_API_URL` matches ngrok URL
3. Redeploy Vercel if URL changed

### Error: POS not loading
**Cause:** POS Backend (port 5001) or Frontend (port 3000) not running
**Solution:**
```bash
cd C:\Users\darun\Desktop\2.1\backend
npm start

cd C:\Users\darun\Desktop\2.1\frontend
npm run dev
```

---

## Quick Commands Summary

```bash
# Scanner Backend
cd C:\Users\darun\Desktop\scanner app\fastapi-server
python start.py

# ngrok
cd C:\Users\darun\Downloads\ngrok-v3-stable-windows-amd64
ngrok http 8000

# POS Backend
cd C:\Users\darun\Desktop\2.1\backend
npm start

# POS Frontend
cd C:\Users\darun\Desktop\2.1\frontend
npm run dev
```

---

## What's Missing Right Now

You started:
- ✅ ngrok
- ✅ POS Backend
- ✅ POS Frontend

You're missing:
- ❌ **Scanner Backend (port 8000)** ← START THIS NOW!

That's why you're getting "502 Bad Gateway" - ngrok is trying to forward requests to port 8000, but nothing is listening there!

---

**Start the Scanner Backend NOW:**
```bash
cd C:\Users\darun\Desktop\scanner app\fastapi-server
python start.py
```
