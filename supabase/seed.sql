-- ============================================================================
-- Seed data: users -> user_profiles -> categories -> tags -> blogs -> links
-- Source: src/data/dummyBlogs.ts
-- ============================================================================

BEGIN;

-- Shared seed constants (keep sensitive/auth-related values centralized).
-- NOTE: `v_seed_password_hash` is a bcrypt hash used only for local/dev seed users.
DO $seed$
DECLARE
  v_seed_instance_id uuid := '00000000-0000-0000-0000-000000000000';
  v_seed_author_id uuid := '11111111-1111-1111-1111-111111111111';
  v_seed_admin_id uuid := '22222222-2222-2222-2222-222222222222';
  v_seed_author_email text := 'seed.author@example.com';
  v_seed_admin_email text := 'seed.admin@example.com';
  v_seed_password_plain text := 'seed-password-change-me';
  v_seed_password_hash text;
BEGIN
  -- pgcrypto functions may live in either extensions or public depending on environment.
  IF to_regprocedure('extensions.gen_salt(text)') IS NOT NULL
     AND to_regprocedure('extensions.crypt(text,text)') IS NOT NULL THEN
    v_seed_password_hash := extensions.crypt(v_seed_password_plain, extensions.gen_salt('bf'));
  ELSIF to_regprocedure('public.gen_salt(text)') IS NOT NULL
     AND to_regprocedure('public.crypt(text,text)') IS NOT NULL THEN
    v_seed_password_hash := public.crypt(v_seed_password_plain, public.gen_salt('bf'));
  ELSE
    RAISE EXCEPTION 'pgcrypto functions crypt/gen_salt not found in extensions or public schema'
      USING ERRCODE = '42883';
  END IF;

-- 1) Seed auth users first (FK target for public.user_profiles.id).
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at,
  confirmation_token, recovery_token, email_change,
  email_change_token_new, email_change_token_current,
  reauthentication_token,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) VALUES
  (v_seed_instance_id, v_seed_author_id, 'authenticated', 'authenticated', v_seed_author_email, v_seed_password_hash, timezone('utc', now()), '', '', '', '', '', '', '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, timezone('utc', now()), timezone('utc', now())),
  (v_seed_instance_id, v_seed_admin_id, 'authenticated', 'authenticated', v_seed_admin_email, v_seed_password_hash, timezone('utc', now()), '', '', '', '', '', '', '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, timezone('utc', now()), timezone('utc', now()))
ON CONFLICT (id) DO UPDATE
SET
  email = EXCLUDED.email,
  aud = EXCLUDED.aud,
  role = EXCLUDED.role,
  encrypted_password = EXCLUDED.encrypted_password,
  email_confirmed_at = EXCLUDED.email_confirmed_at,
  confirmation_token = EXCLUDED.confirmation_token,
  recovery_token = EXCLUDED.recovery_token,
  email_change = EXCLUDED.email_change,
  email_change_token_new = EXCLUDED.email_change_token_new,
  email_change_token_current = EXCLUDED.email_change_token_current,
  reauthentication_token = EXCLUDED.reauthentication_token,
  raw_app_meta_data = EXCLUDED.raw_app_meta_data,
  raw_user_meta_data = EXCLUDED.raw_user_meta_data,
  updated_at = timezone('utc', now());

-- Ensure auth identities exist for password grant login.
INSERT INTO auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  last_sign_in_at,
  created_at,
  updated_at
) VALUES
  (
    v_seed_author_id,
    v_seed_author_id,
    jsonb_build_object('sub', v_seed_author_id::text, 'email', v_seed_author_email, 'email_verified', true, 'phone_verified', false),
    'email',
    v_seed_author_email,
    NULL,
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    v_seed_admin_id,
    v_seed_admin_id,
    jsonb_build_object('sub', v_seed_admin_id::text, 'email', v_seed_admin_email, 'email_verified', true, 'phone_verified', false),
    'email',
    v_seed_admin_email,
    NULL,
    timezone('utc', now()),
    timezone('utc', now())
  )
ON CONFLICT (provider_id, provider) DO UPDATE
SET
  user_id = EXCLUDED.user_id,
  identity_data = EXCLUDED.identity_data,
  updated_at = timezone('utc', now());

-- 2) Seed public user profiles.
INSERT INTO public.user_profiles (id, username, first_name, last_name, role, avatar_url) VALUES
  (v_seed_author_id, 'user-1', 'Jean Paul Elisa', 'NIYOKWIZERWA', 'user', NULL),
  (v_seed_admin_id, 'seed_admin', 'Seed', 'Admin', 'admin', NULL)
ON CONFLICT (id) DO UPDATE
SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name, role = EXCLUDED.role, avatar_url = EXCLUDED.avatar_url, updated_at = timezone('utc', now());
END
$seed$;

-- 3) Seed categories.
INSERT INTO public.blog_categories (id, name, slug, description, icon) VALUES
  ('bcb37a2b-cb0a-93a3-734b-5e8554fb5944', 'Web Development', 'web-development', NULL, 'code'),
  ('91f19f23-52f3-cb83-d9f2-75ffcfb6bbc7', 'Design', 'design', NULL, 'palette'),
  ('9de80899-51b4-eca9-21c1-82fe7624eec6', 'Technology', 'technology', NULL, 'cpu'),
  ('23bc703f-793e-53e7-3e0a-acaac99f8278', 'DevOps', 'devops', NULL, 'server'),
  ('951f32d1-a4ba-b906-29a9-c00ed1460281', 'Cloud Computing', 'cloud-computing', NULL, 'cloud'),
  ('ec16d272-8b05-71b0-5e0a-3cf0d1db67aa', 'Architecture', 'architecture', NULL, 'sitemap'),
  ('e9a9d7be-50c4-690b-78dc-cf346029d3b7', 'Tutorials', 'tutorials', NULL, 'graduation-cap')
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name, slug = EXCLUDED.slug, description = EXCLUDED.description, icon = EXCLUDED.icon, updated_at = timezone('utc', now());

-- 4) Seed tags.
INSERT INTO public.blog_tags (id, name, slug, description) VALUES
  ('f8320c8a-9256-9d2a-c7d5-a052903afaf1', 'Accessibility', 'accessibility', NULL),
  ('ca7d8fcb-84eb-c3e6-9b32-b0dcb2954520', 'AI', 'ai', NULL),
  ('3004a68c-054f-8b74-0016-572ed1d4bc68', 'API', 'api', NULL),
  ('e71bc50c-1688-7e3a-762e-372b7547f96c', 'App Router', 'app-router', NULL),
  ('69799ab8-2985-92af-5835-2fec9768a5a2', 'Architecture', 'architecture', NULL),
  ('87164eaf-7492-803d-5311-00625f56c893', 'Automation', 'automation', NULL),
  ('9c228ea5-bdcc-4ffd-f5eb-66dd0f7eef3b', 'Backend', 'backend', NULL),
  ('45f004e2-25c7-159e-f4aa-89d131ea8e4b', 'Best Practices', 'best-practices', NULL),
  ('9c71f4a3-0762-fe63-875e-94eaf08c98eb', 'CI/CD', 'ci-cd', NULL),
  ('f2743d15-393a-8af1-e42b-3300a1b8e2e7', 'Cloud Native', 'cloud-native', NULL),
  ('3954d4cf-d9a1-466d-a0e4-2a7150eadf54', 'Coding', 'coding', NULL),
  ('ee01597c-e333-b01f-5688-93e0da849066', 'Container Queries', 'container-queries', NULL),
  ('6b34ae29-e48e-2712-9118-9d127e263857', 'Containers', 'containers', NULL),
  ('9fec721e-6ed5-01de-bc94-5672772d9fba', 'CSS', 'css', NULL),
  ('a06acf1e-f648-1a2f-2e9b-506af4a53d39', 'Design Principles', 'design-principles', NULL),
  ('2fe4fb01-d460-767b-5319-9c0cb79e43a1', 'Developer Growth', 'developer-growth', NULL),
  ('57eed282-076b-bafd-1848-ac02b4c9b884', 'DevOps', 'devops', NULL),
  ('6cf57ec5-569f-5e7e-db16-f474cf263140', 'Docker', 'docker', NULL),
  ('a5b36922-a538-452e-947b-a3ee16b9af85', 'Education', 'education', NULL),
  ('1129e06f-3c50-8c72-0ca1-99d4082e3f8a', 'Ethics', 'ethics', NULL),
  ('b6c5b879-f7eb-4ce5-b865-c2a0148913cf', 'Express', 'express', NULL),
  ('76a32807-333d-54af-a01a-3ad609b2e9f7', 'Flexbox', 'flexbox', NULL),
  ('ca4af6d9-da0d-c0a0-a5d2-d63bd39f5f94', 'Frontend', 'frontend', NULL),
  ('a0fd4533-9056-9602-be1b-bbdc82ef8fe9', 'Functional Programming', 'functional-programming', NULL),
  ('1545c473-3740-6cac-d701-444613a7b3c7', 'Future Tech', 'future-tech', NULL),
  ('e6b157cb-8309-c72e-e5ff-14f071770737', 'GitHub Actions', 'github-actions', NULL),
  ('633cff17-e21b-ad4a-951d-55e8f9d34f1f', 'Grid', 'grid', NULL),
  ('d9375728-e80c-d9a6-c8a2-a1a5951e0534', 'Infrastructure', 'infrastructure', NULL),
  ('2a0c7f77-761f-8199-efe7-ab72ac1d68d6', 'JavaScript', 'javascript', NULL),
  ('262f8657-7a74-f2b8-69dc-c65d095f3ec6', 'Kubernetes', 'kubernetes', NULL),
  ('f009cd34-daf1-3e2e-6266-608f94335881', 'Machine Learning', 'machine-learning', NULL),
  ('4b92244d-0623-9345-ddec-ec471e635e54', 'Microservices', 'microservices', NULL),
  ('00a1186c-1d1c-c52c-0049-89f50d1b07c6', 'Mobile-first', 'mobile-first', NULL),
  ('4627946f-50ff-4eaf-8a06-b8d9e14b168b', 'MVP', 'mvp', NULL),
  ('d79a16c9-be48-6e99-0031-d62a6eaf75b0', 'Next.js', 'next-js', NULL),
  ('c6721568-9804-e525-a20e-bbc084f6c925', 'Node.js', 'node-js', NULL),
  ('a31bc35f-3dc6-137e-5e50-f2ca2ea3e36a', 'Product Development', 'product-development', NULL),
  ('192202b8-2e59-f5b8-0647-c4110a1abe6d', 'React', 'react', NULL),
  ('9ada64a7-1225-dc19-6a07-74327ab293ec', 'Responsive Design', 'responsive-design', NULL),
  ('65e225bd-f56f-2036-a401-6ec9b1bb6e2e', 'Server Components', 'server-components', NULL),
  ('5cf337bb-7617-b22b-21a8-15e661ced02c', 'Serverless', 'serverless', NULL),
  ('06f3ef17-8580-fc41-f2cd-b84d73fc14d1', 'Software Engineering', 'software-engineering', NULL),
  ('3470ec5a-0f64-09f4-68c7-238ed5421866', 'Startup', 'startup', NULL),
  ('e4b00377-9bf0-8c53-6de2-2b5f23295900', 'Teaching Tech', 'teaching-tech', NULL),
  ('829a77a8-06a5-1fa6-3b6f-2c334a41c3f5', 'Team Leadership', 'team-leadership', NULL),
  ('2e29cd7c-b137-a092-00f9-654e75892c75', 'Tech Business', 'tech-business', NULL),
  ('74b60e4b-2e91-d231-4c54-90057500d38c', 'Tutorial', 'tutorial', NULL),
  ('b3656dc0-7046-cce1-efe8-938b520a4b9e', 'Twelve-Factor', 'twelve-factor', NULL),
  ('b5800e31-faf0-d2c8-fed0-0a392c211dee', 'Type Safety', 'type-safety', NULL),
  ('ba9d22e1-71af-715c-947b-3994d27f56b3', 'TypeScript', 'typescript', NULL),
  ('be4d30b8-a871-c95b-f049-f7a37e2de261', 'UI', 'ui', NULL),
  ('5fc1e3aa-5be4-4044-8eae-0430fa0f22e8', 'UX', 'ux', NULL),
  ('c9a5f96d-d9e9-8454-fe1d-03f19d3923c4', 'Web Development', 'web-development', NULL)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name, slug = EXCLUDED.slug, description = EXCLUDED.description, updated_at = timezone('utc', now());

-- 5) Seed blogs from dummyBlogs.ts.
INSERT INTO public.blogs (
  id, slug, title, description, content, author_id, author, author_image,
  category_id, category, image_url, read_time, is_new, is_featured,
  meta_title, meta_description, likes, likes_count, views_count, status,
  published_at, created_at, updated_at
) VALUES
  ('3abf9a01-9fe9-a34c-e462-d0cf0a77a068', 'modern-web-architecture-evolution', 'The Evolution of Modern Web Architecture', 'From monolithic applications to microservices and serverless computing — how web architecture has transformed over time and what approach might work best for your next project.', $BLOG_1_CONTENT$
      <h2>The Monolithic Era</h2>
      <p>Traditionally, web applications were built as monolithic structures — single, unified codebases responsible for everything from UI to data persistence. This offered simplicity but presented challenges as apps grew in complexity and scale.</p>
      <p>In a monolithic architecture, all components are interconnected and interdependent. Even small changes require testing and deploying the entire application, making the development cycle longer and increasing the risk of introducing regressions.</p>

      <div class="bg-secondary p-6 rounded-lg my-8 border-l-4 border-primary">
        <h3>Key Limitations of Monolithic Architecture:</h3>
        <ul>
          <li>Scaling challenges: You must scale the entire application rather than just the components under heavy load</li>
          <li>Technology constraints: The whole application typically uses the same stack, limiting flexibility</li>
          <li>Complexity: As the application grows, the codebase becomes harder to understand and maintain</li>
          <li>Development bottlenecks: Larger teams face coordination challenges when working on a single codebase</li>
        </ul>
      </div>

      <h2>The Rise of Microservices</h2>
      <p>Microservices emerged as organizations sought more scalable, flexible alternatives. This architectural style structures applications as collections of loosely coupled services, each implementing a specific business function.</p>
      <p>Microservices communicate through well-defined APIs, typically over HTTP with REST or gRPC protocols. Each service can be developed, deployed, and scaled independently.</p>

      <h3>Benefits of Microservices</h3>
      <ul>
        <li>Improved scalability — services scale independently based on demand</li>
        <li>Technology diversity — teams can select the best tools for each service</li>
        <li>Development agility — smaller, focused teams work in parallel</li>
        <li>Resilience — failures are isolated to individual services</li>
      </ul>

      <h2>Serverless: The Next Evolution</h2>
      <p>Serverless computing abstracts away infrastructure management entirely. Developers focus solely on writing code while cloud providers handle execution, scaling, and availability. Platforms like AWS Lambda, Google Cloud Functions, and Azure Functions enable deploying individual functions that run in response to events.</p>

      <h2>Hybrid Approaches and Modern Best Practices</h2>
      <p>In practice, many organizations adopt hybrid architectures that blend elements from different approaches. An application might use microservices for core business functionality while leveraging serverless for event processing.</p>
      <p>The key to success lies not in blindly following trends, but in carefully evaluating options against your unique needs and constraints.</p>
    $BLOG_1_CONTENT$, '11111111-1111-1111-1111-111111111111', 'user-1', NULL, 'ec16d272-8b05-71b0-5e0a-3cf0d1db67aa', 'Architecture', '/images/blog/tech.jfif', 8, false, true, 'The Evolution of Modern Web Architecture', 'From monoliths to microservices to serverless — explore how web architecture has transformed.', (SELECT COALESCE(array_agg((substr(md5('3abf9a01-9fe9-a34c-e462-d0cf0a77a068:' || gs::text),1,8) || '-' || substr(md5('3abf9a01-9fe9-a34c-e462-d0cf0a77a068:' || gs::text),9,4) || '-' || substr(md5('3abf9a01-9fe9-a34c-e462-d0cf0a77a068:' || gs::text),13,4) || '-' || substr(md5('3abf9a01-9fe9-a34c-e462-d0cf0a77a068:' || gs::text),17,4) || '-' || substr(md5('3abf9a01-9fe9-a34c-e462-d0cf0a77a068:' || gs::text),21,12))::uuid ORDER BY gs), ARRAY[]::uuid[]) FROM generate_series(1, 42) AS gs), 42, 1245, 'published', '2026-03-01T08:00:00Z', '2026-02-15T10:30:00Z', '2026-03-01T08:00:00Z'),
  ('9ffdeaf9-4546-5827-2f6a-40e08de3ad3a', 'responsive-design-principles-2026', 'Responsive Web Design Principles for 2026', 'Master the essential principles of responsive web design — from mobile-first strategies to container queries and modern layout techniques.', $BLOG_2_CONTENT$
      <h2>What is Responsive Web Design?</h2>
      <p>Responsive web design makes web pages render well on a variety of devices and screen sizes. It's about creating websites that provide an optimal viewing experience with minimal resizing and scrolling.</p>

      <h2>Mobile-First Approach</h2>
      <p>Design for the smallest screen first, then progressively enhance for larger screens. This forces focus on essential content and functionality before adding complexity.</p>

      <h2>Modern Layout Techniques</h2>
      <h3>CSS Grid</h3>
      <pre><code>.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}</code></pre>

      <h3>Flexbox</h3>
      <p>Flexbox provides efficient layout, alignment, and space distribution among items in a container — particularly useful for one-dimensional layouts and navigation bars.</p>

      <h3>Container Queries</h3>
      <p>Container queries are a game-changer for component-level responsiveness. Instead of responding to viewport width, components adapt based on their container's size — making truly reusable components possible.</p>

      <h2>Key Takeaways</h2>
      <ul>
        <li>Use fluid grids with relative units (rem, em, %)</li>
        <li>Make images flexible within their containers</li>
        <li>Leverage media queries for device-specific styles</li>
        <li>Adopt container queries for component-level responsiveness</li>
        <li>Test across real devices, not just browser dev tools</li>
      </ul>
    $BLOG_2_CONTENT$, '11111111-1111-1111-1111-111111111111', 'user-1', NULL, 'bcb37a2b-cb0a-93a3-734b-5e8554fb5944', 'Web Development', '/images/blog/programming.jfif', 6, false, false, NULL, NULL, (SELECT COALESCE(array_agg((substr(md5('9ffdeaf9-4546-5827-2f6a-40e08de3ad3a:' || gs::text),1,8) || '-' || substr(md5('9ffdeaf9-4546-5827-2f6a-40e08de3ad3a:' || gs::text),9,4) || '-' || substr(md5('9ffdeaf9-4546-5827-2f6a-40e08de3ad3a:' || gs::text),13,4) || '-' || substr(md5('9ffdeaf9-4546-5827-2f6a-40e08de3ad3a:' || gs::text),17,4) || '-' || substr(md5('9ffdeaf9-4546-5827-2f6a-40e08de3ad3a:' || gs::text),21,12))::uuid ORDER BY gs), ARRAY[]::uuid[]) FROM generate_series(1, 28) AS gs), 28, 947, 'published', '2026-02-10T11:00:00Z', '2026-01-20T14:15:00Z', '2026-02-10T11:00:00Z'),
  ('1af25d8c-5fef-2461-64ee-97f2da2427f7', 'ui-ux-design-fundamentals-developers', 'UI/UX Design Fundamentals for Developers', 'Learn the essential design principles every developer should know to build better user experiences — visual hierarchy, consistency, and accessibility.', $BLOG_3_CONTENT$
      <h2>Why Developers Need Design Skills</h2>
      <p>Understanding design principles helps developers make better decisions at every level — from component architecture to micro-interactions. It bridges the gap between "it works" and "it works beautifully."</p>

      <h2>Core Principles</h2>

      <h3>Visual Hierarchy</h3>
      <p>Guide users through content by size, color, contrast, and spacing. The most important elements should be the most prominent. A well-structured hierarchy reduces cognitive load and helps users find what they need faster.</p>

      <h3>Consistency</h3>
      <p>Consistent patterns reduce cognitive load. Use the same components, colors, and interactions throughout your application. Design systems like shadcn/ui and Material Design exist precisely for this reason.</p>

      <h3>Accessibility</h3>
      <p>Design for everyone. Ensure sufficient color contrast (WCAG 2.1 AA minimum), provide alt text for images, support keyboard navigation, and use semantic HTML. Accessibility isn't optional — it's a fundamental quality of good software.</p>

      <h2>Practical Tips</h2>
      <ul>
        <li>Start with a design system or component library</li>
        <li>Use whitespace generously — it's not wasted space, it's breathing room</li>
        <li>Test with real users, not assumptions</li>
        <li>Limit your color palette to 2-3 primary colors</li>
        <li>Typography hierarchy: no more than 2-3 font weights per page</li>
      </ul>

      <blockquote>
        <p>"Good design is obvious. Great design is transparent." — Joe Sparano</p>
      </blockquote>
    $BLOG_3_CONTENT$, '11111111-1111-1111-1111-111111111111', 'user-1', NULL, '91f19f23-52f3-cb83-d9f2-75ffcfb6bbc7', 'Design', '/images/blog/social.jfif', 7, false, false, NULL, NULL, (SELECT COALESCE(array_agg((substr(md5('1af25d8c-5fef-2461-64ee-97f2da2427f7:' || gs::text),1,8) || '-' || substr(md5('1af25d8c-5fef-2461-64ee-97f2da2427f7:' || gs::text),9,4) || '-' || substr(md5('1af25d8c-5fef-2461-64ee-97f2da2427f7:' || gs::text),13,4) || '-' || substr(md5('1af25d8c-5fef-2461-64ee-97f2da2427f7:' || gs::text),17,4) || '-' || substr(md5('1af25d8c-5fef-2461-64ee-97f2da2427f7:' || gs::text),21,12))::uuid ORDER BY gs), ARRAY[]::uuid[]) FROM generate_series(1, 35) AS gs), 35, 812, 'published', '2026-01-15T14:30:00Z', '2026-01-05T09:00:00Z', '2026-01-15T14:30:00Z'),
  ('1675e29a-2a29-199f-d2e1-148bb6efa5e4', 'future-of-ai-in-tech-2026', 'The Future of AI in Tech: What Developers Need to Know', 'How artificial intelligence is reshaping the technology landscape — from AI-assisted development to production ML systems and the ethical questions we must answer.', $BLOG_4_CONTENT$
      <h2>AI's Current Impact</h2>
      <p>Artificial intelligence has moved from research labs to production systems at an unprecedented pace. From code completion tools to automated testing, AI is becoming an integral part of the development workflow in 2026.</p>

      <h2>AI-Assisted Development</h2>
      <p>Tools like GitHub Copilot, Claude, and AI-powered code review are fundamentally changing how we write software. They don't replace developers — they augment capabilities, handle repetitive tasks, and accelerate the feedback loop from idea to implementation.</p>
      <p>The key is learning to work <em>with</em> AI effectively: writing clear prompts, reviewing generated code critically, and understanding where AI excels versus where human judgment is irreplaceable.</p>

      <h2>Machine Learning in Production</h2>
      <p>Deploying ML models requires understanding infrastructure, monitoring, and the full MLOps lifecycle. It's not just about training models — it's about keeping them reliable, up-to-date, and performant in production environments.</p>

      <h2>Ethical Considerations</h2>
      <p>As AI becomes more pervasive, developers must consider bias in training data, transparency in decision-making, privacy implications, and the societal impact of the systems they build. Responsible AI isn't a nice-to-have — it's a professional obligation.</p>

      <blockquote>
        <p>"The question is not whether AI will transform our industry, but how we'll ensure it does so responsibly."</p>
      </blockquote>
    $BLOG_4_CONTENT$, '11111111-1111-1111-1111-111111111111', 'user-1', NULL, '9de80899-51b4-eca9-21c1-82fe7624eec6', 'Technology', '/images/blog/future.jfif', 6, false, false, NULL, NULL, (SELECT COALESCE(array_agg((substr(md5('1675e29a-2a29-199f-d2e1-148bb6efa5e4:' || gs::text),1,8) || '-' || substr(md5('1675e29a-2a29-199f-d2e1-148bb6efa5e4:' || gs::text),9,4) || '-' || substr(md5('1675e29a-2a29-199f-d2e1-148bb6efa5e4:' || gs::text),13,4) || '-' || substr(md5('1675e29a-2a29-199f-d2e1-148bb6efa5e4:' || gs::text),17,4) || '-' || substr(md5('1675e29a-2a29-199f-d2e1-148bb6efa5e4:' || gs::text),21,12))::uuid ORDER BY gs), ARRAY[]::uuid[]) FROM generate_series(1, 56) AS gs), 56, 1580, 'published', '2026-02-15T09:00:00Z', '2026-01-28T11:00:00Z', '2026-02-15T09:00:00Z'),
  ('b35052cc-7e30-310d-8033-0fad13efc20c', 'starting-your-tech-startup-practical-guide', 'Starting Your Tech Startup: A Practical Guide', 'Practical advice for developers looking to turn ideas into viable tech businesses — from MVP to funding and team building.', $BLOG_5_CONTENT$
      <h2>From Idea to MVP</h2>
      <p>Every startup begins with a problem worth solving. The key is validating your idea before investing months of development. Talk to potential users, build prototypes, and iterate fast. The goal of an MVP isn't perfection — it's learning.</p>

      <h2>Technical Decisions That Matter</h2>
      <p>Choose boring technology for your core infrastructure. Innovation should be in your product, not your tech stack. Use what your team knows best — speed matters more than using the latest framework.</p>
      <p>That said, invest in good foundations: type safety, automated testing, CI/CD from day one. Technical debt accumulated early will slow you down when speed matters most.</p>

      <h2>Building Your Team</h2>
      <p>Start small. A founding team of 2-3 people who complement each other's skills is ideal. Look for people who ship consistently, not just those with impressive resumes. Culture forms in the first few hires.</p>

      <h2>Funding and Growth</h2>
      <ul>
        <li>Bootstrap as long as possible to retain control and validate with real revenue</li>
        <li>Revenue is the best form of funding — it proves your idea works</li>
        <li>If you raise, raise enough to reach the next meaningful milestone</li>
        <li>Focus on unit economics from day one — growth without sustainability is a trap</li>
      </ul>
    $BLOG_5_CONTENT$, '11111111-1111-1111-1111-111111111111', 'user-1', NULL, '9de80899-51b4-eca9-21c1-82fe7624eec6', 'Technology', '/images/blog/enjoy.jfif', 7, false, false, NULL, NULL, (SELECT COALESCE(array_agg((substr(md5('b35052cc-7e30-310d-8033-0fad13efc20c:' || gs::text),1,8) || '-' || substr(md5('b35052cc-7e30-310d-8033-0fad13efc20c:' || gs::text),9,4) || '-' || substr(md5('b35052cc-7e30-310d-8033-0fad13efc20c:' || gs::text),13,4) || '-' || substr(md5('b35052cc-7e30-310d-8033-0fad13efc20c:' || gs::text),17,4) || '-' || substr(md5('b35052cc-7e30-310d-8033-0fad13efc20c:' || gs::text),21,12))::uuid ORDER BY gs), ARRAY[]::uuid[]) FROM generate_series(1, 21) AS gs), 21, 623, 'published', '2026-01-05T10:00:00Z', '2025-12-10T08:30:00Z', '2026-01-05T10:00:00Z'),
  ('bcc20946-6b7b-1f63-9551-88b324f3a2e6', 'typescript-best-practices-2026', 'TypeScript Best Practices for Production Apps', 'Level up your TypeScript with strict configurations, discriminated unions, Zod validation, and patterns used in real production codebases.', $BLOG_6_CONTENT$
      <h2>Strict Mode Is Non-Negotiable</h2>
      <p>Always enable <code>strict: true</code> in your tsconfig. It catches entire categories of bugs at compile time. The small upfront cost pays off enormously in reduced runtime errors and better IDE support.</p>

      <h2>Prefer Interfaces Over Types (Usually)</h2>
      <p>Interfaces are extendable and produce better error messages. Use type aliases for unions, intersections, and mapped types where interfaces can't help.</p>

      <h2>Discriminated Unions</h2>
      <pre><code>type Result&lt;T&gt; =
  | { success: true; data: T }
  | { success: false; error: string };

function handle(result: Result&lt;User&gt;) {
  if (result.success) {
    // TypeScript knows result.data exists here
    console.log(result.data.name);
  }
}</code></pre>

      <h2>Zod for Runtime Validation</h2>
      <p>TypeScript only checks at compile time. Use Zod to validate data at runtime boundaries — API responses, form inputs, environment variables. The combination of TypeScript + Zod gives you end-to-end type safety.</p>

      <h2>Utility Types You Should Know</h2>
      <ul>
        <li><code>Partial&lt;T&gt;</code> — make all properties optional</li>
        <li><code>Pick&lt;T, K&gt;</code> — select specific properties</li>
        <li><code>Omit&lt;T, K&gt;</code> — exclude specific properties</li>
        <li><code>Record&lt;K, V&gt;</code> — construct an object type with specific keys and values</li>
      </ul>
    $BLOG_6_CONTENT$, '11111111-1111-1111-1111-111111111111', 'user-1', NULL, 'bcb37a2b-cb0a-93a3-734b-5e8554fb5944', 'Web Development', '/images/blog/languages.png', 5, true, false, 'TypeScript Best Practices for Production Applications', 'Strict mode, discriminated unions, Zod validation — production TypeScript patterns.', (SELECT COALESCE(array_agg((substr(md5('bcc20946-6b7b-1f63-9551-88b324f3a2e6:' || gs::text),1,8) || '-' || substr(md5('bcc20946-6b7b-1f63-9551-88b324f3a2e6:' || gs::text),9,4) || '-' || substr(md5('bcc20946-6b7b-1f63-9551-88b324f3a2e6:' || gs::text),13,4) || '-' || substr(md5('bcc20946-6b7b-1f63-9551-88b324f3a2e6:' || gs::text),17,4) || '-' || substr(md5('bcc20946-6b7b-1f63-9551-88b324f3a2e6:' || gs::text),21,12))::uuid ORDER BY gs), ARRAY[]::uuid[]) FROM generate_series(1, 63) AS gs), 63, 2100, 'published', '2026-03-05T10:00:00Z', '2026-02-28T16:00:00Z', '2026-03-05T10:00:00Z'),
  ('a074a431-00a8-cdba-8cc2-ea459de04243', 'docker-kubernetes-developers-guide', 'Docker & Kubernetes for Developers', 'A developer-focused guide to containerization and orchestration — from Dockerfile basics to Kubernetes deployments and local development workflows.', $BLOG_7_CONTENT$
      <h2>Why Containers?</h2>
      <p>Containers solve the "works on my machine" problem. They package your application with its dependencies into a consistent, portable unit that runs the same everywhere — your laptop, CI, staging, and production.</p>

      <h2>Docker Essentials</h2>
      <pre><code>FROM node:20-alpine
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build
EXPOSE 3000
CMD ["yarn", "start"]</code></pre>

      <h2>Multi-Stage Builds</h2>
      <p>Use multi-stage builds to keep your production images lean. Build in one stage, copy only the artifacts you need into the final image. This can reduce image sizes by 80% or more.</p>

      <h2>Kubernetes Basics</h2>
      <p>Kubernetes orchestrates containers at scale. It handles deployment, scaling, load balancing, and self-healing. For most teams, managed services like EKS, GKE, or AKS are the way to go — don't run your own control plane unless you have a very good reason.</p>

      <h2>Local Development</h2>
      <p>Use Docker Compose for local multi-service setups. Tools like Tilt or Skaffold bridge the gap between local development and Kubernetes deployment, giving you fast feedback loops without sacrificing parity with production.</p>
    $BLOG_7_CONTENT$, '11111111-1111-1111-1111-111111111111', 'user-1', NULL, '23bc703f-793e-53e7-3e0a-acaac99f8278', 'DevOps', '/images/blog/technology.jfif', 8, false, false, NULL, NULL, (SELECT COALESCE(array_agg((substr(md5('a074a431-00a8-cdba-8cc2-ea459de04243:' || gs::text),1,8) || '-' || substr(md5('a074a431-00a8-cdba-8cc2-ea459de04243:' || gs::text),9,4) || '-' || substr(md5('a074a431-00a8-cdba-8cc2-ea459de04243:' || gs::text),13,4) || '-' || substr(md5('a074a431-00a8-cdba-8cc2-ea459de04243:' || gs::text),17,4) || '-' || substr(md5('a074a431-00a8-cdba-8cc2-ea459de04243:' || gs::text),21,12))::uuid ORDER BY gs), ARRAY[]::uuid[]) FROM generate_series(1, 38) AS gs), 38, 956, 'published', '2026-01-20T15:00:00Z', '2026-01-08T12:00:00Z', '2026-01-20T15:00:00Z'),
  ('761ff385-9753-71b9-73d8-4e3160d064e7', 'functional-programming-javascript', 'Functional Programming in JavaScript', 'Practical functional programming concepts that make your JavaScript code cleaner, more testable, and easier to reason about — without going full Haskell.', $BLOG_8_CONTENT$
      <h2>Pure Functions</h2>
      <p>A pure function always returns the same output for the same input and produces no side effects. This makes them predictable, testable, and easy to compose. Most of your utility functions should be pure.</p>

      <h2>Immutability</h2>
      <p>Avoid mutating data. Use spread operators, <code>Object.freeze</code>, or libraries like Immer to work with immutable data structures. Immutability eliminates an entire class of bugs related to shared mutable state.</p>

      <h2>Higher-Order Functions</h2>
      <pre><code>const pipe = (...fns) => (x) =>
  fns.reduce((acc, fn) => fn(acc), x);

const processUser = pipe(
  validateEmail,
  normalizeNames,
  addTimestamps
);</code></pre>

      <h2>When Not to Go Full Functional</h2>
      <p>Pragmatism beats purity. Use functional patterns where they add clarity, but don't force them everywhere. Imperative code is sometimes clearer for complex stateful operations. The goal is readable, maintainable code — not adherence to a paradigm.</p>

      <h2>Practical Applications</h2>
      <ul>
        <li>Array methods: <code>map</code>, <code>filter</code>, <code>reduce</code> for data transformations</li>
        <li>Currying for creating reusable, configurable functions</li>
        <li>Option/Result patterns for handling nullable values</li>
        <li>Event sourcing patterns in state management</li>
      </ul>
    $BLOG_8_CONTENT$, '11111111-1111-1111-1111-111111111111', 'user-1', NULL, 'bcb37a2b-cb0a-93a3-734b-5e8554fb5944', 'Web Development', '/images/blog/functional.png', 6, false, false, NULL, NULL, (SELECT COALESCE(array_agg((substr(md5('761ff385-9753-71b9-73d8-4e3160d064e7:' || gs::text),1,8) || '-' || substr(md5('761ff385-9753-71b9-73d8-4e3160d064e7:' || gs::text),9,4) || '-' || substr(md5('761ff385-9753-71b9-73d8-4e3160d064e7:' || gs::text),13,4) || '-' || substr(md5('761ff385-9753-71b9-73d8-4e3160d064e7:' || gs::text),17,4) || '-' || substr(md5('761ff385-9753-71b9-73d8-4e3160d064e7:' || gs::text),21,12))::uuid ORDER BY gs), ARRAY[]::uuid[]) FROM generate_series(1, 31) AS gs), 31, 745, 'published', '2025-12-05T14:00:00Z', '2025-11-18T10:00:00Z', '2025-12-05T14:00:00Z'),
  ('9f633322-4373-c34b-1c48-f7ccf79272ea', 'cloud-native-development-2026', 'Cloud-Native Development: Building for the Modern Stack', 'An introduction to cloud-native development principles — twelve-factor apps, infrastructure as code, and designing applications built for the cloud from day one.', $BLOG_9_CONTENT$
      <h2>What Does Cloud-Native Mean?</h2>
      <p>Cloud-native isn't just "running in the cloud." It's a set of principles for building applications that fully leverage cloud computing — elastic scaling, resilience, observability, and automation. It's about designing systems that embrace the distributed nature of modern infrastructure.</p>

      <h2>The Twelve-Factor App</h2>
      <p>The twelve-factor methodology provides a framework for building SaaS applications that are portable, scalable, and maintainable. Key principles include:</p>
      <ul>
        <li>Store config in environment variables, not code</li>
        <li>Treat backing services as attached resources</li>
        <li>Strictly separate build and run stages</li>
        <li>Export services via port binding</li>
        <li>Scale out via the process model</li>
      </ul>

      <h2>Infrastructure as Code</h2>
      <p>Define your infrastructure in version-controlled code using tools like Terraform, Pulumi, or AWS CDK. This ensures reproducibility, enables code review for infrastructure changes, and eliminates configuration drift.</p>

      <h2>Observability</h2>
      <p>In distributed systems, you can't just SSH into a server and tail logs. Invest in the three pillars of observability: structured logging, distributed tracing, and metrics. Tools like Grafana, Prometheus, and OpenTelemetry make this accessible.</p>
    $BLOG_9_CONTENT$, '11111111-1111-1111-1111-111111111111', 'user-1', NULL, '951f32d1-a4ba-b906-29a9-c00ed1460281', 'Cloud Computing', '/images/blog/datascience.jfif', 7, false, false, NULL, NULL, (SELECT COALESCE(array_agg((substr(md5('9f633322-4373-c34b-1c48-f7ccf79272ea:' || gs::text),1,8) || '-' || substr(md5('9f633322-4373-c34b-1c48-f7ccf79272ea:' || gs::text),9,4) || '-' || substr(md5('9f633322-4373-c34b-1c48-f7ccf79272ea:' || gs::text),13,4) || '-' || substr(md5('9f633322-4373-c34b-1c48-f7ccf79272ea:' || gs::text),17,4) || '-' || substr(md5('9f633322-4373-c34b-1c48-f7ccf79272ea:' || gs::text),21,12))::uuid ORDER BY gs), ARRAY[]::uuid[]) FROM generate_series(1, 24) AS gs), 24, 670, 'published', '2026-01-10T09:30:00Z', '2025-12-22T14:00:00Z', '2026-01-10T09:30:00Z'),
  ('b2fd296c-8138-f585-ecf7-5fb361123bb2', 'teaching-coding-to-autistic-kids', 'Teaching Coding to Autistic Kids', 'How structured programming environments can be powerful learning tools for children on the autism spectrum — and what educators should know.', $BLOG_10_CONTENT$
      <h2>Why Coding Works</h2>
      <p>Programming is logical, predictable, and rule-based — qualities that align well with how many autistic children think. It provides clear cause-and-effect relationships and immediate visual feedback, creating a learning environment where the rules are explicit and consistent.</p>

      <h2>Choosing the Right Tools</h2>
      <p>Visual programming languages like Scratch provide an excellent entry point. Block-based coding eliminates syntax errors while teaching computational thinking. For older learners, Python's clean syntax and immediate feedback loop work well.</p>

      <h2>Creating an Inclusive Environment</h2>
      <ul>
        <li>Reduce sensory distractions in the learning space</li>
        <li>Provide clear, step-by-step instructions with visual aids</li>
        <li>Allow self-paced progress without time pressure</li>
        <li>Celebrate process and effort, not just outcomes</li>
        <li>Use special interests as project themes for engagement</li>
      </ul>

      <h2>Real Impact</h2>
      <p>Many autistic individuals have gone on to successful careers in technology. Early exposure to coding can build confidence, problem-solving skills, and a sense of agency. The tech industry benefits enormously from neurodivergent perspectives — different ways of thinking lead to better solutions.</p>
    $BLOG_10_CONTENT$, '11111111-1111-1111-1111-111111111111', 'user-1', NULL, 'e9a9d7be-50c4-690b-78dc-cf346029d3b7', 'Tutorials', '/images/blog/autistic-kids-coding.jpg', 5, false, false, NULL, NULL, (SELECT COALESCE(array_agg((substr(md5('b2fd296c-8138-f585-ecf7-5fb361123bb2:' || gs::text),1,8) || '-' || substr(md5('b2fd296c-8138-f585-ecf7-5fb361123bb2:' || gs::text),9,4) || '-' || substr(md5('b2fd296c-8138-f585-ecf7-5fb361123bb2:' || gs::text),13,4) || '-' || substr(md5('b2fd296c-8138-f585-ecf7-5fb361123bb2:' || gs::text),17,4) || '-' || substr(md5('b2fd296c-8138-f585-ecf7-5fb361123bb2:' || gs::text),21,12))::uuid ORDER BY gs), ARRAY[]::uuid[]) FROM generate_series(1, 47) AS gs), 47, 1320, 'published', '2025-11-05T09:30:00Z', '2025-11-05T09:30:00Z', '2025-11-05T09:30:00Z'),
  ('eaf2b488-4fb5-5452-0590-2bf5b933a86a', 'getting-started-with-ci-cd-pipelines', 'Getting Started with CI/CD Pipelines', 'A practical introduction to continuous integration and deployment — from your first GitHub Actions workflow to production deployment strategies.', $BLOG_11_CONTENT$
      <h2>What Is CI/CD?</h2>
      <p>Continuous Integration means merging code frequently and running automated tests on every change. Continuous Deployment extends this by automatically shipping passing changes to production. Together, they create a fast, reliable feedback loop.</p>

      <h2>Setting Up Your First Pipeline</h2>
      <p>Start simple. A basic pipeline that runs tests and type-checks on pull requests already provides enormous value. You can add deployment stages, security scanning, and performance testing incrementally.</p>

      <h2>GitHub Actions Example</h2>
      <pre><code>name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: yarn
      - run: yarn install --frozen-lockfile
      - run: yarn type-check
      - run: yarn test
      - run: yarn build</code></pre>

      <h2>Best Practices</h2>
      <ul>
        <li>Keep pipelines fast — aim for under 10 minutes total</li>
        <li>Make builds deterministic and reproducible</li>
        <li>Use caching aggressively for dependencies</li>
        <li>Monitor pipeline health and fix flaky tests immediately</li>
        <li>Use branch protection rules to enforce CI passing before merge</li>
      </ul>
    $BLOG_11_CONTENT$, '11111111-1111-1111-1111-111111111111', 'user-1', NULL, '23bc703f-793e-53e7-3e0a-acaac99f8278', 'DevOps', '/images/blog/coding adventure.png', 6, true, false, NULL, NULL, (SELECT COALESCE(array_agg((substr(md5('eaf2b488-4fb5-5452-0590-2bf5b933a86a:' || gs::text),1,8) || '-' || substr(md5('eaf2b488-4fb5-5452-0590-2bf5b933a86a:' || gs::text),9,4) || '-' || substr(md5('eaf2b488-4fb5-5452-0590-2bf5b933a86a:' || gs::text),13,4) || '-' || substr(md5('eaf2b488-4fb5-5452-0590-2bf5b933a86a:' || gs::text),17,4) || '-' || substr(md5('eaf2b488-4fb5-5452-0590-2bf5b933a86a:' || gs::text),21,12))::uuid ORDER BY gs), ARRAY[]::uuid[]) FROM generate_series(1, 25) AS gs), 25, 680, 'published', '2026-03-07T09:00:00Z', '2026-03-01T11:00:00Z', '2026-03-07T09:00:00Z'),
  ('dabf4bb3-03e2-435b-6e6b-10e2a63ca729', 'career-growth-junior-to-senior-developer', 'Career Growth: From Junior to Senior Developer', 'Navigate your career progression in software development — essential skills, mindset shifts, and strategies to advance from junior to senior developer.', $BLOG_12_CONTENT$
      <h2>It's Not Just About Code</h2>
      <p>The jump from junior to senior isn't about writing more complex code — it's about having a broader impact. Senior developers think about systems, trade-offs, team productivity, and long-term maintainability.</p>

      <h2>Technical Depth vs. Breadth</h2>
      <p>Go deep in your primary stack, but maintain awareness of the broader ecosystem. You should be an expert in your domain while being conversational about adjacent technologies. T-shaped skills are your goal.</p>

      <h2>Key Mindset Shifts</h2>
      <ul>
        <li><strong>From tasks to outcomes:</strong> Stop measuring productivity by tasks completed. Focus on the impact of your work.</li>
        <li><strong>From individual to multiplier:</strong> Your value increases when you make the team better — through mentoring, documentation, and process improvements.</li>
        <li><strong>From building to shipping:</strong> Features don't matter until users have them. Prioritize getting things to production safely.</li>
        <li><strong>From certainty to judgment:</strong> Senior developers are comfortable making decisions with incomplete information.</li>
      </ul>

      <h2>Practical Steps</h2>
      <ul>
        <li>Own a feature end-to-end: from design to deployment to monitoring</li>
        <li>Write RFCs and technical proposals</li>
        <li>Mentor junior developers — teaching deepens understanding</li>
        <li>Contribute to architectural decisions</li>
        <li>Build relationships across teams</li>
      </ul>
    $BLOG_12_CONTENT$, '11111111-1111-1111-1111-111111111111', 'user-1', NULL, 'e9a9d7be-50c4-690b-78dc-cf346029d3b7', 'Tutorials', '/images/blog/life.jfif', 7, false, false, 'Career Growth: From Junior to Senior Developer', 'Essential skills and mindset shifts for advancing from junior to senior developer.', (SELECT COALESCE(array_agg((substr(md5('dabf4bb3-03e2-435b-6e6b-10e2a63ca729:' || gs::text),1,8) || '-' || substr(md5('dabf4bb3-03e2-435b-6e6b-10e2a63ca729:' || gs::text),9,4) || '-' || substr(md5('dabf4bb3-03e2-435b-6e6b-10e2a63ca729:' || gs::text),13,4) || '-' || substr(md5('dabf4bb3-03e2-435b-6e6b-10e2a63ca729:' || gs::text),17,4) || '-' || substr(md5('dabf4bb3-03e2-435b-6e6b-10e2a63ca729:' || gs::text),21,12))::uuid ORDER BY gs), ARRAY[]::uuid[]) FROM generate_series(1, 39) AS gs), 39, 1050, 'published', '2026-02-18T16:00:00Z', '2026-02-05T08:30:00Z', '2026-02-18T16:00:00Z'),
  ('89a2f247-c3f3-61f1-24ef-422dbf417860', 'next-js-app-router-deep-dive', 'Next.js App Router: A Deep Dive', 'Everything you need to know about Next.js App Router — server components, streaming, parallel routes, and when to use client vs. server rendering.', $BLOG_13_CONTENT$
      <h2>Why App Router?</h2>
      <p>Next.js App Router represents a fundamental shift in how we build React applications. Built on React Server Components, it enables server-first rendering by default while maintaining the interactivity users expect.</p>

      <h2>Server vs. Client Components</h2>
      <p>The key mental model: components are server components by default. Add <code>"use client"</code> only when you need browser APIs, event handlers, or React hooks like useState/useEffect. Keep the client boundary as low as possible in your component tree.</p>

      <h2>Data Fetching</h2>
      <p>Server components can be async — fetch data directly inside them without useEffect or client-side state management. This is simpler, faster, and eliminates loading waterfalls.</p>

      <pre><code>export default async function BlogPage() {
  const posts = await getBlogPosts();
  return (
    &lt;div&gt;
      {posts.map(post =&gt; (
        &lt;BlogCard key={post.id} post={post} /&gt;
      ))}
    &lt;/div&gt;
  );
}</code></pre>

      <h2>Streaming and Suspense</h2>
      <p>Use <code>&lt;Suspense&gt;</code> boundaries to stream parts of the page independently. Users see content as it becomes available instead of waiting for the slowest data fetch.</p>

      <h2>When to Use What</h2>
      <ul>
        <li><strong>Server Components:</strong> Data fetching, heavy rendering, accessing backend resources</li>
        <li><strong>Client Components:</strong> Interactivity, browser APIs, real-time updates</li>
        <li><strong>Route Handlers:</strong> API endpoints that don't need a UI</li>
        <li><strong>Server Actions:</strong> Form submissions and mutations</li>
      </ul>
    $BLOG_13_CONTENT$, '11111111-1111-1111-1111-111111111111', 'user-1', NULL, 'e9a9d7be-50c4-690b-78dc-cf346029d3b7', 'Tutorials', '/images/blog/pro.jfif', 10, true, true, 'Next.js App Router Deep Dive — Server Components, Streaming & More', 'Master Next.js App Router: server components, data fetching, streaming, and when to use client vs. server rendering.', (SELECT COALESCE(array_agg((substr(md5('89a2f247-c3f3-61f1-24ef-422dbf417860:' || gs::text),1,8) || '-' || substr(md5('89a2f247-c3f3-61f1-24ef-422dbf417860:' || gs::text),9,4) || '-' || substr(md5('89a2f247-c3f3-61f1-24ef-422dbf417860:' || gs::text),13,4) || '-' || substr(md5('89a2f247-c3f3-61f1-24ef-422dbf417860:' || gs::text),17,4) || '-' || substr(md5('89a2f247-c3f3-61f1-24ef-422dbf417860:' || gs::text),21,12))::uuid ORDER BY gs), ARRAY[]::uuid[]) FROM generate_series(1, 71) AS gs), 71, 2450, 'published', '2026-03-09T08:00:00Z', '2026-03-05T10:00:00Z', '2026-03-09T08:00:00Z'),
  ('be53839f-c24d-b9fa-0e49-f43b06cc06e2', 'building-scalable-apis-node-express', 'Building Scalable APIs with Node.js and Express', 'Design and implement robust, scalable APIs — covering authentication, validation, error handling, and performance optimization patterns.', $BLOG_14_CONTENT$
      <h2>API Design Principles</h2>
      <p>Good API design makes your backend a pleasure to work with. Use consistent naming conventions, proper HTTP methods, meaningful status codes, and comprehensive error responses.</p>

      <h2>Project Structure</h2>
      <p>Organize your Express app by feature, not by type. Each feature module contains its routes, controllers, services, and validation schemas. This makes the codebase navigable and each feature independently testable.</p>

      <h2>Authentication & Authorization</h2>
      <p>Use JWT tokens for stateless authentication. Implement role-based access control (RBAC) as middleware. Always hash passwords with bcrypt and store tokens securely.</p>

      <h2>Input Validation</h2>
      <p>Validate every input at the API boundary using Zod or Joi. Never trust client data — validate types, ranges, formats, and business rules before processing.</p>

      <h2>Error Handling</h2>
      <pre><code>// Centralized error handler
app.use((err, req, res, next) => {
  const status = err.statusCode || 500;
  const message = err.isOperational
    ? err.message
    : "Internal server error";

  res.status(status).json({
    success: false,
    error: message,
  });
});</code></pre>

      <h2>Performance Optimization</h2>
      <ul>
        <li>Use database indexes for frequently queried fields</li>
        <li>Implement response caching with Redis</li>
        <li>Paginate all list endpoints</li>
        <li>Use compression middleware for response payloads</li>
      </ul>
    $BLOG_14_CONTENT$, '11111111-1111-1111-1111-111111111111', 'user-1', NULL, 'bcb37a2b-cb0a-93a3-734b-5e8554fb5944', 'Web Development', '/images/blog/mming.jfif', 9, false, false, NULL, NULL, (SELECT COALESCE(array_agg((substr(md5('be53839f-c24d-b9fa-0e49-f43b06cc06e2:' || gs::text),1,8) || '-' || substr(md5('be53839f-c24d-b9fa-0e49-f43b06cc06e2:' || gs::text),9,4) || '-' || substr(md5('be53839f-c24d-b9fa-0e49-f43b06cc06e2:' || gs::text),13,4) || '-' || substr(md5('be53839f-c24d-b9fa-0e49-f43b06cc06e2:' || gs::text),17,4) || '-' || substr(md5('be53839f-c24d-b9fa-0e49-f43b06cc06e2:' || gs::text),21,12))::uuid ORDER BY gs), ARRAY[]::uuid[]) FROM generate_series(1, 33) AS gs), 33, 890, 'published', '2025-12-20T11:00:00Z', '2025-12-01T09:15:00Z', '2025-12-20T11:00:00Z'),
  ('26660285-e2bd-645f-ee55-56a0e41f9050', 'modern-css-techniques-grid-flexbox', 'Modern CSS Techniques: Grid, Flexbox, and Beyond', 'Master modern CSS layout techniques including CSS Grid, Flexbox, container queries, and the new features reshaping how we build responsive layouts.', $BLOG_15_CONTENT$
      <h2>CSS Grid: Two-Dimensional Layouts</h2>
      <p>CSS Grid is the gold standard for two-dimensional layouts. It handles both rows and columns simultaneously, making complex page layouts straightforward.</p>

      <pre><code>.dashboard {
  display: grid;
  grid-template-areas:
    "sidebar header"
    "sidebar main"
    "sidebar footer";
  grid-template-columns: 250px 1fr;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
}</code></pre>

      <h2>Flexbox: One-Dimensional Alignment</h2>
      <p>Flexbox excels at distributing space along a single axis. Use it for navigation bars, card rows, centering content, and any pattern where items flow in one direction.</p>

      <h2>Container Queries</h2>
      <p>Container queries let components respond to their container's size rather than the viewport. This is transformative for building truly reusable, context-aware components.</p>

      <h2>New CSS Features Worth Learning</h2>
      <ul>
        <li><code>:has()</code> — the parent selector CSS always needed</li>
        <li><code>color-mix()</code> — blend colors natively in CSS</li>
        <li>Cascade layers (<code>@layer</code>) — manage specificity at scale</li>
        <li>Nesting — write cleaner, more organized stylesheets</li>
        <li>View transitions — smooth page transitions natively</li>
      </ul>
    $BLOG_15_CONTENT$, '11111111-1111-1111-1111-111111111111', 'user-1', NULL, 'bcb37a2b-cb0a-93a3-734b-5e8554fb5944', 'Web Development', '/images/blog/what is programming.jfif', 6, false, false, NULL, NULL, (SELECT COALESCE(array_agg((substr(md5('26660285-e2bd-645f-ee55-56a0e41f9050:' || gs::text),1,8) || '-' || substr(md5('26660285-e2bd-645f-ee55-56a0e41f9050:' || gs::text),9,4) || '-' || substr(md5('26660285-e2bd-645f-ee55-56a0e41f9050:' || gs::text),13,4) || '-' || substr(md5('26660285-e2bd-645f-ee55-56a0e41f9050:' || gs::text),17,4) || '-' || substr(md5('26660285-e2bd-645f-ee55-56a0e41f9050:' || gs::text),21,12))::uuid ORDER BY gs), ARRAY[]::uuid[]) FROM generate_series(1, 27) AS gs), 27, 720, 'published', '2026-02-25T10:00:00Z', '2026-02-10T13:20:00Z', '2026-02-25T10:00:00Z')
ON CONFLICT (id) DO UPDATE
SET slug = EXCLUDED.slug, title = EXCLUDED.title, description = EXCLUDED.description, content = EXCLUDED.content,
    author_id = EXCLUDED.author_id, author = EXCLUDED.author, author_image = EXCLUDED.author_image,
    category_id = EXCLUDED.category_id, category = EXCLUDED.category, image_url = EXCLUDED.image_url,
    read_time = EXCLUDED.read_time, is_new = EXCLUDED.is_new, is_featured = EXCLUDED.is_featured,
    meta_title = EXCLUDED.meta_title, meta_description = EXCLUDED.meta_description, likes = EXCLUDED.likes,
    likes_count = EXCLUDED.likes_count, views_count = EXCLUDED.views_count, status = EXCLUDED.status,
    published_at = EXCLUDED.published_at, created_at = EXCLUDED.created_at, updated_at = EXCLUDED.updated_at;

-- 6) Seed blog-tag links.
DELETE FROM public.blog_tag_links WHERE blog_id IN ('3abf9a01-9fe9-a34c-e462-d0cf0a77a068', '9ffdeaf9-4546-5827-2f6a-40e08de3ad3a', '1af25d8c-5fef-2461-64ee-97f2da2427f7', '1675e29a-2a29-199f-d2e1-148bb6efa5e4', 'b35052cc-7e30-310d-8033-0fad13efc20c', 'bcc20946-6b7b-1f63-9551-88b324f3a2e6', 'a074a431-00a8-cdba-8cc2-ea459de04243', '761ff385-9753-71b9-73d8-4e3160d064e7', '9f633322-4373-c34b-1c48-f7ccf79272ea', 'b2fd296c-8138-f585-ecf7-5fb361123bb2', 'eaf2b488-4fb5-5452-0590-2bf5b933a86a', 'dabf4bb3-03e2-435b-6e6b-10e2a63ca729', '89a2f247-c3f3-61f1-24ef-422dbf417860', 'be53839f-c24d-b9fa-0e49-f43b06cc06e2', '26660285-e2bd-645f-ee55-56a0e41f9050');
INSERT INTO public.blog_tag_links (blog_id, tag_id) VALUES
  ('3abf9a01-9fe9-a34c-e462-d0cf0a77a068', '69799ab8-2985-92af-5835-2fec9768a5a2'),
  ('3abf9a01-9fe9-a34c-e462-d0cf0a77a068', 'c9a5f96d-d9e9-8454-fe1d-03f19d3923c4'),
  ('3abf9a01-9fe9-a34c-e462-d0cf0a77a068', '4b92244d-0623-9345-ddec-ec471e635e54'),
  ('3abf9a01-9fe9-a34c-e462-d0cf0a77a068', '5cf337bb-7617-b22b-21a8-15e661ced02c'),
  ('3abf9a01-9fe9-a34c-e462-d0cf0a77a068', '45f004e2-25c7-159e-f4aa-89d131ea8e4b'),
  ('9ffdeaf9-4546-5827-2f6a-40e08de3ad3a', '9fec721e-6ed5-01de-bc94-5672772d9fba'),
  ('9ffdeaf9-4546-5827-2f6a-40e08de3ad3a', '9ada64a7-1225-dc19-6a07-74327ab293ec'),
  ('9ffdeaf9-4546-5827-2f6a-40e08de3ad3a', '00a1186c-1d1c-c52c-0049-89f50d1b07c6'),
  ('9ffdeaf9-4546-5827-2f6a-40e08de3ad3a', 'ee01597c-e333-b01f-5688-93e0da849066'),
  ('1af25d8c-5fef-2461-64ee-97f2da2427f7', '5fc1e3aa-5be4-4044-8eae-0430fa0f22e8'),
  ('1af25d8c-5fef-2461-64ee-97f2da2427f7', 'be4d30b8-a871-c95b-f049-f7a37e2de261'),
  ('1af25d8c-5fef-2461-64ee-97f2da2427f7', 'a06acf1e-f648-1a2f-2e9b-506af4a53d39'),
  ('1af25d8c-5fef-2461-64ee-97f2da2427f7', 'f8320c8a-9256-9d2a-c7d5-a052903afaf1'),
  ('1675e29a-2a29-199f-d2e1-148bb6efa5e4', 'ca7d8fcb-84eb-c3e6-9b32-b0dcb2954520'),
  ('1675e29a-2a29-199f-d2e1-148bb6efa5e4', 'f009cd34-daf1-3e2e-6266-608f94335881'),
  ('1675e29a-2a29-199f-d2e1-148bb6efa5e4', '1545c473-3740-6cac-d701-444613a7b3c7'),
  ('1675e29a-2a29-199f-d2e1-148bb6efa5e4', '1129e06f-3c50-8c72-0ca1-99d4082e3f8a'),
  ('b35052cc-7e30-310d-8033-0fad13efc20c', '3470ec5a-0f64-09f4-68c7-238ed5421866'),
  ('b35052cc-7e30-310d-8033-0fad13efc20c', '2e29cd7c-b137-a092-00f9-654e75892c75'),
  ('b35052cc-7e30-310d-8033-0fad13efc20c', '4627946f-50ff-4eaf-8a06-b8d9e14b168b'),
  ('b35052cc-7e30-310d-8033-0fad13efc20c', 'a31bc35f-3dc6-137e-5e50-f2ca2ea3e36a'),
  ('bcc20946-6b7b-1f63-9551-88b324f3a2e6', 'ba9d22e1-71af-715c-947b-3994d27f56b3'),
  ('bcc20946-6b7b-1f63-9551-88b324f3a2e6', '45f004e2-25c7-159e-f4aa-89d131ea8e4b'),
  ('bcc20946-6b7b-1f63-9551-88b324f3a2e6', 'c9a5f96d-d9e9-8454-fe1d-03f19d3923c4'),
  ('bcc20946-6b7b-1f63-9551-88b324f3a2e6', 'b5800e31-faf0-d2c8-fed0-0a392c211dee'),
  ('a074a431-00a8-cdba-8cc2-ea459de04243', '6cf57ec5-569f-5e7e-db16-f474cf263140'),
  ('a074a431-00a8-cdba-8cc2-ea459de04243', '262f8657-7a74-f2b8-69dc-c65d095f3ec6'),
  ('a074a431-00a8-cdba-8cc2-ea459de04243', '57eed282-076b-bafd-1848-ac02b4c9b884'),
  ('a074a431-00a8-cdba-8cc2-ea459de04243', '6b34ae29-e48e-2712-9118-9d127e263857'),
  ('761ff385-9753-71b9-73d8-4e3160d064e7', '2a0c7f77-761f-8199-efe7-ab72ac1d68d6'),
  ('761ff385-9753-71b9-73d8-4e3160d064e7', 'a0fd4533-9056-9602-be1b-bbdc82ef8fe9'),
  ('761ff385-9753-71b9-73d8-4e3160d064e7', '45f004e2-25c7-159e-f4aa-89d131ea8e4b'),
  ('9f633322-4373-c34b-1c48-f7ccf79272ea', 'f2743d15-393a-8af1-e42b-3300a1b8e2e7'),
  ('9f633322-4373-c34b-1c48-f7ccf79272ea', 'd9375728-e80c-d9a6-c8a2-a1a5951e0534'),
  ('9f633322-4373-c34b-1c48-f7ccf79272ea', '57eed282-076b-bafd-1848-ac02b4c9b884'),
  ('9f633322-4373-c34b-1c48-f7ccf79272ea', 'b3656dc0-7046-cce1-efe8-938b520a4b9e'),
  ('b2fd296c-8138-f585-ecf7-5fb361123bb2', 'a5b36922-a538-452e-947b-a3ee16b9af85'),
  ('b2fd296c-8138-f585-ecf7-5fb361123bb2', '3954d4cf-d9a1-466d-a0e4-2a7150eadf54'),
  ('b2fd296c-8138-f585-ecf7-5fb361123bb2', 'f8320c8a-9256-9d2a-c7d5-a052903afaf1'),
  ('b2fd296c-8138-f585-ecf7-5fb361123bb2', 'e4b00377-9bf0-8c53-6de2-2b5f23295900'),
  ('eaf2b488-4fb5-5452-0590-2bf5b933a86a', '9c71f4a3-0762-fe63-875e-94eaf08c98eb'),
  ('eaf2b488-4fb5-5452-0590-2bf5b933a86a', '57eed282-076b-bafd-1848-ac02b4c9b884'),
  ('eaf2b488-4fb5-5452-0590-2bf5b933a86a', 'e6b157cb-8309-c72e-e5ff-14f071770737'),
  ('eaf2b488-4fb5-5452-0590-2bf5b933a86a', '87164eaf-7492-803d-5311-00625f56c893'),
  ('dabf4bb3-03e2-435b-6e6b-10e2a63ca729', '06f3ef17-8580-fc41-f2cd-b84d73fc14d1'),
  ('dabf4bb3-03e2-435b-6e6b-10e2a63ca729', '2fe4fb01-d460-767b-5319-9c0cb79e43a1'),
  ('dabf4bb3-03e2-435b-6e6b-10e2a63ca729', '45f004e2-25c7-159e-f4aa-89d131ea8e4b'),
  ('dabf4bb3-03e2-435b-6e6b-10e2a63ca729', '829a77a8-06a5-1fa6-3b6f-2c334a41c3f5'),
  ('89a2f247-c3f3-61f1-24ef-422dbf417860', 'd79a16c9-be48-6e99-0031-d62a6eaf75b0'),
  ('89a2f247-c3f3-61f1-24ef-422dbf417860', '192202b8-2e59-f5b8-0647-c4110a1abe6d'),
  ('89a2f247-c3f3-61f1-24ef-422dbf417860', '65e225bd-f56f-2036-a401-6ec9b1bb6e2e'),
  ('89a2f247-c3f3-61f1-24ef-422dbf417860', 'e71bc50c-1688-7e3a-762e-372b7547f96c'),
  ('89a2f247-c3f3-61f1-24ef-422dbf417860', '74b60e4b-2e91-d231-4c54-90057500d38c'),
  ('be53839f-c24d-b9fa-0e49-f43b06cc06e2', 'c6721568-9804-e525-a20e-bbc084f6c925'),
  ('be53839f-c24d-b9fa-0e49-f43b06cc06e2', 'b6c5b879-f7eb-4ce5-b865-c2a0148913cf'),
  ('be53839f-c24d-b9fa-0e49-f43b06cc06e2', '3004a68c-054f-8b74-0016-572ed1d4bc68'),
  ('be53839f-c24d-b9fa-0e49-f43b06cc06e2', '9c228ea5-bdcc-4ffd-f5eb-66dd0f7eef3b'),
  ('be53839f-c24d-b9fa-0e49-f43b06cc06e2', '2a0c7f77-761f-8199-efe7-ab72ac1d68d6'),
  ('26660285-e2bd-645f-ee55-56a0e41f9050', '9fec721e-6ed5-01de-bc94-5672772d9fba'),
  ('26660285-e2bd-645f-ee55-56a0e41f9050', '633cff17-e21b-ad4a-951d-55e8f9d34f1f'),
  ('26660285-e2bd-645f-ee55-56a0e41f9050', '76a32807-333d-54af-a01a-3ad609b2e9f7'),
  ('26660285-e2bd-645f-ee55-56a0e41f9050', '9ada64a7-1225-dc19-6a07-74327ab293ec'),
  ('26660285-e2bd-645f-ee55-56a0e41f9050', 'ca4af6d9-da0d-c0a0-a5d2-d63bd39f5f94')
ON CONFLICT (blog_id, tag_id) DO NOTHING;

COMMIT;
