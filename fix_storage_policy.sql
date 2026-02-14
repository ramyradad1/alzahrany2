-- Enable storage access for the products bucket
-- This script allows public (authenticated and anonymous) users to upload files to the 'products' bucket.

-- Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies to avoid "policy already exists" errors
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload" ON storage.objects;
DROP POLICY IF EXISTS "Public Update" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete" ON storage.objects;

-- Policy to allow public SELECT (viewing images)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'products' );

-- Policy to allow public INSERT (uploading images)
CREATE POLICY "Public Upload"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'products' );

-- Policy to allow public UPDATE (replacing images)
CREATE POLICY "Public Update"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'products' );

-- Policy to allow public DELETE (removing images)
CREATE POLICY "Public Delete"
ON storage.objects FOR DELETE
USING ( bucket_id = 'products' );
