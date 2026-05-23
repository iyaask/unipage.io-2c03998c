-- Fix RLS policy scope on marks table - change from public to authenticated role only
-- This prevents unauthenticated users from accessing any marks data

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own marks" ON public.marks;
DROP POLICY IF EXISTS "Users can insert their own marks" ON public.marks;
DROP POLICY IF EXISTS "Users can update their own marks" ON public.marks;
DROP POLICY IF EXISTS "Users can delete their own marks" ON public.marks;

-- Recreate policies with authenticated role scope
CREATE POLICY "Users can view their own marks"
ON public.marks
FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own marks"
ON public.marks
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own marks"
ON public.marks
FOR UPDATE
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can delete their own marks"
ON public.marks
FOR DELETE
TO authenticated
USING (auth.uid() = id);