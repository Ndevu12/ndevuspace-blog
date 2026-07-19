-- =============================================================================
-- Migration: 20260718000200_blog_scheduled_publishing.sql
-- Domain: BLOGS
-- Type: Column + RPCs + pg_cron schedule
-- Purpose: Future-dated auto-publishing. A post's author (or an admin)
--          schedules it; a pg_cron job
--          flips due 'scheduled' posts to 'published' every minute — no user
--          intervention. Public read RPCs need no change: a scheduled post is
--          simply not 'published' until the job flips it.
-- Dependencies: 20260718000100 (blog_status 'scheduled'), blogs,
--               blog_assert_blog_write_access
-- =============================================================================

-- ── Column: when a scheduled post should go live ─────────────────────────────

ALTER TABLE public.blogs
  ADD COLUMN IF NOT EXISTS publish_at timestamptz;

COMMENT ON COLUMN public.blogs.publish_at IS
  'For status = scheduled: the UTC time at which blog_publish_due() should publish this post. NULL for non-scheduled posts.';

-- Supports the due-scan; partial so it only indexes rows the job cares about.
CREATE INDEX IF NOT EXISTS blogs_scheduled_publish_at_idx
  ON public.blogs (publish_at)
  WHERE status = 'scheduled';

-- ── Schedule a post for future publication (author or admin) ─────────────────

CREATE OR REPLACE FUNCTION public.blog_schedule_post(
  p_blog_id uuid,
  p_publish_at timestamptz
)
RETURNS jsonb
LANGUAGE plpgsql
VOLATILE
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_existing public.blogs%ROWTYPE;
BEGIN
  IF p_blog_id IS NULL THEN
    RAISE EXCEPTION 'Blog id is required' USING ERRCODE = '23514';
  END IF;
  IF p_publish_at IS NULL THEN
    RAISE EXCEPTION 'A publish time is required' USING ERRCODE = '23514';
  END IF;
  IF p_publish_at <= timezone('utc', now()) THEN
    RAISE EXCEPTION 'Publish time must be in the future' USING ERRCODE = '22023';
  END IF;

  SELECT * INTO v_existing FROM public.blogs b WHERE b.id = p_blog_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Blog "%" not found', p_blog_id USING ERRCODE = 'P0002';
  END IF;

  -- Same RBAC as blog_admin_update: row author or blog admin only.
  PERFORM public.blog_assert_blog_write_access(v_existing.author_id);

  UPDATE public.blogs b
  SET status = 'scheduled',
      publish_at = p_publish_at,
      published_at = NULL
  WHERE b.id = p_blog_id;

  RETURN jsonb_build_object(
    'ok', true,
    'id', p_blog_id,
    'status', 'scheduled',
    'publishAt', p_publish_at
  );
END;
$$;

COMMENT ON FUNCTION public.blog_schedule_post(uuid, timestamptz) IS
  'Blog scheduling write RPC (not admin-only). Args: p_blog_id uuid, p_publish_at timestamptz (must be future). Callable by any authenticated user; RBAC is enforced in-function via blog_assert_blog_write_access (row author or admin). Sets status=scheduled + publish_at and clears published_at. Returns {"ok":true,"id","status":"scheduled","publishAt"}. A pg_cron job publishes it at publish_at.';

-- ── System: publish all due scheduled posts (the cron target) ────────────────

CREATE OR REPLACE FUNCTION public.blog_publish_due()
RETURNS integer
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count int;
BEGIN
  WITH due AS (
    UPDATE public.blogs
    SET status = 'published',
        published_at = COALESCE(published_at, publish_at, timezone('utc', now()))
    WHERE status = 'scheduled'
      AND publish_at IS NOT NULL
      AND publish_at <= timezone('utc', now())
    RETURNING 1
  )
  SELECT count(*)::int INTO v_count FROM due;
  RETURN v_count;
END;
$$;

COMMENT ON FUNCTION public.blog_publish_due() IS
  'System RPC. Publishes every scheduled post whose publish_at has passed (status scheduled -> published, sets published_at from publish_at). Returns the number published. Intended to be called on a schedule by pg_cron; not exposed to anon/authenticated.';

-- ── Grants ───────────────────────────────────────────────────────────────────

REVOKE ALL ON FUNCTION public.blog_schedule_post(uuid, timestamptz) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.blog_schedule_post(uuid, timestamptz) TO authenticated;

-- System-only: pg_cron runs as postgres; an Edge Function would use service_role.
REVOKE ALL ON FUNCTION public.blog_publish_due() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.blog_publish_due() TO postgres, service_role;

-- ── pg_cron: run the flip every minute (no user intervention) ────────────────

CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Re-schedule idempotently so re-running the migration doesn't stack jobs.
DO $$
BEGIN
  PERFORM cron.unschedule(jobid)
  FROM cron.job
  WHERE jobname = 'blog-publish-due';

  PERFORM cron.schedule(
    'blog-publish-due',
    '* * * * *',
    'SELECT public.blog_publish_due();'
  );
END $$;

-- =============================================================================
-- Migration Complete
-- =============================================================================
