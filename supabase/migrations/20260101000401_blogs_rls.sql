-- =============================================================================
-- Migration: 20260101000401_blogs_rls.sql
-- Domain: BLOGS
-- Type: Row Level Security
-- Purpose: RBAC for blogs — public reads, author ownership, admin override
-- Dependencies: 20260101000103_blog_rpc_helpers_auth.sql,
--               20260101000400_blogs_table.sql
-- =============================================================================
--
-- RBAC matrix (aligned with product plan):
--
-- | Operation | anon | authenticated author | admin (user_profiles.role) |
-- |-----------|------|----------------------|----------------------------|
-- | SELECT    | published rows only | published OR own row (any status) | all rows |
-- | INSERT    | — | author_id = auth.uid() only (admins post as self) | same |
-- | UPDATE    | — | author_id = auth.uid() | any row |
-- | DELETE    | — | author_id = auth.uid() | any row |
--
-- Admin flag: lower(trim(user_profiles.role)) = 'admin' for (select auth.uid()).
-- Matches application auth normalization (see LoginForm / authService).
--
-- Dashboard RPCs / aggregates (INVOKER vs DEFINER):
-- • SECURITY INVOKER functions that SELECT/aggregate blogs inherit this policy.
--   Rows visible to a caller are exactly those allowed by SELECT above; SUM/COUNT
--   therefore span that set (for authors: all published site-wide plus own drafts,
--   unless the SQL adds tighter filters).
-- • For “global” dashboard totals (site-wide drafts, other authors’ private rows),
--   use SECURITY DEFINER only if needed, SET search_path = public, and assert
--   blog RBAC at the start (e.g. same admin predicate below) before aggregating;
--   prefer INVOKER + RLS when the visible-row set is the intended metric.
--
-- User-facing admin list UIs that must show *only* an author’s posts should add an
-- explicit filter in the RPC (e.g. WHERE author_id = auth.uid()) for non-admins,
-- because SELECT intentionally still exposes published rows from all authors.
--
-- =============================================================================

ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;

-- Admin branch calls public.blog_auth_is_blog_admin() (see
-- 20260101000103_blog_rpc_helpers_auth.sql). That helper grants EXECUTE to
-- role authenticated so policies can evaluate it; anon has no EXECUTE, so
-- anonymous readers use a separate SELECT policy (published only).

DROP POLICY IF EXISTS blogs_select_published_or_owner ON public.blogs;
DROP POLICY IF EXISTS blogs_select_anon_published ON public.blogs;
DROP POLICY IF EXISTS blogs_select_authenticated ON public.blogs;

CREATE POLICY blogs_select_anon_published
  ON public.blogs
  FOR SELECT
  TO anon
  USING (status = 'published');

CREATE POLICY blogs_select_authenticated
  ON public.blogs
  FOR SELECT
  TO authenticated
  USING (
    status = 'published'
    OR (SELECT auth.uid()) = author_id
    OR public.blog_auth_is_blog_admin()
  );

DROP POLICY IF EXISTS blogs_insert_own ON public.blogs;
CREATE POLICY blogs_insert_own
  ON public.blogs
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = author_id);

DROP POLICY IF EXISTS blogs_update_own ON public.blogs;
CREATE POLICY blogs_update_own
  ON public.blogs
  FOR UPDATE
  TO authenticated
  USING (
    (SELECT auth.uid()) = author_id
    OR public.blog_auth_is_blog_admin()
  )
  WITH CHECK (
    (SELECT auth.uid()) = author_id
    OR public.blog_auth_is_blog_admin()
  );

DROP POLICY IF EXISTS blogs_delete_own ON public.blogs;
CREATE POLICY blogs_delete_own
  ON public.blogs
  FOR DELETE
  TO authenticated
  USING (
    (SELECT auth.uid()) = author_id
    OR public.blog_auth_is_blog_admin()
  );
