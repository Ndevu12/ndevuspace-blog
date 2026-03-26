-- =============================================================================
-- Migration: 20260101000102_user_profiles_triggers.sql
-- Domain: USER_PROFILES
-- Type: Triggers
-- Purpose: Keep updated_at fresh and auto-bootstrap profiles from auth.users
-- Dependencies: 20260101000101_user_profiles_rls.sql
-- =============================================================================

-- ============================================================================
-- UPDATED_AT TOUCH FUNCTION + TRIGGER
-- ============================================================================

CREATE OR REPLACE FUNCTION public.fn_user_profiles_set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := timezone('utc', now());
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_user_profiles_set_updated_at ON public.user_profiles;
CREATE TRIGGER trg_user_profiles_set_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_user_profiles_set_updated_at();

-- ============================================================================
-- AUTH USER BOOTSTRAP FUNCTION + TRIGGER
-- ============================================================================
-- Automatically creates the profile row when an auth user is created.

CREATE OR REPLACE FUNCTION public.fn_bootstrap_user_profile_from_auth()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  meta jsonb := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);
  derived_username text;
BEGIN
  derived_username := COALESCE(
    NULLIF(meta ->> 'username', ''),
    NULLIF(split_part(COALESCE(NEW.email, ''), '@', 1), ''),
    'user_' || substring(NEW.id::text FROM 1 FOR 8)
  );

  INSERT INTO public.user_profiles (
    id,
    username,
    first_name,
    last_name,
    role,
    avatar_url
  )
  VALUES (
    NEW.id,
    derived_username,
    COALESCE(NULLIF(meta ->> 'firstName', ''), NULLIF(meta ->> 'first_name', ''), ''),
    COALESCE(NULLIF(meta ->> 'lastName', ''), NULLIF(meta ->> 'last_name', ''), ''),
    COALESCE(NULLIF(meta ->> 'role', ''), 'user'),
    COALESCE(NULLIF(meta ->> 'avatarUrl', ''), NULLIF(meta ->> 'avatar_url', ''))
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_bootstrap_user_profile_from_auth ON auth.users;
CREATE TRIGGER trg_bootstrap_user_profile_from_auth
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_bootstrap_user_profile_from_auth();

-- =============================================================================
-- Migration Complete
-- =============================================================================
