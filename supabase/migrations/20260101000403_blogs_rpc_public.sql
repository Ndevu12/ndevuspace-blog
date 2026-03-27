-- =============================================================================
-- Migration: 20260101000403_blogs_rpc_public.sql
-- Domain: BLOGS
-- Type: User-facing public RPCs
-- Purpose: Public listing/search/detail/category and engagement RPCs
-- Dependencies: 20260101000402_blogs_rpc_helpers.sql,
--               20260101000401_blogs_rls.sql
-- =============================================================================

CREATE OR REPLACE FUNCTION public.blog_public_list_published(
  p_page int DEFAULT 1,
  p_limit int DEFAULT 10,
  p_category_id uuid DEFAULT NULL,
  p_tag_slug text DEFAULT NULL,
  p_search text DEFAULT NULL,
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
  v_tag_slug text := NULLIF(trim(p_tag_slug), '');
  v_search text := NULLIF(trim(p_search), '');
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
      AND (p_category_id IS NULL OR b.category_id = p_category_id)
      AND (
        v_tag_slug IS NULL
        OR EXISTS (
          SELECT 1
          FROM public.blog_tag_links l
          JOIN public.blog_tags t ON t.id = l.tag_id
          WHERE l.blog_id = b.id
            AND lower(t.slug) = lower(v_tag_slug)
        )
      )
      AND (
        v_search IS NULL
        OR b.title ILIKE ('%' || v_search || '%')
        OR COALESCE(b.description, '') ILIKE ('%' || v_search || '%')
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

COMMENT ON FUNCTION public.blog_public_list_published(int, int, uuid, text, text, text) IS
  'Public blog list RPC. Args: p_page int default 1 (>=1), p_limit int default 10 (clamped 1..100), p_category_id uuid default null, p_tag_slug text default null, p_search text default null, p_sort text default newest in {newest,oldest,popular}. Returns {"blogs":[blog_row_json...],"totalCount":int,"hasMore":bool,"currentPage":int,"totalPages":int,"pagination":{"page":int,"limit":int,"total":int,"has_more":bool}} for published posts only.';

CREATE OR REPLACE FUNCTION public.blog_public_list_by_category(
  p_category_id uuid,
  p_page int DEFAULT 1,
  p_limit int DEFAULT 10,
  p_sort text DEFAULT 'newest'
)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT public.blog_public_list_published(
    p_page => p_page,
    p_limit => p_limit,
    p_category_id => p_category_id,
    p_tag_slug => NULL,
    p_search => NULL,
    p_sort => p_sort
  );
$$;

COMMENT ON FUNCTION public.blog_public_list_by_category(uuid, int, int, text) IS
  'Public category list RPC. Args: p_category_id uuid, p_page int default 1, p_limit int default 10, p_sort text default newest in {newest,oldest,popular}. Returns the same paginated jsonb envelope as blog_public_list_published, scoped to published posts in one category.';

CREATE OR REPLACE FUNCTION public.blog_public_list_by_tag(
  p_tag_slug text,
  p_page int DEFAULT 1,
  p_limit int DEFAULT 10,
  p_sort text DEFAULT 'newest'
)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT public.blog_public_list_published(
    p_page => p_page,
    p_limit => p_limit,
    p_category_id => NULL,
    p_tag_slug => p_tag_slug,
    p_search => NULL,
    p_sort => p_sort
  );
$$;

COMMENT ON FUNCTION public.blog_public_list_by_tag(text, int, int, text) IS
  'Public tag list RPC. Args: p_tag_slug text, p_page int default 1, p_limit int default 10, p_sort text default newest in {newest,oldest,popular}. Returns the same paginated jsonb envelope as blog_public_list_published, scoped to published posts linked to the requested tag slug.';

CREATE OR REPLACE FUNCTION public.blog_public_search(
  p_query text,
  p_page int DEFAULT 1,
  p_limit int DEFAULT 10
)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT public.blog_public_list_published(
    p_page => p_page,
    p_limit => p_limit,
    p_category_id => NULL,
    p_tag_slug => NULL,
    p_search => p_query,
    p_sort => 'newest'
  );
$$;

COMMENT ON FUNCTION public.blog_public_search(text, int, int) IS
  'Public blog search RPC. Args: p_query text, p_page int default 1, p_limit int default 10. Returns the same paginated jsonb envelope as blog_public_list_published, filtering published posts by case-insensitive substring match on title/description and ordering newest first.';

CREATE OR REPLACE FUNCTION public.blog_public_get_by_slug(
  p_slug text
)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT public.blog_json_row_fragment(b.id)
  FROM public.blogs b
  WHERE b.slug = p_slug
    AND b.status = 'published'
  ORDER BY b.published_at DESC NULLS LAST, b.created_at DESC
  LIMIT 1;
$$;

COMMENT ON FUNCTION public.blog_public_get_by_slug(text) IS
  'Public blog detail RPC. Args: p_slug text. Returns one published blog_row_json (keys: _id, id, slug, title, description, content, author, authorImage, createdAt, updatedAt, imageUrl, category, tags, readTime, isNew, isFeatured, metaTitle, metaDescription, likes, status, viewsCount, likesCount) or SQL null when no published row matches.';

CREATE OR REPLACE FUNCTION public.blog_public_list_recent(
  p_limit int DEFAULT 3
)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  WITH recent_blogs AS (
    SELECT b.id, b.published_at, b.created_at
    FROM public.blogs b
    WHERE b.status = 'published'
    ORDER BY b.published_at DESC NULLS LAST, b.created_at DESC
    LIMIT LEAST(GREATEST(COALESCE(p_limit, 3), 1), 20)
  )
  SELECT jsonb_build_object(
    'blogs',
    COALESCE(
      jsonb_agg(public.blog_json_row_fragment(r.id) ORDER BY r.published_at DESC NULLS LAST, r.created_at DESC),
      '[]'::jsonb
    )
  )
  FROM recent_blogs r;
$$;

COMMENT ON FUNCTION public.blog_public_list_recent(int) IS
  'Public blog widget RPC. Args: p_limit int default 3 (clamped to 1..20). Returns {"blogs":[blog_row_json,...]} ordered by most recent published_at (fallback created_at).';

CREATE OR REPLACE FUNCTION public.blog_public_categories_list(
  p_include_counts boolean DEFAULT false
)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'categories',
    COALESCE(
      jsonb_agg(
        CASE
          WHEN p_include_counts THEN
            jsonb_build_object(
              '_id', c.id,
              'id', c.id,
              'name', c.name,
              'slug', c.slug,
              'icon', c.icon,
              'postCount', COALESCE(post_counts.post_count, 0)
            )
          ELSE
            jsonb_build_object(
              '_id', c.id,
              'id', c.id,
              'name', c.name,
              'slug', c.slug,
              'icon', c.icon
            )
        END
        ORDER BY c.name
      ),
      '[]'::jsonb
    )
  )
  FROM public.blog_categories c
  LEFT JOIN LATERAL (
    SELECT count(*)::int AS post_count
    FROM public.blogs b
    WHERE b.category_id = c.id
      AND b.status = 'published'
  ) post_counts ON p_include_counts;
$$;

COMMENT ON FUNCTION public.blog_public_categories_list(boolean) IS
  'Public category list RPC. Args: p_include_counts boolean default false. Returns {"categories":[{"_id":"uuid","id":"uuid","name":"text","slug":"text","icon":"text","postCount":"int (only when requested)"}]} ordered by category name; postCount includes published blogs only.';

CREATE OR REPLACE FUNCTION public.blog_public_increment_view(
  p_blog_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_views_count int;
BEGIN
  IF p_blog_id IS NULL THEN
    RAISE EXCEPTION 'Blog id is required'
      USING ERRCODE = '23514';
  END IF;

  UPDATE public.blogs b
  SET views_count = b.views_count + 1
  WHERE b.id = p_blog_id
    AND b.status = 'published'
  RETURNING b.views_count INTO v_views_count;

  IF v_views_count IS NULL THEN
    RAISE EXCEPTION 'Published blog not found for view increment'
      USING ERRCODE = 'P0002';
  END IF;

  RETURN jsonb_build_object('views_count', v_views_count);
END;
$$;

COMMENT ON FUNCTION public.blog_public_increment_view(uuid) IS
  'Public engagement RPC (optional). Args: p_blog_id uuid. Increments views_count for one published blog and returns {"views_count":int}. Uses SECURITY DEFINER so anon/authenticated callers can increment without table UPDATE grants; function enforces published-only targeting.';

CREATE OR REPLACE FUNCTION public.blog_public_toggle_like(
  p_blog_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor_id uuid;
  v_likes uuid[];
  v_likes_count int;
  v_liked boolean;
BEGIN
  IF p_blog_id IS NULL THEN
    RAISE EXCEPTION 'Blog id is required'
      USING ERRCODE = '23514';
  END IF;

  v_actor_id := public.blog_assert_authenticated_user();

  SELECT b.likes
  INTO v_likes
  FROM public.blogs b
  WHERE b.id = p_blog_id
    AND b.status = 'published'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Published blog not found for like toggle'
      USING ERRCODE = 'P0002';
  END IF;

  IF array_position(v_likes, v_actor_id) IS NULL THEN
    v_likes := array_append(v_likes, v_actor_id);
    v_liked := true;
  ELSE
    v_likes := array_remove(v_likes, v_actor_id);
    v_liked := false;
  END IF;

  UPDATE public.blogs b
  SET likes = v_likes,
      likes_count = cardinality(v_likes)
  WHERE b.id = p_blog_id
  RETURNING b.likes_count INTO v_likes_count;

  RETURN jsonb_build_object(
    'likes_count', v_likes_count,
    'liked', v_liked
  );
END;
$$;

COMMENT ON FUNCTION public.blog_public_toggle_like(uuid) IS
  'Public engagement RPC (optional, authenticated only). Args: p_blog_id uuid. Atomically toggles auth.uid() inside blogs.likes for a published blog, keeps likes_count in sync via cardinality, and returns {"likes_count":int,"liked":boolean}.';

REVOKE ALL ON FUNCTION public.blog_public_list_published(int, int, uuid, text, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.blog_public_list_by_category(uuid, int, int, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.blog_public_list_by_tag(text, int, int, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.blog_public_search(text, int, int) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.blog_public_get_by_slug(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.blog_public_list_recent(int) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.blog_public_categories_list(boolean) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.blog_public_increment_view(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.blog_public_toggle_like(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.blog_public_list_published(int, int, uuid, text, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.blog_public_list_by_category(uuid, int, int, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.blog_public_list_by_tag(text, int, int, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.blog_public_search(text, int, int) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.blog_public_get_by_slug(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.blog_public_list_recent(int) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.blog_public_categories_list(boolean) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.blog_public_increment_view(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.blog_public_toggle_like(uuid) TO authenticated;

-- =============================================================================
-- Migration Complete
-- =============================================================================
