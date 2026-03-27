-- =============================================================================
-- Migration: 20260101000404_blogs_rpc_admin.sql
-- Domain: BLOGS
-- Type: User-facing admin write/read RPCs
-- Purpose: Admin/author list/detail CRUD and status RPCs for dashboard
-- Dependencies: 20260101000402_blogs_rpc_helpers.sql,
--               20260101000401_blogs_rls.sql
-- =============================================================================

CREATE OR REPLACE FUNCTION public.blog_admin_list(
  p_page int DEFAULT 1,
  p_limit int DEFAULT 10,
  p_status text DEFAULT '',
  p_category_id uuid DEFAULT NULL,
  p_search text DEFAULT NULL,
  p_sort_by text DEFAULT 'created_at',
  p_sort_order text DEFAULT 'desc'
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
  v_page int := GREATEST(COALESCE(p_page, 1), 1);
  v_limit int := LEAST(GREATEST(COALESCE(p_limit, 10), 1), 100);
  v_offset int := (GREATEST(COALESCE(p_page, 1), 1) - 1) * LEAST(GREATEST(COALESCE(p_limit, 10), 1), 100);
  v_status text := lower(COALESCE(NULLIF(trim(p_status), ''), ''));
  v_search text := NULLIF(trim(p_search), '');
  v_sort_by text := lower(COALESCE(NULLIF(trim(p_sort_by), ''), 'created_at'));
  v_sort_order text := lower(COALESCE(NULLIF(trim(p_sort_order), ''), 'desc'));
  v_total_count int;
  v_total_pages int;
  v_has_more boolean;
  v_blogs jsonb;
BEGIN
  v_actor_id := public.blog_assert_authenticated_user();
  v_is_admin := public.blog_auth_is_blog_admin();

  IF v_status <> '' AND v_status NOT IN ('draft', 'published', 'archived') THEN
    RAISE EXCEPTION 'Unsupported status "%" (allowed: draft, published, archived, empty)', p_status
      USING ERRCODE = '22023';
  END IF;

  IF v_sort_by NOT IN ('created_at', 'updated_at', 'title', 'views_count', 'likes_count') THEN
    RAISE EXCEPTION 'Unsupported sort_by "%" (allowed: created_at, updated_at, title, views_count, likes_count)', p_sort_by
      USING ERRCODE = '22023';
  END IF;

  IF v_sort_order NOT IN ('asc', 'desc') THEN
    RAISE EXCEPTION 'Unsupported sort_order "%" (allowed: asc, desc)', p_sort_order
      USING ERRCODE = '22023';
  END IF;

  WITH filtered AS (
    SELECT
      b.id,
      b.created_at,
      b.updated_at,
      b.title,
      b.views_count,
      b.likes_count
    FROM public.blogs b
    WHERE
      (v_is_admin OR b.author_id = v_actor_id)
      AND (v_status = '' OR b.status::text = v_status)
      AND (p_category_id IS NULL OR b.category_id = p_category_id)
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
          CASE WHEN v_sort_by = 'created_at' AND v_sort_order = 'asc' THEN f.created_at END ASC,
          CASE WHEN v_sort_by = 'created_at' AND v_sort_order = 'desc' THEN f.created_at END DESC,
          CASE WHEN v_sort_by = 'updated_at' AND v_sort_order = 'asc' THEN f.updated_at END ASC,
          CASE WHEN v_sort_by = 'updated_at' AND v_sort_order = 'desc' THEN f.updated_at END DESC,
          CASE WHEN v_sort_by = 'title' AND v_sort_order = 'asc' THEN lower(f.title) END ASC,
          CASE WHEN v_sort_by = 'title' AND v_sort_order = 'desc' THEN lower(f.title) END DESC,
          CASE WHEN v_sort_by = 'views_count' AND v_sort_order = 'asc' THEN f.views_count END ASC,
          CASE WHEN v_sort_by = 'views_count' AND v_sort_order = 'desc' THEN f.views_count END DESC,
          CASE WHEN v_sort_by = 'likes_count' AND v_sort_order = 'asc' THEN f.likes_count END ASC,
          CASE WHEN v_sort_by = 'likes_count' AND v_sort_order = 'desc' THEN f.likes_count END DESC,
          f.id DESC
      ) AS row_num
    FROM filtered f
    ORDER BY
      CASE WHEN v_sort_by = 'created_at' AND v_sort_order = 'asc' THEN f.created_at END ASC,
      CASE WHEN v_sort_by = 'created_at' AND v_sort_order = 'desc' THEN f.created_at END DESC,
      CASE WHEN v_sort_by = 'updated_at' AND v_sort_order = 'asc' THEN f.updated_at END ASC,
      CASE WHEN v_sort_by = 'updated_at' AND v_sort_order = 'desc' THEN f.updated_at END DESC,
      CASE WHEN v_sort_by = 'title' AND v_sort_order = 'asc' THEN lower(f.title) END ASC,
      CASE WHEN v_sort_by = 'title' AND v_sort_order = 'desc' THEN lower(f.title) END DESC,
      CASE WHEN v_sort_by = 'views_count' AND v_sort_order = 'asc' THEN f.views_count END ASC,
      CASE WHEN v_sort_by = 'views_count' AND v_sort_order = 'desc' THEN f.views_count END DESC,
      CASE WHEN v_sort_by = 'likes_count' AND v_sort_order = 'asc' THEN f.likes_count END ASC,
      CASE WHEN v_sort_by = 'likes_count' AND v_sort_order = 'desc' THEN f.likes_count END DESC,
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

COMMENT ON FUNCTION public.blog_admin_list(int, int, text, uuid, text, text, text) IS
  'Admin blog read RPC. Args: p_page int default 1 (clamped 1..), p_limit int default 10 (clamped 1..100), p_status text default empty in {draft,published,archived}, p_category_id uuid default null, p_search text default null, p_sort_by text default created_at in {created_at,updated_at,title,views_count,likes_count}, p_sort_order text default desc in {asc,desc}. Requires authenticated session. RBAC visibility is enforced in-function: admins see all rows, non-admins see only rows where author_id = auth.uid(). Returns {"blogs":[blog_row_json...],"totalCount":int,"hasMore":bool,"currentPage":int,"totalPages":int,"pagination":{"page":int,"limit":int,"total":int,"has_more":bool}}.';

CREATE OR REPLACE FUNCTION public.blog_admin_get(
  p_blog_id uuid
)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  WITH actor AS (
    SELECT
      public.blog_assert_authenticated_user() AS actor_id,
      public.blog_auth_is_blog_admin() AS is_admin
  )
  SELECT public.blog_json_row_fragment(b.id)
  FROM public.blogs b
  CROSS JOIN actor a
  WHERE b.id = p_blog_id
    AND (a.is_admin OR b.author_id = a.actor_id)
  LIMIT 1;
$$;

COMMENT ON FUNCTION public.blog_admin_get(uuid) IS
  'Admin blog read RPC. Args: p_blog_id uuid. Requires authenticated session. RBAC visibility is enforced in-function: admins can fetch any row; non-admins can fetch only rows where author_id = auth.uid(). Returns one blog_row_json or SQL null when no visible row matches the id.';

CREATE OR REPLACE FUNCTION public.blog_admin_create(
  p_payload jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
VOLATILE
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_actor_id uuid;
  v_blog_id uuid;
  v_title text;
  v_slug text;
  v_status public.blog_status;
  v_category_id uuid;
  v_category_name text;
  v_tag_names text[] := ARRAY[]::text[];
  v_author_name text;
  v_author_image text;
BEGIN
  v_actor_id := public.blog_assert_authenticated_user();

  IF p_payload IS NULL OR jsonb_typeof(p_payload) <> 'object' THEN
    RAISE EXCEPTION 'Create payload must be a json object'
      USING ERRCODE = '22023';
  END IF;

  v_title := NULLIF(trim(p_payload ->> 'title'), '');
  IF v_title IS NULL THEN
    RAISE EXCEPTION 'Create payload field "title" is required'
      USING ERRCODE = '23514';
  END IF;

  IF NOT (p_payload ? 'content') THEN
    RAISE EXCEPTION 'Create payload field "content" is required'
      USING ERRCODE = '23514';
  END IF;

  IF p_payload ? 'category_id' THEN
    v_category_id := NULLIF(trim(p_payload ->> 'category_id'), '')::uuid;
  ELSE
    v_category_id := NULL;
  END IF;

  IF v_category_id IS NOT NULL THEN
    SELECT c.name
    INTO v_category_name
    FROM public.blog_categories c
    WHERE c.id = v_category_id;

    IF v_category_name IS NULL THEN
      RAISE EXCEPTION 'Category "%" was not found', v_category_id
        USING ERRCODE = '23503';
    END IF;
  ELSE
    v_category_name := NULL;
  END IF;

  v_slug := public.blog_resolve_slug(
    p_title => v_title,
    p_slug => NULLIF(p_payload ->> 'slug', '')
  );

  v_status := COALESCE(NULLIF(trim(p_payload ->> 'status'), ''), 'draft')::public.blog_status;

  SELECT p.username, p.avatar_url
  INTO v_author_name, v_author_image
  FROM public.user_profiles p
  WHERE p.id = v_actor_id;

  IF v_author_name IS NULL THEN
    RAISE EXCEPTION 'Author profile not found for current user'
      USING ERRCODE = 'P0002';
  END IF;

  INSERT INTO public.blogs (
    slug,
    title,
    description,
    content,
    author_id,
    author,
    author_image,
    category_id,
    category,
    image_url,
    read_time,
    meta_title,
    meta_description,
    status,
    published_at,
    is_new,
    is_featured
  )
  VALUES (
    v_slug,
    v_title,
    COALESCE(p_payload ->> 'description', ''),
    COALESCE(p_payload ->> 'content', ''),
    v_actor_id,
    v_author_name,
    COALESCE(NULLIF(p_payload ->> 'author_image', ''), v_author_image),
    v_category_id,
    v_category_name,
    NULLIF(p_payload ->> 'image_url', ''),
    COALESCE(NULLIF(trim(p_payload ->> 'read_time'), ''), '0')::integer,
    NULLIF(p_payload ->> 'meta_title', ''),
    NULLIF(p_payload ->> 'meta_description', ''),
    v_status,
    CASE WHEN v_status = 'published' THEN timezone('utc', now()) ELSE NULL END,
    COALESCE((p_payload ->> 'is_new')::boolean, false),
    COALESCE((p_payload ->> 'is_featured')::boolean, false)
  )
  RETURNING id INTO v_blog_id;

  IF p_payload ? 'tag_names' THEN
    IF p_payload -> 'tag_names' IS NULL OR jsonb_typeof(p_payload -> 'tag_names') = 'null' THEN
      v_tag_names := ARRAY[]::text[];
    ELSIF jsonb_typeof(p_payload -> 'tag_names') <> 'array' THEN
      RAISE EXCEPTION 'Create payload field "tag_names" must be a text array'
        USING ERRCODE = '22023';
    ELSE
      SELECT COALESCE(array_agg(value), ARRAY[]::text[])
      INTO v_tag_names
      FROM jsonb_array_elements_text(p_payload -> 'tag_names') AS t(value);
    END IF;

    PERFORM public.blog_admin_sync_tag_links(v_blog_id, v_tag_names);
  END IF;

  RETURN public.blog_json_row_fragment(v_blog_id);
END;
$$;

COMMENT ON FUNCTION public.blog_admin_create(jsonb) IS
  'Admin blog write RPC. Args: p_payload jsonb with snake_case keys {title(required), content(required), description?, slug?, category_id?, image_url?, read_time?, meta_title?, meta_description?, status?, is_new?, is_featured?, tag_names?}. Requires authenticated session. Creates one blog row with author_id/auth.uid(), applies RBAC via blogs RLS, optionally replaces tag links when tag_names is provided, and returns one blog_row_json.';

CREATE OR REPLACE FUNCTION public.blog_admin_update(
  p_blog_id uuid,
  p_payload jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
VOLATILE
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_existing public.blogs%ROWTYPE;
  v_title text;
  v_slug text;
  v_content text;
  v_status public.blog_status;
  v_category_id uuid;
  v_category_name text;
  v_published_at timestamptz;
  v_tag_names text[] := ARRAY[]::text[];
BEGIN
  IF p_blog_id IS NULL THEN
    RAISE EXCEPTION 'Blog id is required'
      USING ERRCODE = '23514';
  END IF;

  IF p_payload IS NULL OR jsonb_typeof(p_payload) <> 'object' THEN
    RAISE EXCEPTION 'Update payload must be a json object'
      USING ERRCODE = '22023';
  END IF;

  SELECT *
  INTO v_existing
  FROM public.blogs b
  WHERE b.id = p_blog_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Blog "%" not found', p_blog_id
      USING ERRCODE = 'P0002';
  END IF;

  PERFORM public.blog_assert_blog_write_access(v_existing.author_id);

  v_title := CASE
    WHEN p_payload ? 'title' THEN NULLIF(trim(p_payload ->> 'title'), '')
    ELSE v_existing.title
  END;
  IF v_title IS NULL THEN
    RAISE EXCEPTION 'Update payload field "title" cannot be blank'
      USING ERRCODE = '23514';
  END IF;

  v_slug := CASE
    WHEN p_payload ? 'slug' THEN public.blog_resolve_slug(v_title, NULLIF(p_payload ->> 'slug', ''))
    ELSE v_existing.slug
  END;

  v_content := CASE
    WHEN p_payload ? 'content' THEN COALESCE(p_payload ->> 'content', '')
    ELSE v_existing.content
  END;

  v_category_id := CASE
    WHEN p_payload ? 'category_id' THEN NULLIF(trim(p_payload ->> 'category_id'), '')::uuid
    ELSE v_existing.category_id
  END;

  IF v_category_id IS NOT NULL THEN
    SELECT c.name
    INTO v_category_name
    FROM public.blog_categories c
    WHERE c.id = v_category_id;

    IF v_category_name IS NULL THEN
      RAISE EXCEPTION 'Category "%" was not found', v_category_id
        USING ERRCODE = '23503';
    END IF;
  ELSE
    v_category_name := NULL;
  END IF;

  v_status := CASE
    WHEN p_payload ? 'status' THEN COALESCE(NULLIF(trim(p_payload ->> 'status'), ''), v_existing.status::text)::public.blog_status
    ELSE v_existing.status
  END;

  v_published_at := CASE
    WHEN v_status = 'published' THEN COALESCE(v_existing.published_at, timezone('utc', now()))
    ELSE NULL
  END;

  UPDATE public.blogs b
  SET slug = v_slug,
      title = v_title,
      description = CASE
        WHEN p_payload ? 'description' THEN COALESCE(p_payload ->> 'description', '')
        ELSE b.description
      END,
      content = v_content,
      author_image = CASE
        WHEN p_payload ? 'author_image' THEN NULLIF(p_payload ->> 'author_image', '')
        ELSE b.author_image
      END,
      category_id = v_category_id,
      category = v_category_name,
      image_url = CASE
        WHEN p_payload ? 'image_url' THEN NULLIF(p_payload ->> 'image_url', '')
        ELSE b.image_url
      END,
      read_time = CASE
        WHEN p_payload ? 'read_time' THEN COALESCE(NULLIF(trim(p_payload ->> 'read_time'), ''), '0')::integer
        ELSE b.read_time
      END,
      meta_title = CASE
        WHEN p_payload ? 'meta_title' THEN NULLIF(p_payload ->> 'meta_title', '')
        ELSE b.meta_title
      END,
      meta_description = CASE
        WHEN p_payload ? 'meta_description' THEN NULLIF(p_payload ->> 'meta_description', '')
        ELSE b.meta_description
      END,
      status = v_status,
      published_at = v_published_at,
      is_new = CASE
        WHEN p_payload ? 'is_new' THEN COALESCE((p_payload ->> 'is_new')::boolean, false)
        ELSE b.is_new
      END,
      is_featured = CASE
        WHEN p_payload ? 'is_featured' THEN COALESCE((p_payload ->> 'is_featured')::boolean, false)
        ELSE b.is_featured
      END
  WHERE b.id = p_blog_id;

  IF p_payload ? 'tag_names' THEN
    IF p_payload -> 'tag_names' IS NULL OR jsonb_typeof(p_payload -> 'tag_names') = 'null' THEN
      v_tag_names := ARRAY[]::text[];
    ELSIF jsonb_typeof(p_payload -> 'tag_names') <> 'array' THEN
      RAISE EXCEPTION 'Update payload field "tag_names" must be a text array'
        USING ERRCODE = '22023';
    ELSE
      SELECT COALESCE(array_agg(value), ARRAY[]::text[])
      INTO v_tag_names
      FROM jsonb_array_elements_text(p_payload -> 'tag_names') AS t(value);
    END IF;

    PERFORM public.blog_admin_sync_tag_links(p_blog_id, v_tag_names);
  END IF;

  RETURN public.blog_json_row_fragment(p_blog_id);
END;
$$;

COMMENT ON FUNCTION public.blog_admin_update(uuid, jsonb) IS
  'Admin blog write RPC. Args: p_blog_id uuid, p_payload jsonb partial patch using snake_case keys from blog_admin_create payload. Requires authenticated session. Enforces RBAC (row author or admin), updates only provided fields, replaces tag links only when tag_names key is present (empty array clears links), and returns one blog_row_json.';

CREATE OR REPLACE FUNCTION public.blog_admin_delete(
  p_blog_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
VOLATILE
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_author_id uuid;
BEGIN
  IF p_blog_id IS NULL THEN
    RAISE EXCEPTION 'Blog id is required'
      USING ERRCODE = '23514';
  END IF;

  SELECT b.author_id
  INTO v_author_id
  FROM public.blogs b
  WHERE b.id = p_blog_id;

  IF v_author_id IS NULL THEN
    RAISE EXCEPTION 'Blog "%" not found', p_blog_id
      USING ERRCODE = 'P0002';
  END IF;

  PERFORM public.blog_assert_blog_write_access(v_author_id);

  DELETE FROM public.blogs b
  WHERE b.id = p_blog_id;

  RETURN jsonb_build_object('ok', true);
END;
$$;

COMMENT ON FUNCTION public.blog_admin_delete(uuid) IS
  'Admin blog write RPC. Args: p_blog_id uuid. Requires authenticated session. Enforces RBAC (row author or admin), deletes one blog row (tag links cascade via FK), and returns {"ok":true}.';

CREATE OR REPLACE FUNCTION public.blog_admin_set_status(
  p_blog_id uuid,
  p_status public.blog_status
)
RETURNS jsonb
LANGUAGE plpgsql
VOLATILE
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_author_id uuid;
BEGIN
  IF p_blog_id IS NULL THEN
    RAISE EXCEPTION 'Blog id is required'
      USING ERRCODE = '23514';
  END IF;

  SELECT b.author_id
  INTO v_author_id
  FROM public.blogs b
  WHERE b.id = p_blog_id;

  IF v_author_id IS NULL THEN
    RAISE EXCEPTION 'Blog "%" not found', p_blog_id
      USING ERRCODE = 'P0002';
  END IF;

  PERFORM public.blog_assert_blog_write_access(v_author_id);

  UPDATE public.blogs b
  SET status = p_status,
      published_at = CASE
        WHEN p_status = 'published' THEN COALESCE(b.published_at, timezone('utc', now()))
        ELSE NULL
      END
  WHERE b.id = p_blog_id;

  RETURN public.blog_json_row_fragment(p_blog_id);
END;
$$;

COMMENT ON FUNCTION public.blog_admin_set_status(uuid, public.blog_status) IS
  'Admin blog write RPC. Args: p_blog_id uuid, p_status blog_status. Requires authenticated session. Enforces RBAC (row author or admin), applies status transition, sets published_at when transitioning to published, clears published_at for non-published statuses, and returns one blog_row_json.';

REVOKE ALL ON FUNCTION public.blog_admin_list(int, int, text, uuid, text, text, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.blog_admin_get(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.blog_admin_create(jsonb) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.blog_admin_update(uuid, jsonb) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.blog_admin_delete(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.blog_admin_set_status(uuid, public.blog_status) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.blog_admin_list(int, int, text, uuid, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.blog_admin_get(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.blog_admin_create(jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.blog_admin_update(uuid, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.blog_admin_delete(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.blog_admin_set_status(uuid, public.blog_status) TO authenticated;

-- =============================================================================
-- Migration Complete
-- =============================================================================
