-- 1. Drop everything except profiles + auth.users
DROP TABLE IF EXISTS public.nods_page_section CASCADE;
DROP TABLE IF EXISTS public.nods_page CASCADE;
DROP TABLE IF EXISTS public.bursary_results CASCADE;
DROP TABLE IF EXISTS public.chat_messages CASCADE;
DROP TABLE IF EXISTS public.bursary_listings CASCADE;
DROP TABLE IF EXISTS public.scraped_bursaries CASCADE;
DROP TABLE IF EXISTS public.marks CASCADE;
DROP FUNCTION IF EXISTS public.match_page_sections(extensions.vector, double precision, integer, integer) CASCADE;
DROP FUNCTION IF EXISTS public.get_page_parents(bigint) CASCADE;

-- 2. bursary_requirements (public catalog)
CREATE TABLE public.bursary_requirements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bursary_name text NOT NULL,
  requirements text NOT NULL,
  deadline text,
  provider text,
  source_url text,
  raw jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (bursary_name, source_url)
);

ALTER TABLE public.bursary_requirements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view bursary requirements"
  ON public.bursary_requirements FOR SELECT
  USING (true);

-- (no insert/update/delete policies — only service role can write)

CREATE INDEX idx_bursary_requirements_updated ON public.bursary_requirements (updated_at DESC);

-- 3. given_bursary_info (per-user)
CREATE TABLE public.given_bursary_info (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  payload jsonb NOT NULL,
  summary text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.given_bursary_info ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own given bursary info"
  ON public.given_bursary_info FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own given bursary info"
  ON public.given_bursary_info FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own given bursary info"
  ON public.given_bursary_info FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users delete own given bursary info"
  ON public.given_bursary_info FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_given_bursary_info_user_created
  ON public.given_bursary_info (user_id, created_at DESC);

-- 4. comparagent_results
CREATE TABLE public.comparagent_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  given_info_id uuid REFERENCES public.given_bursary_info(id) ON DELETE CASCADE,
  matches jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.comparagent_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own comparagent results"
  ON public.comparagent_results FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own comparagent results"
  ON public.comparagent_results FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own comparagent results"
  ON public.comparagent_results FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_comparagent_results_user_created
  ON public.comparagent_results (user_id, created_at DESC);

-- 5. updated_at trigger helper (idempotent)
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_bursary_requirements_updated
  BEFORE UPDATE ON public.bursary_requirements
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TRIGGER trg_given_bursary_info_updated
  BEFORE UPDATE ON public.given_bursary_info
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();