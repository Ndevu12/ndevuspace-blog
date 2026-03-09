# ndevuspace Blog

A modern tech blog built with **Next.js 16**, **React 19**, and **Tailwind CSS v4**. Covers software engineering, web development, and technology topics.

**Live:** [blog.ndevuspace.com](https://blog.ndevuspace.com) · **Portfolio:** [ndevuspace.com](https://www.ndevuspace.com)

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
├── components/
│   ├── layout/             # Header, Footer, Sidebar
│   └── ui/                 # shadcn/ui primitives (30+)
├── features/
│   ├── auth/               # AuthContext, AuthGuard, LoginForm
│   ├── blog/               # BlogPage, BlogDetailPage, stores
│   ├── comments/           # CommentForm, CommentList
│   └── dashboard/          # Admin features
├── hooks/                  # 10 custom hooks
├── lib/                    # Constants, utils, SEO config, env
├── services/               # API + dummy service layer
├── data/                   # Dummy blogs & categories
└── types/                  # TypeScript domain types
```

## Service Architecture

The app uses an **environment-aware service layer**. At module evaluation time, the resolved service picks either the real API or in-memory dummy data:

```
NEXT_PUBLIC_USE_DUMMY_DATA=true  →  dummyBlogService
NEXT_PUBLIC_USE_DUMMY_DATA=false →  blogService (real API)
```

Write operations (admin) always go through the real API.

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
| `NEXT_PUBLIC_API_BASE_URL` | Backend API URL | `https://my-brand-backend-apis.onrender.com/v1` |
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

## Blog Categories

Web Development · Design · Technology · DevOps · Cloud Computing · Architecture · Tutorials

## Author

**Jean Paul Elisa NIYOKWIZERWA** — [GitHub](https://github.com/Ndevu12) · [ndevuspace.com](https://www.ndevuspace.com) · [ndevulion@gmail.com](mailto:ndevulion@gmail.com)

## License

[MIT](LICENSE)
