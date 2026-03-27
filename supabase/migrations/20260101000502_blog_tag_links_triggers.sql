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

CREATE OR REPLACE FUNCTION public.cleanup_orphan_blog_tags()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM public.blog_tags t
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.blog_tag_links l
    WHERE l.tag_id = t.id
  );

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_blog_tag_links_touch_blog_updated_at ON public.blog_tag_links;
DROP TRIGGER IF EXISTS trg_blog_tag_links_cleanup_orphan_tags ON public.blog_tag_links;

CREATE TRIGGER trg_blog_tag_links_touch_blog_updated_at
  AFTER INSERT OR UPDATE OR DELETE ON public.blog_tag_links
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_blog_updated_at_from_tag_links();

CREATE TRIGGER trg_blog_tag_links_cleanup_orphan_tags
  AFTER INSERT OR UPDATE OR DELETE ON public.blog_tag_links
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.cleanup_orphan_blog_tags();

COMMENT ON FUNCTION public.touch_blog_updated_at_from_tag_links() IS
  'Trigger function that updates parent blog updated_at when blog_tag_links change.';

COMMENT ON FUNCTION public.cleanup_orphan_blog_tags() IS
  'Trigger function that removes blog_tags rows not referenced by any blog_tag_links row.';
