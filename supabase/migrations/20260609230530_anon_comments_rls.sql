-- =============================================================================
-- Migration : Commentaires Anonymes + Modération + Réactions Cœur
-- Objectif  : Permettre aux visiteurs non connectés de soumettre un commentaire
--             (pseudo libre), toujours pending review (approved = false).
--             Seuls les commentaires approved = true sont lisibles en public.
-- =============================================================================

-- 1) Rendre user_id et le pseudo nullable sur la table comments
--    (user_id est NULL pour les commentaires anonymes)
ALTER TABLE public.comments
  ALTER COLUMN user_id DROP NOT NULL;

-- 2) Ajouter la colonne "display_name" pour stocker le pseudo des anonymes
ALTER TABLE public.comments
  ADD COLUMN IF NOT EXISTS display_name TEXT;

-- 3) S'assurer qu'approved vaut false par défaut (sécurité modération)
ALTER TABLE public.comments
  ALTER COLUMN approved SET DEFAULT false;

-- =============================================================================
-- 4) POLITIQUE RLS — TABLE comments
-- =============================================================================

-- Supprimer les anciennes politiques pour repartir propre
DROP POLICY IF EXISTS "Comments are viewable by everyone" ON public.comments;
DROP POLICY IF EXISTS "Authenticated users can insert comments" ON public.comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON public.comments;
DROP POLICY IF EXISTS "Admins can delete comments" ON public.comments;
DROP POLICY IF EXISTS "Comments approved public read" ON public.comments;
DROP POLICY IF EXISTS "Anon can insert comments pending review" ON public.comments;

-- SELECT : seuls les commentaires APPROUVÉS sont publics (anon + authenticated)
--          les admins voient tout
CREATE POLICY "Comments approved public read"
  ON public.comments FOR SELECT
  USING (
    approved = true
    OR public.has_role(auth.uid(), 'admin')
  );

-- INSERT : tout le monde peut soumettre un commentaire (anon inclus)
--          le champ approved est FORCÉ à false côté base (WITH CHECK)
CREATE POLICY "Anon can insert comments pending review"
  ON public.comments FOR INSERT
  WITH CHECK (
    approved = false     -- ✅ Impossible de publier directement en approuvé
  );

-- UPDATE : seuls les admins peuvent approuver / modifier un commentaire
CREATE POLICY "Admins can approve and update comments"
  ON public.comments FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- DELETE : seuls les admins peuvent supprimer
CREATE POLICY "Admins can delete comments"
  ON public.comments FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Grants explicites pour anon
GRANT SELECT ON public.comments TO anon;
GRANT INSERT ON public.comments TO anon;

-- =============================================================================
-- 5) POLITIQUE RLS — TABLE comment_reactions
--    Réactions cœur ouvertes à tous (anon peut liker)
-- =============================================================================

DROP POLICY IF EXISTS "Authenticated users can manage reactions" ON public.comment_reactions;
DROP POLICY IF EXISTS "Anyone can view reactions" ON public.comment_reactions;
DROP POLICY IF EXISTS "Reactions public read" ON public.comment_reactions;
DROP POLICY IF EXISTS "Anon can insert reactions" ON public.comment_reactions;

-- Lecture publique des réactions
CREATE POLICY "Reactions public read"
  ON public.comment_reactions FOR SELECT
  USING (true);

-- Insertion ouverte à tous (anon + authenticated)
--   user_id peut être NULL pour les anonymes
CREATE POLICY "Anon can insert reactions"
  ON public.comment_reactions FOR INSERT
  WITH CHECK (true);

-- Un utilisateur authentifié peut supprimer sa propre réaction
CREATE POLICY "Auth users can delete own reactions"
  ON public.comment_reactions FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Grants explicites
GRANT SELECT ON public.comment_reactions TO anon;
GRANT INSERT ON public.comment_reactions TO anon;

-- =============================================================================
-- 6) Index de performance sur approved pour les lectures publiques rapides
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_comments_approved_article
  ON public.comments (article_id, approved, created_at DESC)
  WHERE approved = true;

CREATE INDEX IF NOT EXISTS idx_comments_approved_podcast
  ON public.comments (podcast_id, approved, created_at DESC)
  WHERE approved = true;
