-- Change default value of approved to true
ALTER TABLE public.comments ALTER COLUMN approved SET DEFAULT true;

-- Update all existing comments to be approved
UPDATE public.comments SET approved = true WHERE approved = false;

-- Drop existing RLS policies for comments
DROP POLICY IF EXISTS "Approved comments are viewable by everyone" ON public.comments;
DROP POLICY IF EXISTS "Authenticated users can insert comments" ON public.comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON public.comments;
DROP POLICY IF EXISTS "Admins can manage all comments" ON public.comments;

-- Create new simplified policies
CREATE POLICY "All comments are viewable by everyone" 
ON public.comments 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can insert comments" 
ON public.comments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" 
ON public.comments 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" 
ON public.comments 
FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all comments" 
ON public.comments 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));