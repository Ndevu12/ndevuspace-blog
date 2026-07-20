-- =============================================================================
-- Migration: 20260718000300_blog_admin_scheduled_write.sql
-- Domain: BLOGS
-- Type: RPC redefinition
-- Purpose: Let authors set a schedule while authoring — blog_admin_create and
--          blog_admin_update now read a `publish_at` payload key and honor
--          status = 'scheduled' (validated to be in the future). Redefines the
--          two write RPCs from 20260101000404 verbatim + the publish_at handling.
-- Dependencies: 20260718000100 ('scheduled' enum), 20260718000200 (publish_at
--               column), blog_resolve_slug, blog_json_row_fragment,
--               blog_admin_sync_tag_links, blog_assert_authenticated_user,
--               blog_assert_blog_write_access
-- =============================================================================

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
  v_publish_at timestamptz;
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

  -- Scheduling: a future publish_at is required when status = scheduled.
  IF v_status = 'scheduled' THEN
    v_publish_at := NULLIF(trim(p_payload ->> 'publish_at'), '')::timestamptz;
    IF v_publish_at IS NULL THEN
      RAISE EXCEPTION 'A future publish_at is required to schedule a post'
        USING ERRCODE = '23514';
    END IF;
    IF v_publish_at <= timezone('utc', now()) THEN
      RAISE EXCEPTION 'publish_at must be in the future' USING ERRCODE = '22023';
    END IF;
  ELSE
    v_publish_at := NULL;
  END IF;

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
    publish_at,
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
    v_publish_at,
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
  'Admin blog write RPC. Args: p_payload jsonb with snake_case keys {title(required), content(required), description?, slug?, category_id?, image_url?, read_time?, meta_title?, meta_description?, status?, publish_at? (required + future when status=scheduled), is_new?, is_featured?, tag_names?}. Requires authenticated session. Creates one blog row with author_id/auth.uid(), applies RBAC via blogs RLS, optionally replaces tag links when tag_names is provided, and returns one blog_row_json.';

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
  v_publish_at timestamptz;
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

  -- Scheduling: keep/require a future publish_at while scheduled; clear it
  -- whenever the post leaves the scheduled state.
  IF v_status = 'scheduled' THEN
    v_publish_at := CASE
      WHEN p_payload ? 'publish_at' THEN NULLIF(trim(p_payload ->> 'publish_at'), '')::timestamptz
      ELSE v_existing.publish_at
    END;
    IF v_publish_at IS NULL THEN
      RAISE EXCEPTION 'A future publish_at is required to schedule a post'
        USING ERRCODE = '23514';
    END IF;
    IF (p_payload ? 'publish_at') AND v_publish_at <= timezone('utc', now()) THEN
      RAISE EXCEPTION 'publish_at must be in the future' USING ERRCODE = '22023';
    END IF;
  ELSE
    v_publish_at := NULL;
  END IF;

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
      publish_at = v_publish_at,
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
  'Admin blog write RPC. Args: p_blog_id uuid, p_payload jsonb partial patch using snake_case keys from blog_admin_create payload (incl. publish_at when status=scheduled). Requires authenticated session. Enforces RBAC (row author or admin), updates only provided fields, clears publish_at when the post leaves the scheduled state, replaces tag links only when tag_names key is present (empty array clears links), and returns one blog_row_json.';

-- Expose publishAt on the shared row fragment so the editor can prefill a
-- scheduled post's time. Null for every non-scheduled post (harmless on public
-- rows, which are only ever 'published' and therefore have publish_at = null).
CREATE OR REPLACE FUNCTION public.blog_json_row_fragment(p_blog_id uuid)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    '_id', b.id,
    'id', b.id,
    'slug', b.slug,
    'title', b.title,
    'description', COALESCE(b.description, ''),
    'content', b.content,
    'author', public.blog_json_author_fragment(b.author_id, b.author),
    'authorImage', COALESCE(b.author_image, p.avatar_url),
    'createdAt', b.created_at,
    'updatedAt', b.updated_at,
    'imageUrl', b.image_url,
    'category', public.blog_json_category_fragment(b.category_id),
    'tags', public.blog_json_tags_fragment(b.id),
    'readTime', format('%s min read', b.read_time),
    'isNew', b.is_new,
    'isFeatured', b.is_featured,
    'metaTitle', b.meta_title,
    'metaDescription', b.meta_description,
    'likes', b.likes_count,
    'status', b.status,
    'publishAt', b.publish_at,
    'viewsCount', b.views_count,
    'likesCount', b.likes_count
  )
  FROM public.blogs b
  LEFT JOIN public.user_profiles p ON p.id = b.author_id
  WHERE b.id = p_blog_id;
$$;

-- =============================================================================
-- Migration Complete
-- =============================================================================
