-- Create comment_reactions table for likes/dislikes
CREATE TABLE public.comment_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'dislike')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(comment_id, user_id)
);

-- Enable RLS
ALTER TABLE public.comment_reactions ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Everyone can view reactions" 
ON public.comment_reactions 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can insert reactions" 
ON public.comment_reactions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reactions" 
ON public.comment_reactions 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reactions" 
ON public.comment_reactions 
FOR DELETE 
USING (auth.uid() = user_id);