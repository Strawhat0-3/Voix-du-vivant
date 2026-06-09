-- Fix profiles table public exposure - restrict SELECT to authenticated users only
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

CREATE POLICY "Profiles are viewable by authenticated users" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() IS NOT NULL);