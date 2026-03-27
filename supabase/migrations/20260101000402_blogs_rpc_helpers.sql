-- =============================================================================
-- Migration: 20260101000402_blogs_rpc_helpers.sql
-- Domain: BLOGS
-- Type: SQL helper functions (internal)
-- Purpose: Small reusable helpers used by blog public/admin/dashboard RPCs
-- Dependencies: 20260101000103_blog_rpc_helpers_auth.sql,
--               20260101000200_blog_categories_table.sql,
--               20260101000300_blog_tags_table.sql,
--               20260101000400_blogs_table.sql,
--               20260101000500_blog_tag_links_table.sql
-- =============================================================================

CREATE OR REPLACE FUNCTION public.blog_slugify(p_value text)
RETURNS text
LANGUAGE sql
IMMUTABLE
STRICT
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT trim(
    both '-'
    FROM regexp_replace(lower(trim(p_value)), '[^a-z0-9]+', '-', 'g')
  );
$$;

COMMENT ON FUNCTION public.blog_slugify(text) IS
  'Internal helper. Args: p_value text. Returns text slug token (lowercase with non-alphanumeric collapsed to hyphens). Helper note: base slug normalizer for blog write flows.';

CREATE OR REPLACE FUNCTION public.blog_resolve_slug(
  p_title text,
  p_slug text DEFAULT NULL
)
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_base text;
  v_slug text;
BEGIN
  v_base := COALESCE(NULLIF(trim(p_slug), ''), p_title);

  IF v_base IS NULL OR trim(v_base) = '' THEN
    RAISE EXCEPTION 'Slug source (title or slug) is required'
      USING ERRCODE = '23514';
  END IF;

  v_slug := public.blog_slugify(v_base);

  IF v_slug IS NULL OR v_slug = '' THEN
    RAISE EXCEPTION 'Resolved blog slug cannot be blank'
      USING ERRCODE = '23514';
  END IF;

  RETURN v_slug;
END;
$$;

COMMENT ON FUNCTION public.blog_resolve_slug(text, text) IS
  'Internal helper. Args: p_title text, p_slug text default null. Returns text resolved slug from explicit slug or title; raises when source/result is blank. Helper note: used by blog create/update RPCs.';

CREATE OR REPLACE FUNCTION public.blog_assert_authenticated_user()
RETURNS uuid
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_actor_id uuid;
BEGIN
  v_actor_id := (SELECT auth.uid());

  IF v_actor_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required'
      USING ERRCODE = '42501';
  END IF;

  RETURN v_actor_id;
END;
$$;

COMMENT ON FUNCTION public.blog_assert_authenticated_user() IS
  'Internal helper. Args: none. Returns uuid auth.uid() for current session. Raises insufficient_privilege when no authenticated user exists. Helper note: shared auth gate for admin/dashboard RPCs.';

CREATE OR REPLACE FUNCTION public.blog_assert_blog_write_access(p_author_id uuid)
RETURNS void
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_actor_id uuid;
BEGIN
  v_actor_id := public.blog_assert_authenticated_user();

  IF p_author_id IS NULL THEN
    RAISE EXCEPTION 'Author id is required for write access check'
      USING ERRCODE = '23514';
  END IF;

  IF v_actor_id <> p_author_id AND NOT public.blog_auth_is_blog_admin() THEN
    RAISE EXCEPTION 'Blog write access denied'
      USING ERRCODE = '42501';
  END IF;
END;
$$;

COMMENT ON FUNCTION public.blog_assert_blog_write_access(uuid) IS
  'Internal helper. Args: p_author_id uuid. Returns void. Raises insufficient_privilege unless caller is row owner (author_id = auth.uid()) or admin (blog_auth_is_blog_admin()). Helper note: centralized RBAC assertion for blog mutations.';

CREATE OR REPLACE FUNCTION public.blog_json_author_fragment(
  p_author_id uuid,
  p_fallback_author text
)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    '_id', p_author_id,
    'user', COALESCE(NULLIF(btrim(p_fallback_author), ''), p.username, ''),
    'firstName', COALESCE(p.first_name, ''),
    'lastName', COALESCE(p.last_name, ''),
    'createdAt', p.created_at,
    'updatedAt', p.updated_at
  )
  FROM public.user_profiles p
  WHERE p.id = p_author_id
  UNION ALL
  SELECT jsonb_build_object(
    '_id', p_author_id,
    'user', COALESCE(NULLIF(btrim(p_fallback_author), ''), ''),
    'firstName', '',
    'lastName', '',
    'createdAt', timezone('utc', now()),
    'updatedAt', timezone('utc', now())
  )
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.user_profiles p
    WHERE p.id = p_author_id
  )
  LIMIT 1;
$$;

COMMENT ON FUNCTION public.blog_json_author_fragment(uuid, text) IS
  'Internal helper. Args: p_author_id uuid, p_fallback_author text. Returns jsonb author fragment for blog_row_json with keys {_id,user,firstName,lastName,createdAt,updatedAt}; prefers user_profiles and falls back to denormalized author text when no profile row exists.';

CREATE OR REPLACE FUNCTION public.blog_json_category_fragment(p_category_id uuid)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT CASE
    WHEN c.id IS NULL THEN NULL
    ELSE jsonb_build_object(
      '_id', c.id,
      'id', c.id,
      'name', c.name,
      'slug', c.slug,
      'icon', c.icon
    )
  END
  FROM public.blog_categories c
  WHERE c.id = p_category_id;
$$;

COMMENT ON FUNCTION public.blog_json_category_fragment(uuid) IS
  'Internal helper. Args: p_category_id uuid. Returns jsonb category fragment {_id,id,name,slug,icon} or SQL null when category is absent.';

CREATE OR REPLACE FUNCTION public.blog_json_tags_fragment(p_blog_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_tags text[];
BEGIN
  -- During migration bootstrap, blog_tag_links may not exist yet.
  IF to_regclass('public.blog_tag_links') IS NULL THEN
    RETURN '[]'::jsonb;
  END IF;

  SELECT COALESCE(
    (
      SELECT array_agg(t.name ORDER BY lower(t.name), t.id)
      FROM public.blog_tag_links l
      JOIN public.blog_tags t ON t.id = l.tag_id
      WHERE l.blog_id = p_blog_id
    ),
    ARRAY[]::text[]
  )
  INTO v_tags;

  RETURN to_jsonb(COALESCE(v_tags, ARRAY[]::text[]));
END;
$$;

COMMENT ON FUNCTION public.blog_json_tags_fragment(uuid) IS
  'Internal helper. Args: p_blog_id uuid. Returns jsonb array of tag names ordered by name/id; returns [] when no links exist. Helper note: reused by blog row JSON builders.';

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
    'viewsCount', b.views_count,
    'likesCount', b.likes_count
  )
  FROM public.blogs b
  LEFT JOIN public.user_profiles p ON p.id = b.author_id
  WHERE b.id = p_blog_id;
$$;

COMMENT ON FUNCTION public.blog_json_row_fragment(uuid) IS
  'Internal helper. Args: p_blog_id uuid. Returns one blog_row_json object as jsonb with keys {_id,id,slug,title,description,content,author,authorImage,createdAt,updatedAt,imageUrl,category,tags,readTime,isNew,isFeatured,metaTitle,metaDescription,likes,status,viewsCount,likesCount}; returns SQL null when row is missing.';

CREATE OR REPLACE FUNCTION public.blog_admin_sync_tag_links(
  p_blog_id uuid,
  p_tag_names text[]
)
RETURNS void
LANGUAGE plpgsql
VOLATILE
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_tag_ids uuid[];
BEGIN
  IF p_blog_id IS NULL THEN
    RAISE EXCEPTION 'Blog id is required'
      USING ERRCODE = '23514';
  END IF;

  -- During migration bootstrap, tag link table may not exist yet.
  IF to_regclass('public.blog_tag_links') IS NULL THEN
    RETURN;
  END IF;

  DELETE FROM public.blog_tag_links
  WHERE blog_id = p_blog_id;

  IF p_tag_names IS NULL OR cardinality(p_tag_names) = 0 THEN
    RETURN;
  END IF;

  SELECT COALESCE(array_agg((value)::uuid), ARRAY[]::uuid[])
  INTO v_tag_ids
  FROM jsonb_array_elements_text(
    public.blog_tag_upsert_by_names(p_tag_names) -> 'tag_ids'
  );

  IF cardinality(v_tag_ids) = 0 THEN
    RETURN;
  END IF;

  INSERT INTO public.blog_tag_links (blog_id, tag_id)
  SELECT p_blog_id, tag_id
  FROM unnest(v_tag_ids) AS tag_id
  ON CONFLICT (blog_id, tag_id) DO NOTHING;
END;
$$;

COMMENT ON FUNCTION public.blog_admin_sync_tag_links(uuid, text[]) IS
  'Internal helper. Args: p_blog_id uuid, p_tag_names text[]. Returns void. Replaces all blog_tag_links for the blog id and upserts missing blog_tags via blog_tag_upsert_by_names before linking. Helper note: used by blog_admin_create and blog_admin_update.';

REVOKE ALL ON FUNCTION public.blog_slugify(text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.blog_resolve_slug(text, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.blog_assert_authenticated_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.blog_assert_blog_write_access(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.blog_json_author_fragment(uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.blog_json_category_fragment(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.blog_json_tags_fragment(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.blog_json_row_fragment(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.blog_admin_sync_tag_links(uuid, text[]) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.blog_slugify(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.blog_resolve_slug(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.blog_assert_authenticated_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.blog_assert_blog_write_access(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.blog_json_author_fragment(uuid, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.blog_json_category_fragment(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.blog_json_tags_fragment(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.blog_json_row_fragment(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.blog_admin_sync_tag_links(uuid, text[]) TO authenticated;

-- =============================================================================
-- Migration Complete
-- =============================================================================
