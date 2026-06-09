
-- Add meta_description and coordinates to articles
ALTER TABLE public.articles 
ADD COLUMN IF NOT EXISTS meta_description TEXT,
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

-- Add meta_description to podcasts
ALTER TABLE public.podcasts
ADD COLUMN IF NOT EXISTS meta_description TEXT;

-- Create bookmarks table
CREATE TABLE public.bookmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE,
  podcast_id UUID REFERENCES public.podcasts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT bookmarks_content_check CHECK (
    (article_id IS NOT NULL AND podcast_id IS NULL) OR 
    (article_id IS NULL AND podcast_id IS NOT NULL)
  ),
  CONSTRAINT bookmarks_unique_article UNIQUE (user_id, article_id),
  CONSTRAINT bookmarks_unique_podcast UNIQUE (user_id, podcast_id)
);

-- Enable RLS on bookmarks
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

-- RLS policies for bookmarks
CREATE POLICY "Users can view their own bookmarks" 
ON public.bookmarks FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookmarks" 
ON public.bookmarks FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks" 
ON public.bookmarks FOR DELETE 
USING (auth.uid() = user_id);

-- Create newsletter_subscribers table
CREATE TABLE public.newsletter_subscribers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  subscribed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Enable RLS on newsletter_subscribers
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- RLS policies for newsletter (public insert, admin view)
CREATE POLICY "Anyone can subscribe to newsletter" 
ON public.newsletter_subscribers FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can view subscribers" 
ON public.newsletter_subscribers FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage subscribers" 
ON public.newsletter_subscribers FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create full-text search function for articles
CREATE OR REPLACE FUNCTION public.search_articles(search_query TEXT)
RETURNS SETOF public.articles
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT *
  FROM public.articles
  WHERE published = true
    AND (
      title ILIKE '%' || search_query || '%'
      OR excerpt ILIKE '%' || search_query || '%'
      OR content ILIKE '%' || search_query || '%'
      OR rubrique ILIKE '%' || search_query || '%'
    )
  ORDER BY 
    CASE 
      WHEN title ILIKE '%' || search_query || '%' THEN 1
      WHEN excerpt ILIKE '%' || search_query || '%' THEN 2
      ELSE 3
    END,
    created_at DESC;
$$;

-- Create full-text search function for podcasts
CREATE OR REPLACE FUNCTION public.search_podcasts(search_query TEXT)
RETURNS SETOF public.podcasts
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT *
  FROM public.podcasts
  WHERE published = true
    AND (
      title ILIKE '%' || search_query || '%'
      OR description ILIKE '%' || search_query || '%'
    )
  ORDER BY 
    CASE 
      WHEN title ILIKE '%' || search_query || '%' THEN 1
      ELSE 2
    END,
    created_at DESC;
$$;
