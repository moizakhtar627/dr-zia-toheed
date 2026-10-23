-- Supabase Storage policies for uploads
-- Run in SQL editor after creating buckets

-- Create buckets (via dashboard or API): 'books-covers', 'books-pdfs', 'medicines'

-- Storage policies
-- Allow public read for covers/images if you want public display
CREATE POLICY "Public read covers" ON storage.objects
  FOR SELECT USING (bucket_id IN ('books-covers', 'medicines'));

CREATE POLICY "Public read pdfs" ON storage.objects
  FOR SELECT USING (bucket_id = 'books-pdfs'); -- adjust based on access needs

-- Admin upload/delete via service role
CREATE POLICY "Service role manage storage" ON storage.objects
  FOR ALL USING (auth.role() = 'service_role');
