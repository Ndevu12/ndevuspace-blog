-- =============================================================================
-- Migration: 20260101000501_blog_tag_links_rls.sql
-- Domain: BLOG TAG LINKS
-- Type: Row Level Security
-- Purpose: Allow public reads while restricting writes to the owning blog author
-- Dependencies: 20260101000500_blog_tag_links_table.sql
-- =============================================================================

ALTER TABLE public.blog_tag_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS blog_tag_links_select_public ON public.blog_tag_links;
CREATE POLICY blog_tag_links_select_public
  ON public.blog_tag_links
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS blog_tag_links_insert_owner ON public.blog_tag_links;
CREATE POLICY blog_tag_links_insert_owner
  ON public.blog_tag_links
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.blogs b
      WHERE b.id = blog_tag_links.blog_id
        AND b.author_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS blog_tag_links_update_owner ON public.blog_tag_links;
CREATE POLICY blog_tag_links_update_owner
  ON public.blog_tag_links
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.blogs b
      WHERE b.id = blog_tag_links.blog_id
        AND b.author_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.blogs b
      WHERE b.id = blog_tag_links.blog_id
        AND b.author_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS blog_tag_links_delete_owner ON public.blog_tag_links;
CREATE POLICY blog_tag_links_delete_owner
  ON public.blog_tag_links
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.blogs b
      WHERE b.id = blog_tag_links.blog_id
        AND b.author_id = (select auth.uid())
    )
  );
