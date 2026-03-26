-- =============================================================================
-- Migration: 20260101000201_blog_categories_rls.sql
-- Domain: BLOG CATEGORIES
-- Type: Row Level Security
-- Purpose: Enforce read access for all and lock writes to privileged roles
-- Dependencies: 20260101000200_blog_categories_table.sql
-- =============================================================================

ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'blog_categories'
      AND policyname = 'blog_categories_public_read'
  ) THEN
    CREATE POLICY blog_categories_public_read
      ON public.blog_categories
      FOR SELECT
      TO anon, authenticated
      USING (true);
  END IF;
END $$;

COMMENT ON POLICY blog_categories_public_read ON public.blog_categories IS
  'Allows public and authenticated clients to read blog categories.';
