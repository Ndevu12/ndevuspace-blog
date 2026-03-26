-- =============================================================================
-- Migration: 20260101000101_user_profiles_rls.sql
-- Domain: USER_PROFILES
-- Type: RLS
-- Purpose: Enable and define RLS policies for user_profiles
-- Dependencies: 20260101000100_user_profiles_table.sql
-- =============================================================================

-- ============================================================================
-- ENABLE RLS
-- ============================================================================

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- POLICIES
-- ============================================================================
-- Read access is open for profile display use-cases.
-- Mutations are limited to the owner row.

DROP POLICY IF EXISTS user_profiles_select_public ON public.user_profiles;
CREATE POLICY user_profiles_select_public
  ON public.user_profiles
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS user_profiles_insert_own ON public.user_profiles;
CREATE POLICY user_profiles_insert_own
  ON public.user_profiles
  FOR INSERT
  WITH CHECK ((select auth.uid()) = id);

DROP POLICY IF EXISTS user_profiles_update_own ON public.user_profiles;
CREATE POLICY user_profiles_update_own
  ON public.user_profiles
  FOR UPDATE
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

DROP POLICY IF EXISTS user_profiles_delete_own ON public.user_profiles;
CREATE POLICY user_profiles_delete_own
  ON public.user_profiles
  FOR DELETE
  USING ((select auth.uid()) = id);

-- =============================================================================
-- Migration Complete
-- =============================================================================
