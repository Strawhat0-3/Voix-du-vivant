
-- 1) Drop creator_applications and any leftover editor policies
DROP TABLE IF EXISTS public.creator_applications CASCADE;

-- 2) Add source document URL to articles
ALTER TABLE public.articles
  ADD COLUMN IF NOT EXISTS source_document_url text;

-- 3) Articles RLS — clean reset, public read of published, admin-only write
DROP POLICY IF EXISTS "Published articles are viewable by everyone" ON public.articles;
DROP POLICY IF EXISTS "Admins and editors can insert articles" ON public.articles;
DROP POLICY IF EXISTS "Admins can delete articles" ON public.articles;
DROP POLICY IF EXISTS "Authors can update their articles, admins can update all" ON public.articles;

CREATE POLICY "Articles published are public"
  ON public.articles FOR SELECT
  USING (published = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage articles insert"
  ON public.articles FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage articles update"
  ON public.articles FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage articles delete"
  ON public.articles FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

GRANT SELECT ON public.articles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.articles TO authenticated;
GRANT ALL ON public.articles TO service_role;

-- 4) Podcasts RLS — same model
DROP POLICY IF EXISTS "Published podcasts are viewable by everyone" ON public.podcasts;
DROP POLICY IF EXISTS "Admins and editors can insert podcasts" ON public.podcasts;
DROP POLICY IF EXISTS "Admins can delete podcasts" ON public.podcasts;
DROP POLICY IF EXISTS "Authors can update their podcasts, admins can update all" ON public.podcasts;

CREATE POLICY "Podcasts published are public"
  ON public.podcasts FOR SELECT
  USING (published = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage podcasts insert"
  ON public.podcasts FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage podcasts update"
  ON public.podcasts FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage podcasts delete"
  ON public.podcasts FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

GRANT SELECT ON public.podcasts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.podcasts TO authenticated;
GRANT ALL ON public.podcasts TO service_role;

-- 5) Comments: public reads of approved comments, authenticated insert
GRANT SELECT ON public.comments TO anon;
