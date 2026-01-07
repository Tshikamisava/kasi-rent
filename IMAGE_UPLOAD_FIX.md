# Fixing Image Upload Issues

## Problem
Images fail to upload when listing a property.

## Common Causes & Solutions

### 1. Supabase Storage Bucket Not Created

#### Solution A: Using Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **New Bucket**
4. Name it: `images`
5. Set it as **Public bucket**
6. Click **Create bucket**

#### Solution B: Using Migration (Recommended)
Run the migration that was just created:
```bash
cd client
npx supabase db push
```

### 2. Missing Environment Variables

Check if you have a `.env` file in the `client` folder:

```bash
# client/.env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key-here
VITE_API_URL=http://localhost:5000
```

**How to get these values:**
1. Go to your Supabase project dashboard
2. Click on **Settings** (gear icon) → **API**
3. Copy the **Project URL** → paste as `VITE_SUPABASE_URL`
4. Copy the **anon/public key** → paste as `VITE_SUPABASE_PUBLISHABLE_KEY`

### 3. Storage Policies Not Set

If the bucket exists but uploads still fail, set up policies:

#### Via Supabase Dashboard:
1. Go to **Storage** → **Policies**
2. Select the `images` bucket
3. Click **New Policy**
4. Add these policies:

**Allow Public Read:**
```sql
CREATE POLICY "Public Access for Images"
ON storage.objects FOR SELECT
USING (bucket_id = 'images');
```

**Allow Authenticated Upload:**
```sql
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'images');
```

**Allow Users to Delete:**
```sql
CREATE POLICY "Users can delete their images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'images');
```

### 4. File Size Limits

Supabase has default file size limits. If uploading large images:

1. Go to **Storage** settings in Supabase dashboard
2. Adjust the **File size limit** (default is 50MB)
3. Or compress images before upload

### 5. Network/CORS Issues

If you see CORS errors in the browser console:

1. Check your Supabase project settings
2. Add your local development URL to allowed origins
3. Restart your development server

## Testing the Fix

### Step 1: Verify Supabase Connection
Open browser console (F12) and run:
```javascript
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Has Key:', !!import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);
```

Both should show valid values (not undefined).

### Step 2: Test Storage Access
The PropertyForm now includes automatic checks that will show error messages if:
- Storage bucket doesn't exist
- Upload fails with specific error details
- Partial uploads occur

### Step 3: Check Console Logs
When uploading, you should see:
```
Uploading image.jpg to properties/1234567890-abc.jpg...
Successfully uploaded: https://...supabase.co/storage/v1/object/public/images/...
```

## Quick Setup Checklist

- [ ] Created `images` bucket in Supabase Storage
- [ ] Set bucket as **Public**
- [ ] Added storage policies for read/write access
- [ ] Created `.env` file in `/client` with correct values
- [ ] Restarted development server after adding .env
- [ ] Ran database migrations (`npx supabase db push`)
- [ ] Checked browser console for errors
- [ ] Verified images folder exists in storage

## Alternative: Use Image URLs

If you can't get storage working immediately, you can:

1. Upload images to any image hosting service (Imgur, Cloudinary, etc.)
2. Use the **"Or Single Image URL"** field in the property form
3. Paste the direct image URL
4. The property will be created with that URL

## Still Having Issues?

### Check Browser Console
Look for specific error messages:
- "Storage bucket check failed" → Supabase connection issue
- "Image storage bucket is not set up" → Bucket doesn't exist
- "Failed to upload [filename]" → Check file format/size
- CORS errors → Check Supabase allowed origins

### Verify File Format
Only these formats are accepted:
- JPG/JPEG
- PNG
- WebP
- GIF

### Check File Size
- Single file: max 50MB (default)
- Total upload: depends on your Supabase plan

### Test with Small Image
Try uploading a small test image (< 1MB) to rule out size issues.

## Additional Help

If issues persist:
1. Check the browser console for detailed error messages
2. Check the server console (terminal) for backend errors
3. Verify your Supabase project is active
4. Check your Supabase project's storage quota

---

**Last Updated:** January 7, 2026  
**Related Files:**
- `/client/src/components/PropertyForm.tsx`
- `/client/supabase/migrations/20260107000001_create_storage_bucket.sql`
- `/client/.env`
