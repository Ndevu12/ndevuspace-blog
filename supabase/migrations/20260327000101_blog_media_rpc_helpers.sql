-- =============================================================================
-- Migration: 20260327000101_blog_media_rpc_helpers.sql
-- Domain: STORAGE / BLOGS
-- Type: SQL helper functions (internal)
-- Purpose: Reusable storage path/RBAC predicates for blog-media policies
-- Dependencies: 20260101000103_blog_rpc_helpers_auth.sql
-- =============================================================================

CREATE OR REPLACE FUNCTION public.blog_media_can_manage_object(
  p_object_name text
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT
    (
      COALESCE((storage.foldername(p_object_name))[1], '') = 'authors'
      AND COALESCE((storage.foldername(p_object_name))[2], '') = (auth.uid())::text
      AND COALESCE((storage.foldername(p_object_name))[3], '') = 'blogs'
    )
    OR public.blog_auth_is_blog_admin();
$$;

COMMENT ON FUNCTION public.blog_media_can_manage_object(text) IS
  'Internal helper. Args: p_object_name text (storage object key). Returns boolean true when object path matches authors/<auth.uid()>/blogs/... or caller is admin via blog_auth_is_blog_admin(). Helper note: reusable storage RBAC predicate for blog-media object writes.';

REVOKE ALL ON FUNCTION public.blog_media_can_manage_object(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.blog_media_can_manage_object(text) TO authenticated, postgres, service_role;

-- =============================================================================
-- Migration Complete
-- =============================================================================
