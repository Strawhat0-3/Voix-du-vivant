-- Add foreign key constraint between comments.user_id and profiles.user_id
ALTER TABLE public.comments 
ADD CONSTRAINT comments_user_id_profiles_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- Ensure parent_id column exists (in case it wasn't created properly)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'comments' AND column_name = 'parent_id'
  ) THEN
    ALTER TABLE public.comments ADD COLUMN parent_id uuid REFERENCES public.comments(id) ON DELETE CASCADE;
  END IF;
END $$;