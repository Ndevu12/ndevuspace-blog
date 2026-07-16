"use client";

import { useCallback, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useBlogListingStore } from "@/features/blog";

/**
 * Hook that synchronises blog filter state (category, tag, search) with URL
 * query parameters. Reads params on mount and writes them back whenever the
 * user changes a filter, keeping URLs shareable and supporting browser
 * back / forward navigation.
 *
 * Returns wrapped action handlers that update *both* the Zustand store and the
 * URL — drop-in replacements for the raw store actions.
 */
export function useBlogUrlParams() {
  const router = useRouter();
  const pathname = usePathname();

  const {
    blogCategories,
    activeTags,
    handleCategoryChange,
    applyTagFilter,
    handleSearch,
    clearSearch,
    clearAllFilters,
    hydrateFromParams,
  } = useBlogListingStore();

  // ── Hydrate store from URL params ────────────────────────────────────────
  // Reads location.search in an effect (never during render) so the listing
  // page stays fully prerenderable — a render-time useSearchParams() would
  // force the whole tree to client-render behind the route Suspense fallback.
  // popstate keeps back/forward navigation in sync.
  useEffect(() => {
    const syncFromLocation = () => {
      const params = new URLSearchParams(window.location.search);
      // Prefer the multi-tag `tags=a,b`; fall back to the legacy single `tag=a`.
      const tags = parseTagsParam(params.get("tags") ?? params.get("tag"));
      const categoryParam = params.get("category");
      const searchParam = params.get("search");

      if (tags.length > 0 || categoryParam || searchParam) {
        hydrateFromParams({
          tags,
          category: categoryParam,
          search: searchParam,
        });
      }
    };

    syncFromLocation();
    window.addEventListener("popstate", syncFromLocation);
    return () => window.removeEventListener("popstate", syncFromLocation);
  }, [hydrateFromParams]);

  // ── Helper: push current filter state into the URL ──────────────────────
  const updateUrlParams = useCallback(
    (params: { category?: string; tags?: string[]; search?: string }) => {
      const newParams = new URLSearchParams();

      if (params.category && params.category !== "all") {
        // Resolve id -> human-readable name for cleaner URLs
        const cat = blogCategories.find((c) => c.id === params.category);
        newParams.set("category", cat ? cat.name : params.category);
      }
      if (params.tags && params.tags.length > 0) {
        newParams.set("tags", params.tags.join(","));
      }
      if (params.search) {
        newParams.set("search", params.search);
      }

      const qs = newParams.toString();
      router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [blogCategories, router, pathname],
  );

  // ── Wrapped handlers (store + URL) ─────────────────────────────────────
  const onCategoryChange = useCallback(
    (categoryId: string) => {
      handleCategoryChange(categoryId);
      updateUrlParams({ category: categoryId });
    },
    [handleCategoryChange, updateUrlParams],
  );

  // Toggle a topic in/out of the OR-filter, then mirror the result to the URL.
  const onTagToggle = useCallback(
    (tag: string) => {
      const next = activeTags.includes(tag)
        ? activeTags.filter((t) => t !== tag)
        : [...activeTags, tag];
      applyTagFilter(next);
      updateUrlParams({ tags: next });
    },
    [activeTags, applyTagFilter, updateUrlParams],
  );

  const onSearch = useCallback(
    (query: string) => {
      handleSearch(query);
      updateUrlParams({ search: query || undefined });
    },
    [handleSearch, updateUrlParams],
  );

  const onClearSearch = useCallback(() => {
    clearSearch();
    updateUrlParams({});
  }, [clearSearch, updateUrlParams]);

  const onClearAllFilters = useCallback(() => {
    clearAllFilters();
    router.replace(pathname, { scroll: false });
  }, [clearAllFilters, router, pathname]);

  return {
    onCategoryChange,
    onTagToggle,
    onSearch,
    onClearSearch,
    onClearAllFilters,
  };
}

/** Parse a `tags`/`tag` query value ("a,b,c") into a trimmed, de-duped list. */
function parseTagsParam(raw: string | null): string[] {
  if (!raw) return [];
  const seen = new Set<string>();
  const result: string[] = [];
  for (const part of raw.split(",")) {
    const tag = part.trim();
    if (tag && !seen.has(tag)) {
      seen.add(tag);
      result.push(tag);
    }
  }
  return result;
}
