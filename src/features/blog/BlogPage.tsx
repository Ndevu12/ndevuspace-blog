"use client";

import { useMemo, useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { BlogCard } from "./components/BlogCard";
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
import { BlogCardSkeleton } from "@/components/shared/LoadingStates";
import { Loader2, Plus, Search, X } from "lucide-react";
import { useBlogUrlParams } from "@/hooks";
import type { BlogCategory, PaginatedBlogsResponse } from "@/types/blog";

export interface BlogPageProps {
  initialBlogs: PaginatedBlogsResponse;
  initialCategories: BlogCategory[];
}

export function BlogPage({ initialBlogs, initialCategories }: BlogPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

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

  useEffect(() => {
    if (searchParams.get("accessDenied") !== "1") {
      return;
    }

    toast.error("Access Denied");

    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete("accessDenied");
    const nextUrl = nextParams.size > 0 ? `${pathname}?${nextParams.toString()}` : pathname;
    router.replace(nextUrl);
  }, [pathname, router, searchParams]);

  // Sort posts client-side (derived state)
  const filteredPosts = useMemo(() => {
    const posts = [...blogs];

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
  }, [blogs, sortBy]);

  const isContentLoading =
    blogsLoading || categoryLoading || tagLoading || searchLoading;

  return (
    <main className="bg-background pt-28 md:pt-32">
      {/* Search — above filters & listing; wired via useBlogUrlParams + store */}
      <div className="max-w-6xl mx-auto px-4 pb-8 md:pb-10">
        <BlogSearch onSearch={onSearch} searchQuery={searchQuery} />
      </div>

      {/* Sticky filters: category tabs only below lg (desktop uses sidebar categories) */}
      <div className="sticky top-16 z-10 backdrop-blur-sm">
        {searchQuery.trim() && (
          <div className="bg-primary/5 border-b border-primary/20 py-3">
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

        {categoriesLoading ? (
          <div className="lg:hidden bg-muted/50 py-4 border-y border-border/50">
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
              categories={blogCategories}
              activeCategory={activeCategory}
              onCategoryChange={onCategoryChange}
              isSearchActive={!!searchQuery.trim()}
            />
          </div>
        )}

        {activeTag && (
          <div className="max-w-6xl mx-auto px-4 mt-4 pb-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Filtering by tag:
              </span>
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
            {blogsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {Array.from({ length: 4 }).map((_, i) => (
                  <BlogCardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <>
                {/* Sort Options */}
                <div className="mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="flex items-center gap-4">
                    <h2 className="text-xl font-bold flex items-center">
                      <span className="inline-block w-1 h-8 bg-primary rounded-sm mr-2" />
                      {searchQuery
                        ? `Search Results (${filteredPosts.length})`
                        : "Latest Articles"}
                    </h2>
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
                    <span className="text-sm text-muted-foreground">
                      Sort by:
                    </span>
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
                </div>

                {/* Blog Grid */}
                {error ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">&#x26A0;&#xFE0F;</div>
                    <h3 className="text-xl font-bold mb-2">{error}</h3>
                    <p className="text-muted-foreground">
                      Please try a different category or clear your search.
                    </p>
                    <Button
                      variant="link"
                      className="mt-4 text-primary"
                      onClick={onClearAllFilters}
                    >
                      Clear and view all articles
                    </Button>
                  </div>
                ) : (
                  <>
                    {isContentLoading ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <BlogCardSkeleton key={i} />
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {filteredPosts.map((post) => (
                          <BlogCard key={post.id} post={post} />
                        ))}
                      </div>
                    )}

                    {/* Load More Button */}
                    {hasMorePosts && !isContentLoading && (
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
              </>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:w-1/4">
            <BlogSidebar
              categories={blogCategories}
              activeCategory={activeCategory}
              onCategoryChange={onCategoryChange}
              isSearchActive={!!searchQuery.trim()}
              hideCategoryNavUntilLg
              tags={allTags}
              onTagClick={onTagChange}
              activeTag={activeTag}
            />
          </aside>
        </div>
      </div>
    </main>
  );
}
