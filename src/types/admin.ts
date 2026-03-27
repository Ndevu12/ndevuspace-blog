// Admin dashboard types — ported from my-brand-nextjs/src/types/admin/types.ts
// with additions for blog form data and enhanced filter options

import { z } from "zod/v4";
import type { BlogPost, BlogCategory, IsoDateString } from "./blog";

// ─── Admin Filters & Pagination ───

export type BlogStatus = "published" | "draft" | "archived";
export type BlogAdminRpcSortBy =
  | "created_at"
  | "updated_at"
  | "title"
  | "views_count"
  | "likes_count";
export type BlogAdminSortOrder = "asc" | "desc";

/**
 * Dashboard/UI filter state.
 * Keep this as UI-friendly shape, then map to {@link BlogAdminListRpcParams} before `supabase.rpc`.
 */
export interface BlogAdminFilters {
  page: number;
  limit: number;
  status: "" | BlogStatus;
  category: string;
  search: string;
  sortBy:
    | BlogAdminRpcSortBy
    | "createdAt"
    | "updatedAt"
    | "viewsCount"
    | "likesCount";
  sortOrder: BlogAdminSortOrder;
}

/** Raw named params for `public.blog_admin_list` RPC. */
export interface BlogAdminListRpcParams {
  p_page: number;
  p_limit: number;
  p_status: "" | BlogStatus;
  p_category_id: string | null;
  p_search: string | null;
  p_sort_by: BlogAdminRpcSortBy;
  p_sort_order: BlogAdminSortOrder;
}

export interface BlogAdminPagination {
  /** RPC nested envelope: `pagination.page`. */
  page?: number;
  /** RPC nested envelope: `pagination.limit`. */
  limit?: number;
  /** RPC nested envelope: `pagination.total`. */
  total?: number;
  /** RPC nested envelope: `pagination.has_more`. */
  has_more?: boolean;

  // Legacy UI aliases kept for compatibility during migration.
  currentPage: number;
  totalPages: number;
  totalBlogs: number;
  blogsPerPage: number;
}

/**
 * `blog_admin_list` jsonb response.
 * Top-level fields are emitted by SQL and should be consumed directly.
 */
export interface BlogAdminResponse {
  blogs: BlogPost[];
  totalCount?: number;
  hasMore?: boolean;
  currentPage?: number;
  totalPages?: number;
  pagination: BlogAdminPagination;
}

// ─── Admin Blog Extended ───

export interface AdminBlogPost extends BlogPost {
  viewsCount?: number;
  likesCount?: number;
  commentsCount?: number;
  status: BlogStatus;
}

/**
 * JSON object passed as `p_payload` to `blog_admin_create` and `blog_admin_update`.
 * Uses **snake_case** keys matching `public.blogs` columns so SQL can patch rows without a rename layer.
 * Partial updates: only include keys to apply. If `tag_names` is present, it replaces all links (empty array clears).
 *
 * RPC **responses** use camelCase jsonb (blog_row_json and envelopes); see `src/types/blog.ts`
 * and `COMMENT ON FUNCTION public._blog_rpc_json_wire_convention_doc()`.
 */
export interface BlogAdminRpcPayload {
  title?: string;
  description?: string;
  content?: string;
  slug?: string | null;
  category_id?: string | null;
  image_url?: string | null;
  read_time?: number | null;
  meta_title?: string | null;
  meta_description?: string | null;
  status?: BlogStatus;
  author_image?: string | null;
  is_new?: boolean;
  is_featured?: boolean;
  tag_names?: string[];
}

// ─── Admin Blog Stats ───

export interface BlogStats {
  views: number;
  likes: number;
  comments: number;
  shares: number;
}

/** JSON returned by `public.blog_dashboard_stats()`. */
export interface BlogDashboardStatsResponse {
  total_blogs: number;
  published_count: number;
  draft_count: number;
  archived_count: number;
  total_views: number;
  total_likes: number;
}

/** Named params for `public.blog_dashboard_recent_activity(p_limit int default 5)`. */
export interface BlogDashboardRecentActivityRpcParams {
  p_limit?: number;
}

/** One item from `blog_dashboard_recent_activity` response `items`. */
export interface BlogDashboardRecentActivityItem {
  id: string;
  title: string;
  updated_at: IsoDateString;
  status: BlogStatus;
}

/** JSON returned by `public.blog_dashboard_recent_activity(...)`. */
export interface BlogDashboardRecentActivityResponse {
  items: BlogDashboardRecentActivityItem[];
}

export type BlogDashboardTimeseriesMetric = "posts_created" | "views";
export type BlogDashboardTimeseriesBucket = "day" | "week" | "month";

/** Named params for `public.blog_dashboard_timeseries(...)`. */
export interface BlogDashboardTimeseriesRpcParams {
  p_metric: BlogDashboardTimeseriesMetric;
  p_start: string | null;
  p_end: string | null;
  p_bucket: BlogDashboardTimeseriesBucket;
}

/** One timeseries datapoint from `blog_dashboard_timeseries` response `points`. */
export interface BlogDashboardTimeseriesPoint {
  bucket_start: IsoDateString;
  value: number;
}

/** JSON returned by `public.blog_dashboard_timeseries(...)`. */
export interface BlogDashboardTimeseriesResponse {
  points: BlogDashboardTimeseriesPoint[];
}

/** One category row from `blog_dashboard_category_distribution` response `categories`. */
export interface BlogDashboardCategoryDistributionItem {
  category: string;
  posts: number;
}

/** JSON returned by `public.blog_dashboard_category_distribution()`. */
export interface BlogDashboardCategoryDistributionResponse {
  categories: BlogDashboardCategoryDistributionItem[];
}

// ─── Component Props ───

export interface BlogAdminTableProps {
  className?: string;
}

export interface BlogTableProps {
  blogs: BlogPost[];
  onEdit: (blogId: string) => void;
  onView: (blogId: string) => void;
  onDelete: (blogId: string) => void;
  loading?: boolean;
}

export interface BlogFiltersProps {
  filters: BlogAdminFilters;
  categories: BlogCategory[];
  onFiltersChange: (filters: Partial<BlogAdminFilters>) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
  isVisible: boolean;
  onToggleVisibility: () => void;
}

export interface BlogActionsProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onToggleFilters: () => void;
  onNewBlog: () => void;
  filtersVisible: boolean;
}

export interface BlogPaginationProps {
  pagination: BlogAdminPagination;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

// ─── Zod Schemas ───

export const blogFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  content: z.string().min(20, "Content must be at least 20 characters"),
  category: z.string().min(1, "Please select a category"),
  tags: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  status: z.enum(["published", "draft"]).default("draft"),
});

export type BlogFormData = z.infer<typeof blogFormSchema>;

export const categoryFormSchema = z.object({
  name: z.string().min(2, "Category name must be at least 2 characters"),
  icon: z.string().min(1, "Please provide an icon identifier"),
});

export type CategoryFormData = z.infer<typeof categoryFormSchema>;
