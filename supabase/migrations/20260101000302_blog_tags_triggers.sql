-- =============================================================================
-- Migration: 20260101000302_blog_tags_triggers.sql
-- Domain: BLOG TAGS
-- Type: Triggers
-- Purpose: Keep updated_at fresh on tag updates
-- Dependencies: 20260101000301_blog_tags_rls.sql
-- =============================================================================

CREATE OR REPLACE FUNCTION public.set_blog_tags_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := timezone('utc', now());
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_blog_tags_set_updated_at ON public.blog_tags;

CREATE TRIGGER trg_blog_tags_set_updated_at
  BEFORE UPDATE ON public.blog_tags
  FOR EACH ROW
  EXECUTE FUNCTION public.set_blog_tags_updated_at();

COMMENT ON FUNCTION public.set_blog_tags_updated_at() IS
  'Trigger function that refreshes updated_at before blog_tags updates.';

-- Trigger helper only; prevent direct client execution.
REVOKE ALL ON FUNCTION public.set_blog_tags_updated_at() FROM PUBLIC, anon, authenticated;
