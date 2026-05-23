CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Remove any prior schedule with this name (idempotent)
DO $$
BEGIN
  PERFORM cron.unschedule('weekly-extractor');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

SELECT cron.schedule(
  'weekly-extractor',
  '0 3 * * 1', -- every Monday 03:00 UTC
  $$
  SELECT net.http_post(
    url := 'https://rgfpyoihpevqmwtwlrvn.supabase.co/functions/v1/extractor',
    headers := '{"Content-Type":"application/json","apikey":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJnZnB5b2locGV2cW13dHdscnZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgzNjA2NzMsImV4cCI6MjA1MzkzNjY3M30.UAiqKjcLcvDjFw0mi9viyBcRNisrzoFh8OFLdN2dbFQ"}'::jsonb,
    body := jsonb_build_object('triggered_at', now())
  );
  $$
);