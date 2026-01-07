# How to Add Images Column to Supabase

## Quick Steps:

1. **Go to Supabase Dashboard**
   - Open https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New query"

3. **Run This SQL**
   ```sql
   -- Add images column to properties table
   ALTER TABLE public.properties 
   ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';

   -- Add comment
   COMMENT ON COLUMN public.properties.images IS 'Array of image URLs for property photos';

   -- Create index for better query performance
   CREATE INDEX IF NOT EXISTS idx_properties_images ON public.properties USING GIN (images);
   ```

4. **Click "Run"** (or press Ctrl+Enter)

5. **Verify**
   - Go to "Table Editor"
   - Select "properties" table
   - You should see the new "images" column (type: text[])

## Done! ✅

Now try uploading a property again - it should work!

---

## Alternative: If you can't access Supabase

If you still can't access Supabase, we can switch to using MySQL instead. Just let me know!
