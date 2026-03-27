-- =============================================================================
-- Migration: 20260101000501_blog_tag_links_rls.sql
-- Domain: BLOG TAG LINKS
-- Type: Row Level Security
-- Purpose: Allow public reads; writes for blog author or blog admin (RBAC parity
-- with public.blogs policies in 20260101000401_blogs_rls.sql).
-- Dependencies: 20260101000103_blog_rpc_helpers_auth.sql,
--               20260101000500_blog_tag_links_table.sql
-- =============================================================================

ALTER TABLE public.blog_tag_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS blog_tag_links_select_public ON public.blog_tag_links;
CREATE POLICY blog_tag_links_select_public
  ON public.blog_tag_links
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Admin branch delegates to public.blog_auth_is_blog_admin() so role
-- normalization stays in one helper and is shared with blogs RLS.

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
        AND (
          b.author_id = (select auth.uid())
          OR public.blog_auth_is_blog_admin()
        )
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
        AND (
          b.author_id = (select auth.uid())
          OR public.blog_auth_is_blog_admin()
        )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.blogs b
      WHERE b.id = blog_tag_links.blog_id
        AND (
          b.author_id = (select auth.uid())
          OR public.blog_auth_is_blog_admin()
        )
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
        AND (
          b.author_id = (select auth.uid())
          OR public.blog_auth_is_blog_admin()
        )
    )
  );
