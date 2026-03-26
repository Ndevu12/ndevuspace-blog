-- =============================================================================
-- Migration: 20260101000500_blog_tag_links_table.sql
-- Domain: BLOG TAG LINKS
-- Type: Table
-- Purpose: Create junction table between blogs and blog_tags for many-to-many tagging
-- Dependencies: 20260101000402_blogs_triggers.sql
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.blog_tag_links (
  blog_id uuid NOT NULL REFERENCES public.blogs (id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES public.blog_tags (id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  PRIMARY KEY (blog_id, tag_id)
);

COMMENT ON TABLE public.blog_tag_links IS
  'Junction table mapping blogs to tags for many-to-many taxonomy relationships.';

COMMENT ON COLUMN public.blog_tag_links.blog_id IS
  'FK to blogs(id).';

COMMENT ON COLUMN public.blog_tag_links.tag_id IS
  'FK to blog_tags(id).';

CREATE INDEX IF NOT EXISTS blog_tag_links_tag_id_blog_id_idx
  ON public.blog_tag_links (tag_id, blog_id);
