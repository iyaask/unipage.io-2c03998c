
-- profile_extras (1 row per user)
CREATE TABLE public.profile_extras (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  summary text,
  location text,
  linkedin_url text,
  website_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profile_extras TO authenticated;
GRANT ALL ON public.profile_extras TO service_role;
ALTER TABLE public.profile_extras ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile_extras" ON public.profile_extras FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- profile_documents
CREATE TABLE public.profile_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  doc_type text,
  storage_path text NOT NULL,
  size_bytes bigint,
  mime_type text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX profile_documents_user_idx ON public.profile_documents(user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profile_documents TO authenticated;
GRANT ALL ON public.profile_documents TO service_role;
ALTER TABLE public.profile_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile_documents" ON public.profile_documents FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- profile_experience
CREATE TABLE public.profile_experience (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL,
  company text,
  start_date text,
  end_date text,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX profile_experience_user_idx ON public.profile_experience(user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profile_experience TO authenticated;
GRANT ALL ON public.profile_experience TO service_role;
ALTER TABLE public.profile_experience ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile_experience" ON public.profile_experience FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- profile_education
CREATE TABLE public.profile_education (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  institution text NOT NULL,
  degree text,
  field text,
  start_year text,
  end_year text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX profile_education_user_idx ON public.profile_education(user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profile_education TO authenticated;
GRANT ALL ON public.profile_education TO service_role;
ALTER TABLE public.profile_education ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile_education" ON public.profile_education FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- profile_skills
CREATE TABLE public.profile_skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  level text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX profile_skills_user_idx ON public.profile_skills(user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profile_skills TO authenticated;
GRANT ALL ON public.profile_skills TO service_role;
ALTER TABLE public.profile_skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile_skills" ON public.profile_skills FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- profile_certifications
CREATE TABLE public.profile_certifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  issuer text,
  issue_date text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX profile_certifications_user_idx ON public.profile_certifications(user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profile_certifications TO authenticated;
GRANT ALL ON public.profile_certifications TO service_role;
ALTER TABLE public.profile_certifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile_certifications" ON public.profile_certifications FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- profile_projects
CREATE TABLE public.profile_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX profile_projects_user_idx ON public.profile_projects(user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profile_projects TO authenticated;
GRANT ALL ON public.profile_projects TO service_role;
ALTER TABLE public.profile_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile_projects" ON public.profile_projects FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- profile_application_defaults (1 row per user)
CREATE TABLE public.profile_application_defaults (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  salary_expectation text,
  work_authorization text,
  availability text,
  preferred_location text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profile_application_defaults TO authenticated;
GRANT ALL ON public.profile_application_defaults TO service_role;
ALTER TABLE public.profile_application_defaults ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile_application_defaults" ON public.profile_application_defaults FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS trigger
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_profile_extras_upd BEFORE UPDATE ON public.profile_extras FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_profile_documents_upd BEFORE UPDATE ON public.profile_documents FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_profile_experience_upd BEFORE UPDATE ON public.profile_experience FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_profile_education_upd BEFORE UPDATE ON public.profile_education FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_profile_app_def_upd BEFORE UPDATE ON public.profile_application_defaults FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Storage policies for profile-documents bucket (bucket created via tool)
CREATE POLICY "own folder read" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'profile-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "own folder insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'profile-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "own folder update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'profile-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "own folder delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'profile-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
