-- =============================================================================
-- Migration: 20260327000102_blog_media_rls.sql
-- Domain: STORAGE / BLOGS
-- Type: RLS policies
-- Purpose: Author/admin-scoped object access for blog-media bucket
-- Dependencies: 20260327000100_blog_media_bucket.sql,
--               20260327000101_blog_media_rpc_helpers.sql
-- =============================================================================
--
-- Object key path contract (required for all application uploads):
--   authors/<auth_uid>/blogs/<blog_id_or_draft>/<filename>
--
-- Path segment semantics:
--   - Segment 1: literal "authors"
--   - Segment 2: uploader auth uid (must equal auth.uid() for non-admin writes)
--   - Segment 3: literal "blogs"
--   - Segment 4: blog identifier or "draft" grouping token
--   - Segment 5+: filename (and optional nested suffixes if ever needed)
--
-- Policy RBAC matrix (bucket-scoped to blog-media only):
--   - SELECT -> role anon:
--       Read object rows when bucket_id = 'blog-media'.
--   - INSERT -> role authenticated:
--       Allow create when bucket_id = 'blog-media' and
--       public.blog_media_can_manage_object(name) is true.
--   - UPDATE -> role authenticated:
--       Allow modify when existing row and new row both satisfy:
--       bucket_id = 'blog-media' and public.blog_media_can_manage_object(name).
--   - DELETE -> role authenticated:
--       Allow delete when bucket_id = 'blog-media' and
--       public.blog_media_can_manage_object(name) is true.
--
-- blog_media_can_manage_object(name) grants write access when either:
--   1) object path begins with authors/<auth.uid()>/blogs/..., or
--   2) caller is an admin via public.blog_auth_is_blog_admin().
--
-- =============================================================================

DROP POLICY IF EXISTS "blog_media_public_read" ON storage.objects;
DROP POLICY IF EXISTS "blog_media_insert_own_or_admin" ON storage.objects;
DROP POLICY IF EXISTS "blog_media_update_own_or_admin" ON storage.objects;
DROP POLICY IF EXISTS "blog_media_delete_own_or_admin" ON storage.objects;

CREATE POLICY "blog_media_public_read"
ON storage.objects
FOR SELECT
TO anon
USING (
  bucket_id = 'blog-media'
);

CREATE POLICY "blog_media_insert_own_or_admin"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'blog-media'
  AND public.blog_media_can_manage_object(name)
);

CREATE POLICY "blog_media_update_own_or_admin"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'blog-media'
  AND public.blog_media_can_manage_object(name)
)
WITH CHECK (
  bucket_id = 'blog-media'
  AND public.blog_media_can_manage_object(name)
);

CREATE POLICY "blog_media_delete_own_or_admin"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'blog-media'
  AND public.blog_media_can_manage_object(name)
);

-- =============================================================================
-- Migration Complete
-- =============================================================================
