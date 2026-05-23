-- Enable RLS on bursary_results
ALTER TABLE public.bursary_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bursary_results FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own bursary results" ON public.bursary_results;
DROP POLICY IF EXISTS "Users can insert their own bursary results" ON public.bursary_results;
DROP POLICY IF EXISTS "Users can update their own bursary results" ON public.bursary_results;
DROP POLICY IF EXISTS "Users can delete their own bursary results" ON public.bursary_results;

CREATE POLICY "Users can view their own bursary results"
  ON public.bursary_results FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bursary results"
  ON public.bursary_results FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bursary results"
  ON public.bursary_results FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bursary results"
  ON public.bursary_results FOR DELETE
  USING (auth.uid() = user_id);

-- Enable RLS on chat_messages
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own chat messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can insert their own chat messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can update their own chat messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can delete their own chat messages" ON public.chat_messages;

CREATE POLICY "Users can view their own chat messages"
  ON public.chat_messages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chat messages"
  ON public.chat_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chat messages"
  ON public.chat_messages FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chat messages"
  ON public.chat_messages FOR DELETE
  USING (auth.uid() = user_id);
