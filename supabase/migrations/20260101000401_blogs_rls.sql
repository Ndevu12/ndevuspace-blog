-- =============================================================================
-- Migration: 20260101000401_blogs_rls.sql
-- Domain: BLOGS
-- Type: Row Level Security
-- Purpose: Enforce public published reads and owner-scoped mutations for blogs
-- Dependencies: 20260101000400_blogs_table.sql
-- =============================================================================

ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS blogs_select_published_or_owner ON public.blogs;
CREATE POLICY blogs_select_published_or_owner
  ON public.blogs
  FOR SELECT
  TO anon, authenticated
  USING (
    status = 'published'
    OR (select auth.uid()) = author_id
  );

DROP POLICY IF EXISTS blogs_insert_own ON public.blogs;
CREATE POLICY blogs_insert_own
  ON public.blogs
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = author_id);

DROP POLICY IF EXISTS blogs_update_own ON public.blogs;
CREATE POLICY blogs_update_own
  ON public.blogs
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = author_id)
  WITH CHECK ((select auth.uid()) = author_id);

DROP POLICY IF EXISTS blogs_delete_own ON public.blogs;
CREATE POLICY blogs_delete_own
  ON public.blogs
  FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = author_id);
