-- Fix: Update user_roles SELECT policy to only allow authenticated users
DROP POLICY IF EXISTS "Roles are viewable by authenticated users" ON public.user_roles;

CREATE POLICY "Roles are viewable by authenticated users" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() IS NOT NULL);