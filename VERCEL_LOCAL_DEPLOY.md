# Deploy to Vercel from Local Machine (No GitHub Required)

## Step-by-Step Commands

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
- This opens your browser
- Authorize the CLI
- Return to terminal when done

### Step 4: Deploy (First Time - Interactive Setup)
```powershell
vercel
```

You'll be asked:
- **Set up and deploy?** → Type `Y` and press Enter
- **Which scope?** → Select your account (use arrow keys, press Enter)
- **Link to existing project?** → Type `N` (for new project)
- **What's your project's name?** → Type `kasi-rent` or press Enter
- **In which directory is your code located?** → Press Enter (current directory)
- **Want to override the settings?** → Type `N` (use defaults)

### Step 5: Set Environment Variables (Before or After Deployment)

**Option A: Set during deployment (interactive)**
When prompted, you can add environment variables.

**Option B: Set via command line**
```powershell
# Frontend variables
vercel env add VITE_SUPABASE_URL production
# Paste your value, press Enter

vercel env add VITE_SUPABASE_PUBLISHABLE_KEY production
# Paste your value, press Enter

vercel env add VITE_SUPABASE_PROJECT_ID production
# Paste your value, press Enter
```

### Step 6: Deploy to Production
```powershell
vercel --prod
```

This deploys to your production domain!

---

## Quick Reference Commands

```powershell
# Deploy to preview (testing)
vercel

# Deploy to production
vercel --prod

# View your deployments
vercel ls

# View logs
vercel logs

# Remove a deployment
vercel remove
```

---

## Important Notes

1. **No GitHub Required**: Vercel CLI uploads files directly from your local machine
2. **Environment Variables**: Set them via CLI or Vercel dashboard
3. **First Deployment**: Takes longer (uploads all files)
4. **Subsequent Deployments**: Faster (only changed files)

---

## Troubleshooting

**If "vercel" command not found:**
- Make sure Node.js is installed: `node --version`
- Reinstall Vercel CLI: `npm install -g vercel`

**If login fails:**
- Try: `vercel login --github` (alternative login method)

**If deployment fails:**
- Check build logs: `vercel logs`
- Make sure you're in the project root directory

