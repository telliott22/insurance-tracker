-- Storage policies for private invoice bucket
-- Run these in Supabase Dashboard → SQL Editor

-- Policy: Users can upload their own invoices
CREATE POLICY "Users can upload own invoices" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'invoices' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy: Users can view their own invoices  
CREATE POLICY "Users can view own invoices" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'invoices' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy: Users can update their own invoices
CREATE POLICY "Users can update own invoices" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'invoices' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy: Users can delete their own invoices
CREATE POLICY "Users can delete own invoices" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'invoices' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Enable RLS on storage.objects (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;