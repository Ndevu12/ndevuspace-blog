## Self-contained feature folders

This repo uses a **feature-first** structure. Each folder under `src/features/<featureName>/` is a **self-contained module** responsible for its UI, state, and business logic.

### Why

- **Local reasoning**: most changes live entirely inside one feature
- **Clear boundaries**: fewer cross-feature entanglements
- **Consistent organization**: predictable locations for hooks/stores/services
- **Scalable growth**: new features don’t create a tangled global `hooks/` or `store/`

### Feature folder contract (required)

Every feature must have an `index.ts` that defines its public API. Other code should import from the feature’s public API, not from deep internal files.

Recommended layout:

```
src/features/<featureName>/
  components/        # feature UI (optional)
  hooks/             # React hooks (required if used)
  services/          # API / side effects (required if used)
  store/             # zustand stores (required if used)
  types/             # feature-local types (optional)
  utils/             # feature-local helpers (optional)
  index.ts           # public exports (required)
```

### Conventions

- **Hooks**: `hooks/useX*.ts(x)` (e.g. `useAuth`, `useAuthSync`)
- **Stores**: `store/*Store.ts` (e.g. `authStore.ts` exporting `useAuthStore`)
- **Services**: `services/*Service.ts` (e.g. `authSyncService.ts`, `authActionsService.ts`)
- Keep files small and purpose-driven; prefer creating another file over mixing concerns.

### Import boundaries

Other parts of the app should import from the feature’s public API:

- `@/features/<featureName>` (preferred)
- or from a file explicitly treated as public API (also exported from `index.ts`)

Avoid importing deep internal files from another feature. If something is needed externally, **export it from that feature’s `index.ts`**.

### Public vs private (simple rule)

- **Public**: exported from `src/features/<featureName>/index.ts`
- **Private**: anything else inside the feature folder

If another feature needs something that’s currently private, either:

- promote it to the public API by exporting it, or
- move it to a shared layer (`src/lib`, `src/services`, `src/types`, or `src/components`) when it is truly cross-feature.

### Separation of responsibilities

- `components/`: JSX + composition (calls hooks, renders UI)
- `hooks/`: effects, subscriptions, client-side orchestration
- `store/`: state + actions (no JSX). Keep side effects delegated to services.
- `services/`: API calls, Supabase calls, serialization/mapping. No React imports.

### Examples

#### Example feature skeleton

```
src/features/auth/
  components/
    LoginForm.tsx
  hooks/
    useAuth.ts
    useAuthSync.ts
  services/
    authActionsService.ts
    authSyncService.ts
  store/
    authStore.ts
  index.ts
```

#### Good imports

- From outside the feature:
  - `import { LoginForm } from "@/features/auth";`
  - `import { useAuth } from "@/features/auth";` (if exported)
- From inside the feature:
  - `import { useAuthStore } from "@/features/auth/store/authStore";` (internal use is fine)

#### Avoid

- `import { useAuthStore } from "@/features/auth/store/authStore";` from unrelated app code if the feature intends `useAuth` to be the public API.
- Putting Supabase/API calls directly in components when a `services/` file exists for that concern.

### Related: database and services policy

Schema and RPC changes follow the repo’s migration conventions (in-place edits pre-production, append-only after production, helper functions not client-exposed). Service implementations stay in the canonical `*Service.ts` files for each feature—no permanent duplicate `V2` or RPC-only modules. See [MIGRATIONS.md](MIGRATIONS.md).

### Cleanup guardrails

- Keep feature modules clean during refactors: delete replaced files once imports are moved, rather than leaving orphaned blog/category service variants behind.
- Keep docs current when canonical file paths or data-layer rules change, especially for RPC-only access and migration editing policy.

