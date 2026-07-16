-- Multi-tag public blog listing (OR / union semantics).
--
-- Mirrors blog_public_list_published's envelope, sort, and pagination but
-- filters on an ARRAY of tag slugs/names: a post is included when it carries
-- at least one of the requested tags. Empty/NULL array = no tag filter (all
-- published posts), so callers can reuse it as a general list too.
--
-- SECURITY INVOKER + SET search_path, published-only, granted to anon/auth,
-- matching the rest of the public RPCs.

CREATE OR REPLACE FUNCTION public.blog_public_list_by_tags(
  p_tag_slugs text[] DEFAULT NULL,
  p_page int DEFAULT 1,
  p_limit int DEFAULT 10,
  p_sort text DEFAULT 'newest'
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_page int := GREATEST(COALESCE(p_page, 1), 1);
  v_limit int := LEAST(GREATEST(COALESCE(p_limit, 10), 1), 100);
  v_offset int := (GREATEST(COALESCE(p_page, 1), 1) - 1) * LEAST(GREATEST(COALESCE(p_limit, 10), 1), 100);
  v_sort text := lower(COALESCE(NULLIF(trim(p_sort), ''), 'newest'));
  -- Normalise to a lowercased set of non-empty needles; NULL when none given.
  v_slugs text[] := (
    SELECT CASE WHEN count(*) > 0 THEN array_agg(s) END
    FROM (
      SELECT DISTINCT lower(trim(x)) AS s
      FROM unnest(COALESCE(p_tag_slugs, ARRAY[]::text[])) AS x
      WHERE NULLIF(trim(x), '') IS NOT NULL
    ) needles
  );
  v_total_count int;
  v_total_pages int;
  v_has_more boolean;
  v_blogs jsonb;
BEGIN
  IF v_sort NOT IN ('newest', 'oldest', 'popular') THEN
    RAISE EXCEPTION 'Unsupported sort "%" (allowed: newest, oldest, popular)', p_sort
      USING ERRCODE = '22023';
  END IF;

  WITH filtered AS (
    SELECT b.id, b.created_at, b.published_at, b.likes_count
    FROM public.blogs b
    WHERE b.status = 'published'
      AND (
        v_slugs IS NULL
        OR EXISTS (
          SELECT 1
          FROM public.blog_tag_links l
          JOIN public.blog_tags t ON t.id = l.tag_id
          WHERE l.blog_id = b.id
            AND (
              lower(t.slug) = ANY(v_slugs)
              OR lower(t.name) = ANY(v_slugs)
            )
        )
      )
  ),
  paged AS (
    SELECT
      f.id,
      row_number() OVER (
        ORDER BY
          CASE WHEN v_sort = 'popular' THEN f.likes_count END DESC,
          CASE WHEN v_sort = 'oldest' THEN COALESCE(f.published_at, f.created_at) END ASC,
          CASE WHEN v_sort IN ('newest', 'popular') THEN COALESCE(f.published_at, f.created_at) END DESC,
          f.id DESC
      ) AS row_num
    FROM filtered f
    ORDER BY
      CASE WHEN v_sort = 'popular' THEN f.likes_count END DESC,
      CASE WHEN v_sort = 'oldest' THEN COALESCE(f.published_at, f.created_at) END ASC,
      CASE WHEN v_sort IN ('newest', 'popular') THEN COALESCE(f.published_at, f.created_at) END DESC,
      f.id DESC
    LIMIT v_limit
    OFFSET v_offset
  )
  SELECT
    (SELECT count(*)::int FROM filtered),
    COALESCE(
      (
        SELECT jsonb_agg(public.blog_json_row_fragment(p.id) ORDER BY p.row_num)
        FROM paged p
      ),
      '[]'::jsonb
    )
  INTO v_total_count, v_blogs;

  v_total_pages := CASE
    WHEN v_total_count = 0 THEN 0
    ELSE CEIL(v_total_count::numeric / v_limit::numeric)::int
  END;
  v_has_more := (v_offset + v_limit) < v_total_count;

  RETURN jsonb_build_object(
    'blogs', v_blogs,
    'totalCount', v_total_count,
    'hasMore', v_has_more,
    'currentPage', v_page,
    'totalPages', v_total_pages,
    'pagination', jsonb_build_object(
      'page', v_page,
      'limit', v_limit,
      'total', v_total_count,
      'has_more', v_has_more
    )
  );
END;
$$;

COMMENT ON FUNCTION public.blog_public_list_by_tags(text[], int, int, text) IS
  'Public multi-tag blog list RPC (OR/union). Args: p_tag_slugs text[] default null (tag slugs or display names, case-insensitive; a post matches if it carries ANY of them; empty/null = no tag filter), p_page int default 1, p_limit int default 10 (clamped 1..100), p_sort text default newest in {newest,oldest,popular}. Returns the same paginated jsonb envelope as blog_public_list_published, scoped to published posts.';

REVOKE ALL ON FUNCTION public.blog_public_list_by_tags(text[], int, int, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.blog_public_list_by_tags(text[], int, int, text) TO anon, authenticated;
