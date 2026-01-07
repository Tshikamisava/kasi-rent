-- ============================================
-- SUPABASE STORAGE SETUP FOR KASIRENT
-- ============================================
-- Run this in your Supabase SQL Editor
-- Dashboard > SQL Editor > New Query > Paste this > Run

-- Step 1: Create the images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'images',
  'images',
  true,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

-- Step 2: Enable RLS on storage.objects (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Step 3: Drop existing policies (if any)
DROP POLICY IF EXISTS "Public Access for Images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can read images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can upload" ON storage.objects;

-- Step 4: Create policies for public read access
CREATE POLICY "Anyone can read images"
ON storage.objects FOR SELECT
USING (bucket_id = 'images');

-- Step 5: Allow authenticated users to upload
CREATE POLICY "Authenticated can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'images' 
  AND (storage.foldername(name))[1] = 'properties'
);

-- Step 6: Allow users to update images (optional)
CREATE POLICY "Authenticated can update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'images');

-- Step 7: Allow users to delete images (optional)
CREATE POLICY "Authenticated can delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'images');

-- Verification query - Run this to confirm setup
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE id = 'images';

-- If you see a row returned, the bucket is created successfully!
