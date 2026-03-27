# ndevuspace Blog

A modern tech blog built with **Next.js 16**, **React 19**, and **Tailwind CSS v4**. Covers software engineering, web development, and technology topics.

**Live:** [Blogs](https://blog.ndevuspace.com) · **Portfolio:** [NdevuSpace](https://www.ndevuspace.com)

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| UI | React 19, Tailwind CSS v4, shadcn/ui (base-nova) |
| State | Zustand 5 |
| Validation | Zod 4 |
| Editor | Custom rich text editor |
| Charts | Recharts |
| Animations | Framer Motion |
| Icons | Lucide React |
| Theme | next-themes (dark default, system-aware) |
| Type Safety | TypeScript 5, strict mode |

## Features

- **Blog** — Paginated listing, category/tag filtering, search, featured & new badges
- **Blog Detail** — Full article view, related posts, comments, likes, share
- **Dashboard** — Admin panel with blog CRUD, category management, analytics overview
- **Auth** — Login/logout with route guards
- **SEO** — Dynamic OpenGraph/Twitter images, sitemap (hourly revalidation), robots.txt
- **Dark Mode** — System-aware with manual toggle
- **Dummy Data Mode** — Full offline development with realistic sample data

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx            # Redirects to /blog
│   ├── blog/
│   │   ├── page.tsx        # Blog listing (server component)
│   │   └── [slug]/page.tsx # Blog detail
│   ├── auth/               # Login & logout
│   └── dashboard/          # Admin panel (auth-guarded)
│       ├── blogs/          # Blog CRUD
│       └── categories/     # Category management
├── components/             # Shared UI (layout + shadcn/ui primitives)
├── features/               # Self-contained feature modules (preferred)
│   ├── <featureName>/
│   │   ├── components/     # Feature UI (optional)
│   │   ├── hooks/          # `use*` hooks (optional)
│   │   ├── services/       # Feature service functions (optional)
│   │   ├── store/          # Zustand stores (optional)
│   │   ├── types/          # Feature-local types (optional)
│   │   ├── utils/          # Feature-local helpers (optional)
│   │   └── index.ts        # Public feature exports (required)
│   └── ...
├── lib/                    # Shared config/env/utils/SEO helpers
├── services/               # Cross-feature services (API, dummy services)
├── data/                   # Dummy blogs & categories
└── types/                  # Cross-feature domain types
```

## Feature Folder Rules

Feature code must be **self-contained** and follow the per-feature structure (`hooks/`, `store/`, `services/`, etc.). See `[docs/FEATURES.md](docs/FEATURES.md)`.

## Service Architecture

The app uses an **environment-aware service layer**. At module evaluation time, the resolved service picks either the real API or in-memory dummy data:

```
NEXT_PUBLIC_USE_DUMMY_DATA=true  →  dummyBlogService
NEXT_PUBLIC_USE_DUMMY_DATA=false →  blogService (real API)
```

Write operations (admin) always go through the real API.

## Supabase migrations and RPC policy

- **Pre-production:** Prefer **editing existing migration files** under `supabase/migrations/` when changing schema, RLS, helpers, or RPCs, instead of stacking many small fix migrations.
- **After local rewrites:** Run **`supabase db reset`** so your database matches the updated migration chain.
- **Post-production:** Once history is irreversible, use **append-only** new migrations only; do not rewrite old files.
- **RPC exposure:** Grant `EXECUTE` on **user-facing** RPCs to clients as needed; **SQL helpers** should not be exposed via PostgREST to `anon` / `authenticated` (revoke helper execution from client roles).
- **Codebase:** Use **canonical** service and type paths only—no permanent `*V2` or parallel RPC-only service modules.
- **Repo hygiene:** Remove orphaned/replaced blog modules in the same change where call sites move, and keep docs aligned with the canonical paths and migration policy.

Details: [docs/MIGRATIONS.md](docs/MIGRATIONS.md).

## Getting Started

### Prerequisites

- Node.js 20+
- Yarn

### Setup

```bash
# Clone
git clone https://github.com/Ndevu12/ndevuspace-blog.git
cd ndevuspace-blog

# Install dependencies
yarn install

# Configure environment
cp .env.example .env
```

### Environment Variables

| Variable | Description | Default |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Public site URL | `https://blog.ndevuspace.com` |
| `NEXT_PUBLIC_USE_DUMMY_DATA` | Use in-memory dummy data | `false` |

### Development

```bash
yarn dev          # Start dev server with Turbopack (http://localhost:3000)
```

### Build

```bash
yarn build        # Production build
yarn start        # Start production server
```

### Lint

```bash
yarn lint         # Run ESLint
```

## Routes

| Path | Description |
|---|---|
| `/` | Redirects to `/blog` |
| `/blog` | Blog listing with filters |
| `/blog/:slug` | Blog detail page |
| `/auth/login` | Login |
| `/dashboard` | Admin overview |
| `/dashboard/blogs` | Blog management |
| `/dashboard/blogs/new` | Create blog |
| `/dashboard/blogs/:id/edit` | Edit blog |
| `/dashboard/categories` | Category management |


## License

[MIT](LICENSE)
