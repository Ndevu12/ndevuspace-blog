-- ============================================================================
-- Scheduled publishing verification (rollback-only)
-- ============================================================================
-- Validates:
-- 1) Non-admin (non-owner) cannot schedule a post
-- 2) blog_schedule_post sets status=scheduled + publish_at, clears published_at
-- 3) A future publish time is rejected
-- 4) blog_publish_due() leaves not-yet-due posts alone
-- 5) blog_publish_due() flips due posts to published (published_at = publish_at)
--
-- Usage:
--   yarn db:verify:scheduled-publishing
--
-- Runs in a transaction and ends with ROLLBACK. Tests the RPCs directly and
-- does not depend on the pg_cron job actually firing.
-- ============================================================================

BEGIN;

DO $$
DECLARE
  v_admin uuid := gen_random_uuid();
  v_user uuid := gen_random_uuid();
  v_blog uuid;
  v_blog2 uuid;
  v_res jsonb;
  v_status text;
  v_published_at timestamptz;
  v_publish_at timestamptz;
  v_flipped int;
BEGIN
  -- ── Seed auth users + profiles ─────────────────────────────────────────
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, confirmation_token, recovery_token, email_change,
    email_change_token_new, email_change_token_current, reauthentication_token,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at
  )
  VALUES
    ('00000000-0000-0000-0000-000000000000', v_admin, 'authenticated',
     'authenticated', 'sched.admin@example.com',
     '$2a$10$QJ4j7aL1fXf9k7G3nYf3s.yfYb7fBQfFPHlyv5Q9ix8fJ0Eqv6c7u',
     timezone('utc', now()), '', '', '', '', '', '',
     '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb,
     timezone('utc', now()), timezone('utc', now())),
    ('00000000-0000-0000-0000-000000000000', v_user, 'authenticated',
     'authenticated', 'sched.user@example.com',
     '$2a$10$QJ4j7aL1fXf9k7G3nYf3s.yfYb7fBQfFPHlyv5Q9ix8fJ0Eqv6c7u',
     timezone('utc', now()), '', '', '', '', '', '',
     '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb,
     timezone('utc', now()), timezone('utc', now()));

  INSERT INTO public.user_profiles (id, username, first_name, last_name, role)
  VALUES
    (v_admin, 'sched_admin', 'Sched', 'Admin', 'admin'),
    (v_user, 'sched_user', 'Sched', 'User', 'user')
  ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role;

  INSERT INTO public.blogs (slug, title, content, author_id, author, status)
  VALUES ('sched-post', 'Scheduled Post', 'body', v_admin, 'sched_admin', 'draft')
  RETURNING id INTO v_blog;

  -- ── 1) Non-admin (non-owner) is denied ─────────────────────────────────
  PERFORM set_config('request.jwt.claim.role', 'authenticated', true);
  PERFORM set_config('request.jwt.claim.sub', v_user::text, true);
  BEGIN
    PERFORM public.blog_schedule_post(v_blog, timezone('utc', now()) + interval '1 day');
    RAISE EXCEPTION 'FAIL: non-admin was allowed to schedule a post';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;

  -- ── Admin session ──────────────────────────────────────────────────────
  PERFORM set_config('request.jwt.claim.sub', v_admin::text, true);

  -- 3) Past publish time rejected.
  BEGIN
    PERFORM public.blog_schedule_post(v_blog, timezone('utc', now()) - interval '1 hour');
    RAISE EXCEPTION 'FAIL: a past publish time was accepted';
  EXCEPTION WHEN sqlstate '22023' THEN NULL; END;

  -- 2) Schedule for the future.
  v_res := public.blog_schedule_post(v_blog, timezone('utc', now()) + interval '1 day');
  SELECT status::text, published_at, publish_at
  INTO v_status, v_published_at, v_publish_at
  FROM public.blogs WHERE id = v_blog;

  IF v_status <> 'scheduled' THEN
    RAISE EXCEPTION 'FAIL: expected status scheduled, got %', v_status;
  END IF;
  IF v_publish_at IS NULL THEN
    RAISE EXCEPTION 'FAIL: publish_at was not set';
  END IF;
  IF v_published_at IS NOT NULL THEN
    RAISE EXCEPTION 'FAIL: published_at should be null while scheduled';
  END IF;

  -- 4) Not yet due → publish_due leaves it scheduled.
  v_flipped := public.blog_publish_due();
  SELECT status::text INTO v_status FROM public.blogs WHERE id = v_blog;
  IF v_status <> 'scheduled' THEN
    RAISE EXCEPTION 'FAIL: not-yet-due post was published early (flipped=%)', v_flipped;
  END IF;

  -- 5) Make it due (simulate time passing), then publish_due flips it.
  UPDATE public.blogs
  SET publish_at = timezone('utc', now()) - interval '1 minute'
  WHERE id = v_blog;

  v_flipped := public.blog_publish_due();
  IF v_flipped < 1 THEN
    RAISE EXCEPTION 'FAIL: blog_publish_due reported % flips, expected >= 1', v_flipped;
  END IF;

  SELECT status::text, published_at, publish_at
  INTO v_status, v_published_at, v_publish_at
  FROM public.blogs WHERE id = v_blog;

  IF v_status <> 'published' THEN
    RAISE EXCEPTION 'FAIL: due post was not published (status=%)', v_status;
  END IF;
  IF v_published_at IS NULL THEN
    RAISE EXCEPTION 'FAIL: published_at was not set on publish';
  END IF;
  IF v_published_at <> v_publish_at THEN
    RAISE EXCEPTION 'FAIL: published_at (%) should equal publish_at (%)', v_published_at, v_publish_at;
  END IF;

  -- ── Native scheduling through the create/update RPCs (the editor path) ──
  -- 6) Create a post already scheduled.
  v_res := public.blog_admin_create(jsonb_build_object(
    'title', 'Created Scheduled',
    'content', 'body',
    'status', 'scheduled',
    'publish_at', (timezone('utc', now()) + interval '2 days')::text
  ));
  v_blog2 := (v_res ->> 'id')::uuid;
  IF (v_res ->> 'publishAt') IS NULL THEN
    RAISE EXCEPTION 'FAIL: created row json is missing publishAt';
  END IF;
  SELECT status::text, publish_at INTO v_status, v_publish_at
  FROM public.blogs WHERE id = v_blog2;
  IF v_status <> 'scheduled' OR v_publish_at IS NULL THEN
    RAISE EXCEPTION 'FAIL: create-with-schedule state wrong (status=%, publish_at=%)', v_status, v_publish_at;
  END IF;

  -- 7) Creating scheduled without publish_at is rejected.
  BEGIN
    PERFORM public.blog_admin_create(jsonb_build_object(
      'title', 'No Time', 'content', 'b', 'status', 'scheduled'));
    RAISE EXCEPTION 'FAIL: scheduled create without publish_at was accepted';
  EXCEPTION WHEN sqlstate '23514' THEN NULL; END;

  -- 8) Leaving scheduled via update clears publish_at.
  PERFORM public.blog_admin_update(v_blog2, jsonb_build_object('status', 'draft'));
  SELECT status::text, publish_at INTO v_status, v_publish_at
  FROM public.blogs WHERE id = v_blog2;
  IF v_status <> 'draft' OR v_publish_at IS NOT NULL THEN
    RAISE EXCEPTION 'FAIL: leaving scheduled did not clear publish_at (status=%, publish_at=%)', v_status, v_publish_at;
  END IF;

  -- 9) Update back into scheduled with a fresh time.
  PERFORM public.blog_admin_update(v_blog2, jsonb_build_object(
    'status', 'scheduled',
    'publish_at', (timezone('utc', now()) + interval '3 days')::text));
  SELECT status::text, publish_at INTO v_status, v_publish_at
  FROM public.blogs WHERE id = v_blog2;
  IF v_status <> 'scheduled' OR v_publish_at IS NULL THEN
    RAISE EXCEPTION 'FAIL: update-to-scheduled did not persist (status=%, publish_at=%)', v_status, v_publish_at;
  END IF;

  RAISE NOTICE 'PASS: scheduled publishing verification succeeded';
END $$;

ROLLBACK;
