-- =============================================================================
-- Migration: 20260718000400_blog_tag_admin_list_unify.sql
-- Domain: BLOG TAGS
-- Type: RPC de-duplication
-- Purpose: Resolve an overload clash on blog_tag_admin_list. 20260101000303
--          defined blog_tag_admin_list(int, int); 20260717000100 added a no-arg
--          blog_tag_admin_list(). A no-arg call then matched BOTH candidates and
--          PostgREST failed with "could not choose the best candidate function".
--
--          Keep ONE canonical, paginated function (more scalable) and enrich it
--          with the postCount the admin Tag Manager needs; drop the no-arg one.
--          The client still calls it with no args, resolving to the defaults.
-- Dependencies: blog_tags, blog_tag_links
-- =============================================================================

-- Remove the ambiguous no-arg overload added in 20260717000100.
DROP FUNCTION IF EXISTS public.blog_tag_admin_list();

-- Canonical: paginated, ordered A–Z, with per-tag post counts (camelCase to
-- match the admin service's parser).
CREATE OR REPLACE FUNCTION public.blog_tag_admin_list(
  p_page int DEFAULT 1,
  p_limit int DEFAULT 200
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_page int := GREATEST(COALESCE(p_page, 1), 1);
  v_limit int := LEAST(GREATEST(COALESCE(p_limit, 200), 1), 500);
  v_offset int := (GREATEST(COALESCE(p_page, 1), 1) - 1)
                  * LEAST(GREATEST(COALESCE(p_limit, 200), 1), 500);
  v_total int := (SELECT count(*)::int FROM public.blog_tags);
BEGIN
  RETURN jsonb_build_object(
    'tags',
    COALESCE((
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', t.id,
          'name', t.name,
          'slug', t.slug,
          'postCount', COALESCE(lc.post_count, 0),
          'createdAt', t.created_at,
          'updatedAt', t.updated_at
        )
        ORDER BY lower(t.name), t.id
      )
      FROM (
        SELECT *
        FROM public.blog_tags
        ORDER BY lower(name), id
        LIMIT v_limit OFFSET v_offset
      ) t
      LEFT JOIN LATERAL (
        SELECT count(*)::int AS post_count
        FROM public.blog_tag_links l
        WHERE l.tag_id = t.id
      ) lc ON true
    ), '[]'::jsonb),
    'pagination', jsonb_build_object(
      'page', v_page,
      'limit', v_limit,
      'total', v_total,
      'has_more', (v_offset + v_limit) < v_total
    )
  );
END;
$$;

COMMENT ON FUNCTION public.blog_tag_admin_list(int, int) IS
  'Admin tag read RPC. Args: p_page int default 1, p_limit int default 200 (capped 500). Returns {"tags":[{"id","name","slug","postCount","createdAt","updatedAt"}],"pagination":{"page","limit","total","has_more"}} ordered by lower(name). postCount counts blog_tag_links rows (all statuses).';

REVOKE ALL ON FUNCTION public.blog_tag_admin_list(int, int) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.blog_tag_admin_list(int, int) TO authenticated;

-- =============================================================================
-- Migration Complete
-- =============================================================================
