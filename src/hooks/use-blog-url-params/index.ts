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
    handleCategoryChange,
    handleTagChange,
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
      const tagParam = params.get("tag");
      const categoryParam = params.get("category");
      const searchParam = params.get("search");

      if (tagParam || categoryParam || searchParam) {
        hydrateFromParams({
          tag: tagParam,
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
    (params: { category?: string; tag?: string | null; search?: string }) => {
      const newParams = new URLSearchParams();

      if (params.category && params.category !== "all") {
        // Resolve id -> human-readable name for cleaner URLs
        const cat = blogCategories.find((c) => c.id === params.category);
        newParams.set("category", cat ? cat.name : params.category);
      }
      if (params.tag) {
        newParams.set("tag", params.tag);
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

  const onTagChange = useCallback(
    (tag: string) => {
      handleTagChange(tag);
      updateUrlParams({ tag });
    },
    [handleTagChange, updateUrlParams],
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
    onTagChange,
    onSearch,
    onClearSearch,
    onClearAllFilters,
  };
}
