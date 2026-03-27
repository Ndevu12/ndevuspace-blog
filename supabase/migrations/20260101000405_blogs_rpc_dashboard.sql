-- =============================================================================
-- Migration: 20260101000405_blogs_rpc_dashboard.sql
-- Domain: BLOGS
-- Type: User-facing dashboard analytics RPCs
-- Purpose: Dashboard stats and recent activity aggregates with role-aware scope
-- Dependencies: 20260101000402_blogs_rpc_helpers.sql,
--               20260101000401_blogs_rls.sql
-- =============================================================================

CREATE OR REPLACE FUNCTION public.blog_dashboard_stats()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_actor_id uuid;
  v_is_admin boolean;
BEGIN
  v_actor_id := public.blog_assert_authenticated_user();
  v_is_admin := public.blog_auth_is_blog_admin();

  RETURN (
    SELECT jsonb_build_object(
      'total_blogs', count(*)::int,
      'published_count', count(*) FILTER (WHERE b.status = 'published')::int,
      'draft_count', count(*) FILTER (WHERE b.status = 'draft')::int,
      'archived_count', count(*) FILTER (WHERE b.status = 'archived')::int,
      'total_views', COALESCE(sum(b.views_count), 0)::int,
      'total_likes', COALESCE(sum(b.likes_count), 0)::int
    )
    FROM public.blogs b
    WHERE v_is_admin OR b.author_id = v_actor_id
  );
END;
$$;

COMMENT ON FUNCTION public.blog_dashboard_stats() IS
  'Dashboard analytics RPC. Args: none. Requires authenticated session. Visibility scope is role-aware: admins aggregate across all blogs; non-admins aggregate only blogs where author_id = auth.uid(). Returns {"total_blogs":int,"published_count":int,"draft_count":int,"archived_count":int,"total_views":int,"total_likes":int}.';

CREATE OR REPLACE FUNCTION public.blog_dashboard_recent_activity(
  p_limit int DEFAULT 5
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_actor_id uuid;
  v_is_admin boolean;
  v_limit int := LEAST(GREATEST(COALESCE(p_limit, 5), 1), 50);
BEGIN
  v_actor_id := public.blog_assert_authenticated_user();
  v_is_admin := public.blog_auth_is_blog_admin();

  RETURN (
    WITH recent_items AS (
      SELECT
        b.id,
        b.title,
        b.updated_at,
        b.status
      FROM public.blogs b
      WHERE v_is_admin OR b.author_id = v_actor_id
      ORDER BY b.updated_at DESC, b.id DESC
      LIMIT v_limit
    )
    SELECT jsonb_build_object(
      'items',
      COALESCE(
        jsonb_agg(
          jsonb_build_object(
            'id', r.id,
            'title', r.title,
            'updated_at', r.updated_at,
            'status', r.status
          )
          ORDER BY r.updated_at DESC, r.id DESC
        ),
        '[]'::jsonb
      )
    )
    FROM recent_items r
  );
END;
$$;

COMMENT ON FUNCTION public.blog_dashboard_recent_activity(int) IS
  'Dashboard activity RPC. Args: p_limit int default 5 (clamped 1..50). Requires authenticated session. Visibility scope is role-aware: admins read all blogs; non-admins read only blogs where author_id = auth.uid(). Returns {"items":[{"id":"uuid","title":"text","updated_at":"timestamptz","status":"blog_status"}]}.';

CREATE OR REPLACE FUNCTION public.blog_dashboard_timeseries(
  p_metric text,
  p_start date,
  p_end date,
  p_bucket text
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_actor_id uuid;
  v_is_admin boolean;
  v_metric text := lower(COALESCE(p_metric, ''));
  v_bucket text := lower(COALESCE(p_bucket, ''));
  v_start date := COALESCE(p_start, (timezone('utc', now())::date - 29));
  v_end date := COALESCE(p_end, timezone('utc', now())::date);
BEGIN
  v_actor_id := public.blog_assert_authenticated_user();
  v_is_admin := public.blog_auth_is_blog_admin();

  IF v_metric NOT IN ('posts_created', 'views') THEN
    RAISE EXCEPTION 'Unsupported metric %. Expected one of: posts_created, views', p_metric
      USING ERRCODE = '22023';
  END IF;

  IF v_bucket NOT IN ('day', 'week', 'month') THEN
    RAISE EXCEPTION 'Unsupported bucket %. Expected one of: day, week, month', p_bucket
      USING ERRCODE = '22023';
  END IF;

  IF v_end < v_start THEN
    RAISE EXCEPTION 'Invalid date range: p_end must be on or after p_start'
      USING ERRCODE = '22007';
  END IF;

  IF v_end - v_start > 3660 THEN
    RAISE EXCEPTION 'Date range too large. Maximum supported span is 3660 days'
      USING ERRCODE = '22023';
  END IF;

  RETURN (
    WITH scoped_blogs AS (
      SELECT
        b.created_at,
        b.views_count
      FROM public.blogs b
      WHERE (v_is_admin OR b.author_id = v_actor_id)
        AND b.created_at >= v_start::timestamptz
        AND b.created_at < (v_end + 1)::timestamptz
    ),
    bucket_bounds AS (
      SELECT
        CASE v_bucket
          WHEN 'month' THEN date_trunc('month', v_start::timestamp)
          WHEN 'week' THEN date_trunc('week', v_start::timestamp)
          ELSE v_start::timestamp
        END AS series_start,
        CASE v_bucket
          WHEN 'month' THEN date_trunc('month', v_end::timestamp)
          WHEN 'week' THEN date_trunc('week', v_end::timestamp)
          ELSE v_end::timestamp
        END AS series_end,
        CASE v_bucket
          WHEN 'month' THEN interval '1 month'
          WHEN 'week' THEN interval '1 week'
          ELSE interval '1 day'
        END AS series_step
    ),
    buckets AS (
      SELECT
        gs.bucket_start
      FROM bucket_bounds bb
      CROSS JOIN LATERAL generate_series(bb.series_start, bb.series_end, bb.series_step) AS gs(bucket_start)
    ),
    metric_values AS (
      SELECT
        date_trunc(v_bucket, sb.created_at)::timestamp AS bucket_start,
        CASE
          WHEN v_metric = 'views' THEN COALESCE(sum(sb.views_count), 0)::bigint
          ELSE count(*)::bigint
        END AS bucket_value
      FROM scoped_blogs sb
      GROUP BY 1
    )
    SELECT jsonb_build_object(
      'points',
      COALESCE(
        jsonb_agg(
          jsonb_build_object(
            'bucket_start', b.bucket_start,
            'value', COALESCE(mv.bucket_value, 0)
          )
          ORDER BY b.bucket_start
        ),
        '[]'::jsonb
      )
    )
    FROM buckets b
    LEFT JOIN metric_values mv ON mv.bucket_start = b.bucket_start
  );
END;
$$;

COMMENT ON FUNCTION public.blog_dashboard_timeseries(text, date, date, text) IS
  'Dashboard timeseries RPC. Args: p_metric text (posts_created|views), p_start date, p_end date, p_bucket text (day|week|month). Requires authenticated session. Visibility scope is role-aware: admins aggregate across all blogs; non-admins aggregate only blogs where author_id = auth.uid(). Returns {"points":[{"bucket_start":"timestamp","value":"number"}]}. Notes: p_start/p_end default to last 30 days when null and p_end must be >= p_start. The views metric is based on current blogs.views_count grouped by created_at bucket (proxy, not event-log timeseries).';

REVOKE ALL ON FUNCTION public.blog_dashboard_stats() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.blog_dashboard_recent_activity(int) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.blog_dashboard_timeseries(text, date, date, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.blog_dashboard_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.blog_dashboard_recent_activity(int) TO authenticated;
GRANT EXECUTE ON FUNCTION public.blog_dashboard_timeseries(text, date, date, text) TO authenticated;

-- =============================================================================
-- Migration Complete
-- =============================================================================
