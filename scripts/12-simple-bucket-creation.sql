-- Simple bucket creation that works within Supabase constraints
-- Run this in Supabase SQL Editor

-- Create a function that creates the bucket with proper permissions
CREATE OR REPLACE FUNCTION create_menu_images_bucket()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert the bucket using the storage.buckets table
  INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  VALUES (
    'menu-images',
    'menu-images',
    true,
    5242880,
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']::text[]
  )
  ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']::text[];
  
  RETURN 'Bucket created successfully';
EXCEPTION
  WHEN OTHERS THEN
    RETURN 'Error: ' || SQLERRM;
END;
$$;

-- Execute the function
SELECT create_menu_images_bucket();

-- Clean up the function
DROP FUNCTION create_menu_images_bucket();
