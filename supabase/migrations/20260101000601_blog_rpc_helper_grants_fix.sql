-- =============================================================================
-- Migration: 20260101000601_blog_rpc_helper_grants_fix.sql
-- Domain: BLOGS
-- Type: Permission fix
-- Purpose: Ensure SECURITY INVOKER blog RPC helper call-chain is executable
--          by client roles that execute public/admin RPCs.
-- Dependencies: 20260101000103_blog_rpc_helpers_auth.sql,
--               20260101000402_blogs_rpc_helpers.sql
-- =============================================================================

REVOKE ALL ON FUNCTION public.blog_auth_is_blog_admin() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.blog_auth_is_blog_admin() TO authenticated, postgres, service_role;

REVOKE ALL ON FUNCTION public.blog_slugify(text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.blog_resolve_slug(text, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.blog_assert_authenticated_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.blog_assert_blog_write_access(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.blog_json_author_fragment(uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.blog_json_category_fragment(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.blog_json_tags_fragment(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.blog_json_row_fragment(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.blog_admin_sync_tag_links(uuid, text[]) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.blog_slugify(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.blog_resolve_slug(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.blog_assert_authenticated_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.blog_assert_blog_write_access(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.blog_json_author_fragment(uuid, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.blog_json_category_fragment(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.blog_json_tags_fragment(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.blog_json_row_fragment(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.blog_admin_sync_tag_links(uuid, text[]) TO authenticated;

-- =============================================================================
-- Migration Complete
-- =============================================================================
