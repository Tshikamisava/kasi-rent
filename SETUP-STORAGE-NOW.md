# 🚀 QUICK FIX: Setup Supabase Storage

## Follow These Steps (5 minutes):

### Step 1: Go to Supabase Dashboard
1. Open https://supabase.com/dashboard
2. Sign in to your account
3. Select your **kasi-rent** project (or create one if you haven't)

### Step 2: Run the Setup SQL
1. In your Supabase dashboard, click **SQL Editor** (in left sidebar)
2. Click **New Query**
3. Open the file: `setup-supabase-storage.sql` (in this folder)
4. **Copy ALL the SQL code** from that file
5. **Paste it** into the Supabase SQL Editor
6. Click **RUN** (bottom right)

✅ You should see: "Success. No rows returned"

### Step 3: Verify Storage Bucket Created
1. In Supabase dashboard, click **Storage** (in left sidebar)
2. You should see a bucket named **images**
3. It should show a green "Public" badge

### Step 4: Get Your Supabase Credentials
1. In Supabase dashboard, click **Settings** (gear icon at bottom)
2. Click **API** in the settings menu
3. You'll see:
   - **Project URL** (looks like: https://xxxxx.supabase.co)
   - **anon/public key** (long string starting with eyJ...)

### Step 5: Create Environment File
1. In VS Code, create a new file: `client/.env`
2. Paste this and **replace with your actual values**:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-public-key-here
VITE_API_URL=http://localhost:5000
```

**Example:**
```env
VITE_SUPABASE_URL=https://rfwtgtxaztaipilodiul.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6...
VITE_API_URL=http://localhost:5000
```

### Step 6: Restart Your App
1. Stop your development server (Ctrl+C in terminal)
2. Start it again:
```bash
cd client
npm run dev
```

## ✅ Test It

1. Go to Landlord Dashboard
2. Click "Add New Property"
3. Fill in the form
4. **Select multiple images** from your computer
5. Click "List Property"

You should now see:
- ✅ Images uploading with progress
- ✅ Success message
- ✅ Property card showing your images

## 🆘 Still Not Working?

### Check 1: Is the bucket there?
- Supabase Dashboard → Storage → Should see "images" bucket

### Check 2: Is it public?
- The "images" bucket should have a green "Public" badge

### Check 3: Are credentials correct?
- Open browser console (F12)
- Type: `console.log(import.meta.env.VITE_SUPABASE_URL)`
- Should show your actual URL (not undefined)

### Check 4: Browser Console Errors
- Open browser console (F12)
- Look for red error messages
- Common errors:
  - "Invalid API key" → Wrong key in .env
  - "CORS error" → Wrong URL in .env
  - "Bucket not found" → Run the SQL script again

## 📹 Visual Guide

If you prefer visual instructions:
1. **Supabase Storage**: https://supabase.com/docs/guides/storage
2. **Getting API Keys**: https://supabase.com/docs/guides/api

---

**Questions?** Check the browser console for specific error messages!
