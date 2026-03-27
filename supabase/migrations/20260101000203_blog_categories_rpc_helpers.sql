-- =============================================================================
-- Migration: 20260101000203_blog_categories_rpc_helpers.sql
-- Domain: BLOG CATEGORIES
-- Type: SQL helper functions (internal only)
-- Purpose: Shared slug/validation helpers used by category admin RPCs
-- Dependencies: 20260101000202_blog_categories_triggers.sql
-- =============================================================================

CREATE OR REPLACE FUNCTION public.blog_category_slugify(p_value text)
RETURNS text
LANGUAGE sql
IMMUTABLE
STRICT
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT trim(both '-' FROM regexp_replace(lower(trim(p_value)), '[^a-z0-9]+', '-', 'g'));
$$;

COMMENT ON FUNCTION public.blog_category_slugify(text) IS
  'Internal helper. Args: p_value text. Returns text slug token (lowercase with non-alphanumeric collapsed to hyphens). Helper note: reusable slug normalization primitive for category write RPCs.';

CREATE OR REPLACE FUNCTION public.blog_category_resolve_slug(p_name text, p_slug text DEFAULT NULL)
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_source text;
  v_slug text;
BEGIN
  v_source := COALESCE(NULLIF(trim(p_slug), ''), NULLIF(trim(p_name), ''));

  IF v_source IS NULL THEN
    RAISE EXCEPTION 'Category name or slug is required'
      USING ERRCODE = '23514';
  END IF;

  v_slug := public.blog_category_slugify(v_source);

  IF v_slug IS NULL OR v_slug = '' THEN
    RAISE EXCEPTION 'Resolved category slug cannot be blank'
      USING ERRCODE = '23514';
  END IF;

  RETURN v_slug;
END;
$$;

COMMENT ON FUNCTION public.blog_category_resolve_slug(text, text) IS
  'Internal helper. Args: p_name text, p_slug text default null. Returns text resolved slug by preferring explicit slug then name, normalized via blog_category_slugify; raises when result is blank. Helper note: used by category create/update RPCs.';

CREATE OR REPLACE FUNCTION public.blog_category_assert_unique_name(
  p_name text,
  p_exclude_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  IF NULLIF(trim(p_name), '') IS NULL THEN
    RAISE EXCEPTION 'Category name is required'
      USING ERRCODE = '23514';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.blog_categories c
    WHERE lower(c.name) = lower(trim(p_name))
      AND (p_exclude_id IS NULL OR c.id <> p_exclude_id)
  ) THEN
    RAISE EXCEPTION 'Category name "%" already exists', trim(p_name)
      USING ERRCODE = '23505';
  END IF;
END;
$$;

COMMENT ON FUNCTION public.blog_category_assert_unique_name(text, uuid) IS
  'Internal helper. Args: p_name text, p_exclude_id uuid default null. Returns void. Raises unique_violation when another category already has the same case-insensitive name (excluding p_exclude_id when provided).';

CREATE OR REPLACE FUNCTION public.blog_category_assert_unique_slug(
  p_slug text,
  p_exclude_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  IF NULLIF(trim(p_slug), '') IS NULL THEN
    RAISE EXCEPTION 'Category slug is required'
      USING ERRCODE = '23514';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.blog_categories c
    WHERE lower(c.slug) = lower(trim(p_slug))
      AND (p_exclude_id IS NULL OR c.id <> p_exclude_id)
  ) THEN
    RAISE EXCEPTION 'Category slug "%" already exists', trim(p_slug)
      USING ERRCODE = '23505';
  END IF;
END;
$$;

COMMENT ON FUNCTION public.blog_category_assert_unique_slug(text, uuid) IS
  'Internal helper. Args: p_slug text, p_exclude_id uuid default null. Returns void. Raises unique_violation when another category already has the same case-insensitive slug (excluding p_exclude_id when provided).';

CREATE OR REPLACE FUNCTION public.blog_category_admin_list(
  p_include_counts boolean DEFAULT false
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_result jsonb;
BEGIN
  IF p_include_counts THEN
    -- During early migration bootstrap, blogs table may not exist yet.
    IF to_regclass('public.blogs') IS NOT NULL THEN
      SELECT jsonb_build_object(
        'categories',
        COALESCE(
          jsonb_agg(
            jsonb_build_object(
              'id', c.id,
              'name', c.name,
              'slug', c.slug,
              'description', c.description,
              'icon', c.icon,
              'created_at', c.created_at,
              'updated_at', c.updated_at,
              'post_count', COALESCE(post_counts.post_count, 0)
            )
            ORDER BY c.name
          ),
          '[]'::jsonb
        )
      )
      INTO v_result
      FROM public.blog_categories c
      LEFT JOIN LATERAL (
        SELECT count(*)::int AS post_count
        FROM public.blogs b
        WHERE b.category_id = c.id
      ) post_counts ON true;
    ELSE
      SELECT jsonb_build_object(
        'categories',
        COALESCE(
          jsonb_agg(
            jsonb_build_object(
              'id', c.id,
              'name', c.name,
              'slug', c.slug,
              'description', c.description,
              'icon', c.icon,
              'created_at', c.created_at,
              'updated_at', c.updated_at,
              'post_count', 0
            )
            ORDER BY c.name
          ),
          '[]'::jsonb
        )
      )
      INTO v_result
      FROM public.blog_categories c;
    END IF;
  ELSE
    SELECT jsonb_build_object(
      'categories',
      COALESCE(
        jsonb_agg(
          jsonb_build_object(
            'id', c.id,
            'name', c.name,
            'slug', c.slug,
            'description', c.description,
            'icon', c.icon,
            'created_at', c.created_at,
            'updated_at', c.updated_at
          )
          ORDER BY c.name
        ),
        '[]'::jsonb
      )
    )
    INTO v_result
    FROM public.blog_categories c;
  END IF;

  RETURN COALESCE(v_result, jsonb_build_object('categories', '[]'::jsonb));
END;
$$;

COMMENT ON FUNCTION public.blog_category_admin_list(boolean) IS
  'Admin category read RPC. Args: p_include_counts boolean (default false). Returns jsonb with shape {"categories":[{"id":"uuid","name":"text","slug":"text","description":"text|null","icon":"text","created_at":"timestamptz","updated_at":"timestamptz","post_count":"int (only when requested)"}]} ordered by name.';

CREATE OR REPLACE FUNCTION public.blog_category_admin_get(
  p_category_id uuid
)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'id', c.id,
    'name', c.name,
    'slug', c.slug,
    'description', c.description,
    'icon', c.icon,
    'created_at', c.created_at,
    'updated_at', c.updated_at
  )
  FROM public.blog_categories c
  WHERE c.id = p_category_id;
$$;

COMMENT ON FUNCTION public.blog_category_admin_get(uuid) IS
  'Admin category read RPC. Args: p_category_id uuid. Returns one category object with keys id, name, slug, description, icon, created_at, updated_at, or SQL null when no row is visible for that id.';

CREATE OR REPLACE FUNCTION public.blog_category_admin_create(
  p_name text,
  p_slug text DEFAULT NULL,
  p_description text DEFAULT NULL,
  p_icon text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_name text;
  v_slug text;
  v_inserted public.blog_categories%ROWTYPE;
BEGIN
  IF (SELECT auth.uid()) IS NULL OR NOT public.blog_auth_is_blog_admin() THEN
    RAISE EXCEPTION 'Only blog admins can create categories'
      USING ERRCODE = '42501';
  END IF;

  v_name := NULLIF(trim(p_name), '');
  IF v_name IS NULL THEN
    RAISE EXCEPTION 'Category name is required'
      USING ERRCODE = '23514';
  END IF;

  v_slug := public.blog_category_resolve_slug(v_name, p_slug);
  PERFORM public.blog_category_assert_unique_name(v_name);
  PERFORM public.blog_category_assert_unique_slug(v_slug);

  INSERT INTO public.blog_categories (name, slug, description, icon)
  VALUES (
    v_name,
    v_slug,
    NULLIF(trim(p_description), ''),
    COALESCE(NULLIF(trim(p_icon), ''), 'tag')
  )
  RETURNING * INTO v_inserted;

  RETURN jsonb_build_object(
    'id', v_inserted.id,
    'name', v_inserted.name,
    'slug', v_inserted.slug,
    'description', v_inserted.description,
    'icon', v_inserted.icon,
    'created_at', v_inserted.created_at,
    'updated_at', v_inserted.updated_at
  );
END;
$$;

COMMENT ON FUNCTION public.blog_category_admin_create(text, text, text, text) IS
  'Admin category write RPC. Args: p_name text, p_slug text default null, p_description text default null, p_icon text default null. Requires authenticated blog admin role. Returns created category JSON with keys id, name, slug, description, icon, created_at, updated_at.';

CREATE OR REPLACE FUNCTION public.blog_category_admin_update(
  p_category_id uuid,
  p_name text,
  p_slug text,
  p_description text,
  p_icon text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_name text;
  v_slug text;
  v_updated public.blog_categories%ROWTYPE;
BEGIN
  IF (SELECT auth.uid()) IS NULL OR NOT public.blog_auth_is_blog_admin() THEN
    RAISE EXCEPTION 'Only blog admins can update categories'
      USING ERRCODE = '42501';
  END IF;

  v_name := NULLIF(trim(p_name), '');
  IF v_name IS NULL THEN
    RAISE EXCEPTION 'Category name is required'
      USING ERRCODE = '23514';
  END IF;

  v_slug := public.blog_category_resolve_slug(v_name, p_slug);
  PERFORM public.blog_category_assert_unique_name(v_name, p_category_id);
  PERFORM public.blog_category_assert_unique_slug(v_slug, p_category_id);

  UPDATE public.blog_categories c
  SET
    name = v_name,
    slug = v_slug,
    description = NULLIF(trim(p_description), ''),
    icon = COALESCE(NULLIF(trim(p_icon), ''), 'tag')
  WHERE c.id = p_category_id
  RETURNING c.* INTO v_updated;

  IF v_updated.id IS NULL THEN
    RAISE EXCEPTION 'Category "%" was not found', p_category_id
      USING ERRCODE = 'P0002';
  END IF;

  RETURN jsonb_build_object(
    'id', v_updated.id,
    'name', v_updated.name,
    'slug', v_updated.slug,
    'description', v_updated.description,
    'icon', v_updated.icon,
    'created_at', v_updated.created_at,
    'updated_at', v_updated.updated_at
  );
END;
$$;

COMMENT ON FUNCTION public.blog_category_admin_update(uuid, text, text, text, text) IS
  'Admin category write RPC. Args: p_category_id uuid, p_name text, p_slug text, p_description text, p_icon text. Requires authenticated blog admin role. Returns updated category JSON with keys id, name, slug, description, icon, created_at, updated_at; raises no_data_found when the category id is missing.';

CREATE OR REPLACE FUNCTION public.blog_category_admin_delete(
  p_category_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deleted_id uuid;
BEGIN
  IF (SELECT auth.uid()) IS NULL OR NOT public.blog_auth_is_blog_admin() THEN
    RAISE EXCEPTION 'Only blog admins can delete categories'
      USING ERRCODE = '42501';
  END IF;

  DELETE FROM public.blog_categories c
  WHERE c.id = p_category_id
  RETURNING c.id INTO v_deleted_id;

  IF v_deleted_id IS NULL THEN
    RAISE EXCEPTION 'Category "%" was not found', p_category_id
      USING ERRCODE = 'P0002';
  END IF;

  RETURN jsonb_build_object('ok', true);
END;
$$;

COMMENT ON FUNCTION public.blog_category_admin_delete(uuid) IS
  'Admin category write RPC. Args: p_category_id uuid. Requires authenticated blog admin role. Deletes the category row and returns {"ok": true}; raises no_data_found when the category id is missing.';

REVOKE ALL ON FUNCTION public.blog_category_slugify(text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.blog_category_resolve_slug(text, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.blog_category_assert_unique_name(text, uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.blog_category_assert_unique_slug(text, uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.blog_category_admin_list(boolean) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.blog_category_admin_get(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.blog_category_admin_create(text, text, text, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.blog_category_admin_update(uuid, text, text, text, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.blog_category_admin_delete(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.blog_category_admin_list(boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.blog_category_admin_get(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.blog_category_admin_create(text, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.blog_category_admin_update(uuid, text, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.blog_category_admin_delete(uuid) TO authenticated;

-- =============================================================================
-- Migration Complete
-- =============================================================================
