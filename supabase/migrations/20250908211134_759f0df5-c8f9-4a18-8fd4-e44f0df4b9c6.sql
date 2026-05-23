-- Harden access to sensitive user data in public.profiles
-- Ensure Row Level Security is enabled and enforced
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;

-- Note: Existing per-user RLS policies remain unchanged:
--  - Users can view/insert/update/delete their own profile (auth.uid() = id)
-- This migration does not broaden access and is safe to run multiple times.
