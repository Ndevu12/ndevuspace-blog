"use client";

import { create } from "zustand";
import type { BlogPost, BlogCategory } from "@/types/blog";
import {
  getAllBlogCategories,
  getBlogsPaginated,
  getBlogsByCategory,
  getBlogsByTag,
  searchBlogsByTitle,
} from "@/services/resolvedBlogService";

// ─── Types ───

type SortOption = "newest" | "oldest" | "popular";

interface BlogListingState {
  // Data
  blogs: BlogPost[];
  blogCategories: BlogCategory[];
  featuredPost: BlogPost | null;
  popularPosts: BlogPost[];
  allTags: string[];

  // Filters
  activeCategory: string;
  activeTag: string | null;
  searchQuery: string;
  sortBy: SortOption;

  // Pagination
  currentPage: number;
  hasMorePosts: boolean;

  // Loading states
  blogsLoading: boolean;
  categoriesLoading: boolean;
  categoryLoading: boolean;
  tagLoading: boolean;
  searchLoading: boolean;
  loadingMore: boolean;

  // Error
  error: string | null;
}

interface BlogListingActions {
  // Data fetching
  fetchCategories: () => Promise<void>;
  fetchFilteredBlogs: (source?: "category" | "search" | "tag" | "initial") => Promise<void>;
  loadMorePosts: () => Promise<void>;

  // Hydration from server data
  hydrateFromServer: (data: {
    blogs: BlogPost[];
    categories: BlogCategory[];
    totalCount: number;
    hasMore: boolean;
    currentPage: number;
  }) => void;

  // Filter actions
  setActiveCategory: (categoryId: string) => void;
  setActiveTag: (tag: string | null) => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (sort: SortOption) => void;

  // Composite actions
  handleSearch: (query: string) => void;
  clearSearch: () => void;
  handleCategoryChange: (categoryId: string) => void;
  handleTagChange: (tag: string) => void;
  clearAllFilters: () => void;

  // Hydration from URL params
  hydrateFromParams: (params: { tag?: string | null; category?: string | null; search?: string | null }) => void;
}

// ─── Constants ───

const POSTS_PER_PAGE = 10;

// ─── Store ───

export const useBlogListingStore = create<BlogListingState & BlogListingActions>(
  (set, get) => ({
    // Initial state
    blogs: [],
    blogCategories: [],
    featuredPost: null,
    popularPosts: [],
    allTags: [],
    activeCategory: "all",
    activeTag: null,
    searchQuery: "",
    sortBy: "newest",
    currentPage: 1,
    hasMorePosts: false,
    blogsLoading: true,
    categoriesLoading: true,
    categoryLoading: false,
    tagLoading: false,
    searchLoading: false,
    loadingMore: false,
    error: null,

    // ─── Hydration from Server ───

    hydrateFromServer: (data) => {
      const { blogs, categories, hasMore, currentPage } = data;

      const blogTags = blogs.flatMap((blog: BlogPost) => blog.tags || []);
      const uniqueTags = Array.from(new Set(blogTags.filter(Boolean)));

      const popular = [...blogs]
        .sort((a, b) => (b.likes || 0) - (a.likes || 0))
        .slice(0, 3);

      // Check if there's a pending unresolved category name from URL params
      // (hydrateFromParams may have run before categories were loaded)
      const { activeCategory } = get();
      let resolvedCategory = activeCategory;
      if (activeCategory && activeCategory !== "all") {
        const isAlreadyId = categories.some((c) => c._id === activeCategory);
        if (!isAlreadyId) {
          const found = categories.find(
            (c) => c.name.toLowerCase() === activeCategory.toLowerCase()
          );
          if (found) {
            resolvedCategory = found._id;
          }
        }
      }

      set({
        blogs,
        blogCategories: categories,
        featuredPost: blogs.length > 0 ? blogs[0] : null,
        popularPosts: popular,
        allTags: uniqueTags,
        currentPage,
        hasMorePosts: hasMore,
        blogsLoading: false,
        categoriesLoading: false,
        activeCategory: resolvedCategory,
        error: null,
      });
    },

    // ─── Data Fetching ───

    fetchCategories: async () => {
      set({ categoriesLoading: true });
      try {
        const categories = await getAllBlogCategories();
        set({ blogCategories: categories, categoriesLoading: false });
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        set({ blogCategories: [], categoriesLoading: false });
      }
    },

    fetchFilteredBlogs: async (source = "initial") => {
      const { activeCategory, activeTag, searchQuery, blogCategories } = get();

      // Set loading state based on source
      const loadingUpdate: Partial<BlogListingState> = {};
      switch (source) {
        case "category":
          loadingUpdate.categoryLoading = true;
          break;
        case "search":
          loadingUpdate.searchLoading = true;
          break;
        case "tag":
          loadingUpdate.tagLoading = true;
          break;
        default:
          loadingUpdate.blogsLoading = true;
      }
      set(loadingUpdate);

      try {
        let data;

        if (searchQuery.trim()) {
          data = await searchBlogsByTitle(searchQuery.trim(), 1, POSTS_PER_PAGE);
        } else if (activeTag) {
          data = await getBlogsByTag(activeTag, 1, POSTS_PER_PAGE);
        } else if (activeCategory && activeCategory !== "all") {
          const category = blogCategories.find((cat) => cat._id === activeCategory);
          if (category) {
            data = await getBlogsByCategory(category._id, 1, POSTS_PER_PAGE);
          } else {
            data = await getBlogsPaginated(1, POSTS_PER_PAGE);
          }
        } else {
          data = await getBlogsPaginated(1, POSTS_PER_PAGE);
        }

        if (data?.blogs) {
          const isUnfiltered = activeCategory === "all" && !searchQuery.trim() && !activeTag;

          // Extract tags
          const blogTags = data.blogs.flatMap((blog: BlogPost) => blog.tags || []);
          const uniqueTags = Array.from(new Set(blogTags.filter(Boolean)));

          // Popular posts (top 3 by likes)
          const popular = [...data.blogs]
            .sort((a, b) => (b.likes || 0) - (a.likes || 0))
            .slice(0, 3);

          set({
            blogs: data.blogs,
            currentPage: data.currentPage || 1,
            hasMorePosts: data.hasMore || false,
            featuredPost: isUnfiltered && data.blogs.length > 0 ? data.blogs[0] : null,
            allTags: uniqueTags,
            popularPosts: popular,
            error: null,
          });
        } else {
          set({
            blogs: [],
            popularPosts: [],
            featuredPost: null,
            error: "No articles available.",
          });
        }
      } catch (error) {
        console.error("Error fetching blogs:", error);
        set({ blogs: [], featuredPost: null, error: "Failed to load articles." });
      } finally {
        // Clear all loading states
        set({
          blogsLoading: false,
          categoryLoading: false,
          searchLoading: false,
          tagLoading: false,
        });
      }
    },

    loadMorePosts: async () => {
      const { loadingMore, hasMorePosts, currentPage, searchQuery, activeCategory, blogCategories, blogs } = get();
      if (loadingMore || !hasMorePosts) return;

      set({ loadingMore: true });

      try {
        const nextPage = currentPage + 1;
        let response;

        if (searchQuery.trim()) {
          response = await searchBlogsByTitle(searchQuery, nextPage, POSTS_PER_PAGE);
        } else if (activeCategory !== "all") {
          const selectedCategory = blogCategories.find((cat) => cat._id === activeCategory);
          if (selectedCategory) {
            response = await getBlogsByCategory(selectedCategory._id, nextPage, POSTS_PER_PAGE);
          } else {
            response = await getBlogsPaginated(nextPage, POSTS_PER_PAGE);
          }
        } else {
          response = await getBlogsPaginated(nextPage, POSTS_PER_PAGE);
        }

        const allBlogs = [...blogs, ...response.blogs];
        const mergedTags = Array.from(
          new Set(allBlogs.flatMap((blog) => blog.tags || []).filter(Boolean))
        );

        set({
          blogs: allBlogs,
          currentPage: response.currentPage,
          hasMorePosts: response.hasMore,
          allTags: mergedTags,
        });
      } catch (error) {
        console.error("Failed to load more blogs:", error);
      } finally {
        set({ loadingMore: false });
      }
    },

    // ─── Filter Actions ───

    setActiveCategory: (categoryId) => set({ activeCategory: categoryId }),
    setActiveTag: (tag) => set({ activeTag: tag }),
    setSearchQuery: (query) => set({ searchQuery: query }),
    setSortBy: (sort) => set({ sortBy: sort }),

    // ─── Composite Actions ───

    handleSearch: (query) => {
      const state = get();
      set({
        searchQuery: query,
        currentPage: 1,
        error: null,
        activeCategory: query.trim() && state.activeCategory !== "all" ? "all" : state.activeCategory,
      });
      // Fetch is triggered by the component via useEffect watching searchQuery
    },

    clearSearch: () => {
      set({ searchQuery: "", currentPage: 1, error: null });
    },

    handleCategoryChange: (categoryId) => {
      set({
        activeCategory: categoryId,
        currentPage: 1,
        error: null,
        activeTag: null,
        searchQuery: "",
      });
    },

    handleTagChange: (tag) => {
      set({
        activeTag: tag,
        currentPage: 1,
        error: null,
        searchQuery: "",
        activeCategory: "all",
      });
    },

    clearAllFilters: () => {
      set({
        searchQuery: "",
        activeCategory: "all",
        activeTag: null,
        currentPage: 1,
        error: null,
      });
    },

    hydrateFromParams: ({ tag, category, search }) => {
      const updates: Partial<BlogListingState> = {};

      if (search) {
        updates.searchQuery = search;
        updates.activeCategory = "all";
        updates.activeTag = null;
      } else if (tag) {
        updates.activeTag = tag;
        updates.activeCategory = "all";
        updates.searchQuery = "";
      } else if (category) {
        // Resolve category name to _id
        const { blogCategories } = get();
        const found = blogCategories.find(
          (c) => c.name.toLowerCase() === category.toLowerCase()
        );
        if (found) {
          updates.activeCategory = found._id;
        } else {
          // If categories aren't loaded yet, store the name and resolve later
          updates.activeCategory = category;
        }
        updates.activeTag = null;
        updates.searchQuery = "";
      }

      if (Object.keys(updates).length > 0) {
        set(updates);
      }
    },
  })
);
