-- =============================================================================
-- Migration: 20260718000100_blog_status_scheduled_enum.sql
-- Domain: BLOGS
-- Type: Enum extension
-- Purpose: Add a 'scheduled' lifecycle status for future-dated auto-publishing.
--
-- NOTE: this lives in its own migration on purpose — PostgreSQL forbids USING a
-- newly added enum value in the same transaction that adds it. The follow-up
-- migration (…000200) references 'scheduled' and therefore must run afterwards.
-- =============================================================================

ALTER TYPE public.blog_status ADD VALUE IF NOT EXISTS 'scheduled';

COMMENT ON TYPE public.blog_status IS
  'Blog lifecycle status (draft, scheduled, published, archived). "scheduled" posts are not public until blog_publish_due() flips them to "published" at their publish_at time.';
