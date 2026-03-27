-- =============================================================================
-- Migration: 20260101000600_blog_rpc_json_wire_convention.sql
-- Domain: BLOG (cross-cutting RPC wire contract)
-- Type: Documentation anchor (not an app-facing RPC)
-- Purpose: Single COMMENT ON FUNCTION for JSON key casing (camelCase responses,
--          snake_case p_payload). User-facing blog_* RPCs should repeat the
--          response shape details in their own COMMENT ON FUNCTION per function.
-- =============================================================================

CREATE OR REPLACE FUNCTION public._blog_rpc_json_wire_convention_doc()
RETURNS void
LANGUAGE plpgsql
IMMUTABLE
PARALLEL SAFE
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  NULL;
END;
$$;

REVOKE ALL ON FUNCTION public._blog_rpc_json_wire_convention_doc() FROM PUBLIC;
REVOKE ALL ON FUNCTION public._blog_rpc_json_wire_convention_doc() FROM anon;
REVOKE ALL ON FUNCTION public._blog_rpc_json_wire_convention_doc() FROM authenticated;

COMMENT ON FUNCTION public._blog_rpc_json_wire_convention_doc() IS
'Documentation anchor only; do not call from the application. Defines JSON key casing for public blog_* RPCs. (1) RESPONSE jsonb from PostgREST: use camelCase for compound keys everywhere the TypeScript wire types use camelCase (e.g. blog_row_json: authorImage, createdAt, updatedAt, imageUrl, isNew, isFeatured, metaTitle, metaDescription, viewsCount, likesCount, commentsCount; envelopes: totalCount, hasMore, currentPage, totalPages; dashboard aggregates: totalBlogs, publishedCount, draftCount, archivedCount, totalViews, totalLikes). Single-word keys remain lowercase in both conventions (title, slug, status, name, blogs, tags, points). Nested legacy fields may still use _id as documented in src/types/blog.ts. (2) REQUEST p_payload for blog_admin_create and blog_admin_update: snake_case keys aligned to public.blogs columns — title, description, content, slug, category_id, image_url, read_time, meta_title, meta_description, status, is_new, is_featured, tag_names (text[]). Partial update: only keys present in the object are applied; when tag_names is present it replaces all tag links. TypeScript: BlogAdminRpcPayload in src/types/admin.ts.';
