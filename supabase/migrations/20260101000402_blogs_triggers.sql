-- =============================================================================
-- Migration: 20260101000402_blogs_triggers.sql
-- Domain: BLOGS
-- Type: Triggers
-- Purpose: Keep updated_at fresh on blog updates
-- Dependencies: 20260101000401_blogs_rls.sql
-- =============================================================================

CREATE OR REPLACE FUNCTION public.set_blogs_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := timezone('utc', now());
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_blogs_set_updated_at ON public.blogs;

CREATE TRIGGER trg_blogs_set_updated_at
  BEFORE UPDATE ON public.blogs
  FOR EACH ROW
  EXECUTE FUNCTION public.set_blogs_updated_at();

COMMENT ON FUNCTION public.set_blogs_updated_at() IS
  'Trigger function that refreshes updated_at before blog updates.';
