# ngrok Authentication Setup

## You Need to Sign Up and Get Your Auth Token

ngrok requires a free account to use. Here's how to set it up:

### Step 1: Sign Up for ngrok (Free)

1. Go to: https://dashboard.ngrok.com/signup
2. Sign up with:
   - Email
   - Google account
   - GitHub account
   
   (Choose whichever is easiest for you)

### Step 2: Get Your Auth Token

After signing up, you'll be redirected to the dashboard:

1. Go to: https://dashboard.ngrok.com/get-started/your-authtoken
2. You'll see your authtoken (looks like: `2abc123def456ghi789jkl0mnop1qrs_2stu3vwx4yz5ABC6DEF7GHI`)
3. **Copy this token** (click the copy button)

### Step 3: Add Auth Token to ngrok

Open your terminal where you downloaded ngrok and run:

```bash
cd C:\Users\darun\Downloads\ngrok-v3-stable-windows-amd64
ngrok config add-authtoken YOUR_TOKEN_HERE
```

Replace `YOUR_TOKEN_HERE` with the token you copied.

**Example:**
```bash
ngrok config add-authtoken 2abc123def456ghi789jkl0mnop1qrs_2stu3vwx4yz5ABC6DEF7GHI
```

### Step 4: Start ngrok

Now you can start the tunnel:

```bash
ngrok http 8000
```

You should see:
```
Session Status                online
Account                       Your Name (Plan: Free)
Forwarding                    https://abc123-456-789.ngrok-free.app -> http://localhost:8000
```

**Copy that HTTPS URL!**

---

## Quick Commands Summary

```bash
# 1. Navigate to ngrok folder
cd C:\Users\darun\Downloads\ngrok-v3-stable-windows-amd64

# 2. Add your auth token (one-time setup)
ngrok config add-authtoken YOUR_TOKEN_HERE

# 3. Start tunnel
ngrok http 8000

# 4. Copy the HTTPS forwarding URL
```

---

## After Getting the URL

Once ngrok is running and you have the HTTPS URL:

1. **Update Vercel Environment Variable:**
   - Go to: https://vercel.com/darunkishorec-4458s-projects/scanner-app/settings/environment-variables
   - Edit `VITE_API_URL`
   - Set value to your ngrok URL: `https://YOUR-URL.ngrok-free.app`
   - Click "Save"

2. **Redeploy Vercel App:**
   - Go to: https://vercel.com/darunkishorec-4458s-projects/scanner-app
   - Click "Deployments" tab
   - Click "..." on latest deployment → "Redeploy"
   - Wait 1-2 minutes

3. **Test Your App:**
   - Open: https://scanner-app-olive.vercel.app/
   - Everything should work!

---

## Important Notes

✅ **Free tier is perfect for your demo**
- No credit card required
- Unlimited tunnels
- URL changes each restart (that's okay)

⚠️ **Keep terminal open during demo**
- Don't close the ngrok window
- If it closes, restart and update Vercel again

⚠️ **Auth token is one-time setup**
- You only need to add the token once
- After that, just run `ngrok http 8000` each time

---

## Troubleshooting

**"command not found: ngrok"**
- Make sure you're in the correct folder: `cd C:\Users\darun\Downloads\ngrok-v3-stable-windows-amd64`
- Or add ngrok to your PATH (see NGROK_SETUP_FIX.md)

**"authtoken not found"**
- Run: `ngrok config add-authtoken YOUR_TOKEN`
- Get token from: https://dashboard.ngrok.com/get-started/your-authtoken

**"tunnel not found"**
- Your free account might have expired
- Sign in again at: https://dashboard.ngrok.com/

---

## What to Do RIGHT NOW:

1. Go to: https://dashboard.ngrok.com/signup
2. Sign up (free, no credit card)
3. Copy your authtoken from: https://dashboard.ngrok.com/get-started/your-authtoken
4. Run in terminal:
   ```bash
   cd C:\Users\darun\Downloads\ngrok-v3-stable-windows-amd64
   ngrok config add-authtoken YOUR_TOKEN_HERE
   ngrok http 8000
   ```
5. Copy the HTTPS URL and come back!
