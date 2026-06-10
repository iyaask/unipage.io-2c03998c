
CREATE POLICY "users read own docs" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'student-documents' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "users upload own docs" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'student-documents' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "users update own docs" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'student-documents' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "users delete own docs" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'student-documents' AND (storage.foldername(name))[1] = auth.uid()::text);
