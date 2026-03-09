"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { BlogCard } from "./components/BlogCard";
import { FeaturedBlogCard } from "./components/FeaturedBlogCard";
import { BlogSidebar } from "./components/BlogSidebar";
import { CategoryTabs } from "./components/CategoryTabs";
import { BlogSearch } from "./components/BlogSearch";
import {
  getAllBlogCategories,
  getBlogsPaginated,
  getBlogsByCategory,
  getBlogsByTag,
  searchBlogsByTitle,
} from "@/services/blogService";
import ClientLayout from "@/components/layout";
import { BlogPost, BlogCategory } from "@/types/blog";
import { Loading } from "@/components/atoms/Loading";

export function BlogPage() {
  const searchParams = useSearchParams();

  // State management
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "popular">(
    "newest"
  );
  const [blogCategories, setBlogCategories] = useState<BlogCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [blogsLoading, setBlogsLoading] = useState(true);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [tagLoading, setTagLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [featuredPost, setFeaturedPost] = useState<BlogPost | null>(null);
  const [popularPosts, setPopularPosts] = useState<BlogPost[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMorePosts, setHasMorePosts] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const POSTS_PER_PAGE = 10;

  // Handle URL parameters on component mount
  useEffect(() => {
    const tagParam = searchParams.get("tag");
    if (tagParam) {
      setActiveTag(tagParam);
      // Clear other filters when tag is set from URL
      setActiveCategory("all");
      setSearchQuery("");
    }
  }, [searchParams]);

  // Fetch categories from server
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const categories = await getAllBlogCategories();
        setBlogCategories(categories);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        setBlogCategories([]);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Filter and sort posts from server data
  const filteredPosts = useMemo(() => {
    let posts = [...blogs];

    // Apply sorting (filtering by category and search are handled server-side now)
    switch (sortBy) {
      case "oldest":
        posts.sort(
          (a: BlogPost, b: BlogPost) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        break;
      case "popular":
        posts.sort(
          (a: BlogPost, b: BlogPost) => (b.likes || 0) - (a.likes || 0)
        );
        break;
      case "newest":
      default:
        posts.sort(
          (a: BlogPost, b: BlogPost) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
    }

    return posts;
  }, [blogs, sortBy]);

  const postsToShow = filteredPosts;

  // Fetch blogs based on active filters
  const fetchFilteredBlogs = useCallback(
    async (
      fromCategoryChange = false,
      fromSearch = false,
      fromTagChange = false
    ) => {
      if (fromCategoryChange) {
        setCategoryLoading(true);
      } else if (fromSearch) {
        setSearchLoading(true);
      } else if (fromTagChange) {
        setTagLoading(true);
      } else {
        setBlogsLoading(true);
      }

      try {
        let data;

        if (searchQuery.trim()) {
          // Search by title
          data = await searchBlogsByTitle(
            searchQuery.trim(),
            1,
            POSTS_PER_PAGE
          );
        } else if (activeTag) {
          // Filter by tag
          data = await getBlogsByTag(activeTag, 1, POSTS_PER_PAGE);
        } else if (activeCategory && activeCategory !== "all") {
          const category = blogCategories.find(
            (cat: BlogCategory) => cat._id === activeCategory
          );

          if (category) {
            data = await getBlogsByCategory(category._id, 1, POSTS_PER_PAGE);
          } else {
            data = await getBlogsPaginated(1, POSTS_PER_PAGE);
          }
        } else {
          // Fetch all blogs
          data = await getBlogsPaginated(1, POSTS_PER_PAGE);
        }

        if (data?.blogs) {
          setBlogs(data.blogs);
          // Update pagination states
          setCurrentPage(data.currentPage || 1);
          setHasMorePosts(data.hasMore || false);
          setTotalPages(data.totalPages || 1);

          // Update featured post only when showing all categories and no search
          if (activeCategory === "all" && !searchQuery.trim()) {
            if (data.blogs.length > 0) {
              setFeaturedPost(data.blogs[0]);
            } else {
              setFeaturedPost(null);
            }
          } else {
            setFeaturedPost(null); // No featured post for filtered results
          }

          // Extract and update tags from fetched blogs
          const allTags = data.blogs.flatMap((blog: any) => blog.tags || []);
          const stringTags = allTags.filter(
            (tag: any): tag is string => typeof tag === "string"
          );
          const uniqueTags: string[] = Array.from(new Set(stringTags));
          setAllTags(uniqueTags);

          // Set popular posts (top 3 by likes from current results)
          const popularPostsList = [...data.blogs]
            .sort((a: any, b: any) => (b.likes || 0) - (a.likes || 0))
            .slice(0, 3);
          setPopularPosts(popularPostsList);
        } else {
          setBlogs([]);
          setPopularPosts([]);
        }
      } catch (error) {
        setBlogs([]);
        setFeaturedPost(null);
      } finally {
        if (fromCategoryChange) {
          setCategoryLoading(false);
        } else if (fromSearch) {
          setSearchLoading(false);
        } else if (fromTagChange) {
          setTagLoading(false);
        } else {
          setBlogsLoading(false);
        }
      }
    },
    [activeCategory, activeTag, searchQuery, blogCategories]
  );

  // Effect to fetch blogs when filters change
  useEffect(() => {
    fetchFilteredBlogs(); // Don't pass true for initial load
  }, [fetchFilteredBlogs]);

  // Load more posts
  const handleLoadMore = async () => {
    if (loadingMore || !hasMorePosts) return;

    try {
      setLoadingMore(true);
      const nextPage = currentPage + 1;
      let response;

      // Use same filtering logic for load more
      if (searchQuery.trim()) {
        response = await searchBlogsByTitle(
          searchQuery,
          nextPage,
          POSTS_PER_PAGE
        );
      } else if (activeCategory !== "all") {
        const selectedCategory = blogCategories.find(
          (cat) => cat._id === activeCategory
        );
        if (selectedCategory) {
          response = await getBlogsByCategory(
            selectedCategory._id,
            nextPage,
            POSTS_PER_PAGE
          );
        } else {
          response = await getBlogsPaginated(nextPage, POSTS_PER_PAGE);
        }
      } else {
        response = await getBlogsPaginated(nextPage, POSTS_PER_PAGE);
      }

      setBlogs((prev) => [...prev, ...response.blogs]);
      setCurrentPage(response.currentPage);
      setHasMorePosts(response.hasMore);

      // Update tags with new blogs
      const allBlogs = [...blogs, ...response.blogs];
      const allTags = allBlogs.flatMap((blog: any) => blog.tags || []);
      const stringTags = allTags.filter(
        (tag: any): tag is string => typeof tag === "string"
      );
      const uniqueTags: string[] = Array.from(new Set(stringTags));
      setAllTags(uniqueTags);
    } catch (error) {
      console.error("Failed to load more blogs:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
    setError(null);

    // When searching, reset category to "all" to indicate we're searching across all categories
    if (query.trim() && activeCategory !== "all") {
      setActiveCategory("all");
    }

    // Don't reset pagination states prematurely - let the server response determine them
    // fetchFilteredBlogs will handle updating hasMorePosts and totalPages correctly
    fetchFilteredBlogs(false, true); // fromSearch = true
  };

  const clearSearch = () => {
    setSearchQuery("");
    setCurrentPage(1);
    setError(null);
    // This will trigger fetchFilteredBlogs via the useEffect
  };

  const handleCategoryChange = (categoryId: string) => {
    console.log("🔄 [BlogPage] Category change triggered:");
    console.log("  - Previous category:", activeCategory);
    console.log("  - New category:", categoryId);
    console.log("  - Current search query:", searchQuery);

    setActiveCategory(categoryId);
    setCurrentPage(1);
    setError(null);

    // Clear search query when changing categories
    if (searchQuery.trim()) {
      console.log("  - Clearing search query due to category change");
      setSearchQuery("");
    }

    console.log("  - Calling fetchFilteredBlogs with fromCategoryChange=true");

    // Don't reset pagination states prematurely - let the server response determine them
    // fetchFilteredBlogs will handle updating hasMorePosts and totalPages correctly
    fetchFilteredBlogs(true);
  };

  const handleTagChange = (tag: string) => {
    setActiveTag(tag);
    setCurrentPage(1);
    setError(null);

    // Clear search query and category when changing tags
    if (searchQuery.trim()) {
      setSearchQuery("");
    }

    if (activeCategory !== "all") {
      setActiveCategory("all");
    }

    // Don't reset pagination states prematurely - let the server response determine them
    // fetchFilteredBlogs will handle updating hasMorePosts and totalPages correctly
    fetchFilteredBlogs(false, false, true);
  };

  // Update error state when no posts found
  useEffect(() => {
    if (
      !blogsLoading &&
      !categoryLoading &&
      !searchLoading &&
      filteredPosts.length === 0 &&
      blogs.length > 0
    ) {
      setError("No articles found for this category or search.");
    } else if (
      !blogsLoading &&
      !categoryLoading &&
      !searchLoading &&
      blogs.length === 0
    ) {
      setError("No articles available.");
    } else {
      setError(null);
    }
  }, [
    filteredPosts,
    blogs,
    blogsLoading,
    categoryLoading,
    tagLoading,
    searchLoading,
  ]);

  return (
    <ClientLayout>
      {/* Hero Banner */}
      <section className="relative bg-white dark:bg-primary pt-32 pb-20">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-gray-900 dark:from-white to-gray-600 dark:to-gray-400 bg-clip-text text-transparent">
                Tech{" "}
              </span>
              <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                Insights
              </span>
            </h1>
            <p className="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto text-lg leading-relaxed">
              Exploring the world of web development, software engineering, and
              digital innovation. Dive into articles that share knowledge,
              experiences, and practical tips.
            </p>
          </div>

          {/* Search Bar */}
          <BlogSearch onSearch={handleSearch} searchQuery={searchQuery} />
        </div>
      </section>

      {/* Category Tabs */}
      {categoriesLoading ? (
        <div className="bg-gray-100/50 dark:bg-secondary/50 py-4 sticky top-16 z-10 backdrop-blur-sm border-y border-gray-200/50 dark:border-gray-800/50">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex justify-center py-2">
              <div className="animate-pulse flex space-x-2">
                <div className="rounded-full bg-gray-300 dark:bg-gray-600 h-8 w-20"></div>
                <div className="rounded-full bg-gray-300 dark:bg-gray-600 h-8 w-24"></div>
                <div className="rounded-full bg-gray-300 dark:bg-gray-600 h-8 w-16"></div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="sticky top-16 z-10 backdrop-blur-sm">
          {searchQuery.trim() && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800 py-3">
              <div className="max-w-6xl mx-auto px-4">
                <div className="flex items-center justify-center gap-2 text-sm text-yellow-800 dark:text-yellow-200">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <span>
                    Searching for: &ldquo;<strong>{searchQuery}</strong>&rdquo;
                  </span>
                  <button
                    onClick={clearSearch}
                    className="ml-2 text-yellow-600 dark:text-yellow-300 hover:text-yellow-800 dark:hover:text-yellow-100 underline"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          )}
          <CategoryTabs
            categories={blogCategories}
            activeCategory={activeCategory}
            onCategoryChange={handleCategoryChange}
            isSearchActive={!!searchQuery.trim()}
          />

          {/* Active Tag Indicator */}
          {activeTag && (
            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Filtering by tag:
              </span>
              <div className="flex items-center gap-2 px-3 py-1 bg-yellow-100 dark:bg-yellow-500/20 rounded-full">
                <span className="text-sm font-medium text-yellow-800 dark:text-yellow-400">
                  #{activeTag}
                </span>
                <button
                  onClick={() => {
                    setActiveTag(null);
                    setCurrentPage(1);
                    fetchFilteredBlogs();
                  }}
                  className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-200 transition-colors"
                  title="Clear tag filter"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Blog Content */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          {blogsLoading ? (
            <Loading size="lg" />
          ) : (
            <div className="lg:w-3/4">
              {/* Featured Article */}
              {featuredPost && activeCategory === "all" && !searchQuery && (
                <div className="mb-12">
                  <h2 className="text-xl text-gray-600 dark:text-gray-300 mb-4 flex items-center">
                    <span className="inline-block w-6 h-6 bg-yellow-500 rounded-full mr-2 flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-black"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                        />
                      </svg>
                    </span>
                    FEATURED POST
                  </h2>
                  <FeaturedBlogCard post={featuredPost} />
                </div>
              )}
              {/* Blog Filter and Sort Options */}
              <div className="mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-bold flex items-center text-gray-900 dark:text-white">
                    <span className="inline-block w-2 h-8 bg-yellow-500 rounded-sm mr-2"></span>
                    {searchQuery
                      ? `Search Results (${filteredPosts.length})`
                      : "Latest Articles"}
                  </h2>
                  {searchQuery && (
                    <button
                      onClick={clearSearch}
                      className="text-sm text-gray-500 dark:text-gray-400 hover:text-yellow-500 dark:hover:text-yellow-400 flex items-center gap-1 transition-colors"
                      title="Clear search"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                      Clear
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <label
                    htmlFor="sort-options"
                    className="text-sm text-gray-500 dark:text-gray-400"
                  >
                    Sort by:
                  </label>
                  <select
                    id="sort-options"
                    value={sortBy}
                    onChange={(e) =>
                      setSortBy(
                        e.target.value as "newest" | "oldest" | "popular"
                      )
                    }
                    className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-yellow-500 dark:focus:border-yellow-400 transition-all text-gray-900 dark:text-white"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="popular">Most Popular</option>
                  </select>
                </div>
              </div>
              {/* Blog Grid with Error Boundary */}
              {error ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">⚠️</div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {error}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Please try a different category or clear your search.
                  </p>
                  <button
                    onClick={() => {
                      clearSearch();
                      setActiveCategory("all");
                    }}
                    className="mt-4 text-yellow-500 dark:text-yellow-400 hover:underline"
                  >
                    Clear and view all articles
                  </button>
                </div>
              ) : (
                <>
                  {/* Blog Loading States - Show the main blogs section loading */}
                  {blogsLoading ? (
                    <Loading text="Loading articles..." size="lg" />
                  ) : categoryLoading ? (
                    <Loading text="Loading articles..." size="lg" />
                  ) : tagLoading ? (
                    <Loading text="Loading articles..." size="lg" />
                  ) : searchLoading ? (
                    <Loading text="Searching articles..." size="lg" />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {postsToShow.map((post: BlogPost) => (
                        <BlogCard key={post._id} post={post} />
                      ))}
                    </div>
                  )}

                  {/* Load More Button */}
                  {hasMorePosts &&
                    !searchLoading &&
                    !categoryLoading &&
                    !tagLoading && (
                      <div className="my-12 text-center">
                        <button
                          onClick={handleLoadMore}
                          disabled={loadingMore}
                          className="px-8 py-3 bg-yellow-500 hover:bg-yellow-400 disabled:bg-yellow-300 text-black font-medium rounded-lg transition-colors inline-flex items-center"
                        >
                          {loadingMore ? (
                            <>
                              <svg
                                className="animate-spin -ml-1 mr-3 h-5 w-5 text-black"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                />
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                              </svg>
                              Loading...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-plus mr-2"></i>
                              Load More
                            </>
                          )}
                        </button>
                      </div>
                    )}
                </>
              )}
            </div>
          )}

          {/* Sidebar */}
          <aside className="lg:w-1/4">
            <BlogSidebar
              popularPosts={popularPosts}
              tags={allTags}
              onTagClick={handleTagChange}
              activeTag={activeTag}
            />
          </aside>
        </div>
      </main>
    </ClientLayout>
  );
}
