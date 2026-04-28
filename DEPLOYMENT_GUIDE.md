# SmartCart Scanner App - Deployment Guide

## Changes Made for Vercel Deployment

This document summarizes all changes made to prepare the Scanner App for hosting on Vercel and pushing to GitHub.

### 1. Environment Variable Configuration

#### Files Created:
- **`client/.env`** - Local development environment variables
  ```
  VITE_API_URL=http://localhost:8000
  ```

- **`client/.env.example`** - Template for environment variables (committed to Git)
  ```
  VITE_API_URL=your_api_url_here
  ```

#### Files Modified:
- **`client/vite.config.js`** - Updated proxy configuration to use environment variable
  ```javascript
  proxy: {
    '/api': {
      target: process.env.VITE_API_URL || 'http://localhost:8000',
      changeOrigin: true,
    },
  }
  ```

- **`client/src/admin/AdminDashboard.jsx`** - Changed hardcoded API URL to environment variable
  ```javascript
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  ```

- **`client/src/admin/AdminLogin.jsx`** - Updated fetch call to use environment variable
  ```javascript
  await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/admin/logs`, ...)
  ```

### 2. Git Configuration

#### Files Created:
- **`client/.gitignore`** - Ensures `.env` file is never committed to Git
  ```
  # Environment variables
  .env
  .env.local
  .env.production
  ```

**Note:** `.env.example` is NOT in `.gitignore` and will be visible on GitHub as a template.

### 3. Vercel Configuration

#### Files Created:
- **`client/vercel.json`** - Configures Vercel for React Router SPA
  ```json
  {
    "rewrites": [
      {
        "source": "/(.*)",
        "destination": "/index.html"
      }
    ]
  }
  ```

This ensures that direct navigation to routes like `/admin` works correctly on Vercel.

### 4. Backend CORS Configuration

#### Files Modified:
- **`fastapi-server/main.py`** - Added comments for production CORS configuration
  ```python
  # CORS Configuration
  # For production: Add your Vercel domain to allow_origins list
  # Example: allow_origins=["https://your-app-name.vercel.app", "http://localhost:5173"]
  app.add_middleware(
      CORSMiddleware,
      allow_origins=["*"],  # Allows all origins - restrict in production
      allow_methods=["*"],
      allow_headers=["*"],
  )
  ```

**Current Setting:** `allow_origins=["*"]` allows all origins, which is fine for demo purposes. For production, you should restrict this to your specific Vercel domain.

### 5. Documentation Updates

#### Files Modified:
- **`README.md`** - Added comprehensive "Hosting and Deployment" section with:
  - Local development setup instructions
  - Vercel deployment step-by-step guide
  - ngrok setup for exposing local backend
  - Demo day checklist
  - Important notes about ngrok URL changes

## Deployment Workflow

### For Local Development:
1. Ensure `client/.env` contains: `VITE_API_URL=http://localhost:8000`
2. Run `start-system.bat` or start backend and frontend manually
3. App works at `http://localhost:5173`

### For Vercel Deployment:
1. Push code to GitHub (`.env` will NOT be pushed due to `.gitignore`)
2. Deploy to Vercel, set root directory to `client`
3. Add environment variable in Vercel: `VITE_API_URL` = `https://your-ngrok-url.ngrok.io`
4. On demo day:
   - Start backend: `cd fastapi-server && python start.py`
   - Start ngrok: `ngrok http 8000`
   - Update Vercel env variable with new ngrok URL
   - Redeploy

## API Endpoints

All API calls in the frontend use relative paths (`/api/...`) which are:
- **In development:** Proxied to `VITE_API_URL` by Vite dev server
- **In production:** Must be configured to point to your backend URL via `VITE_API_URL` environment variable

### Frontend API Calls:
- Scanner App: Uses `/api/validate-cart`, `/api/cart/status`, `/api/queue/*`
- Admin Dashboard: Uses `${API_BASE}/api/admin/*` where `API_BASE` comes from `import.meta.env.VITE_API_URL`
- Admin Login: Uses `${import.meta.env.VITE_API_URL}/api/admin/logs`

## Security Notes

1. **Environment Variables:**
   - `.env` file is gitignored and never committed
   - `.env.example` is committed as a template
   - Vercel environment variables are set in the dashboard

2. **CORS:**
   - Currently set to `allow_origins=["*"]` for demo purposes
   - For production, restrict to specific domains

3. **Admin Credentials:**
   - Hardcoded in `AdminLogin.jsx` for demo
   - For production, implement proper authentication

## Troubleshooting

### Issue: Frontend can't connect to backend
- **Solution:** Check that `VITE_API_URL` is set correctly in Vercel environment variables
- **Solution:** Ensure ngrok is running and the URL matches the environment variable

### Issue: 404 errors on direct route navigation in Vercel
- **Solution:** Ensure `vercel.json` exists in the `client` folder with the rewrite rule

### Issue: CORS errors in production
- **Solution:** Verify CORS settings in `fastapi-server/main.py` allow your Vercel domain

### Issue: ngrok URL expired
- **Solution:** Restart ngrok, copy new URL, update Vercel environment variable, redeploy

## Files Changed Summary

### Created:
- `client/.env`
- `client/.env.example`
- `client/.gitignore`
- `client/vercel.json`
- `DEPLOYMENT_GUIDE.md` (this file)

### Modified:
- `client/vite.config.js`
- `client/src/admin/AdminDashboard.jsx`
- `client/src/admin/AdminLogin.jsx`
- `fastapi-server/main.py`
- `README.md`

### Not Changed:
- All UI components
- All business logic
- All component behavior
- Database configuration
- Scanner app functionality
- Admin dashboard features

## Next Steps

1. **Test locally** to ensure everything still works
2. **Push to GitHub** (ensure `.env` is not committed)
3. **Deploy to Vercel** following the README instructions
4. **Test production deployment** with ngrok
5. **Prepare for demo day** using the checklist in README

---

**Last Updated:** April 28, 2026
**Author:** Kiro AI Assistant
