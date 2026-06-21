-- Infrastructure additions for the MVP agent platform.

CREATE UNIQUE INDEX IF NOT EXISTS idx_student_profiles_user_id
  ON public.student_profiles(user_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_bursaries_name_provider
  ON public.bursaries(name, provider);

CREATE INDEX IF NOT EXISTS idx_bursaries_fields_of_study
  ON public.bursaries USING gin(fields_of_study);

CREATE INDEX IF NOT EXISTS idx_bursaries_eligibility
  ON public.bursaries USING gin(eligibility);

CREATE INDEX IF NOT EXISTS idx_applications_user_bursary
  ON public.applications(user_id, bursary_id);

ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS screenshot_url text;

ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS approval_required boolean NOT NULL DEFAULT true;

ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS approved_at timestamptz;

ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS proof jsonb;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_student_profiles_updated_at ON public.student_profiles;
CREATE TRIGGER set_student_profiles_updated_at
  BEFORE UPDATE ON public.student_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_bursaries_updated_at ON public.bursaries;
CREATE TRIGGER set_bursaries_updated_at
  BEFORE UPDATE ON public.bursaries
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_applications_updated_at ON public.applications;
CREATE TRIGGER set_applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO storage.buckets (id, name, public)
VALUES
  ('student-documents', 'student-documents', false),
  ('application-screenshots', 'application-screenshots', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload their own student documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'student-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can read their own student documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'student-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own student documents"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'student-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'student-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can read their own application screenshots"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'application-screenshots'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.applications;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
