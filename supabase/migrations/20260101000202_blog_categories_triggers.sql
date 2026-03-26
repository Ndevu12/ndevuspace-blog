-- =============================================================================
-- Migration: 20260101000202_blog_categories_triggers.sql
-- Domain: BLOG CATEGORIES
-- Type: Triggers
-- Purpose: Keep updated_at fresh on category updates
-- Dependencies: 20260101000201_blog_categories_rls.sql
-- =============================================================================

CREATE OR REPLACE FUNCTION public.set_blog_categories_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := timezone('utc', now());
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_blog_categories_set_updated_at ON public.blog_categories;

CREATE TRIGGER trg_blog_categories_set_updated_at
  BEFORE UPDATE ON public.blog_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.set_blog_categories_updated_at();

COMMENT ON FUNCTION public.set_blog_categories_updated_at() IS
  'Trigger function that refreshes updated_at before blog_categories updates.';
