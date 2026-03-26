-- =============================================================================
-- Migration: 20260101000400_blogs_table.sql
-- Domain: BLOGS
-- Type: Table
-- Purpose: Create blogs table with client-required display fields and relations
-- Dependencies: 20260101000202_blog_categories_triggers.sql
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.blogs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL,
  title text NOT NULL,
  description text,
  content text NOT NULL DEFAULT '',
  author_id uuid NOT NULL REFERENCES public.user_profiles (id) ON DELETE RESTRICT,
  author text NOT NULL DEFAULT '',
  author_image text,
  category_id uuid REFERENCES public.blog_categories (id) ON DELETE SET NULL,
  category text,
  image_url text,
  read_time integer NOT NULL DEFAULT 0,
  is_new boolean NOT NULL DEFAULT false,
  is_featured boolean NOT NULL DEFAULT false,
  meta_title text,
  meta_description text,
  likes uuid[] NOT NULL DEFAULT '{}',
  likes_count integer NOT NULL DEFAULT 0,
  views_count integer NOT NULL DEFAULT 0,
  status public.blog_status NOT NULL DEFAULT 'draft',
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT blogs_slug_not_blank CHECK (btrim(slug) <> ''),
  CONSTRAINT blogs_title_not_blank CHECK (btrim(title) <> ''),
  CONSTRAINT blogs_author_not_blank CHECK (btrim(author) <> ''),
  CONSTRAINT blogs_read_time_non_negative CHECK (read_time >= 0),
  CONSTRAINT blogs_likes_count_non_negative CHECK (likes_count >= 0),
  CONSTRAINT blogs_views_count_non_negative CHECK (views_count >= 0),
  CONSTRAINT blogs_likes_length_matches_count CHECK (cardinality(likes) = likes_count)
);

COMMENT ON TABLE public.blogs IS
  'Primary blog post entity preserving client fields while supporting normalized joins.';

COMMENT ON COLUMN public.blogs.slug IS
  'URL-safe stable identifier for blog post routes.';
COMMENT ON COLUMN public.blogs.author_id IS
  'FK to user_profiles(id), canonical author relation for ownership and joins.';
COMMENT ON COLUMN public.blogs.author IS
  'Display author string preserved for client compatibility.';
COMMENT ON COLUMN public.blogs.author_image IS
  'Display avatar URL preserved for client compatibility.';
COMMENT ON COLUMN public.blogs.category_id IS
  'FK to blog_categories(id), canonical category relation for filtering.';
COMMENT ON COLUMN public.blogs.category IS
  'Display category string preserved for client compatibility.';
COMMENT ON COLUMN public.blogs.likes IS
  'Array of user ids that liked the blog, mirroring current client shape.';
COMMENT ON COLUMN public.blogs.likes_count IS
  'Cached likes count for sort/filter operations.';
COMMENT ON COLUMN public.blogs.status IS
  'Blog lifecycle status (draft, published, archived).';

-- Baseline lookup and uniqueness indexes.
CREATE UNIQUE INDEX IF NOT EXISTS blogs_slug_uidx
  ON public.blogs (slug);

CREATE INDEX IF NOT EXISTS blogs_status_published_at_idx
  ON public.blogs (status, published_at DESC);

CREATE INDEX IF NOT EXISTS blogs_category_status_published_at_idx
  ON public.blogs (category_id, status, published_at DESC);

CREATE INDEX IF NOT EXISTS blogs_author_created_at_idx
  ON public.blogs (author_id, created_at DESC);

-- Additional support indexes for RLS and common sorting.
CREATE INDEX IF NOT EXISTS blogs_author_id_idx
  ON public.blogs (author_id);

CREATE INDEX IF NOT EXISTS blogs_category_id_idx
  ON public.blogs (category_id);

CREATE INDEX IF NOT EXISTS blogs_created_at_idx
  ON public.blogs (created_at DESC);
