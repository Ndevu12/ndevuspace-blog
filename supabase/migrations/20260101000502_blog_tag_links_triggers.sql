-- =============================================================================
-- Migration: 20260101000502_blog_tag_links_triggers.sql
-- Domain: BLOG TAG LINKS
-- Type: Triggers
-- Purpose: Touch parent blog updated_at when tag links change
-- Dependencies: 20260101000501_blog_tag_links_rls.sql
-- =============================================================================

CREATE OR REPLACE FUNCTION public.touch_blog_updated_at_from_tag_links()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.blogs
  SET updated_at = timezone('utc', now())
  WHERE id = COALESCE(NEW.blog_id, OLD.blog_id);

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_blog_tag_links_touch_blog_updated_at ON public.blog_tag_links;

CREATE TRIGGER trg_blog_tag_links_touch_blog_updated_at
  AFTER INSERT OR UPDATE OR DELETE ON public.blog_tag_links
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_blog_updated_at_from_tag_links();

COMMENT ON FUNCTION public.touch_blog_updated_at_from_tag_links() IS
  'Trigger function that updates parent blog updated_at when blog_tag_links change.';
