# Fix MongoDB Authentication Issue

## The Problem

Your MongoDB password likely contains special characters that need to be URL-encoded in the connection string.

## Solution: URL Encode the Password

### Special Characters That Need Encoding:

| Character | URL Encoded |
|-----------|-------------|
| @ | %40 |
| : | %3A |
| / | %2F |
| ? | %3F |
| # | %23 |
| [ | %5B |
| ] | %5D |
| ! | %21 |
| $ | %24 |
| & | %26 |
| ' | %27 |
| ( | %28 |
| ) | %29 |
| * | %2A |
| + | %2B |
| , | %2C |
| ; | %3B |
| = | %3D |
| % | %25 |

### Example:

If your password is: `MyP@ss:word!123`

URL encoded it becomes: `MyP%40ss%3Aword%21123`

Your connection string:
```
Before: mongodb+srv://smartcart_admin:MyP@ss:word!123@cluster0...
After:  mongodb+srv://smartcart_admin:MyP%40ss%3Aword%21123@cluster0...
```

## Easier Solution: Reset Password Without Special Characters

### In MongoDB Atlas:

1. Go to **Database Access**
2. Click **Edit** on smartcart_admin user
3. Click **Edit Password**
4. **Type a simple password** (no special characters): `SmartCart2026`
5. Click **Update User**
6. Get connection string again
7. Replace `<password>` with: `SmartCart2026`
8. Update Render environment variable
9. Redeploy

## Recommended for Demo: Use ngrok

Since you already have ngrok working:
- Keep PC running during demo
- Keep ngrok running
- Scanner App on Vercel uses ngrok URL
- This is perfectly acceptable for a final year project demo

Many students use this approach!
