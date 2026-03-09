import { create } from "zustand";
import { adminBlogService } from "@/services/adminBlogService";
import type { BlogAdminFilters, BlogAdminPagination } from "@/types/admin";
import type { BlogPost } from "@/types/blog";

const DEFAULT_FILTERS: BlogAdminFilters = {
  page: 1,
  limit: 10,
  status: "",
  category: "",
  search: "",
  sortBy: "createdAt",
  sortOrder: "desc",
};

const DEFAULT_PAGINATION: BlogAdminPagination = {
  currentPage: 1,
  totalPages: 1,
  totalBlogs: 0,
  blogsPerPage: 10,
};

interface AllBlogsState {
  blogs: BlogPost[];
  pagination: BlogAdminPagination;
  loading: boolean;
  error: string | null;
  filters: BlogAdminFilters;
  searchInput: string;
  filtersVisible: boolean;

  // Actions
  setSearchInput: (value: string) => void;
  setFilters: (updater: Partial<BlogAdminFilters> | ((prev: BlogAdminFilters) => BlogAdminFilters)) => void;
  setFiltersVisible: (visible: boolean) => void;
  clearFilters: () => void;
  loadBlogs: () => Promise<void>;
  deleteBlog: (blogId: string) => Promise<void>;
}

export const useAllBlogsStore = create<AllBlogsState>((set, get) => ({
  blogs: [],
  pagination: DEFAULT_PAGINATION,
  loading: true,
  error: null,
  filters: DEFAULT_FILTERS,
  searchInput: "",
  filtersVisible: false,

  setSearchInput: (value) => set({ searchInput: value }),

  setFilters: (updater) =>
    set((state) => ({
      filters: typeof updater === "function" ? updater(state.filters) : { ...state.filters, ...updater },
    })),

  setFiltersVisible: (visible) => set({ filtersVisible: visible }),

  clearFilters: () =>
    set({
      searchInput: "",
      filters: DEFAULT_FILTERS,
      filtersVisible: false,
    }),

  loadBlogs: async () => {
    const { filters } = get();
    set({ loading: true, error: null });
    try {
      const response = await adminBlogService.getAdminBlogs(filters);
      set({
        blogs: response.blogs,
        pagination: response.pagination,
        loading: false,
      });
    } catch (err) {
      console.error("Error loading blogs:", err);
      set({
        error: "Failed to load blogs. Please try again.",
        blogs: [],
        loading: false,
      });
    }
  },

  deleteBlog: async (blogId) => {
    await adminBlogService.deleteBlog(blogId);
    // Reload after deletion
    await get().loadBlogs();
  },
}));
