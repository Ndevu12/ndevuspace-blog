-- ============================================================================
-- Tag admin RPC verification (rollback-only)
-- ============================================================================
-- Validates the blog_tag_admin_* RPCs end to end:
-- 1) Non-admins are denied create / update / delete / merge
-- 2) Admin create + list (with post counts)
-- 3) Admin rename
-- 4) Admin merge repoints post links onto the target, de-dupes, drops sources
-- 5) Admin delete cascades the tag's links
--
-- Usage:
--   yarn db:verify:tag-admin
--   (or: psql "$LOCAL_DB_URL" -v ON_ERROR_STOP=1 -f supabase/verify/verify_tag_admin.sql)
--
-- Runs in a transaction and ends with ROLLBACK — it never persists data.
-- ============================================================================

BEGIN;

DO $$
DECLARE
  v_admin uuid := gen_random_uuid();
  v_user uuid := gen_random_uuid();
  v_blog1 uuid;
  v_blog2 uuid;
  v_tag_a uuid;   -- merge target
  v_tag_b uuid;   -- merge source
  v_created jsonb;
  v_renamed jsonb;
  v_list jsonb;
  v_merge jsonb;
  v_count int;
BEGIN
  -- ── Seed auth users (user_profiles FK) ──────────────────────────────────
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, confirmation_token, recovery_token, email_change,
    email_change_token_new, email_change_token_current, reauthentication_token,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at
  )
  VALUES
    ('00000000-0000-0000-0000-000000000000', v_admin, 'authenticated',
     'authenticated', 'tagadmin.admin@example.com',
     '$2a$10$QJ4j7aL1fXf9k7G3nYf3s.yfYb7fBQfFPHlyv5Q9ix8fJ0Eqv6c7u',
     timezone('utc', now()), '', '', '', '', '', '',
     '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb,
     timezone('utc', now()), timezone('utc', now())),
    ('00000000-0000-0000-0000-000000000000', v_user, 'authenticated',
     'authenticated', 'tagadmin.user@example.com',
     '$2a$10$QJ4j7aL1fXf9k7G3nYf3s.yfYb7fBQfFPHlyv5Q9ix8fJ0Eqv6c7u',
     timezone('utc', now()), '', '', '', '', '', '',
     '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb,
     timezone('utc', now()), timezone('utc', now()));

  INSERT INTO public.user_profiles (id, username, first_name, last_name, role)
  VALUES
    (v_admin, 'tagadmin_admin', 'Tag', 'Admin', 'admin'),
    (v_user, 'tagadmin_user', 'Tag', 'User', 'user')
  ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role;

  -- ── Seed blogs + tags + links for the merge scenario ────────────────────
  INSERT INTO public.blogs (slug, title, content, author_id, author, status)
  VALUES ('tagadmin-post-1', 'Tag Admin Post 1', 'c1', v_admin, 'tagadmin_admin', 'published')
  RETURNING id INTO v_blog1;
  INSERT INTO public.blogs (slug, title, content, author_id, author, status)
  VALUES ('tagadmin-post-2', 'Tag Admin Post 2', 'c2', v_admin, 'tagadmin_admin', 'published')
  RETURNING id INTO v_blog2;

  INSERT INTO public.blog_tags (name, slug) VALUES ('Alpha', 'alpha') RETURNING id INTO v_tag_a;
  INSERT INTO public.blog_tags (name, slug) VALUES ('Alfa', 'alfa') RETURNING id INTO v_tag_b;

  -- blog1 → both tags (so the merge must de-dupe); blog2 → source only.
  INSERT INTO public.blog_tag_links (blog_id, tag_id) VALUES
    (v_blog1, v_tag_a),
    (v_blog1, v_tag_b),
    (v_blog2, v_tag_b);

  -- ── 1) Non-admin is denied every write ──────────────────────────────────
  PERFORM set_config('request.jwt.claim.role', 'authenticated', true);
  PERFORM set_config('request.jwt.claim.sub', v_user::text, true);

  BEGIN
    PERFORM public.blog_tag_admin_create('Nope', NULL);
    RAISE EXCEPTION 'FAIL: non-admin was allowed to create a tag';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;

  BEGIN
    PERFORM public.blog_tag_admin_update(v_tag_a, 'Nope', NULL);
    RAISE EXCEPTION 'FAIL: non-admin was allowed to rename a tag';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;

  BEGIN
    PERFORM public.blog_tag_admin_delete(v_tag_a);
    RAISE EXCEPTION 'FAIL: non-admin was allowed to delete a tag';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;

  BEGIN
    PERFORM public.blog_tag_admin_merge(ARRAY[v_tag_b], v_tag_a);
    RAISE EXCEPTION 'FAIL: non-admin was allowed to merge tags';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;

  -- ── Switch to admin session ─────────────────────────────────────────────
  PERFORM set_config('request.jwt.claim.sub', v_admin::text, true);

  -- 2) Create + list with post counts.
  v_created := public.blog_tag_admin_create('Gamma', NULL);
  IF v_created ->> 'slug' <> 'gamma' THEN
    RAISE EXCEPTION 'FAIL: created tag slug expected "gamma", got %', v_created ->> 'slug';
  END IF;

  v_list := public.blog_tag_admin_list();
  IF NOT EXISTS (
    SELECT 1 FROM jsonb_array_elements(v_list -> 'tags') t
    WHERE t ->> 'name' = 'Alpha' AND (t ->> 'postCount')::int = 1
  ) THEN
    RAISE EXCEPTION 'FAIL: list did not report Alpha with postCount 1';
  END IF;

  -- 3) Rename.
  v_renamed := public.blog_tag_admin_update(v_tag_a, 'Alpha Renamed', NULL);
  IF v_renamed ->> 'name' <> 'Alpha Renamed' OR v_renamed ->> 'slug' <> 'alpha-renamed' THEN
    RAISE EXCEPTION 'FAIL: rename mismatch (name=%, slug=%)',
      v_renamed ->> 'name', v_renamed ->> 'slug';
  END IF;

  -- 4) Merge source (Alfa) into target (Alpha).
  v_merge := public.blog_tag_admin_merge(ARRAY[v_tag_b], v_tag_a);
  IF (v_merge ->> 'mergedCount')::int <> 1 THEN
    RAISE EXCEPTION 'FAIL: merge mergedCount expected 1, got %', v_merge ->> 'mergedCount';
  END IF;
  -- Source tag is gone.
  IF EXISTS (SELECT 1 FROM public.blog_tags WHERE id = v_tag_b) THEN
    RAISE EXCEPTION 'FAIL: source tag still exists after merge';
  END IF;
  -- blog2 was repointed to the target; blog1 kept its single target link (de-duped).
  IF NOT EXISTS (SELECT 1 FROM public.blog_tag_links WHERE blog_id = v_blog2 AND tag_id = v_tag_a) THEN
    RAISE EXCEPTION 'FAIL: blog2 was not repointed to the target tag';
  END IF;
  SELECT count(*) INTO v_count FROM public.blog_tag_links WHERE tag_id = v_tag_a;
  IF v_count <> 2 THEN
    RAISE EXCEPTION 'FAIL: target tag expected 2 links after merge, got %', v_count;
  END IF;

  -- 5) Delete cascades links.
  PERFORM public.blog_tag_admin_delete(v_tag_a);
  IF EXISTS (SELECT 1 FROM public.blog_tags WHERE id = v_tag_a) THEN
    RAISE EXCEPTION 'FAIL: tag still exists after delete';
  END IF;
  SELECT count(*) INTO v_count FROM public.blog_tag_links WHERE tag_id = v_tag_a;
  IF v_count <> 0 THEN
    RAISE EXCEPTION 'FAIL: links were not cascaded on tag delete, % remain', v_count;
  END IF;

  RAISE NOTICE 'PASS: blog_tag_admin_* verification succeeded';
END $$;

ROLLBACK;
