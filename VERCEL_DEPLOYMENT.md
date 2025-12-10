# Step-by-Step Vercel Deployment Guide

## Prerequisites
- Node.js installed
- Git repository (GitHub/GitLab/Bitbucket)
- Vercel account (free at vercel.com)

---

## Step 1: Install Vercel CLI

Open PowerShell/Command Prompt and run:

```powershell
npm install -g vercel
```

Verify installation:
```powershell
vercel --version
```

---

## Step 2: Login to Vercel

```powershell
vercel login
```

This will:
- Open your browser
- Ask you to authorize Vercel CLI
- Return to terminal when done

---

## Step 3: Navigate to Project Root

```powershell
cd C:\Users\User\OneDrive\Desktop\kasi-rent
```

---

## Step 4: Link Your Project to Vercel

```powershell
vercel link
```

You'll be asked:
- **Set up and deploy?** → Type `Y` and press Enter
- **Which scope?** → Select your account
- **Link to existing project?** → Type `N` (for new project) or `Y` (if project exists)
- **What's your project's name?** → Type `kasi-rent` or press Enter for default
- **In which directory is your code located?** → Press Enter (current directory)

---

## Step 5: Set Environment Variables

### For Frontend (Client):
```powershell
vercel env add VITE_SUPABASE_URL
# Paste your Supabase URL when prompted
# Select: Production, Preview, Development (or just Production)

vercel env add VITE_SUPABASE_PUBLISHABLE_KEY
# Paste your Supabase key when prompted
# Select: Production, Preview, Development

vercel env add VITE_SUPABASE_PROJECT_ID
# Paste your project ID when prompted
# Select: Production, Preview, Development
```

### For Backend (Server) - If deploying API:
```powershell
vercel env add DB_HOST
# Enter: localhost (or your MySQL host)
# Select: Production, Preview, Development

vercel env add DB_USER
# Enter: root (or your MySQL username)

vercel env add DB_PASSWORD
# Enter: your MySQL password

vercel env add DB_NAME
# Enter: kasi_rent

vercel env add JWT_SECRET
# Enter: your JWT secret key

vercel env add PORT
# Enter: 5000 (optional, Vercel sets this automatically)
```

**Note:** For production MySQL, you'll need a cloud MySQL service (like PlanetScale, AWS RDS, or Railway) since Vercel serverless functions can't connect to localhost MySQL.

---

## Step 6: Deploy to Vercel

### Option A: Deploy to Preview (Testing)
```powershell
vercel
```

This creates a preview deployment URL.

### Option B: Deploy to Production
```powershell
vercel --prod
```

This deploys to your production domain.

---

## Step 7: Verify Deployment

After deployment, you'll see:
- ✅ Preview URL: `https://kasi-rent-xxxxx.vercel.app`
- ✅ Production URL: `https://kasi-rent.vercel.app` (if configured)

Visit the URL in your browser to test!

---

## Step 8: Set Up Automatic Deployments (Optional)

If your code is on GitHub:

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click your project
3. Go to **Settings** → **Git**
4. Connect your GitHub repository
5. Enable **Automatic deployments**

Now every push to main/master will auto-deploy!

---

## Troubleshooting

### Issue: Build Fails
```powershell
# Check build logs
vercel logs
```

### Issue: Environment Variables Not Working
- Make sure variables start with `VITE_` for frontend
- Redeploy after adding variables: `vercel --prod`

### Issue: MySQL Connection Fails
- Vercel serverless functions can't connect to localhost MySQL
- Use a cloud MySQL service (PlanetScale, Railway, AWS RDS)
- Update `DB_HOST` in environment variables

### Issue: API Routes Not Working
- Make sure `vercel.json` is configured correctly
- Check that API routes are in `api/` directory
- Verify CORS settings allow your frontend domain

---

## Quick Commands Reference

```powershell
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# View deployments
vercel ls

# View logs
vercel logs

# Remove deployment
vercel remove

# Check project info
vercel inspect
```

---

## Important Notes

1. **MySQL on Vercel**: Your local MySQL won't work with Vercel. You need a cloud MySQL service for production.

2. **Frontend Only**: If you only want to deploy the frontend, the current `vercel.json` is already configured.

3. **Backend API**: To deploy the backend, you'll need to restructure it as Vercel serverless functions (see next section).

---

## Next Steps

After successful deployment:
- ✅ Test your live site
- ✅ Set up custom domain (optional)
- ✅ Configure automatic deployments
- ✅ Set up cloud MySQL for backend (if needed)



