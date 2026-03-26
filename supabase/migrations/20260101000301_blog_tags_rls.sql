-- =============================================================================
-- Migration: 20260101000301_blog_tags_rls.sql
-- Domain: BLOG TAGS
-- Type: Row Level Security
-- Purpose: Enforce read access for all and lock writes to privileged roles
-- Dependencies: 20260101000300_blog_tags_table.sql
-- =============================================================================

ALTER TABLE public.blog_tags ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'blog_tags'
      AND policyname = 'blog_tags_public_read'
  ) THEN
    CREATE POLICY blog_tags_public_read
      ON public.blog_tags
      FOR SELECT
      TO anon, authenticated
      USING (true);
  END IF;
END $$;

COMMENT ON POLICY blog_tags_public_read ON public.blog_tags IS
  'Allows public and authenticated clients to read blog tags.';
