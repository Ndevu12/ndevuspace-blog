# Supabase migrations and RPC policy

This document records how we evolve Postgres schema, RLS, and RPCs, and how that ties to the app layer. Aligns with the RPC-first data layer: real DB access for blog/category/tag CRUD and dashboard analytics goes through `supabase.rpc(...)`, not direct `.from(...)` queries for those operations.

## Pre-production: edit migrations in place

Until the project has **production** (or otherwise irreversible) migration history applied to long-lived databases:

- Prefer **changing the existing migration file** that introduced a table, policy, helper, or RPC rather than adding a chain of small `…_fix_…sql` patches.
- Keeps history readable and avoids migration sprawl.
- Coordinate domain-grouped files (tables → RLS → triggers → helpers → user-facing RPCs) as already used under `supabase/migrations/`.

## After rewriting migrations locally

If you amend migration files that were **already applied** on a developer machine, the local database will not match the files until you reset:

- Run **`supabase db reset`** (or your team’s equivalent) so the database is recreated from the full migration chain.

## Post-production: append-only

Once you have **production** or other **irreversible** applied history:

- **Stop** rewriting old migration files for changes.
- Add **new, timestamped migrations** only (append-only).
- Record that switch in team docs when it happens so everyone uses the same rule.

## RPC helpers vs client-callable RPCs

- **User-facing RPCs** (the operations the app calls with `supabase.rpc('name', { ... })`) get `GRANT EXECUTE` to `anon` and/or `authenticated` as appropriate for the product.
- **SQL helper functions** used only inside other SQL should **not** be callable from the client: omit grants to `anon` / `authenticated`, and **`REVOKE EXECUTE`** from `PUBLIC` (and roles) when needed so PostgREST does not expose them. Document any intentional exceptions in `COMMENT ON FUNCTION`.

## RBAC E2E verification

- Use the rollback-only SQL harness at `supabase/verify/verify_rbac_e2e.sql` to validate blog RBAC behavior.
- Run it with `yarn db:verify:rbac-e2e` (or pipe it manually into `supabase db shell`).
- The script asserts three outcomes:
  - author cannot update another author's blog,
  - admin can update another author's blog (override),
  - dashboard/admin list scope is owner-only for non-admin and global for admin.
- It finishes with `ROLLBACK`, so it does not leave verification data behind.

## TypeScript and services (no parallel “V2” modules)

- Land changes in **canonical** modules (`blogService.ts`, `categoryService.ts`, `dashboardBlogService.ts`, shared types under `src/types/`, etc.).
- Do **not** keep a permanent second implementation path (`fooV2.ts`, `blogServiceRpc.ts`, or duplicate type trees). Short-lived branches during development should merge into those canonical files or delete the temporary code before the work is done.

## Related reading

- [Feature folder rules](FEATURES.md) — where feature `services/` live and import boundaries.
- [README](../README.md) — environment-aware service resolution and stack overview.
