import { create } from "zustand";
import type {
  BlogAdminFilters,
  BlogAdminPagination,
  BlogStatus,
} from "@/types/admin";
import type { BlogPost } from "@/types/blog";
import { dashboardBlogService } from "@/features/dashboard/services/dashboardBlogService";

/** Outcome of a bulk operation — how many rows succeeded vs. failed. */
export interface BulkResult {
  ok: number;
  failed: number;
}

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
  /** Row IDs ticked for a bulk action (scoped to the current page/filter view). */
  selectedIds: string[];

  // Actions
  setSearchInput: (value: string) => void;
  setFilters: (updater: Partial<BlogAdminFilters> | ((prev: BlogAdminFilters) => BlogAdminFilters)) => void;
  setFiltersVisible: (visible: boolean) => void;
  clearFilters: () => void;
  loadBlogs: () => Promise<void>;
  deleteBlog: (blogId: string) => Promise<void>;
  /** Schedule a post for future auto-publication (pg_cron flips it when due). */
  scheduleBlog: (blogId: string, publishAtIso: string) => Promise<void>;
  /** Publish a scheduled (or draft) post immediately. */
  publishNow: (blogId: string) => Promise<void>;

  // Bulk selection
  toggleSelected: (blogId: string) => void;
  setSelected: (ids: string[]) => void;
  clearSelection: () => void;
  bulkUpdateStatus: (status: BlogStatus) => Promise<BulkResult>;
  bulkDelete: () => Promise<BulkResult>;
}

export const useAllBlogsStore = create<AllBlogsState>((set, get) => ({
  blogs: [],
  pagination: DEFAULT_PAGINATION,
  loading: true,
  error: null,
  filters: DEFAULT_FILTERS,
  searchInput: "",
  filtersVisible: false,
  selectedIds: [],

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
      const response = await dashboardBlogService.getAdminBlogs(filters);
      set({
        blogs: response.blogs,
        pagination: response.pagination,
        loading: false,
        // Drop any selection that referenced the previous page/filter view.
        selectedIds: [],
      });
    } catch (err) {
      console.error("Error loading blogs:", err);
      set({
        error: "Failed to load blogs. Please try again.",
        blogs: [],
        loading: false,
        selectedIds: [],
      });
    }
  },

  deleteBlog: async (blogId) => {
    await dashboardBlogService.deleteBlog(blogId);
    // Reload after deletion
    await get().loadBlogs();
  },

  scheduleBlog: async (blogId, publishAtIso) => {
    await dashboardBlogService.scheduleBlog(blogId, publishAtIso);
    await get().loadBlogs();
  },

  publishNow: async (blogId) => {
    await dashboardBlogService.updateBlogStatus(blogId, "published");
    await get().loadBlogs();
  },

  // ─── Bulk selection ───

  toggleSelected: (blogId) =>
    set((state) => ({
      selectedIds: state.selectedIds.includes(blogId)
        ? state.selectedIds.filter((id) => id !== blogId)
        : [...state.selectedIds, blogId],
    })),

  setSelected: (ids) => set({ selectedIds: ids }),

  clearSelection: () => set({ selectedIds: [] }),

  bulkUpdateStatus: async (status) => {
    const ids = get().selectedIds;
    const results = await Promise.allSettled(
      ids.map((id) => dashboardBlogService.updateBlogStatus(id, status))
    );
    const failed = results.filter((r) => r.status === "rejected").length;
    await get().loadBlogs(); // also clears the selection
    return { ok: ids.length - failed, failed };
  },

  bulkDelete: async () => {
    const ids = get().selectedIds;
    const results = await Promise.allSettled(
      ids.map((id) => dashboardBlogService.deleteBlog(id))
    );
    const failed = results.filter((r) => r.status === "rejected").length;
    await get().loadBlogs(); // also clears the selection
    return { ok: ids.length - failed, failed };
  },
}));
