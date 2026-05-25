-- Create enums for bursary and application status
CREATE TYPE public.bursary_status AS ENUM ('open', 'closed', 'unknown');
CREATE TYPE public.application_status AS ENUM ('pending', 'submitted', 'failed', 'reviewing');

-- Student profile table for detailed bursary matching
CREATE TABLE public.student_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id),
  full_name text NOT NULL,
  id_number text NOT NULL,
  race text,
  gender text,
  disability boolean NOT NULL DEFAULT false,
  university text,
  faculty text,
  degree text,
  year_of_study text,
  gpa numeric,
  household_income text,
  province text,
  supporting_documents jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own student profiles"
  ON public.student_profiles FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Bursaries table for scraped and discovered funding opportunities
CREATE TABLE public.bursaries (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  provider text,
  url text,
  deadline text,
  amount text,
  eligibility jsonb,
  fields_of_study text[],
  application_url text,
  status public.bursary_status NOT NULL DEFAULT 'unknown',
  last_scraped_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.bursaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read bursaries"
  ON public.bursaries FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "No direct insert or update by authenticated users"
  ON public.bursaries FOR INSERT
  WITH CHECK (false);

CREATE POLICY "No direct delete by authenticated users"
  ON public.bursaries FOR DELETE
  USING (false);

CREATE INDEX idx_bursaries_status_last_scraped ON public.bursaries(status, last_scraped_at DESC);

-- Applications table to track agent actions and approvals
CREATE TABLE public.applications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  bursary_id uuid NOT NULL REFERENCES public.bursaries(id),
  status public.application_status NOT NULL DEFAULT 'pending',
  agent_log text,
  submitted_at timestamptz,
  screenshot_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own applications"
  ON public.applications FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_applications_user_status ON public.applications(user_id, status, created_at DESC);
