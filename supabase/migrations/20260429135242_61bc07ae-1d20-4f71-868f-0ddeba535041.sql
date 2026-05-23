CREATE TABLE public.scraped_bursaries (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  source_url text NOT NULL,
  title text,
  provider text,
  eligibility text,
  deadline text,
  amount text,
  apply_url text,
  raw jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.scraped_bursaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own scraped bursaries"
  ON public.scraped_bursaries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scraped bursaries"
  ON public.scraped_bursaries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scraped bursaries"
  ON public.scraped_bursaries FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_scraped_bursaries_user_created ON public.scraped_bursaries(user_id, created_at DESC);