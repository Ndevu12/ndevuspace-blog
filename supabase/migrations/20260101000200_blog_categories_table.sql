-- =============================================================================
-- Migration: 20260101000200_blog_categories_table.sql
-- Domain: BLOG CATEGORIES
-- Type: Table
-- Purpose: Create taxonomy table for blog category metadata
-- Dependencies: 20260101000002_foundation_enum_all.sql
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.blog_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL,
  description text,
  icon text NOT NULL DEFAULT 'tag',
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

ALTER TABLE public.blog_categories
  ALTER COLUMN created_at SET DEFAULT timezone('utc', now()),
  ALTER COLUMN updated_at SET DEFAULT timezone('utc', now());

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'blog_categories_name_not_blank'
      AND conrelid = 'public.blog_categories'::regclass
  ) THEN
    ALTER TABLE public.blog_categories
      ADD CONSTRAINT blog_categories_name_not_blank
      CHECK (btrim(name) <> '');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'blog_categories_slug_not_blank'
      AND conrelid = 'public.blog_categories'::regclass
  ) THEN
    ALTER TABLE public.blog_categories
      ADD CONSTRAINT blog_categories_slug_not_blank
      CHECK (btrim(slug) <> '');
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS blog_categories_name_lower_uidx
  ON public.blog_categories (lower(name));

CREATE UNIQUE INDEX IF NOT EXISTS blog_categories_slug_lower_uidx
  ON public.blog_categories (lower(slug));

COMMENT ON TABLE public.blog_categories IS
  'Blog taxonomy categories used to group and filter blog posts.';

COMMENT ON COLUMN public.blog_categories.name IS
  'Display label for category.';

COMMENT ON COLUMN public.blog_categories.slug IS
  'URL-safe stable identifier for category pages.';

COMMENT ON COLUMN public.blog_categories.icon IS
  'Display icon key for the category (e.g. Lucide name). Default ''tag'' matches dashboard create-form default.';
