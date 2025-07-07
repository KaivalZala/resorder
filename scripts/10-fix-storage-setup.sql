-- Fix storage bucket creation and RLS policies
-- This script should be run in the Supabase SQL Editor

-- First, temporarily disable RLS on storage.buckets to create the bucket
ALTER TABLE storage.buckets DISABLE ROW LEVEL SECURITY;

-- Create the storage bucket for menu images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'menu-images',
  'menu-images', 
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']::text[];

-- Re-enable RLS on storage.buckets
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for storage.buckets (if they don't exist)
DO $$
BEGIN
  -- Policy for viewing buckets
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'buckets' 
    AND policyname = 'Allow public bucket viewing'
  ) THEN
    CREATE POLICY "Allow public bucket viewing" ON storage.buckets
      FOR SELECT USING (public = true);
  END IF;

  -- Policy for authenticated users to manage buckets
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'buckets' 
    AND policyname = 'Allow authenticated bucket management'
  ) THEN
    CREATE POLICY "Allow authenticated bucket management" ON storage.buckets
      FOR ALL USING (auth.role() = 'authenticated');
  END IF;
END $$;

-- Drop existing object policies if they exist
DROP POLICY IF EXISTS "Public can view menu images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload menu images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update menu images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete menu images" ON storage.objects;

-- Create comprehensive RLS policies for storage.objects
CREATE POLICY "Public can view menu images" ON storage.objects
  FOR SELECT USING (bucket_id = 'menu-images');

CREATE POLICY "Authenticated users can upload menu images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'menu-images' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated users can update menu images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'menu-images' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated users can delete menu images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'menu-images' AND
    auth.role() = 'authenticated'
  );

-- Verify the bucket was created
SELECT 
  id, 
  name, 
  public, 
  file_size_limit, 
  allowed_mime_types,
  created_at
FROM storage.buckets 
WHERE name = 'menu-images';
