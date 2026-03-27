-- =============================================================================
-- Migration: 20260327000100_blog_media_bucket.sql
-- Domain: STORAGE / BLOGS
-- Type: Bucket foundation
-- Purpose: Define blog-media storage bucket baseline
-- Dependencies: none
-- =============================================================================
--
-- Bucket contract:
--   - Bucket id/name: blog-media
--   - Public read is enabled at bucket metadata level.
--   - Object-level access control is enforced by storage.objects RLS policies.
--
-- =============================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-media', 'blog-media', true)
ON CONFLICT (id)
DO UPDATE SET
  name = EXCLUDED.name,
  public = EXCLUDED.public;

-- =============================================================================
-- Migration Complete
-- =============================================================================
