-- =============================================================================
-- Adjacent-post RPC for previous/next article navigation
-- =============================================================================
-- Returns the published posts immediately newer and older than the given
-- slug in the site's canonical order (published_at DESC NULLS LAST,
-- created_at DESC) — the same ordering used by blog_public_list_published.

CREATE OR REPLACE FUNCTION public.blog_public_get_adjacent(
  p_slug text
)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  WITH ordered AS (
    SELECT
      b.id,
      b.slug,
      ROW_NUMBER() OVER (
        ORDER BY b.published_at DESC NULLS LAST, b.created_at DESC
      ) AS rn
    FROM public.blogs b
    WHERE b.status = 'published'
  ),
  target AS (
    SELECT o.rn FROM ordered o WHERE o.slug = p_slug LIMIT 1
  )
  SELECT jsonb_build_object(
    'newer', (
      SELECT public.blog_json_row_fragment(o.id)
      FROM ordered o, target t
      WHERE o.rn = t.rn - 1
    ),
    'older', (
      SELECT public.blog_json_row_fragment(o.id)
      FROM ordered o, target t
      WHERE o.rn = t.rn + 1
    )
  )
  FROM target;
$$;

COMMENT ON FUNCTION public.blog_public_get_adjacent(text) IS
  'Public navigation RPC. Args: p_slug text. Returns {"newer":blog_row_json|null,"older":blog_row_json|null} relative to the published post with the given slug in canonical order (published_at DESC NULLS LAST, created_at DESC), or SQL null when the slug does not match a published post.';

REVOKE ALL ON FUNCTION public.blog_public_get_adjacent(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.blog_public_get_adjacent(text) TO anon, authenticated;

-- =============================================================================
-- Migration Complete
-- =============================================================================
