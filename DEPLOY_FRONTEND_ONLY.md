# Deploy Kasi Rent Frontend Only to Vercel

## Quick Deploy Commands

### Step 1: Install Vercel CLI (if not installed)
```powershell
npm install -g vercel
```

### Step 2: Navigate to Project Root
```powershell
cd C:\Users\User\OneDrive\Desktop\kasi-rent
```

### Step 3: Login to Vercel
```powershell
vercel login
```
- Browser opens for authorization
- Return to terminal when done

### Step 4: Deploy Frontend (First Time)
```powershell
vercel
```

**When prompted:**
- Set up and deploy? → Type `Y` and press Enter
- Which scope? → Select your account (arrow keys + Enter)
- Link to existing project? → Type `N` (new project)
- Project name? → Type `kasi-rent` or press Enter
- Directory? → Press Enter (uses current directory)
- Override settings? → Type `N` (uses vercel.json)

### Step 5: Set Environment Variables (Required for Supabase)

```powershell
vercel env add VITE_SUPABASE_URL production
# Paste your Supabase URL, press Enter

vercel env add VITE_SUPABASE_PUBLISHABLE_KEY production
# Paste your Supabase key, press Enter

vercel env add VITE_SUPABASE_PROJECT_ID production
# Paste your project ID, press Enter
```

### Step 6: Deploy to Production
```powershell
vercel --prod
```

✅ **Done!** Your frontend is now live!

---

## Your vercel.json is Already Configured ✅

Your `vercel.json` is set up correctly for frontend deployment:
- ✅ Builds from `client` directory
- ✅ Outputs to `client/dist`
- ✅ Handles SPA routing
- ✅ Uses Vite framework

---

## Quick Commands Reference

```powershell
# Deploy to preview (testing)
vercel

# Deploy to production
vercel --prod

# View deployments
vercel ls

# View logs
vercel logs
```

---

## Environment Variables Needed

Make sure you have these in Vercel (set via CLI or dashboard):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`

---

## Note

This deploys **only the frontend** (React app). The backend/server is not included.

