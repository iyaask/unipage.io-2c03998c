-- Add foreign key constraint to ensure profiles.id references auth.users
-- This prevents orphaned profiles and ensures id integrity
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_id_fkey,
  ADD CONSTRAINT profiles_id_fkey 
    FOREIGN KEY (id) 
    REFERENCES auth.users(id) 
    ON DELETE CASCADE;

-- Add constraint to prevent id from being null (defense in depth)
ALTER TABLE public.profiles
  ALTER COLUMN id SET NOT NULL;

-- Create function to prevent id modification after insert
CREATE OR REPLACE FUNCTION public.prevent_profile_id_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Prevent changing the id field
  IF OLD.id IS DISTINCT FROM NEW.id THEN
    RAISE EXCEPTION 'Cannot modify profile id';
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger to enforce id immutability
DROP TRIGGER IF EXISTS prevent_profile_id_update ON public.profiles;
CREATE TRIGGER prevent_profile_id_update
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_profile_id_change();

-- Add check to ensure only authenticated users can have profiles
-- This is enforced by the foreign key, but we add a comment for clarity
COMMENT ON TABLE public.profiles IS 'User profile data with RLS policies. All access restricted to profile owner (auth.uid() = id). Foreign key ensures profiles can only exist for valid auth.users.';

-- Verify RLS is enabled (should already be, but explicit check)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Force RLS even for table owner (additional security)
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;