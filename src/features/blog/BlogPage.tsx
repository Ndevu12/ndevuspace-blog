"use client";

import { useMemo, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { toast } from "sonner";
import { BlogGrid, BlogGridSkeleton } from "./components/BlogGrid";
import { BlogSidebar } from "./components/BlogSidebar";
import { CategoryTabs } from "./components/CategoryTabs";
import { BlogSearch } from "./components/BlogSearch";
import { useBlogListingStore } from "./store";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/EmptyState";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Loader2, Plus, Search, SearchX, X } from "lucide-react";
import { getUniqueTags } from "@/lib/blogUtils";
import { entrance } from "@/lib/motion";
import { useBlogUrlParams } from "@/hooks";
import type { BlogCategory, PaginatedBlogsResponse } from "@/types/blog";

export interface BlogPageProps {
  initialBlogs: PaginatedBlogsResponse;
  initialCategories: BlogCategory[];
}

export function BlogPage({ initialBlogs, initialCategories }: BlogPageProps) {
  const router = useRouter();
  const pathname = usePathname();

  // ─── Store ───
  const {
    blogs,
    blogCategories,
    allTags,
    activeCategory,
    activeTag,
    searchQuery,
    sortBy,
    hasMorePosts,
    totalCount,
    blogsLoading,
    categoriesLoading,
    categoryLoading,
    tagLoading,
    searchLoading,
    loadingMore,
    error,
    hydrateFromServer,
    fetchFilteredBlogs,
    loadMorePosts,
    setSortBy,
  } = useBlogListingStore();

  // ─── URL-synced filter actions ───
  const { onCategoryChange, onTagChange, onSearch, onClearSearch, onClearAllFilters } =
    useBlogUrlParams();

  const prefersReducedMotion = useReducedMotion();

  // Hydrate store from server data on mount (once)
  const hydrated = useRef(false);
  useEffect(() => {
    if (!hydrated.current) {
      hydrated.current = true;
      hydrateFromServer({
        blogs: initialBlogs.blogs,
        categories: initialCategories,
        totalCount: initialBlogs.totalCount,
        hasMore: initialBlogs.hasMore,
        currentPage: initialBlogs.currentPage,
      });
    }
  }, [initialBlogs, initialCategories, hydrateFromServer]);

  // Fetch blogs when filters change (skip initial only if no URL params are active,
  // since server data is unfiltered)
  const initialRender = useRef(true);
  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
      // If a filter is already active from URL params, fetch filtered data
      if (activeCategory === "all" && !activeTag && !searchQuery) {
        return;
      }
    }
    fetchFilteredBlogs();
  }, [activeCategory, activeTag, searchQuery, fetchFilteredBlogs]);

  // Access-denied redirect notice — reads location.search in an effect so the
  // page stays prerenderable (see useBlogUrlParams for the same constraint).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("accessDenied") !== "1") {
      return;
    }

    toast.error("Access Denied");

    params.delete("accessDenied");
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  }, [pathname, router]);

  // ── First-paint data ──
  // The store hydrates from the server payload in a post-mount effect; until
  // then it is empty with blogsLoading=true. Render the server data directly
  // during that window so the prerendered page and the initial visit/reload
  // paint content instead of skeletons. URL-filtered visits briefly show the
  // unfiltered set, then the matching fetch swaps in a skeleton.
  const useServerData = blogsLoading && blogs.length === 0;

  const displayBlogs = useServerData ? initialBlogs.blogs : blogs;
  const displayTotalCount = useServerData ? initialBlogs.totalCount : totalCount;
  const displayHasMore = useServerData ? initialBlogs.hasMore : hasMorePosts;
  const displayCategories =
    blogCategories.length > 0 ? blogCategories : initialCategories;
  const displayTags = useMemo(
    () => (allTags.length > 0 ? allTags : getUniqueTags(initialBlogs.blogs)),
    [allTags, initialBlogs.blogs]
  );

  const isContentLoading =
    (blogsLoading && !useServerData) ||
    categoryLoading ||
    tagLoading ||
    searchLoading;

  // Sort posts client-side (derived state)
  const filteredPosts = useMemo(() => {
    const posts = [...displayBlogs];

    switch (sortBy) {
      case "oldest":
        posts.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        break;
      case "popular":
        posts.sort((a, b) => (b.likes || 0) - (a.likes || 0));
        break;
      case "newest":
      default:
        posts.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
    }

    return posts;
  }, [displayBlogs, sortBy]);

  const hasActiveFilters =
    Boolean(searchQuery.trim()) || Boolean(activeTag) || activeCategory !== "all";

  const showingMeta =
    !isContentLoading && !error && filteredPosts.length > 0
      ? `Showing ${filteredPosts.length} of ${displayTotalCount} ${displayTotalCount === 1 ? "post" : "posts"}`
      : undefined;

  return (
    <main className="bg-background pt-28 md:pt-32">
      {/* Search — above filters & listing; wired via useBlogUrlParams + store */}
      <motion.div
        {...entrance(prefersReducedMotion)}
        className="max-w-6xl mx-auto px-4 pb-8 md:pb-10"
      >
        <BlogSearch onSearch={onSearch} searchQuery={searchQuery} />
      </motion.div>

      {/* Sticky filters: category tabs only below lg (desktop uses sidebar categories) */}
      <div className="sticky top-16 z-10">
        {searchQuery.trim() && (
          <div className="glass bg-primary/5 border-b border-primary/20 py-3">
            <div className="max-w-6xl mx-auto px-4">
              <div className="flex items-center justify-center gap-2 text-sm text-primary">
                <Search className="h-4 w-4" />
                <span>
                  Searching for: &ldquo;<strong>{searchQuery}</strong>&rdquo;
                </span>
                <button
                  onClick={onClearSearch}
                  className="ml-2 text-primary/70 hover:text-primary underline"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}

        {categoriesLoading && displayCategories.length === 0 ? (
          <div className="lg:hidden glass py-4 border-y border-border/60">
            <div className="max-w-6xl mx-auto px-4">
              <div className="flex justify-center py-2 gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-9 w-24 rounded-full" />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:hidden">
            <CategoryTabs
              categories={displayCategories}
              activeCategory={activeCategory}
              onCategoryChange={onCategoryChange}
              isSearchActive={!!searchQuery.trim()}
            />
          </div>
        )}

        {activeTag && (
          <div className="max-w-6xl mx-auto px-4 mt-4 pb-2">
            <div className="flex items-center gap-2">
              <span className="text-meta">Filtering by tag:</span>
              <Badge variant="default" className="gap-1">
                #{activeTag}
                <button
                  onClick={onClearAllFilters}
                  className="ml-1 hover:text-primary-foreground/80"
                  title="Clear tag filter"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            </div>
          </div>
        )}
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="lg:w-3/4">
            {/* Listing header: heading + count, sort control */}
            <motion.div
              {...entrance(prefersReducedMotion, 0.1)}
              className="mb-8 flex flex-col md:flex-row justify-between md:items-end gap-4"
            >
              <div className="flex items-center gap-4">
                <SectionHeading
                  eyebrow="Journal"
                  title={searchQuery ? "Search Results" : "Latest Articles"}
                  meta={showingMeta}
                />
                {searchQuery && (
                  <button
                    onClick={onClearSearch}
                    className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
                  >
                    <X className="h-4 w-4" />
                    Clear
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                <span className="text-meta">Sort by</span>
                <Select
                  value={sortBy}
                  onValueChange={(value) =>
                    setSortBy(value as "newest" | "oldest" | "popular")
                  }
                >
                  <SelectTrigger className="w-[160px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="popular">Most Popular</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </motion.div>

            {/* Blog Grid */}
            {error ? (
              <EmptyState
                icon={<span className="text-6xl">&#x26A0;&#xFE0F;</span>}
                title={error}
                description="Please try a different category or clear your search."
                actionLabel="Clear and view all articles"
                onAction={onClearAllFilters}
              />
            ) : isContentLoading ? (
              <BlogGridSkeleton />
            ) : filteredPosts.length === 0 ? (
              <EmptyState
                icon={<SearchX className="h-10 w-10" />}
                title="No articles found"
                description={
                  hasActiveFilters
                    ? "Nothing matches the current filters."
                    : "No articles have been published yet — check back soon."
                }
                actionLabel={
                  hasActiveFilters ? "Clear and view all articles" : undefined
                }
                onAction={hasActiveFilters ? onClearAllFilters : undefined}
              />
            ) : (
              <>
                <BlogGrid
                  posts={filteredPosts}
                  featureFirst={!hasActiveFilters}
                />

                {/* Load More Button */}
                {displayHasMore && (
                  <div className="my-12 text-center">
                    <Button
                      onClick={loadMorePosts}
                      disabled={loadingMore}
                      size="lg"
                    >
                      {loadingMore ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          <Plus className="mr-2 h-4 w-4" />
                          Load More
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sidebar — sticky on desktop so it tracks the scroll */}
          <aside className="lg:w-1/4">
            <div className="lg:sticky lg:top-24">
              <BlogSidebar
                categories={displayCategories}
                activeCategory={activeCategory}
                onCategoryChange={onCategoryChange}
                isSearchActive={!!searchQuery.trim()}
                hideCategoryNavUntilLg
                tags={displayTags}
                onTagClick={onTagChange}
                activeTag={activeTag}
              />
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
