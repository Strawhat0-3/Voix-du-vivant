-- Create analytics tables for tracking views
CREATE TABLE public.article_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT
);

CREATE TABLE public.podcast_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  podcast_id UUID NOT NULL REFERENCES public.podcasts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT
);

-- Create ratings tables
CREATE TABLE public.article_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(article_id, user_id)
);

CREATE TABLE public.podcast_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  podcast_id UUID NOT NULL REFERENCES public.podcasts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(podcast_id, user_id)
);

-- Enable RLS on analytics and ratings tables
ALTER TABLE public.article_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.podcast_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.podcast_ratings ENABLE ROW LEVEL SECURITY;

-- RLS policies for views (anyone can insert, admins can view all)
CREATE POLICY "Anyone can track article views"
ON public.article_views FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view all article views"
ON public.article_views FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can track podcast views"
ON public.podcast_views FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view all podcast views"
ON public.podcast_views FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for ratings (authenticated users can rate, everyone can view)
CREATE POLICY "Authenticated users can insert article ratings"
ON public.article_ratings FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Everyone can view article ratings"
ON public.article_ratings FOR SELECT
USING (true);

CREATE POLICY "Users can update their own article ratings"
ON public.article_ratings FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert podcast ratings"
ON public.podcast_ratings FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Everyone can view podcast ratings"
ON public.podcast_ratings FOR SELECT
USING (true);

CREATE POLICY "Users can update their own podcast ratings"
ON public.podcast_ratings FOR UPDATE
USING (auth.uid() = user_id);

-- Update articles RLS policies: only admins can publish
DROP POLICY IF EXISTS "Admins and editors can insert articles" ON public.articles;
DROP POLICY IF EXISTS "Authors and admins can update articles" ON public.articles;

CREATE POLICY "Admins and editors can insert articles"
ON public.articles FOR INSERT
WITH CHECK (
  (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role))
  AND (published = false OR has_role(auth.uid(), 'admin'::app_role))
);

CREATE POLICY "Authors can update their articles, admins can update all"
ON public.articles FOR UPDATE
USING (
  auth.uid() = author_id OR has_role(auth.uid(), 'admin'::app_role)
)
WITH CHECK (
  (auth.uid() = author_id AND published = false) OR has_role(auth.uid(), 'admin'::app_role)
);

-- Update podcasts RLS policies: only admins can publish
DROP POLICY IF EXISTS "Admins and editors can insert podcasts" ON public.podcasts;
DROP POLICY IF EXISTS "Authors and admins can update podcasts" ON public.podcasts;

CREATE POLICY "Admins and editors can insert podcasts"
ON public.podcasts FOR INSERT
WITH CHECK (
  (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role))
  AND (published = false OR has_role(auth.uid(), 'admin'::app_role))
);

CREATE POLICY "Authors can update their podcasts, admins can update all"
ON public.podcasts FOR UPDATE
USING (
  auth.uid() = author_id OR has_role(auth.uid(), 'admin'::app_role)
)
WITH CHECK (
  (auth.uid() = author_id AND published = false) OR has_role(auth.uid(), 'admin'::app_role)
);

-- Create indexes for better performance
CREATE INDEX idx_article_views_article_id ON public.article_views(article_id);
CREATE INDEX idx_article_views_viewed_at ON public.article_views(viewed_at DESC);
CREATE INDEX idx_podcast_views_podcast_id ON public.podcast_views(podcast_id);
CREATE INDEX idx_podcast_views_viewed_at ON public.podcast_views(viewed_at DESC);
CREATE INDEX idx_article_ratings_article_id ON public.article_ratings(article_id);
CREATE INDEX idx_podcast_ratings_podcast_id ON public.podcast_ratings(podcast_id);