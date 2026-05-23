-- Add critical RLS policies for marks table
CREATE POLICY "Users can view their own marks" 
ON public.marks 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own marks" 
ON public.marks 
FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own marks" 
ON public.marks 
FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can delete their own marks" 
ON public.marks 
FOR DELETE 
USING (auth.uid() = id);

-- Enable RLS on marks table if not already enabled
ALTER TABLE public.marks ENABLE ROW LEVEL SECURITY;

-- Add missing INSERT and DELETE policies for profiles table
CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete their own profile" 
ON public.profiles 
FOR DELETE 
USING (auth.uid() = id);

-- Make nods_page and nods_page_section publicly readable (knowledge base data)
-- These appear to be content/documentation tables that should be publicly accessible
CREATE POLICY "Public read access for page content" 
ON public.nods_page 
FOR SELECT 
USING (true);

CREATE POLICY "Public read access for page sections" 
ON public.nods_page_section 
FOR SELECT 
USING (true);

-- Enable RLS on content tables
ALTER TABLE public.nods_page ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nods_page_section ENABLE ROW LEVEL SECURITY;

-- Fix security definer function search path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$function$;