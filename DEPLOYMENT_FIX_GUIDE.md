# 🚀 Complete Deployment Fix Guide - Login Failures

## Problem
Login/Register failing on Vercel production (`https://kasi-rent-seven.vercel.app`)

## Root Causes
1. **Code changes not pushed to Git** (most likely)
2. **VITE_API_URL env var not set on Vercel** before build
3. **Backend environment variables not updated on Render**

---

## ✅ STEP 1: Fix Local Code Issues

### Issue: auth.ts has duplicate `body` fields
**File:** `client/src/lib/auth.ts` (lines ~60-70)

**Fix:** Replace the register method with:
```typescript
async register(data: RegisterData) {
  try {
    const url = `${API_URL}/register`;
    console.log('📝 Register attempt:', { url, apiBase: API_BASE, email: data.email });
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.phone,
        role: data.userType || 'tenant',
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('❌ Registration failed:', { status: response.status, error: result.error });
      throw new Error(result.error || 'Registration failed');
    }

    console.log('✅ Registration successful');
    return result.user;
  } catch (error) {
    if (error instanceof TypeError) {
      console.error('🌐 Network error:', error.message);
      throw new Error('Cannot connect to authentication service. Check that the backend is running.');
    }
    console.error('❌ Auth error:', error);
    throw error;
  }
},
```

---

## ✅ STEP 2: Rebuild Locally (verify it compiles)
```bash
cd client
npm run build
```

✓ Should complete with "✓ built in X.XXs"

---

## ✅ STEP 3: Push ALL Changes to Git
```bash
cd c:\Users\User\OneDrive\Desktop\kasi-rent
git add .
git commit -m "fix: repair auth API URLs and add comprehensive error logging for production debugging"
git push origin main
```

---

## ✅ STEP 4: Update Render Backend Environment Variables

1. Go to: **[Render Dashboard](https://dashboard.render.com)**
2. Select your **KasiRent backend service**
3. Click **Environment** tab
4. Add/Update these variables:

```
CLIENT_URL=https://kasi-rent-seven.vercel.app
CORS_ALLOWED_ORIGINS=https://kasi-rent-seven.vercel.app,https://kasi-rent.vercel.app
CORS_ALLOW_VERCEL_PREVIEWS=true
JWT_SECRET=<your_jwt_secret_key>
SESSION_SECRET=<your_session_secret_key>
DB_HOST=<your_mysql_host>
DB_USER=<your_mysql_user>
DB_PASSWORD=<your_mysql_password>
DB_NAME=<your_mysql_database>
```

5. Click **Save** button
6. Wait for redeploy to complete (should auto-trigger from Git push)

---

## ✅ STEP 5: Update Vercel Frontend Environment Variables

1. Go to: **[Vercel Dashboard](https://vercel.com)**
2. Select **kasi-rent** project
3. Go to **Settings → Environment Variables**
4. Add this variable:

```
VITE_API_URL=https://kasirent.onrender.com
```

5. Click **Save**
6. **Important:** Go to **Deployments** and click "Redeploy" on the latest deployment
   - OR wait for Git push to auto-trigger redeploy
   - Make sure the new env var is used in the new build

---

## ✅ STEP 6: Test Login/Register

### Open Browser DevTools (F12) and watch console:

1. Go to: `https://kasi-rent-seven.vercel.app`
2. Open **DevTools** (F12) → **Console** tab
3. Try **Login or Register**
4. Look for console logs like:
   - `🔍 API Config: { env: 'https://kasirent.onrender.com', resolved: 'https://kasirent.onrender.com', isProd: true }`
   - `🔐 Login attempt: { url: 'https://kasirent.onrender.com/api/auth/login', apiBase: '...', email: '...' }`
   - `✅ Login successful` OR `❌ Login failed: ...`

### If you see errors:

**Error: "Cannot connect to authentication service"**
- Backend is down or URL is wrong
- Check that Render backend is running: `https://kasirent.onrender.com/api/auth/me` in browser (should give 401 Unauthorized, not connection error)

**Error: "CORS policy..."**
- Backend CORS doesn't allow your frontend domain
- Verify `CORS_ALLOWED_ORIGINS` on Render includes your domain

**Error: "Login failed: {specific message}"**
- Backend responded but rejected credentials
- Check user exists in database
- Check password is correct

---

## 🔧 Quick Troubleshooting

| Symptom | Fix |
|---------|-----|
| Blank console, no logs | VITE_API_URL not set on Vercel - redeploy with env var |
| `🔍 API Config: { env: undefined, resolved: 'http://localhost:5001', isProd: true }` | VITE_API_URL not in Vercel env vars - add it and redeploy |
| Network tab shows `/api/auth/login` → 502/503 | Render backend is down - check Render dashboard |
| Network tab shows blocked request | CORS policy issue - verify CORS_ALLOWED_ORIGINS on Render |

---

## ✅ After Fix: Expected Behavior

✅ Login page loads
✅ Enter credentials
✅ Console shows: `🔐 Login attempt: { url: 'https://kasirent.onrender.com/api/auth/login', ... }`
✅ Console shows: `✅ Login successful`
✅ Redirected to dashboard
✅ User data persists in localStorage

---

## Questions?

- **Backend not starting?** Check `/server/server.js` startup logs
- **Database connection failing?** Verify MySQL/Supabase connection string in Render env
- **Still getting errors?** Share the exact console error and network request/response details

