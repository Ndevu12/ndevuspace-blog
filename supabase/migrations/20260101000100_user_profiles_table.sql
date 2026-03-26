-- =============================================================================
-- Migration: 20260101000100_user_profiles_table.sql
-- Domain: USER_PROFILES
-- Type: Table
-- Purpose: Create user_profiles table linked to auth.users
-- Dependencies: 20260101000002_foundation_enum_all.sql
-- =============================================================================

-- ============================================================================
-- USER PROFILES TABLE
-- ============================================================================
-- Canonical profile record for each authenticated user.
-- Keep this table minimal and safe for broad read access.

CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  username text NOT NULL,
  first_name text NOT NULL DEFAULT '',
  last_name text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'user',
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT user_profiles_username_length_chk
    CHECK (char_length(trim(username)) BETWEEN 3 AND 50),
  CONSTRAINT user_profiles_role_length_chk
    CHECK (char_length(trim(role)) BETWEEN 2 AND 32)
);

COMMENT ON TABLE public.user_profiles IS
  'Public profile attributes for authenticated users; one row per auth.users id.';

COMMENT ON COLUMN public.user_profiles.id IS
  'FK to auth.users(id), also the PK for one-to-one user profile mapping.';
COMMENT ON COLUMN public.user_profiles.username IS
  'Unique display username (case-insensitive).';
COMMENT ON COLUMN public.user_profiles.first_name IS
  'Given name for display and author attribution.';
COMMENT ON COLUMN public.user_profiles.last_name IS
  'Family name for display and author attribution.';
COMMENT ON COLUMN public.user_profiles.role IS
  'Application role hint (for example user/admin).';
COMMENT ON COLUMN public.user_profiles.avatar_url IS
  'Optional public URL for profile/avatar image.';

-- Case-insensitive uniqueness for profile handles.
CREATE UNIQUE INDEX IF NOT EXISTS user_profiles_username_lower_uidx
  ON public.user_profiles (lower(username));

-- Useful for administration and user listings.
CREATE INDEX IF NOT EXISTS user_profiles_created_at_idx
  ON public.user_profiles (created_at DESC);

CREATE INDEX IF NOT EXISTS user_profiles_role_idx
  ON public.user_profiles (role);

-- =============================================================================
-- Migration Complete
-- =============================================================================
