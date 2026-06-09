-- Create storage buckets for articles images and podcast audio
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('article-images', 'article-images', true),
  ('podcast-audio', 'podcast-audio', true);

-- Create RLS policies for article-images bucket
CREATE POLICY "Article images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'article-images');

CREATE POLICY "Editors and admins can upload article images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'article-images' 
  AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role))
);

CREATE POLICY "Editors and admins can update article images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'article-images' 
  AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role))
);

CREATE POLICY "Admins can delete article images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'article-images' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Create RLS policies for podcast-audio bucket
CREATE POLICY "Podcast audio are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'podcast-audio');

CREATE POLICY "Editors and admins can upload podcast audio"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'podcast-audio' 
  AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role))
);

CREATE POLICY "Editors and admins can update podcast audio"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'podcast-audio' 
  AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role))
);

CREATE POLICY "Admins can delete podcast audio"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'podcast-audio' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Create comments table
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  user_id UUID NOT NULL,
  article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE,
  podcast_id UUID REFERENCES public.podcasts(id) ON DELETE CASCADE,
  approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT check_content_type CHECK (
    (article_id IS NOT NULL AND podcast_id IS NULL) OR 
    (article_id IS NULL AND podcast_id IS NOT NULL)
  )
);

-- Enable RLS on comments
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- RLS policies for comments
CREATE POLICY "Approved comments are viewable by everyone"
ON public.comments FOR SELECT
USING (approved = true OR auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can insert comments"
ON public.comments FOR INSERT
WITH CHECK (auth.uid() = user_id AND approved = false);

CREATE POLICY "Users can update their own comments"
ON public.comments FOR UPDATE
USING (auth.uid() = user_id AND approved = false);

CREATE POLICY "Admins can manage all comments"
ON public.comments FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_comments_updated_at
BEFORE UPDATE ON public.comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for comments
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;