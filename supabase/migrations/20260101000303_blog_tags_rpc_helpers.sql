-- =============================================================================
-- Migration: 20260101000303_blog_tags_rpc_helpers.sql
-- Domain: BLOG TAGS
-- Type: SQL helpers + user-facing tag RPCs
-- Purpose: Shared slug/name helpers and tag upsert/list RPCs for blog writes
-- Dependencies: 20260101000302_blog_tags_triggers.sql
-- =============================================================================

CREATE OR REPLACE FUNCTION public.blog_tag_slugify(p_value text)
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

COMMENT ON FUNCTION public.blog_tag_slugify(text) IS
  'Internal helper. Args: p_value text. Returns text slug token (lowercase with non-alphanumeric collapsed to hyphens). Helper note: shared by tag upsert/resolve helpers.';

CREATE OR REPLACE FUNCTION public.blog_tag_normalize_name(p_value text)
RETURNS text
LANGUAGE sql
IMMUTABLE
STRICT
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT regexp_replace(trim(p_value), '\s+', ' ', 'g');
$$;

COMMENT ON FUNCTION public.blog_tag_normalize_name(text) IS
  'Internal helper. Args: p_value text. Returns text normalized display name with trimmed edges and collapsed internal whitespace. Helper note: stabilizes dedupe behavior before slug generation/upsert.';

CREATE OR REPLACE FUNCTION public.blog_tag_resolve_slug(
  p_name text,
  p_slug text DEFAULT NULL
)
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_name text;
  v_source text;
  v_slug text;
BEGIN
  v_name := public.blog_tag_normalize_name(p_name);

  IF v_name IS NULL OR v_name = '' THEN
    RAISE EXCEPTION 'Tag name is required'
      USING ERRCODE = '23514';
  END IF;

  v_source := COALESCE(
    NULLIF(public.blog_tag_normalize_name(p_slug), ''),
    v_name
  );
  v_slug := public.blog_tag_slugify(v_source);

  IF v_slug IS NULL OR v_slug = '' THEN
    RAISE EXCEPTION 'Resolved tag slug cannot be blank'
      USING ERRCODE = '23514';
  END IF;

  RETURN v_slug;
END;
$$;

COMMENT ON FUNCTION public.blog_tag_resolve_slug(text, text) IS
  'Internal helper. Args: p_name text, p_slug text default null. Returns text resolved slug using explicit slug when provided or normalized name otherwise; raises when blank. Helper note: called by tag upsert flows.';

CREATE OR REPLACE FUNCTION public.blog_tag_upsert_by_names(
  p_names text[]
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_tag_ids uuid[];
BEGIN
  IF p_names IS NULL OR cardinality(p_names) = 0 THEN
    RETURN jsonb_build_object('tag_ids', ARRAY[]::uuid[]);
  END IF;

  WITH normalized AS (
    SELECT
      min(raw.ordinality)::int AS first_position,
      public.blog_tag_normalize_name(raw.value) AS normalized_name,
      public.blog_tag_resolve_slug(raw.value, NULL) AS resolved_slug
    FROM unnest(p_names) WITH ORDINALITY AS raw(value, ordinality)
    WHERE raw.value IS NOT NULL
      AND NULLIF(trim(raw.value), '') IS NOT NULL
    GROUP BY
      public.blog_tag_normalize_name(raw.value),
      public.blog_tag_resolve_slug(raw.value, NULL)
  ),
  inserted AS (
    INSERT INTO public.blog_tags (name, slug)
    SELECT n.normalized_name, n.resolved_slug
    FROM normalized n
    ON CONFLICT DO NOTHING
    RETURNING id
  ),
  selected AS (
    SELECT t.id, n.first_position
    FROM normalized n
    JOIN public.blog_tags t
      ON lower(t.slug) = lower(n.resolved_slug)
  )
  SELECT array_agg(s.id ORDER BY s.first_position)
  INTO v_tag_ids
  FROM selected s;

  RETURN jsonb_build_object(
    'tag_ids',
    COALESCE(v_tag_ids, ARRAY[]::uuid[])
  );
END;
$$;

COMMENT ON FUNCTION public.blog_tag_upsert_by_names(text[]) IS
  'Tag write RPC. Args: p_names text[] of raw tag names. Normalizes and slugifies each non-blank value, upserts missing blog_tags rows, and returns {"tag_ids":[uuid,...]} ordered by first appearance of each distinct normalized tag.';

CREATE OR REPLACE FUNCTION public.blog_tag_admin_list(
  p_page int DEFAULT 1,
  p_limit int DEFAULT 50
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_page int := GREATEST(COALESCE(p_page, 1), 1);
  v_limit int := LEAST(GREATEST(COALESCE(p_limit, 50), 1), 200);
  v_offset int := (GREATEST(COALESCE(p_page, 1), 1) - 1) * LEAST(GREATEST(COALESCE(p_limit, 50), 1), 200);
BEGIN
  RETURN (
    SELECT jsonb_build_object(
      'tags',
      COALESCE(
        jsonb_agg(
          jsonb_build_object(
            'id', t.id,
            'name', t.name,
            'slug', t.slug,
            'description', t.description,
            'created_at', t.created_at,
            'updated_at', t.updated_at
          )
          ORDER BY lower(t.name), t.id
        ),
        '[]'::jsonb
      ),
      'pagination', jsonb_build_object(
        'page', v_page,
        'limit', v_limit,
        'total', (SELECT count(*)::int FROM public.blog_tags),
        'has_more', (
          (v_offset + v_limit) < (SELECT count(*)::int FROM public.blog_tags)
        )
      )
    )
    FROM (
      SELECT *
      FROM public.blog_tags
      ORDER BY lower(name), id
      LIMIT v_limit
      OFFSET v_offset
    ) t
  );
END;
$$;

COMMENT ON FUNCTION public.blog_tag_admin_list(int, int) IS
  'Tag read RPC. Args: p_page int default 1, p_limit int default 50 (capped at 200). Returns {"tags":[{"id":"uuid","name":"text","slug":"text","description":"text|null","created_at":"timestamptz","updated_at":"timestamptz"}],"pagination":{"page":"int","limit":"int","total":"int","has_more":"boolean"}} ordered by case-insensitive tag name.';

-- Keep helper surface private to authenticated call paths only.
REVOKE ALL ON FUNCTION public.blog_tag_slugify(text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.blog_tag_normalize_name(text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.blog_tag_resolve_slug(text, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.blog_tag_upsert_by_names(text[]) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.blog_tag_admin_list(int, int) FROM PUBLIC, anon, authenticated;

-- Required by SECURITY INVOKER call chain:
-- blog_tag_upsert_by_names -> blog_tag_normalize_name/blog_tag_resolve_slug -> blog_tag_slugify.
GRANT EXECUTE ON FUNCTION public.blog_tag_slugify(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.blog_tag_normalize_name(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.blog_tag_resolve_slug(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.blog_tag_upsert_by_names(text[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.blog_tag_admin_list(int, int) TO authenticated;

-- =============================================================================
-- Migration Complete
-- =============================================================================
