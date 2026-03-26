-- =============================================================================
-- Migration: 20260101000300_blog_tags_table.sql
-- Domain: BLOG TAGS
-- Type: Table
-- Purpose: Create taxonomy table for blog tag metadata
-- Dependencies: 20260101000002_foundation_enum_all.sql
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.blog_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

ALTER TABLE public.blog_tags
  ALTER COLUMN created_at SET DEFAULT timezone('utc', now()),
  ALTER COLUMN updated_at SET DEFAULT timezone('utc', now());

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'blog_tags_name_not_blank'
      AND conrelid = 'public.blog_tags'::regclass
  ) THEN
    ALTER TABLE public.blog_tags
      ADD CONSTRAINT blog_tags_name_not_blank
      CHECK (btrim(name) <> '');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'blog_tags_slug_not_blank'
      AND conrelid = 'public.blog_tags'::regclass
  ) THEN
    ALTER TABLE public.blog_tags
      ADD CONSTRAINT blog_tags_slug_not_blank
      CHECK (btrim(slug) <> '');
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS blog_tags_name_lower_uidx
  ON public.blog_tags (lower(name));

CREATE UNIQUE INDEX IF NOT EXISTS blog_tags_slug_lower_uidx
  ON public.blog_tags (lower(slug));

COMMENT ON TABLE public.blog_tags IS
  'Blog taxonomy tags used for finer-grained post classification and filtering.';

COMMENT ON COLUMN public.blog_tags.name IS
  'Display label for tag.';

COMMENT ON COLUMN public.blog_tags.slug IS
  'URL-safe stable identifier for tag pages and API filtering.';
