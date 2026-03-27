-- ============================================================================
-- RBAC E2E verification (rollback-only)
-- ============================================================================
-- Validates:
-- 1) Author cannot update another author's post
-- 2) Admin can update another author's post
-- 3) Dashboard/admin list visibility is scoped for author vs admin
--
-- Usage:
--   yarn db:verify:rbac-e2e
--
-- The script runs in a transaction and ends with ROLLBACK.
-- ============================================================================

BEGIN;

DO $$
DECLARE
  v_author_a uuid := gen_random_uuid();
  v_author_b uuid := gen_random_uuid();
  v_admin uuid := gen_random_uuid();
  v_blog_a uuid;
  v_blog_b uuid;
  v_updated jsonb;
  v_list jsonb;
  v_stats jsonb;
BEGIN
  -- Seed auth users needed by user_profiles FK.
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    confirmation_token,
    recovery_token,
    email_change,
    email_change_token_new,
    email_change_token_current,
    reauthentication_token,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
  )
  VALUES
    (
      '00000000-0000-0000-0000-000000000000',
      v_author_a,
      'authenticated',
      'authenticated',
      'rbac.author.a@example.com',
      '$2a$10$QJ4j7aL1fXf9k7G3nYf3s.yfYb7fBQfFPHlyv5Q9ix8fJ0Eqv6c7u',
      timezone('utc', now()),
      '',
      '',
      '',
      '',
      '',
      '',
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{}'::jsonb,
      timezone('utc', now()),
      timezone('utc', now())
    ),
    (
      '00000000-0000-0000-0000-000000000000',
      v_author_b,
      'authenticated',
      'authenticated',
      'rbac.author.b@example.com',
      '$2a$10$QJ4j7aL1fXf9k7G3nYf3s.yfYb7fBQfFPHlyv5Q9ix8fJ0Eqv6c7u',
      timezone('utc', now()),
      '',
      '',
      '',
      '',
      '',
      '',
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{}'::jsonb,
      timezone('utc', now()),
      timezone('utc', now())
    ),
    (
      '00000000-0000-0000-0000-000000000000',
      v_admin,
      'authenticated',
      'authenticated',
      'rbac.admin@example.com',
      '$2a$10$QJ4j7aL1fXf9k7G3nYf3s.yfYb7fBQfFPHlyv5Q9ix8fJ0Eqv6c7u',
      timezone('utc', now()),
      '',
      '',
      '',
      '',
      '',
      '',
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{}'::jsonb,
      timezone('utc', now()),
      timezone('utc', now())
    );

  INSERT INTO public.user_profiles (id, username, first_name, last_name, role)
  VALUES
    (v_author_a, 'rbac_author_a', 'Author', 'A', 'user'),
    (v_author_b, 'rbac_author_b', 'Author', 'B', 'user'),
    (v_admin, 'rbac_admin', 'Admin', 'User', 'admin')
  ON CONFLICT (id) DO UPDATE
  SET
    username = EXCLUDED.username,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    role = EXCLUDED.role;

  INSERT INTO public.blogs (slug, title, content, author_id, author, status)
  VALUES
    ('rbac-author-a-post', 'RBAC Author A Post', 'content a', v_author_a, 'rbac_author_a', 'draft')
  RETURNING id INTO v_blog_a;

  INSERT INTO public.blogs (slug, title, content, author_id, author, status)
  VALUES
    ('rbac-author-b-post', 'RBAC Author B Post', 'content b', v_author_b, 'rbac_author_b', 'draft')
  RETURNING id INTO v_blog_b;

  -- Simulate author A session.
  PERFORM set_config('request.jwt.claim.role', 'authenticated', true);
  PERFORM set_config('request.jwt.claim.sub', v_author_a::text, true);

  -- 1) Author cannot edit another author's post.
  BEGIN
    PERFORM public.blog_admin_update(
      v_blog_b,
      jsonb_build_object('title', 'UNEXPECTED_AUTHOR_OVERRIDE')
    );
    RAISE EXCEPTION 'RBAC check failed: author updated another author post';
  EXCEPTION
    WHEN insufficient_privilege THEN
      NULL;
  END;

  -- Dashboard/admin list for author must include only own posts.
  v_list := public.blog_admin_list(1, 50, '', NULL, NULL, 'created_at', 'desc');
  IF COALESCE((v_list ->> 'totalCount')::int, 0) < 1 THEN
    RAISE EXCEPTION 'Author list scope failed: expected at least one visible row, got %', (v_list ->> 'totalCount');
  END IF;

  IF EXISTS (
    SELECT 1
    FROM jsonb_array_elements(v_list -> 'blogs') AS row_json
    WHERE (row_json -> 'author' ->> '_id')::uuid <> v_author_a
  ) THEN
    RAISE EXCEPTION 'Author list scope failed: found non-owned row';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM jsonb_array_elements(v_list -> 'blogs') AS row_json
    WHERE (row_json ->> 'id')::uuid = v_blog_a
  ) THEN
    RAISE EXCEPTION 'Author list scope failed: own seeded post not visible';
  END IF;

  v_stats := public.blog_dashboard_stats();
  IF COALESCE((v_stats ->> 'total_blogs')::int, 0) < 1 THEN
    RAISE EXCEPTION 'Author dashboard scope failed: expected at least one visible blog, got %', (v_stats ->> 'total_blogs');
  END IF;

  -- Simulate admin session.
  PERFORM set_config('request.jwt.claim.role', 'authenticated', true);
  PERFORM set_config('request.jwt.claim.sub', v_admin::text, true);

  -- 2) Admin can edit another author's post.
  v_updated := public.blog_admin_update(
    v_blog_b,
    jsonb_build_object('title', 'RBAC_ADMIN_OVERRIDE_OK')
  );

  IF (v_updated ->> 'id')::uuid <> v_blog_b THEN
    RAISE EXCEPTION 'Admin override failed: update did not return expected blog id';
  END IF;

  IF v_updated ->> 'title' <> 'RBAC_ADMIN_OVERRIDE_OK' THEN
    RAISE EXCEPTION 'Admin override failed: updated title mismatch';
  END IF;

  -- 3) Dashboard/admin list rules for admin: includes all posts.
  v_list := public.blog_admin_list(1, 50, '', NULL, NULL, 'created_at', 'desc');
  IF NOT EXISTS (
    SELECT 1
    FROM jsonb_array_elements(v_list -> 'blogs') AS row_json
    WHERE (row_json ->> 'id')::uuid = v_blog_a
  ) OR NOT EXISTS (
    SELECT 1
    FROM jsonb_array_elements(v_list -> 'blogs') AS row_json
    WHERE (row_json ->> 'id')::uuid = v_blog_b
  ) THEN
    RAISE EXCEPTION 'Admin list scope failed: expected both seeded posts to be visible';
  END IF;

  v_stats := public.blog_dashboard_stats();
  IF COALESCE((v_stats ->> 'total_blogs')::int, 0) < 2 THEN
    RAISE EXCEPTION 'Admin dashboard scope failed: expected at least two visible blogs, got %', (v_stats ->> 'total_blogs');
  END IF;

  RAISE NOTICE 'RBAC E2E verification passed (author denied, admin override allowed, dashboard/list scoped correctly).';
END;
$$;

ROLLBACK;
