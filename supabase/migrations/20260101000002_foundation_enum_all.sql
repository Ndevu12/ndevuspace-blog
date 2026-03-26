-- =============================================================================
-- Migration: 20260101000002_foundation_enum_all.sql
-- Domain: FOUNDATION
-- Type: Enum Types
-- Purpose: Shared enum types required by domain tables
-- Dependencies: 20260101000001_foundation_extensions.sql
-- =============================================================================

-- ============================================================================
-- BLOG STATUS ENUM
-- ============================================================================
-- Shared status domain used by blog records and API filtering.
-- Keep labels aligned with frontend/domain types:
-- draft | published | archived

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'blog_status'
      AND n.nspname = 'public'
  ) THEN
    CREATE TYPE public.blog_status AS ENUM ('draft', 'published', 'archived');
  END IF;
END $$;

ALTER TYPE public.blog_status ADD VALUE IF NOT EXISTS 'draft';
ALTER TYPE public.blog_status ADD VALUE IF NOT EXISTS 'published';
ALTER TYPE public.blog_status ADD VALUE IF NOT EXISTS 'archived';

COMMENT ON TYPE public.blog_status IS
  'Canonical blog lifecycle status enum shared across blog domain tables.';

-- =============================================================================
-- Migration Complete
-- =============================================================================
