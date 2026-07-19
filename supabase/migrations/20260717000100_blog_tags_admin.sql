-- =============================================================================
-- Migration: 20260717000100_blog_tags_admin.sql
-- Domain: BLOG TAGS
-- Type: Admin RPCs
-- Purpose: Admin management of the tag taxonomy — list with post counts,
--          create, rename, delete, and merge duplicates into one canonical tag.
--          Keeps the topic cloud clean (no orphaned / misspelled tags).
-- Dependencies: blog_tags, blog_tag_links, blog_auth_is_blog_admin,
--               blog_tag_slugify / blog_tag_normalize_name / blog_tag_resolve_slug
-- =============================================================================

-- ── Uniqueness assertions (internal) ─────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.blog_tag_assert_unique_name(
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
    RAISE EXCEPTION 'Tag name is required' USING ERRCODE = '23514';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.blog_tags t
    WHERE lower(t.name) = lower(trim(p_name))
      AND (p_exclude_id IS NULL OR t.id <> p_exclude_id)
  ) THEN
    RAISE EXCEPTION 'Tag name "%" already exists', trim(p_name)
      USING ERRCODE = '23505';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.blog_tag_assert_unique_slug(
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
    RAISE EXCEPTION 'Tag slug is required' USING ERRCODE = '23514';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.blog_tags t
    WHERE lower(t.slug) = lower(trim(p_slug))
      AND (p_exclude_id IS NULL OR t.id <> p_exclude_id)
  ) THEN
    RAISE EXCEPTION 'Tag slug "%" already exists', trim(p_slug)
      USING ERRCODE = '23505';
  END IF;
END;
$$;

-- ── Read: list with post counts ──────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.blog_tag_admin_list()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'tags',
    COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'id', t.id,
          'name', t.name,
          'slug', t.slug,
          'postCount', COALESCE(link_counts.post_count, 0),
          'createdAt', t.created_at,
          'updatedAt', t.updated_at
        )
        ORDER BY lower(t.name)
      ),
      '[]'::jsonb
    )
  )
  INTO v_result
  FROM public.blog_tags t
  LEFT JOIN LATERAL (
    SELECT count(*)::int AS post_count
    FROM public.blog_tag_links l
    WHERE l.tag_id = t.id
  ) link_counts ON true;

  RETURN COALESCE(v_result, jsonb_build_object('tags', '[]'::jsonb));
END;
$$;

COMMENT ON FUNCTION public.blog_tag_admin_list() IS
  'Admin tag read RPC. Returns {"tags":[{"id","name","slug","postCount","createdAt","updatedAt"}]} ordered by lower(name). postCount counts blog_tag_links rows (all statuses).';

-- ── Write: create ────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.blog_tag_admin_create(
  p_name text,
  p_slug text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_name text;
  v_slug text;
  v_row public.blog_tags%ROWTYPE;
BEGIN
  IF (SELECT auth.uid()) IS NULL OR NOT public.blog_auth_is_blog_admin() THEN
    RAISE EXCEPTION 'Only blog admins can create tags' USING ERRCODE = '42501';
  END IF;

  v_name := public.blog_tag_normalize_name(p_name);
  IF v_name IS NULL OR v_name = '' THEN
    RAISE EXCEPTION 'Tag name is required' USING ERRCODE = '23514';
  END IF;

  v_slug := public.blog_tag_resolve_slug(v_name, p_slug);
  PERFORM public.blog_tag_assert_unique_name(v_name);
  PERFORM public.blog_tag_assert_unique_slug(v_slug);

  INSERT INTO public.blog_tags (name, slug)
  VALUES (v_name, v_slug)
  RETURNING * INTO v_row;

  RETURN jsonb_build_object(
    'id', v_row.id, 'name', v_row.name, 'slug', v_row.slug,
    'postCount', 0, 'createdAt', v_row.created_at, 'updatedAt', v_row.updated_at
  );
END;
$$;

COMMENT ON FUNCTION public.blog_tag_admin_create(text, text) IS
  'Admin tag write RPC. Args: p_name text, p_slug text default null (derived from name when null). Requires blog admin. Returns the created tag JSON.';

-- ── Write: rename / update ───────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.blog_tag_admin_update(
  p_tag_id uuid,
  p_name text,
  p_slug text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_name text;
  v_slug text;
  v_row public.blog_tags%ROWTYPE;
BEGIN
  IF (SELECT auth.uid()) IS NULL OR NOT public.blog_auth_is_blog_admin() THEN
    RAISE EXCEPTION 'Only blog admins can update tags' USING ERRCODE = '42501';
  END IF;

  v_name := public.blog_tag_normalize_name(p_name);
  IF v_name IS NULL OR v_name = '' THEN
    RAISE EXCEPTION 'Tag name is required' USING ERRCODE = '23514';
  END IF;

  v_slug := public.blog_tag_resolve_slug(v_name, p_slug);
  PERFORM public.blog_tag_assert_unique_name(v_name, p_tag_id);
  PERFORM public.blog_tag_assert_unique_slug(v_slug, p_tag_id);

  UPDATE public.blog_tags t
  SET name = v_name, slug = v_slug
  WHERE t.id = p_tag_id
  RETURNING t.* INTO v_row;

  IF v_row.id IS NULL THEN
    RAISE EXCEPTION 'Tag "%" was not found', p_tag_id USING ERRCODE = 'P0002';
  END IF;

  RETURN jsonb_build_object(
    'id', v_row.id, 'name', v_row.name, 'slug', v_row.slug,
    'postCount', (
      SELECT count(*)::int FROM public.blog_tag_links l WHERE l.tag_id = v_row.id
    ),
    'createdAt', v_row.created_at, 'updatedAt', v_row.updated_at
  );
END;
$$;

COMMENT ON FUNCTION public.blog_tag_admin_update(uuid, text, text) IS
  'Admin tag write RPC. Args: p_tag_id uuid, p_name text, p_slug text default null. Requires blog admin. Renames the tag and returns updated JSON; raises no_data_found for a missing id.';

-- ── Write: delete (links cascade via FK) ─────────────────────────────────────

CREATE OR REPLACE FUNCTION public.blog_tag_admin_delete(
  p_tag_id uuid
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
    RAISE EXCEPTION 'Only blog admins can delete tags' USING ERRCODE = '42501';
  END IF;

  DELETE FROM public.blog_tags t
  WHERE t.id = p_tag_id
  RETURNING t.id INTO v_deleted_id;

  IF v_deleted_id IS NULL THEN
    RAISE EXCEPTION 'Tag "%" was not found', p_tag_id USING ERRCODE = 'P0002';
  END IF;

  RETURN jsonb_build_object('ok', true);
END;
$$;

COMMENT ON FUNCTION public.blog_tag_admin_delete(uuid) IS
  'Admin tag write RPC. Args: p_tag_id uuid. Requires blog admin. Deletes the tag (blog_tag_links rows cascade) and returns {"ok":true}; raises no_data_found for a missing id.';

-- ── Write: merge duplicates into one canonical tag ───────────────────────────

CREATE OR REPLACE FUNCTION public.blog_tag_admin_merge(
  p_source_ids uuid[],
  p_target_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sources uuid[];
  v_moved int := 0;
BEGIN
  IF (SELECT auth.uid()) IS NULL OR NOT public.blog_auth_is_blog_admin() THEN
    RAISE EXCEPTION 'Only blog admins can merge tags' USING ERRCODE = '42501';
  END IF;

  IF p_target_id IS NULL THEN
    RAISE EXCEPTION 'A target tag is required' USING ERRCODE = '23514';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.blog_tags WHERE id = p_target_id) THEN
    RAISE EXCEPTION 'Target tag "%" was not found', p_target_id USING ERRCODE = 'P0002';
  END IF;

  -- Distinct sources, excluding the target (a no-op self-merge is ignored).
  SELECT array_agg(DISTINCT s)
  INTO v_sources
  FROM unnest(COALESCE(p_source_ids, ARRAY[]::uuid[])) AS s
  WHERE s IS NOT NULL AND s <> p_target_id;

  IF v_sources IS NULL OR array_length(v_sources, 1) IS NULL THEN
    RAISE EXCEPTION 'At least one source tag (other than the target) is required'
      USING ERRCODE = '23514';
  END IF;

  -- Repoint links to the target, skipping links the post already has (PK dedupe).
  WITH moved AS (
    INSERT INTO public.blog_tag_links (blog_id, tag_id)
    SELECT l.blog_id, p_target_id
    FROM public.blog_tag_links l
    WHERE l.tag_id = ANY(v_sources)
    ON CONFLICT (blog_id, tag_id) DO NOTHING
    RETURNING 1
  )
  SELECT count(*)::int INTO v_moved FROM moved;

  -- Dropping the source tags cascades away their (now-duplicate) links.
  DELETE FROM public.blog_tags WHERE id = ANY(v_sources);

  RETURN jsonb_build_object(
    'ok', true,
    'mergedCount', array_length(v_sources, 1),
    'movedLinks', v_moved
  );
END;
$$;

COMMENT ON FUNCTION public.blog_tag_admin_merge(uuid[], uuid) IS
  'Admin tag write RPC. Args: p_source_ids uuid[], p_target_id uuid. Requires blog admin. Repoints every source tag''s post links onto the target (de-duplicating), deletes the source tags, and returns {"ok":true,"mergedCount":int,"movedLinks":int}.';

-- ── Grants ───────────────────────────────────────────────────────────────────

REVOKE ALL ON FUNCTION public.blog_tag_assert_unique_name(text, uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.blog_tag_assert_unique_slug(text, uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.blog_tag_admin_list() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.blog_tag_admin_create(text, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.blog_tag_admin_update(uuid, text, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.blog_tag_admin_delete(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.blog_tag_admin_merge(uuid[], uuid) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.blog_tag_admin_list() TO authenticated;
GRANT EXECUTE ON FUNCTION public.blog_tag_admin_create(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.blog_tag_admin_update(uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.blog_tag_admin_delete(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.blog_tag_admin_merge(uuid[], uuid) TO authenticated;

-- =============================================================================
-- Migration Complete
-- =============================================================================
