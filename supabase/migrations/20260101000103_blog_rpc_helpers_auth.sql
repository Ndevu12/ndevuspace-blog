-- =============================================================================
-- Migration: 20260101000103_blog_rpc_helpers_auth.sql
-- Domain: BLOG (cross-domain auth helpers)
-- Type: SQL helper functions (not primary PostgREST RPC surface)
-- Purpose: Shared RBAC predicate for blog dashboard/RPC and blogs RLS
-- Dependencies: 20260101000100_user_profiles_table.sql,
--               20260101000101_user_profiles_rls.sql
-- =============================================================================
--
-- blog_auth_is_blog_admin() mirrors application role checks (LoginForm / auth):
-- lower(trim(user_profiles.role)) = 'admin' for auth.uid().
--
-- This helper is used by SECURITY INVOKER RPCs and RLS predicates.
-- Therefore authenticated callers need EXECUTE so the call chain can run.
--
-- =============================================================================

CREATE OR REPLACE FUNCTION public.blog_auth_is_blog_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_profiles p
    WHERE p.id = (SELECT auth.uid())
      AND lower(trim(p.role)) = 'admin'
  );
$$;

COMMENT ON FUNCTION public.blog_auth_is_blog_admin() IS
  'Helper auth predicate. Args: none. Returns boolean true when auth.uid() maps to user_profiles.role = admin (case/whitespace normalized), false otherwise. Helper note: internal-only helper for RLS/RPC guard composition and not part of the PostgREST client RPC surface.';

REVOKE ALL ON FUNCTION public.blog_auth_is_blog_admin() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.blog_auth_is_blog_admin() TO authenticated, postgres, service_role;

-- =============================================================================
-- Migration Complete
-- =============================================================================
