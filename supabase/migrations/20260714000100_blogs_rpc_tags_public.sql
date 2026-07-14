-- =============================================================================
-- Public tag-cloud RPC — weighted, popularity-capped, alphabetically paginated
-- =============================================================================
-- Powers the site's Topic Cloud. Ranks tags by number of PUBLISHED posts
-- (the JOIN to published blogs is the published-only filter), keeps the top
-- N most popular, then serves that capped set in alphabetical pages so the
-- cloud fills in A–Z as it infinite-scrolls — no reshuffle between batches.
-- Each row carries postCount so the client can weight (size) each topic.

CREATE OR REPLACE FUNCTION public.blog_public_tags_list(
  p_page int DEFAULT 1,
  p_limit int DEFAULT 10,
  p_cap int DEFAULT 30
)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  WITH params AS (
    SELECT
      GREATEST(COALESCE(p_page, 1), 1) AS page,
      LEAST(GREATEST(COALESCE(p_limit, 10), 1), 100) AS lim,
      LEAST(GREATEST(COALESCE(p_cap, 30), 1), 200) AS cap
  ),
  ranked AS (
    -- Published-post count per tag (INNER JOIN drops tags with none),
    -- ranked most-popular first for the cap.
    SELECT
      t.id,
      t.name,
      t.slug,
      count(b.id)::int AS post_count,
      row_number() OVER (
        ORDER BY count(b.id) DESC, lower(t.name), t.id
      ) AS pop_rank
    FROM public.blog_tags t
    JOIN public.blog_tag_links l ON l.tag_id = t.id
    JOIN public.blogs b ON b.id = l.blog_id AND b.status = 'published'
    GROUP BY t.id, t.name, t.slug
  ),
  top AS (
    -- Keep the most popular `cap` tags, then number them alphabetically so
    -- pages are stable A–Z slices of that capped set.
    SELECT
      id,
      name,
      slug,
      post_count,
      row_number() OVER (ORDER BY lower(name), id) AS alpha_rank
    FROM ranked, params
    WHERE pop_rank <= params.cap
  )
  SELECT jsonb_build_object(
    'tags',
    COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            '_id', top.id,
            'id', top.id,
            'name', top.name,
            'slug', top.slug,
            'postCount', top.post_count
          )
          ORDER BY top.alpha_rank
        )
        FROM top, params
        WHERE top.alpha_rank > (params.page - 1) * params.lim
          AND top.alpha_rank <= params.page * params.lim
      ),
      '[]'::jsonb
    ),
    'totalCount', (SELECT count(*)::int FROM top),
    -- Constant across pages: lets the client weight topics relatively and
    -- keep sizes stable as batches stream in.
    'maxPostCount', (SELECT COALESCE(max(post_count), 0)::int FROM top),
    'currentPage', (SELECT page FROM params),
    'hasMore', (
      SELECT (page * lim) < (SELECT count(*)::int FROM top) FROM params
    )
  );
$$;

COMMENT ON FUNCTION public.blog_public_tags_list(int, int, int) IS
  'Public topic-cloud RPC. Args: p_page int default 1, p_limit int default 10 (capped 100), p_cap int default 30 (capped 200). Ranks tags by published-post count desc, keeps the top p_cap, and returns that set paginated alphabetically: {"tags":[{"_id":"uuid","id":"uuid","name":"text","slug":"text","postCount":"int"}],"totalCount":"int (size of capped set)","maxPostCount":"int (highest count in the set; for relative weighting)","currentPage":"int","hasMore":"boolean"}. Only tags with >=1 published post appear.';

REVOKE ALL ON FUNCTION public.blog_public_tags_list(int, int, int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.blog_public_tags_list(int, int, int) TO anon, authenticated;

-- =============================================================================
-- Migration Complete
-- =============================================================================
