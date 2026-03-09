# Standalone Blog System — Implementation Instructions

This document defines the complete implementation plan for the **ndevuspace blog** system — a standalone Next.js application hosted at `blog.ndevuspace.com`. It covers project scaffolding, architecture, component strategy, feature porting, API integration, and cleanup of legacy code.

> **Context**: The portfolio site is already hosted at `www.ndevuspace.com` (root-level Next.js app in this repo). This instruction covers extracting and building the blog system from existing implementations across `my-brand-nextjs/` (Phase 2 — TypeScript/Next.js) and `src/` (Phase 1 — HTML/CSS/JS), then cleaning up legacy folders.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack & Dependencies](#2-tech-stack--dependencies)
3. [Folder Structure](#3-folder-structure)
4. [Component Strategy](#4-component-strategy)
5. [Implementation Phases](#5-implementation-phases)
   - [Phase A: Project Scaffolding](#phase-a-project-scaffolding)
   - [Phase B: Core Infrastructure](#phase-b-core-infrastructure)
   - [Phase C: Public Blog Features](#phase-c-public-blog-features)
   - [Phase D: Auth & Admin Dashboard](#phase-d-auth--admin-dashboard)
   - [Phase E: Layout, Styles & SEO](#phase-e-layout-styles--seo)
   - [Phase F: Dev Data & Environment](#phase-f-dev-data--environment)
   - [Phase G: Cleanup](#phase-g-cleanup)
6. [Source File Mapping](#6-source-file-mapping)
7. [API Endpoints Reference](#7-api-endpoints-reference)
8. [Code Guidelines](#8-code-guidelines)
9. [Verification Checklist](#9-verification-checklist)

---

## 1. Project Overview

### Goal

Create a self-contained blog management system inside `blog/` at the repository root. This system serves two audiences:

- **Public readers** — Blog listing, search, category filtering, blog detail with comments, likes
- **Admin** — Blog CRUD, category management, analytics dashboard

### Source Implementations

| Phase | Location | Stack | Blog Features |
|-------|----------|-------|---------------|
| Phase 1 | `src/` | HTML/CSS/JS | Full blog system with CRUD, comments, categories, tags, search, pagination, likes, admin dashboard with charts, rich text editor (TinyMCE), dummy data fallback, notification toasts |
| Phase 2 | `my-brand-nextjs/` | Next.js 15 / TypeScript / Tailwind | TypeScript blog system with SSR metadata, feature-based architecture, service layer with centralized error handling, blog CRUD, comments, categories, tags, social sharing, Table of Contents, admin dashboard |
| Phase 3 | `portfolio/` | Next.js / TypeScript / Tailwind | **No blog code** — portfolio only |
| Phase 4 | Root `app/` | Next.js / TypeScript / Tailwind | **No blog code** — portfolio only |

### Merge Strategy

Use **Phase 2 (`my-brand-nextjs/`)** as the architectural base (TypeScript, Next.js App Router, feature-based, SSR, typed services). Supplement with missing features from **Phase 1 (`src/`)**:

- Category CRUD (admin create/update/delete categories)
- Like toggle with localStorage persistence
- Notification toast system
- Comment deletion
- Dummy data fallback for development
- Dashboard analytics charts

---

## 2. Tech Stack & Dependencies

All dependencies must use their **latest stable versions** at time of implementation.

### Core Framework

| Package | Purpose |
|---------|---------|
| `next` (latest) | App Router, SSR, file-based routing |
| `react` + `react-dom` (latest) | UI library |
| `typescript` (latest) | Type safety |
| `tailwindcss` (latest) | Utility-first CSS |
| `@tailwindcss/typography` (latest) | Prose styling for blog content |

### UI Component Library — shadcn/ui

**All base UI primitives come from shadcn/ui** — do NOT build buttons, cards, inputs, tables, etc. from scratch.

| shadcn Component | Blog System Usage |
|-----------------|-------------------|
| `button` | All buttons across the app |
| `badge` | Category badges, status tags, tag pills |
| `card` | Blog cards, stat cards, sidebar cards |
| `input` | Search inputs, form fields |
| `textarea` | Comment form, blog description |
| `label` | Form labels |
| `separator` | Content dividers |
| `skeleton` | Loading states for all data-fetching components |
| `avatar` | Author avatars, commenter avatars |
| `scroll-area` | Category tabs overflow, Table of Contents |
| `navigation-menu` | Main site navigation |
| `breadcrumb` | Blog detail page breadcrumbs |
| `tabs` | Category filter tabs |
| `pagination` | Blog listing, admin tables |
| `table` | Admin blog list, categories |
| `tooltip` | Action buttons, share buttons |
| `hover-card` | Author preview |
| `toast` (sonner) | Success/error notifications |
| `alert` | Info/warning messages |
| `alert-dialog` | Delete confirmations |
| `dialog` | Create/edit category modal |
| `form` | All forms (integrates react-hook-form + zod) |
| `select` | Filter dropdowns, category selector |
| `checkbox` | Admin bulk actions |
| `switch` | Draft/publish toggle |
| `dropdown-menu` | Action menus in admin tables |
| `popover` | Date picker, filter popover |
| `command` | Enhanced search with keyboard navigation |
| `sheet` | Mobile sidebar navigation |
| `sidebar` | Dashboard sidebar layout — use shadcn's full prebuilt sidebar (`SidebarProvider`, `SidebarTrigger`, `SidebarContent`, `SidebarGroup`, `SidebarMenu`, `SidebarMenuItem`, `SidebarMenuButton`, `SidebarFooter`, `SidebarHeader`, `SidebarInset`) |
| `collapsible` | Table of Contents sections |

### Additional Dependencies

| Package | Purpose |
|---------|---------|
| `lucide-react` (latest) | Icon library (shadcn default) |
| `framer-motion` (latest) | Page transitions, micro-animations |
| `@tinymce/tinymce-react` (latest) | Rich text editor for blog creation/editing |
| `zod` (latest) | Schema validation for forms |
| `react-hook-form` + `@hookform/resolvers` (latest) | Form state management (shadcn form integration) |
| `zustand` (latest) | Client state management — replaces crowded `useState` in feature components. Each feature gets its own store file. |
| `recharts` (latest) | Dashboard analytics charts — import `AreaChart`, `BarChart`, `LineChart`, `PieChart`, `ResponsiveContainer`, `XAxis`, `YAxis`, `Tooltip`, `CartesianGrid`, `Area`, `Bar`, `Line`, `Pie`, `Cell`, `Legend` from `recharts`. Use shadcn's prebuilt `ChartContainer`, `ChartTooltip`, `ChartTooltipContent`, `ChartLegend`, `ChartLegendContent` wrappers from `@/components/ui/chart` for consistent theming. |
| `date-fns` (latest) | Date formatting and manipulation |
| `sonner` (latest) | Toast notification provider (shadcn toast backend) |
| `next-themes` (latest) | Dark/light theme switching (shadcn-compatible, replaces custom ThemeContext) |
| `clsx` + `tailwind-merge` | Class merging utility — auto-installed by shadcn init as `cn()` |

### Package Manager

This project uses **yarn** as the package manager. All commands must use `yarn` — never `npm`.

### What NOT to Install

- ~~`chart.js`~~ — replaced by `recharts`
- ~~`class-variance-authority`~~ — auto-installed by shadcn if needed
- ~~`@radix-ui/*`~~ — auto-installed as shadcn peer dependencies
- ~~Custom Button/Card/Badge/Input~~ — use shadcn instead
- ~~`redux` / `@reduxjs/toolkit`~~ — replaced by `zustand` for simpler, lighter state management
- ~~Custom `useContext` for complex state~~ — use zustand stores instead; reserve React Context only for dependency injection (e.g., auth provider)

---

## 3. Folder Structure

```
blog/
├── src/
│   ├── app/
│   │   ├── layout.tsx                    # Root layout (ThemeProvider, Toaster, fonts)
│   │   ├── page.tsx                      # Main blog listing page (root route)
│   │   ├── loading.tsx                   # Blog listing loading state
│   │   ├── not-found.tsx                 # 404 page
│   │   ├── robots.ts                    # SEO robots
│   │   ├── sitemap.ts                   # SEO sitemap
│   │   ├── opengraph-image.tsx          # Default OG image
│   │   │
│   │   ├── [slug]/
│   │   │   ├── page.tsx                 # Blog detail route (SSR metadata)
│   │   │   └── loading.tsx
│   │   │
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   │   └── page.tsx             # Login page
│   │   │   └── logout/
│   │   │       └── page.tsx             # Logout handler
│   │   │
│   │   └── dashboard/
│   │       ├── layout.tsx               # Dashboard layout (sidebar + auth guard)
│   │       ├── page.tsx                 # Dashboard overview (analytics)
│   │       ├── blogs/
│   │       │   ├── page.tsx             # All blogs table
│   │       │   ├── new/
│   │       │   │   └── page.tsx         # Create blog
│   │       │   └── [id]/
│   │       │       ├── page.tsx         # Admin blog detail
│   │       │       └── edit/
│   │       │           └── page.tsx     # Edit blog
│   │       └── categories/
│   │           └── page.tsx             # Category management
│   │
│   ├── components/
│   │   ├── ui/                          # shadcn/ui ONLY — generated via CLI
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── input.tsx
│   │   │   ├── ... (all shadcn components)
│   │   │   └── index.ts                # barrel export
│   │   │
│   │   ├── layout/                      # App-level layout components
│   │   │   ├── Header.tsx               # Blog site header + navigation
│   │   │   ├── Footer.tsx               # Footer with links
│   │   │   └── DashboardSidebar.tsx     # Admin sidebar using shadcn SidebarProvider + Sidebar components
│   │   │
│   │   ├── editor/                      # Content editing
│   │   │   └── RichTextEditor.tsx       # TinyMCE wrapper component
│   │   │
│   │   └── shared/                      # Cross-cutting shared components
│   │       ├── ThemeToggle.tsx           # Dark/light toggle (uses next-themes)
│   │       ├── LoadingStates.tsx         # Reusable skeleton layouts
│   │       └── ErrorBoundary.tsx        # Error boundary wrapper
│   │
│   ├── features/
│   │   ├── blog/                        # PUBLIC BLOG FEATURE
│   │   │   ├── store.ts                 # Zustand store for blog listing state (filters, pagination, loading)
│   │   │   ├── detailStore.ts           # Zustand store for blog detail state (likes, comments, sidebar)
│   │   │   ├── BlogPage.tsx             # Blog listing page (consumes store)
│   │   │   ├── BlogDetailPage.tsx       # Blog detail page (consumes detailStore)
│   │   │   ├── components/
│   │   │   │   ├── BlogCard.tsx         # Blog card for grid display
│   │   │   │   ├── FeaturedBlogCard.tsx # Hero/featured blog card
│   │   │   │   ├── BlogSearch.tsx       # Search bar with suggestions
│   │   │   │   ├── BlogSidebar.tsx      # Popular posts, topic cloud (no author card — content-first)
│   │   │   │   ├── CategoryTabs.tsx     # Category filter tabs
│   │   │   │   ├── ShareArticle.tsx     # Social sharing buttons
│   │   │   │   └── TableOfContents.tsx  # Auto-generated TOC with scroll spy
│   │   │   └── index.ts
│   │   │
│   │   ├── comments/                    # COMMENT FEATURE
│   │   │   ├── CommentForm.tsx          # Add comment form (zod validation)
│   │   │   ├── CommentList.tsx          # Comment display list
│   │   │   └── index.ts
│   │   │
│   │   ├── auth/                        # AUTH FEATURE
│   │   │   ├── LoginForm.tsx            # Login form component
│   │   │   ├── AuthGuard.tsx            # Protected route wrapper
│   │   │   ├── AuthContext.tsx          # Auth state context provider
│   │   │   └── index.ts
│   │   │
│   │   └── dashboard/                   # ADMIN DASHBOARD FEATURES
│   │       ├── overview/                # Dashboard analytics
│   │       │   ├── store.ts             # Zustand store for stats + recent activity
│   │       │   ├── DashboardStats.tsx   # Stat cards using shadcn Card (CardHeader, CardTitle, CardContent)
│   │       │   ├── DashboardCharts.tsx  # Charts using shadcn ChartContainer + recharts
│   │       │   └── RecentActivity.tsx   # Recent activity timeline
│   │       │
│   │       ├── blogs/                   # Blog CRUD management
│   │       │   ├── store.ts             # Zustand store for blog listing state (filters, pagination, CRUD)
│   │       │   ├── AllBlogs.tsx         # Blog table with filters/actions
│   │       │   ├── NewBlog.tsx          # Create blog form
│   │       │   ├── EditBlog.tsx         # Edit blog form
│   │       │   ├── AdminBlogDetail.tsx  # Admin blog detail view
│   │       │   └── types.ts            # Admin blog-specific types
│   │       │
│   │       └── categories/              # Category CRUD management
│   │           ├── store.ts             # Zustand store for category CRUD state
│   │           └── CategoryManager.tsx  # Category list + create/edit/delete
│   │
│   ├── services/                        # API SERVICE LAYER
│   │   ├── blogService.ts              # Public blog API (list, get, search, filter, like)
│   │   ├── adminBlogService.ts         # Admin blog API (CRUD, status, filter)
│   │   ├── commentService.ts           # Comment API (add, list, delete)
│   │   ├── categoryService.ts          # Category API (CRUD)
│   │   ├── authService.ts              # Auth API (login, logout, getCurrentUser)
│   │   └── index.ts                    # barrel export
│   │
│   ├── lib/                             # UTILITIES & CONFIGURATION
│   │   ├── utils.ts                    # cn() utility (shadcn auto-generated)
│   │   ├── api.ts                      # safeFetch, extractApiResponse, error handling
│   │   ├── constants.ts                # API_BASE_URL, TINYMCE_CDN, SITE_URL
│   │   ├── textUtils.ts               # Text truncation, excerpt generation
│   │   └── blogUtils.ts               # getAuthorName, getAuthorImage, formatDate
│   │
│   ├── hooks/                           # CUSTOM HOOKS — one hook per folder
│   │   ├── use-scroll-spy/
│   │   │   └── index.ts                # Scroll spy for TOC active state
│   │   ├── use-intersection-observer/
│   │   │   └── index.ts                # IntersectionObserver helper (returns ref)
│   │   ├── use-scroll-direction/
│   │   │   └── index.ts                # Scroll direction via useSyncExternalStore
│   │   ├── use-window-size/
│   │   │   └── index.ts                # Window dimensions via useSyncExternalStore
│   │   ├── use-auth/
│   │   │   └── index.ts                # Auth state hook (uses React 19 `use()`)
│   │   ├── use-mobile-hook/
│   │   │   └── index.ts                # Mobile breakpoint detection via useSyncExternalStore
│   │   ├── use-debounced-value/
│   │   │   └── index.ts                # Generic debounce hook for search inputs etc.
│   │   ├── use-categories/
│   │   │   └── index.ts                # Fetch categories for form selects
│   │   ├── use-tag-input/
│   │   │   └── index.ts                # Tag input management (add/remove/keydown)
│   │   └── index.ts                    # barrel export
│   │
│   ├── types/                           # TYPE DEFINITIONS
│   │   ├── blog.ts                     # BlogPost, Author, BlogComment, BlogCategory,
│   │   │                               # BlogSearchFilters, BlogMetadata, BlogServerResponse
│   │   ├── admin.ts                    # AdminBlogPost, BlogAdminFilters, BlogFormData,
│   │   │                               # AdminPagination, table/filter/action props
│   │   ├── auth.ts                    # User, AuthState, LoginCredentials
│   │   └── index.ts                   # barrel export
│   │
│   ├── data/                            # DEVELOPMENT DATA
│   │   ├── dummyBlogs.ts              # Rich dummy blog content (from Phase 1)
│   │   └── blogLoader.ts             # Toggle between API and dummy data
│   │
│   └── styles/
│       └── globals.css                 # shadcn CSS variables + brand overrides
│                                       # + @tailwindcss/typography prose + editor styles
│
├── public/
│   └── images/
│       └── blog/                       # Blog placeholder images
│
├── docs/
│   └── api-endpoints.md               # API reference (moved from list_of_endpoints.prompt.md)
│
├── components.json                     # shadcn/ui configuration
├── .env.local                          # Environment variables (gitignored)
├── .env.example                        # Env template (committed)
├── package.json
├── next.config.ts
├── tailwind.config.ts
├── postcss.config.mjs
└── tsconfig.json
```

### Organization Principles

- **`components/ui/`** — shadcn/ui primitives ONLY. Never put custom components here.
- **`components/layout/`** — App-level structural components (header, footer, sidebar).
- **`components/editor/`** — Content editing components (rich text editor).
- **`components/shared/`** — Cross-cutting utility components (theme toggle, loading states, error boundaries).
- **`features/`** — Domain-specific features, each self-contained with their own components, types, and logic. Feature components are NOT designed for reuse outside their feature.
- **`services/`** — API communication layer. One service per backend resource. All services use `safeFetch` from `lib/api.ts`.
- **`lib/`** — Pure utilities, configuration, and helper functions. No React components.
- **`types/`** — Shared TypeScript type definitions. Feature-local types live in `features/<name>/types.ts`.
- **`hooks/`** — Custom React hooks that are shared across multiple features.

---

## 4. Component Strategy

### Rule: shadcn/ui First

Before building any UI component, check if shadcn/ui provides it. If it does, install it via `npx shadcn@latest add <component>`. Only build custom components for domain-specific logic that shadcn doesn't cover.

### shadcn/ui Configuration

Initialize with:
```bash
npx shadcn@latest init
```

Configuration choices:
- **Style**: New York
- **Base color**: Slate
- **CSS variables**: Yes
- **Path aliases**: `@/` → `src/`
- **Components path**: `src/components/ui`
- **Utils path**: `src/lib/utils`

### Component Categorization

Components are categorized by **functionality**, not by atomic design (atoms/molecules/organisms):

| Category | Location | Contents | Reusable? |
|----------|----------|----------|-----------|
| **UI Primitives** | `components/ui/` | shadcn/ui components | Yes — app-wide |
| **Layout** | `components/layout/` | Header, Footer, DashboardSidebar | Yes — app-wide |
| **Editor** | `components/editor/` | RichTextEditor | Yes — used in new/edit blog |
| **Shared** | `components/shared/` | ThemeToggle, LoadingStates, ErrorBoundary | Yes — app-wide |
| **Blog** | `features/blog/components/` | BlogCard, FeaturedCard, Search, Sidebar, Tabs, TOC, Share | Feature-scoped |
| **Comments** | `features/comments/` | CommentForm, CommentList | Feature-scoped |

| **Auth** | `features/auth/` | LoginForm, AuthGuard, AuthContext | Feature-scoped |
| **Dashboard** | `features/dashboard/*/` | Admin tables, forms, charts | Feature-scoped |

### Form Strategy

All forms use the **shadcn `form` component** which integrates:
1. **`react-hook-form`** for state management
2. **`zod`** for schema validation
3. **shadcn `input`/`textarea`/`select`** for field rendering
4. **shadcn `toast` (sonner)** for submission feedback

Example pattern:
```typescript
// 1. Define zod schema
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// 2. Use in shadcn Form
<Form {...form}>
  <FormField name="email" render={({ field }) => (
    <FormItem>
      <FormLabel>Email</FormLabel>
      <FormControl><Input {...field} /></FormControl>
      <FormMessage />
    </FormItem>
  )} />
</Form>
```

### Theme Strategy

Use **`next-themes`** (NOT a custom ThemeContext):
```typescript
// In root layout.tsx
import { ThemeProvider } from "next-themes";

<ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
  {children}
</ThemeProvider>
```

All shadcn components automatically respect the theme via CSS variables. Custom components must use the shadcn CSS variable tokens (`bg-background`, `text-foreground`, `bg-card`, `text-muted-foreground`, etc.) instead of hardcoded colors.

### Notification Strategy

Use **`sonner`** via shadcn's `toast`:
```typescript
import { toast } from "sonner";

// Success
toast.success("Blog published successfully");

// Error
toast.error("Failed to save blog");
```

This replaces the custom notification system from Phase 1 (`notificationUtils.js`).

---

## 5. Implementation Phases

### Workflow Protocol

> **CRITICAL**: These rules govern how phases are executed. Follow them exactly.

#### Phase Gating — Wait for User Approval

Phases **MUST** be executed sequentially, one at a time. After completing **all steps** within the current phase:

1. **Summarize** what was completed (files created, services ported, components built, etc.).
2. **Run verification** — confirm the project builds (`yarn build`) and lints (`yarn lint`) cleanly at the end of each phase.
3. **Report** any issues, decisions made, or deviations from the plan.
4. **STOP and wait** for the user's explicit go-ahead (e.g., "proceed", "continue", "go ahead") before starting the next phase.

**Do NOT** begin the next phase automatically. Do NOT ask "should I continue?" and then proceed anyway. The user will decide when to move forward.

#### Todo List Tracking — Per Phase

When starting a new phase, **immediately create a todo list** (using `manage_todo_list`) that breaks down every step in that phase into trackable items. Follow this workflow:

1. **Before starting a phase**: Create the full todo list with all steps from the phase table (e.g., A1–A7 for Phase A). Each todo item should map to one step in the phase table. Set all items to `not-started`.
2. **Before working on a step**: Mark that specific todo as `in-progress` (only one at a time).
3. **After completing a step**: Mark that todo as `completed` immediately — do not batch completions.
4. **After all steps are done**: Ensure all todos are marked `completed`, then deliver the phase summary and wait for approval.

This provides the user with real-time visibility into progress within each phase.

#### Phase Execution Order

```
Phase A → [wait] → Phase B → [wait] → Phase C → [wait] → Phase D → [wait] → Phase E → [wait] → Phase F → [wait] → Phase G → [done]
```

Each `[wait]` is a hard stop where the user must approve continuation.

---

### Phase A: Project Scaffolding

**Goal**: Set up the `blog/` project with latest dependencies and shadcn/ui.

| Step | Task | Details |
|------|------|---------|
| A1 | Initialize Next.js project | `yarn create next-app blog --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"` (select **yarn** as package manager when prompted) |
| A2 | Initialize shadcn/ui | `cd blog && npx shadcn@latest init` (New York style, Slate base, CSS variables enabled) |
| A3 | Install shadcn components | `npx shadcn@latest add button badge card input textarea label separator skeleton avatar scroll-area navigation-menu breadcrumb tabs pagination table tooltip hover-card toast alert alert-dialog dialog form select checkbox switch dropdown-menu popover command sheet sidebar collapsible chart` |
| A4 | Install additional deps | `yarn add lucide-react framer-motion @tinymce/tinymce-react zod react-hook-form @hookform/resolvers recharts date-fns sonner next-themes @tailwindcss/typography` |
| A5 | Configure Tailwind theme | Port brand colors from `my-brand-nextjs/tailwind.config.ts` into shadcn CSS variables. Add `@tailwindcss/typography` prose customization. |
| A6 | Create `.env.example` | Document required env vars |
| A7 | Create folder structure | Set up all directories per Section 3 |

### Phase B: Core Infrastructure

**Goal**: Port types, services, utilities, and shared infrastructure.

| Step | Task | Source |
|------|------|--------|
| B1 | Port type definitions | **Primary**: `my-brand-nextjs/src/types/blog.ts`, `my-brand-nextjs/src/types/admin/types.ts`. **Add**: Auth types. Add `zod` schemas for each type used in forms. |
| B2 | Port API utility layer | `my-brand-nextjs/utils/apiResponse.ts` → `blog/src/lib/api.ts`. Includes `safeFetch()` with centralized error handling, `extractApiResponse()`. |
| B3 | Port blog service | `my-brand-nextjs/src/services/blogService.ts`. **Add** `likeBlog()` from `src/scripts/actions/blogs/blogActions.js`. |
| B4 | Port admin blog service | `my-brand-nextjs/src/features/dashboard/blogs/allBlogs/services.ts` + `blogDetail/services.ts` → `blog/src/services/adminBlogService.ts`. |
| B5 | Port comment service | `my-brand-nextjs/src/services/comment/commentService.ts`. **Add** `deleteComment()` from `src/scripts/actions/blogs/commentActions.js`. |
| B6 | Create category service | **New** — TypeScript port of `src/scripts/actions/categories/categoryActions.js`. Full CRUD: `getAllCategories`, `getCategoryById`, `createCategory`, `updateCategory`, `deleteCategory`. |
| B7 | Port auth service | `my-brand-nextjs/src/services/authService.ts` → `blog/src/services/authService.ts`. Cookie-based auth with `credentials: 'include'`. |
| B8 | Port utilities | `cn()` (auto from shadcn), `constants.ts` (from `my-brand-nextjs/src/lib/constants.ts`), `textUtils.ts` (from `my-brand-nextjs/utils/textLengthReducer.ts`), `blogUtils.ts` (from `my-brand-nextjs/utils/blogUtils.ts`). |
| B9 | Port hooks | `useScrollSpy`, `useIntersectionObserver` from root `hooks/index.ts`. Create `useAuth` hook wrapping AuthContext. |
| B10 | Set up auth context | `features/auth/AuthContext.tsx` — port from Phase 2 patterns + Phase 1 `protectedRoute.js` logic. |
| B11 | Set up theme provider | Configure `next-themes` in root layout (replaces custom ThemeContext). |

### Phase C: Public Blog Features

**Goal**: Port all public-facing blog functionality.

| Step | Task | Source | shadcn Components Used |
|------|------|--------|----------------------|
| C1 | Blog listing page (root `/`) | `my-brand-nextjs/src/features/blog/BlogPage.tsx` (666 lines). This is the main entry point — no separate landing page. | `input`/`command`, `tabs`, `pagination`, `skeleton`, `select`, `badge` |
| C2 | Blog card | `my-brand-nextjs/src/features/blog/components/BlogCard.tsx` | `card`, `badge`, `avatar` |
| C3 | Featured blog card | `my-brand-nextjs/src/features/blog/components/FeaturedBlogCard.tsx` | `card`, `badge` |
| C4 | Blog search | `my-brand-nextjs/src/features/blog/components/BlogSearch.tsx` | `command` or `input` |
| C5 | Category tabs | `my-brand-nextjs/src/features/blog/components/CategoryTabs.tsx` | `tabs`, `scroll-area` |
| C6 | Blog sidebar | `my-brand-nextjs/src/features/blog/components/BlogSidebar.tsx` | `card`, `avatar`, `badge`, `separator` |
| C7 | Blog detail page | `my-brand-nextjs/src/features/blog/BlogDetailPage.tsx` (394 lines). **Add** like toggle from `src/utils/interactionUtils.js`. | `breadcrumb`, `separator`, `avatar`, `badge`, `button` |
| C8 | Table of Contents | `my-brand-nextjs/src/features/blog/components/TableOfContents.tsx` (188 lines) | `scroll-area`, `collapsible` |
| C9 | Share article | `my-brand-nextjs/src/features/blog/components/ShareArticle.tsx` | `button`, `tooltip`, `dropdown-menu` |
| C10 | Comment form | `my-brand-nextjs/src/features/comments/CommentForm.tsx` | `form`, `input`, `textarea`, `button` |
| C11 | Comment list | `my-brand-nextjs/src/features/comments/CommentList.tsx` | `card`, `avatar`, `separator`, `skeleton` |
| C12 | App routes | Wire `app/page.tsx` (blog listing), `app/[slug]/page.tsx` (blog detail) with SSR metadata | — |

### Phase D: Auth & Admin Dashboard

**Goal**: Port authentication and admin dashboard with blog management.

| Step | Task | Source | shadcn Components Used |
|------|------|--------|----------------------|
| D1 | Login page | `my-brand-nextjs/src/app/auth/login/` + `authService.ts` | `card`, `form`, `input`, `button` |
| D2 | Auth guard | `src/scripts/context/protectedRoute.js` + Phase 2 auth context | — |
| D3 | Dashboard layout | Use shadcn's **prebuilt sidebar system** — import `SidebarProvider`, `Sidebar`, `SidebarContent`, `SidebarGroup`, `SidebarGroupLabel`, `SidebarGroupContent`, `SidebarMenu`, `SidebarMenuItem`, `SidebarMenuButton`, `SidebarHeader`, `SidebarFooter`, `SidebarInset`, `SidebarTrigger` from `@/components/ui/sidebar`. Wrap dashboard layout in `<SidebarProvider>`. Reference `my-brand-nextjs/src/features/dashboard/dashboardLayout/`. | `sidebar`, `sheet`, `collapsible`, `separator`, `avatar`, `dropdown-menu` |
| D4 | Dashboard overview | Use shadcn's **prebuilt chart components** — import `ChartContainer`, `ChartTooltip`, `ChartTooltipContent`, `ChartLegend`, `ChartLegendContent` from `@/components/ui/chart`. Install the `chart` shadcn component (`npx shadcn@latest add chart`). Wrap `recharts` charts (`AreaChart`, `BarChart`, `LineChart`, `PieChart`) inside `<ChartContainer>` with a `chartConfig` object for consistent theme colors. Use shadcn `card` (`CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`) for stat cards. Reference `src/scripts/dashboard/dashboardCharts.js`. | `card`, `chart`, recharts |
| D5 | All blogs admin | `my-brand-nextjs/src/features/dashboard/blogs/allBlogs/AllBlogs.tsx` | `table`, `pagination`, `dropdown-menu`, `badge`, `select`, `alert-dialog`, `skeleton` |
| D6 | Create blog | `my-brand-nextjs/src/features/dashboard/blogs/newBlog/NewBlog.tsx` | `form`, `input`, `select`, `switch`, `button`, TinyMCE editor |
| D7 | Edit blog | `my-brand-nextjs/src/features/dashboard/blogs/edit/` | Same as D6 |
| D8 | Admin blog detail | `my-brand-nextjs/src/features/dashboard/blogs/blogDetail/AdminBlogDetail.tsx` | `card`, `badge`, `button`, `alert-dialog` |
| D9 | Category management | **New** — from `src/components/categoryManager.js` + `src/scripts/actions/categories/categoryActions.js` | `table`, `dialog`, `form`, `input`, `alert-dialog` |
| D10 | Admin routes | Wire all `app/dashboard/*` routes with layout + auth guard | — |

### Phase E: Layout, Styles & SEO

**Goal**: Blog-specific header/footer, global styles, and SEO optimization.

| Step | Task | Details |
|------|------|---------|
| E1 | Blog header | Navigation using shadcn `navigation-menu` + `sheet` (mobile). Links: Home, Blog, Categories. Include `ThemeToggle`. Link back to `www.ndevuspace.com`. |
| E2 | Blog footer | Social links + copyright. Use shadcn `separator`. Link back to main portfolio site. |
| E3 | Dashboard sidebar | Using shadcn's prebuilt `sidebar` component system. Import `SidebarProvider`, `Sidebar`, `SidebarContent`, `SidebarGroup`, `SidebarMenu`, `SidebarMenuItem`, `SidebarMenuButton`, `SidebarHeader`, `SidebarFooter`, `SidebarTrigger` from `@/components/ui/sidebar`. Nav items: Overview, Blogs, Categories. Use `SidebarMenuButton` with `lucide-react` icons (`LayoutDashboard`, `FileText`, `FolderOpen`). Mobile: uses built-in `sheet` overlay automatically. |
| E4 | Global styles | shadcn CSS variables as base + brand color overrides + `@tailwindcss/typography` prose customization (from `my-brand-nextjs/tailwind.config.ts`) + blog content styles (from `src/styles/blog-detail.css`) + rich text editor styles (from `my-brand-nextjs/src/styles/globals.css`). |
| E5 | SEO metadata | `metadata` on all routes using Next.js Metadata API. Generate dynamic OG images. Set `metadataBase` to `https://blog.ndevuspace.com`. |
| E6 | robots.ts | Reference root `app/robots.ts` pattern. |
| E7 | sitemap.ts | Dynamic sitemap generating URLs from blog API. |
| E8 | Rich text editor component | Port TinyMCE wrapper from `src/components/richTextEditor.js` to React/TypeScript in `blog/src/components/editor/RichTextEditor.tsx`. |

### Phase F: Dev Data & Environment

**Goal**: Development support with dummy data and environment configuration.

| Step | Task | Details |
|------|------|---------|
| F1 | Port dummy blogs | Convert `src/data/dummyBlogs.js` (1277 lines) to TypeScript `blog/src/data/dummyBlogs.ts`. Type with `BlogPost` interface. |
| F2 | Data source toggle | Port `src/utils/blogLoader.js` pattern → `blog/src/data/blogLoader.ts`. Switch between API and dummy data based on env flag (`NEXT_PUBLIC_USE_DUMMY_DATA`). |
| F3 | .env.example | `NEXT_PUBLIC_API_BASE_URL=https://my-brand-backend-apis.onrender.com/v1`, `NEXT_PUBLIC_TINYMCE_API_KEY=`, `NEXT_PUBLIC_SITE_URL=https://blog.ndevuspace.com`, `NEXT_PUBLIC_USE_DUMMY_DATA=false` |
| F4 | Port blog images | Copy `src/images/blogImages/*` → `blog/public/images/blog/` as development placeholders. |

### Implementation Tracking

Completed phases:

- [x] Phase A: Project Scaffolding --> Completed
- [x] Phase B: Core Infrastructure --> Completed
- [x] Phase C: Public Blog Features --> Completed
- [x] Phase D: Auth & Admin Dashboard --> Completed
- [x] Phase E: Layout, Styles & SEO --> Completed
- [x] Phase F: Dev Data & Environment --> Completed

## 6. Source File Mapping

This maps every file in the new `blog/` system to its source(s) in the existing codebase.

### Types (`blog/src/types/`)

| New File | Primary Source | Secondary Source |
|----------|---------------|-----------------|
| `blog.ts` | `my-brand-nextjs/src/types/blog.ts` | — |
| `admin.ts` | `my-brand-nextjs/src/types/admin/types.ts` + `features/dashboard/blogs/newBlog/types.ts` | — |
| `auth.ts` | New — modeled from `my-brand-nextjs/src/services/authService.ts` | — |

### Services (`blog/src/services/`)

| New File | Primary Source | Additional From Phase 1 |
|----------|---------------|------------------------|
| `blogService.ts` | `my-brand-nextjs/src/services/blogService.ts` | + `likeBlog()` from `src/scripts/actions/blogs/blogActions.js` |
| `adminBlogService.ts` | `my-brand-nextjs/src/features/dashboard/blogs/allBlogs/services.ts` + `blogDetail/services.ts` | — |
| `commentService.ts` | `my-brand-nextjs/src/services/comment/commentService.ts` | + `deleteComment()` from `src/scripts/actions/blogs/commentActions.js` |
| `categoryService.ts` | New TypeScript service | Full CRUD from `src/scripts/actions/categories/categoryActions.js` |
| `authService.ts` | `my-brand-nextjs/src/services/authService.ts` | — |

### Features (`blog/src/features/`)

| New File | Primary Source | Notes |
|----------|---------------|-------|
| `blog/BlogPage.tsx` | `my-brand-nextjs/src/features/blog/BlogPage.tsx` | Refactor to use shadcn components |
| `blog/BlogDetailPage.tsx` | `my-brand-nextjs/src/features/blog/BlogDetailPage.tsx` | + like toggle from Phase 1 |
| `blog/components/BlogCard.tsx` | `my-brand-nextjs/src/features/blog/components/BlogCard.tsx` | Use shadcn `card` |
| `blog/components/FeaturedBlogCard.tsx` | `my-brand-nextjs/src/features/blog/components/FeaturedBlogCard.tsx` | Use shadcn `card` |
| `blog/components/BlogSearch.tsx` | `my-brand-nextjs/src/features/blog/components/BlogSearch.tsx` | Use shadcn `command`/`input` |
| `blog/components/BlogSidebar.tsx` | `my-brand-nextjs/src/features/blog/components/BlogSidebar.tsx` | Use shadcn components |
| `blog/components/CategoryTabs.tsx` | `my-brand-nextjs/src/features/blog/components/CategoryTabs.tsx` | Use shadcn `tabs` |
| `blog/components/ShareArticle.tsx` | `my-brand-nextjs/src/features/blog/components/ShareArticle.tsx` | Use shadcn `dropdown-menu` |
| `blog/components/TableOfContents.tsx` | `my-brand-nextjs/src/features/blog/components/TableOfContents.tsx` | Use shadcn `scroll-area` |
| `comments/CommentForm.tsx` | `my-brand-nextjs/src/features/comments/CommentForm.tsx` | Use shadcn `form` + zod |
| `comments/CommentList.tsx` | `my-brand-nextjs/src/features/comments/CommentList.tsx` | Use shadcn components |
| `auth/LoginForm.tsx` | `my-brand-nextjs/src/app/auth/login/` | Use shadcn `form` |
| `auth/AuthGuard.tsx` | `src/scripts/context/protectedRoute.js` | React context-based |
| `auth/AuthContext.tsx` | New | Cookie-based auth state |
| `dashboard/overview/*` | `src/scripts/dashboard/dashboardCharts.js` | recharts instead of Chart.js |
| `dashboard/blogs/AllBlogs.tsx` | `my-brand-nextjs/src/features/dashboard/blogs/allBlogs/AllBlogs.tsx` | shadcn `table` |
| `dashboard/blogs/NewBlog.tsx` | `my-brand-nextjs/src/features/dashboard/blogs/newBlog/NewBlog.tsx` | shadcn `form` + TinyMCE |
| `dashboard/blogs/EditBlog.tsx` | `my-brand-nextjs/src/features/dashboard/blogs/edit/` | Same as NewBlog with data |
| `dashboard/blogs/AdminBlogDetail.tsx` | `my-brand-nextjs/src/features/dashboard/blogs/blogDetail/AdminBlogDetail.tsx` | shadcn components |
| `dashboard/categories/CategoryManager.tsx` | **New** | From Phase 1 `categoryManager.js` |

### Utilities (`blog/src/lib/`)

| New File | Source |
|----------|--------|
| `utils.ts` | Auto-generated by shadcn (cn function) |
| `api.ts` | `my-brand-nextjs/utils/apiResponse.ts` |
| `constants.ts` | `my-brand-nextjs/src/lib/constants.ts` |
| `textUtils.ts` | `my-brand-nextjs/utils/textLengthReducer.ts` |
| `blogUtils.ts` | `my-brand-nextjs/utils/blogUtils.ts` |

---

## 7. API Endpoints Reference

Backend: `https://my-brand-backend-apis.onrender.com/v1`

All authenticated requests use cookie-based auth with `credentials: 'include'`.

### Public Blog Endpoints

| Method | Endpoint | Service Method |
|--------|----------|---------------|
| `GET` | `/blogs/public?page=1&limit=10` | `blogService.getBlogsPaginated()` |
| `GET` | `/blogs/public/recent` | `blogService.getRecentBlogs()` |
| `GET` | `/blogs/public/:id` | `blogService.getBlogById()` |
| `GET` | `/blogs/by-slug/:slug` | `blogService.getBlogBySlug()` |
| `GET` | `/blogs/by-category/:id` | `blogService.getBlogsByCategory()` |
| `GET` | `/blogs/by-tag` | `blogService.getBlogsByTag()` |
| `GET` | `/blogs/by-title` | `blogService.searchBlogsByTitle()` |
| `PUT` | `/blogs/like/:id` | `blogService.likeBlog()` |
| `GET` | `/blogs/author/:id` | `blogService.getAuthorByBlogId()` |

### Admin Blog Endpoints

| Method | Endpoint | Service Method |
|--------|----------|---------------|
| `GET` | `/blogs` | `adminBlogService.getAdminBlogs()` |
| `GET` | `/blogs/:id` | `adminBlogService.getBlogById()` |
| `POST` | `/blogs/create` | `adminBlogService.createBlog()` |
| `PUT` | `/blogs/update/:id` | `adminBlogService.updateBlog()` |
| `DELETE` | `/blogs/delete/:id` | `adminBlogService.deleteBlog()` |

### Category Endpoints

| Method | Endpoint | Service Method |
|--------|----------|---------------|
| `GET` | `/blog-category` | `categoryService.getAllCategories()` |
| `GET` | `/blog-category/:id` | `categoryService.getCategoryById()` |
| `POST` | `/blog-category/create` | `categoryService.createCategory()` |
| `PUT` | `/blog-category/update/:id` | `categoryService.updateCategory()` |
| `DELETE` | `/blog-category/delete/:id` | `categoryService.deleteCategory()` |

### Comment Endpoints

| Method | Endpoint | Service Method |
|--------|----------|---------------|
| `POST` | `/comment/add` | `commentService.addComment()` |
| `DELETE` | `/comment/:id` | `commentService.deleteComment()` |

### Auth Endpoints

| Method | Endpoint | Service Method |
|--------|----------|---------------|
| `POST` | `/auth/login` | `authService.login()` |
| `POST` | `/auth/logout` | `authService.logout()` |
| `GET` | `/auth/me` | `authService.getCurrentUser()` |

---

## 8. Code Guidelines

### General Rules

- **TypeScript** for all files — no `.js` or `.jsx`.
- **React Server Components** by default. Add `"use client"` only when interactivity is required (event handlers, hooks, browser APIs).
- **Next.js `metadata`** API on all page routes for SEO.
- **`loading.tsx`** in every route segment for streaming/Suspense.
- **Semantic HTML** (`<main>`, `<section>`, `<article>`, `<header>`, `<nav>`, `<footer>`).
- **Accessible** — all interactive elements must be keyboard navigable and screen-reader friendly (shadcn handles most of this via Radix).

### Modern React & Next.js Patterns (CRITICAL)

These patterns are **mandatory**. Do NOT use legacy equivalents.

| Modern (Use This) | Legacy (Do NOT Use) | Purpose |
|---|---|---|
| `useSyncExternalStore` | `useState` + `useEffect` + event listener | Subscribe to browser APIs (scroll, resize, media queries). Concurrent-mode safe, avoids tearing. |
| `useTransition` + `startTransition` | `useState(isLoading)` + manual try/catch/finally | Non-blocking async operations (form submissions, mutations). Keeps UI responsive during transitions. |
| `use()` (React 19) | `useContext()` | Context consumption. Simpler API, works in conditional blocks. |
| `useRef` for mount tracking | `useState(false)` + `useEffect` for `mounted` flag | Track mount state without triggering re-renders. |
| Zustand stores | 5+ `useState` in one component | Complex client state. See State Management Rules below. |
| `useMemo` / derived state | `useState` + `useEffect` to sync | Computed values from existing state (e.g., sorting, filtering). |
| `useOptimistic` (React 19) | Manual optimistic state | Optimistic UI updates for mutations (likes, comments). |
| `useActionState` (React 19) | `useState` + form action handler | Form action state management with built-in pending/error tracking. |

**Anti-patterns to avoid:**
- ~~`queueMicrotask(() => setState(...))`~~ inside effects — restructure to avoid the need
- ~~`useCallback` with empty deps for stable references~~ — define functions outside component or in zustand store
- ~~Multiple `useState` for related loading states~~ — use single zustand store or `useReducer`
- ~~`useEffect` for data fetching on mount~~ — prefer Next.js server components with `async` page functions, or zustand store actions called from a single mount effect

### State Management Rules

Use **zustand** for client state management. Reserve `useState` only for truly local, isolated UI state (e.g., a single toggle, input focus).

**When to use zustand:**
- Component has 3+ `useState` calls that represent related state
- State is shared between multiple components
- State involves complex update logic (filters, pagination, loading states)
- State needs to be accessed outside React (e.g., in service callbacks)
- Feature has async operations (API calls) paired with loading/error states

**When to keep `useState`:**
- Single toggle (e.g., `isCollapsed`)
- Component-local form input not managed by `react-hook-form`
- Ephemeral UI state that resets on unmount
- Content text synced to a rich text editor (1-2 isolated values)

**Store organization (MANDATORY):**
- **Every dashboard feature MUST have a `store.ts`** in `features/<name>/store.ts` — this is non-negotiable for admin features with data fetching
- Stores colocate state + actions in a single `create()` call
- Async actions (API calls, loading states) belong in the store, NOT in component `useEffect`
- Components subscribe to stores with selector functions for minimal re-renders: `const blogs = useBlogListingStore(state => state.blogs)`
- Do NOT create a single global store — keep stores feature-scoped
- When `react-hook-form` needs to coordinate with store actions (e.g., `form.reset()` when dialog opens), create local wrapper functions in the component that call both store action + form method

### Hooks Rules

- **One hook per folder** under `hooks/<hook-name>/index.ts` — this is mandatory, no exceptions
- Shared/reusable hooks (used across 2+ features) MUST live in `hooks/` — never scatter them inside feature folders
- All shared hooks MUST be re-exported from `hooks/index.ts` barrel file
- Use `useSyncExternalStore` for any browser API subscription (scroll, resize, media query, etc.)
- Use React 19's `use()` instead of `useContext()` for consuming contexts
- Hooks that are only used within a single feature MAY live in that feature's folder, not in `hooks/`
- When extracting state logic from a component, prefer a zustand store for complex state with async actions, and a custom hook for simpler reusable logic (e.g., debounce, tag input management, category fetching)

### Styling Rules

- **Tailwind CSS** is the primary styling method — no CSS modules, no styled-components.
- Use **shadcn CSS variable tokens** for colors (`bg-background`, `text-foreground`, `bg-primary`, `text-muted-foreground`, `border-border`, etc.) — NOT hardcoded hex/rgb values.
- Use **`dark:`** prefix for dark-mode-specific overrides only when CSS variables are insufficient.
- **Default theme is dark** — design for dark first, then ensure light mode works.
- **Responsive by default** — mobile-first breakpoints (`sm:`, `md:`, `lg:`, `xl:`).

### Component Rules

- **shadcn/ui first** — never rebuild what shadcn provides.
- **Feature components** are scoped to their feature folder and not designed for reuse.
- **Shared components** in `components/` must be feature-agnostic.
- **No prop drilling** — use zustand stores or composition patterns.
- Export via barrel files (`index.ts`) in every folder.

### Service Rules

- All API calls go through `safeFetch()` in `lib/api.ts` — never call `fetch()` directly.
- All authenticated requests include `credentials: 'include'`.
- Services return typed responses — no `any`.
- Error handling is centralized in `safeFetch()` — services throw typed errors.

### Form Rules

- All forms use **shadcn `Form`** + **`react-hook-form`** + **`zod`** schemas.
- Use **`useTransition`** for form submission instead of manual `useState(isSubmitting)`.
- Validation schemas live alongside their form components or in `types/`.
- Submit feedback via **`toast()`** from `sonner`.

### Commit Convention

- `feat: <description>` — new feature
- `fix: <description>` — bug fix
- `refactor: <description>` — code restructuring
- `chore: <description>` — tooling, deps, cleanup
- `docs: <description>` — documentation
- Keep commits small and focused on a single concern.

---

## 9. Verification Checklist

After implementation, verify:

### Build & Run
- [ ] `cd blog && yarn install` completes without errors
- [ ] `yarn build` compiles successfully
- [ ] `yarn dev` starts without errors on `localhost:3000`
- [ ] `yarn lint` passes with no errors

### Public Routes
- [ ] `/` — Main blog listing with search, category tabs, sort, pagination, featured post, loading skeletons
- [ ] `/[slug]` — Blog detail with content (prose styled), TOC, comments, likes, share, related posts, breadcrumbs
- [ ] 404 page renders for invalid routes

### Admin Routes (behind auth)
- [ ] `/auth/login` — Login form with validation, redirects to dashboard on success
- [ ] `/auth/logout` — Clears session, redirects to home
- [ ] `/dashboard` — Analytics overview with stat cards and charts
- [ ] `/dashboard/blogs` — Blog table with pagination, filters, search, status badges, action menu
- [ ] `/dashboard/blogs/new` — Create blog form with TinyMCE, category select, tags, image upload, draft/publish toggle
- [ ] `/dashboard/blogs/[id]` — Admin blog detail with status management
- [ ] `/dashboard/blogs/[id]/edit` — Edit blog form pre-populated with data
- [ ] `/dashboard/categories` — Category list with create/edit/delete dialogs

### Features
- [ ] Dark/light theme toggle works consistently across all pages
- [ ] Blog search returns results from API
- [ ] Category filter works via tabs
- [ ] Pagination loads correct pages
- [ ] Comment form validates and submits
- [ ] Like toggle updates UI and persists
- [ ] Share buttons generate correct URLs (Facebook, Twitter, LinkedIn, copy link)
- [ ] Table of Contents highlights current section on scroll
- [ ] Toast notifications appear for all success/error states
- [ ] All admin forms validate via zod before submission
- [ ] Delete confirmations show alert dialogs
- [ ] Protected routes redirect to login when unauthenticated

### Responsive & Theme
- [ ] Mobile navigation (sheet/hamburger menu) works
- [ ] Dashboard sidebar collapses on mobile
- [ ] Blog grid adapts to mobile/tablet/desktop
- [ ] All shadcn components render correctly in both light and dark mode
- [ ] No hardcoded colors — all use CSS variable tokens

### SEO
- [ ] All pages have `metadata` with title, description, keywords
- [ ] Blog detail pages have dynamic OG metadata (title, description, image)
- [ ] `robots.ts` generates valid robots.txt
- [ ] `sitemap.ts` generates valid sitemap with blog post URLs
- [ ] OG image generates correctly

### Cleanup
- [ ] `portfolio/` folder deleted
- [ ] `src/` folder deleted
- [ ] No broken imports referencing deleted folders
- [ ] `index.html` removed from root
- [ ] `list_of_endpoints.prompt.md` moved to `blog/docs/api-endpoints.md`
- [ ] `.github/instructions/` updated to reflect new structure

---

*This is a living document. Update as implementation progresses and decisions evolve.*
