import { createClient } from "@/lib/supabase/client";
import type {
  BlogAdminFilters,
  BlogAdminListRpcParams,
  BlogAdminResponse,
  BlogAdminRpcPayload,
  BlogDashboardRecentActivityResponse,
  BlogDashboardStatsResponse,
  BlogDashboardTimeseriesBucket,
  BlogDashboardTimeseriesMetric,
  BlogDashboardTimeseriesResponse,
  BlogStatus,
} from "@/types/admin";
import type { BlogPost } from "@/types/blog";

type RpcRecord = Record<string, unknown>;

function toRpcRecord(data: unknown, errorMessage: string): RpcRecord {
  if (!data || typeof data !== "object") {
    throw new Error(errorMessage);
  }
  return data as RpcRecord;
}

function normalizeBlogPost(post: BlogPost): BlogPost {
  const normalizedId = post.id ?? "";
  const category = post.category
    ? {
        ...post.category,
        id: post.category.id,
      }
    : undefined;

  return {
    ...post,
    id: normalizedId,
    category,
  };
}

function mapSortByToRpc(sortBy: BlogAdminFilters["sortBy"]): BlogAdminListRpcParams["p_sort_by"] {
  if (sortBy === "createdAt") return "created_at";
  if (sortBy === "updatedAt") return "updated_at";
  if (sortBy === "viewsCount") return "views_count";
  if (sortBy === "likesCount") return "likes_count";
  return sortBy;
}

function mapFiltersToRpcParams(filters: BlogAdminFilters): BlogAdminListRpcParams {
  return {
    p_page: Math.max(1, filters.page),
    p_limit: Math.max(1, filters.limit),
    p_status: filters.status,
    p_category_id: filters.category || null,
    p_search: filters.search.trim() ? filters.search.trim() : null,
    p_sort_by: mapSortByToRpc(filters.sortBy),
    p_sort_order: filters.sortOrder,
  };
}

function parseTotalCount(payload: RpcRecord): number {
  if (typeof payload.totalCount === "number") {
    return payload.totalCount;
  }
  const pagination =
    payload.pagination && typeof payload.pagination === "object"
      ? (payload.pagination as RpcRecord)
      : null;
  if (pagination && typeof pagination.total === "number") {
    return pagination.total;
  }
  return 0;
}

function parseAdminResponse(data: unknown): BlogAdminResponse {
  const payload = toRpcRecord(data, "Invalid admin blogs response.");
  const blogs = Array.isArray(payload.blogs)
    ? (payload.blogs as BlogPost[]).map(normalizeBlogPost)
    : [];
  const totalBlogs = parseTotalCount(payload);
  const currentPage =
    typeof payload.currentPage === "number"
      ? payload.currentPage
      : typeof payload.pagination === "object" &&
          payload.pagination &&
          typeof (payload.pagination as RpcRecord).page === "number"
        ? ((payload.pagination as RpcRecord).page as number)
        : 1;
  const totalPages =
    typeof payload.totalPages === "number"
      ? payload.totalPages
      : typeof payload.pagination === "object" &&
          payload.pagination &&
          typeof (payload.pagination as RpcRecord).limit === "number" &&
          (payload.pagination as RpcRecord).limit
        ? Math.max(
            1,
            Math.ceil(totalBlogs / Number((payload.pagination as RpcRecord).limit))
          )
        : 1;
  const blogsPerPage =
    typeof payload.pagination === "object" &&
    payload.pagination &&
    typeof (payload.pagination as RpcRecord).limit === "number"
      ? ((payload.pagination as RpcRecord).limit as number)
      : blogs.length;

  return {
    blogs,
    totalCount: typeof payload.totalCount === "number" ? payload.totalCount : undefined,
    hasMore: typeof payload.hasMore === "boolean" ? payload.hasMore : undefined,
    currentPage: typeof payload.currentPage === "number" ? payload.currentPage : undefined,
    totalPages: typeof payload.totalPages === "number" ? payload.totalPages : undefined,
    pagination: {
      page:
        typeof payload.pagination === "object" && payload.pagination
          ? ((payload.pagination as RpcRecord).page as number | undefined)
          : undefined,
      limit:
        typeof payload.pagination === "object" && payload.pagination
          ? ((payload.pagination as RpcRecord).limit as number | undefined)
          : undefined,
      total:
        typeof payload.pagination === "object" && payload.pagination
          ? ((payload.pagination as RpcRecord).total as number | undefined)
          : undefined,
      has_more:
        typeof payload.pagination === "object" && payload.pagination
          ? ((payload.pagination as RpcRecord).has_more as boolean | undefined)
          : undefined,
      currentPage,
      totalPages,
      totalBlogs,
      blogsPerPage,
    },
  };
}

function parseReadTime(value: FormDataEntryValue | null): number | null {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }
  const parsed = Number.parseInt(value, 10);
  if (Number.isFinite(parsed)) {
    return parsed;
  }
  const fromLabel = Number.parseInt(value.replace(/\D+/g, ""), 10);
  return Number.isFinite(fromLabel) ? fromLabel : null;
}

function parseTags(value: FormDataEntryValue | null): string[] | undefined {
  if (typeof value !== "string" || !value.trim()) {
    return undefined;
  }
  try {
    const parsed = JSON.parse(value) as unknown;
    if (Array.isArray(parsed)) {
      return parsed
        .map((item) => (typeof item === "string" ? item.trim() : ""))
        .filter(Boolean);
    }
  } catch {
    return undefined;
  }
  return undefined;
}

function buildPayloadFromFormData(formData: FormData): BlogAdminRpcPayload {
  const payload: BlogAdminRpcPayload = {
    title: String(formData.get("title") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    content: String(formData.get("content") ?? "").trim(),
    status: (formData.get("status") as BlogStatus | null) ?? "draft",
  };

  const categoryId = String(formData.get("category") ?? "").trim();
  if (categoryId) {
    payload.category_id = categoryId;
  }

  const imageUrl = String(formData.get("imageUrl") ?? "").trim();
  if (imageUrl) {
    payload.image_url = imageUrl;
  }

  const metaTitle = String(formData.get("metaTitle") ?? "").trim();
  if (metaTitle) {
    payload.meta_title = metaTitle;
  }

  const metaDescription = String(formData.get("metaDescription") ?? "").trim();
  if (metaDescription) {
    payload.meta_description = metaDescription;
  }

  const readTime = parseReadTime(formData.get("readTime"));
  if (readTime !== null) {
    payload.read_time = readTime;
  }

  const tagNames = parseTags(formData.get("tags"));
  if (tagNames) {
    payload.tag_names = tagNames;
  }

  return payload;
}

export async function getAdminBlogs(filters: BlogAdminFilters): Promise<BlogAdminResponse> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("blog_admin_list", mapFiltersToRpcParams(filters));

  if (error) {
    throw new Error(error.message || "Failed to fetch admin blogs.");
  }

  return parseAdminResponse(data);
}

export async function getBlogById(blogId: string): Promise<BlogPost | null> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("blog_admin_get", {
    p_blog_id: blogId,
  });

  if (error) {
    throw new Error(error.message || "Failed to fetch blog.");
  }

  if (!data || typeof data !== "object") {
    return null;
  }

  return normalizeBlogPost(data as BlogPost);
}

export async function createBlog(formData: FormData): Promise<void> {
  const supabase = createClient();
  const payload = buildPayloadFromFormData(formData);
  const { error } = await supabase.rpc("blog_admin_create", {
    p_payload: payload,
  });

  if (error) {
    throw new Error(error.message || "Failed to create blog.");
  }
}

export async function updateBlog(blogId: string, formData: FormData): Promise<void> {
  const supabase = createClient();
  const payload = buildPayloadFromFormData(formData);
  const { error } = await supabase.rpc("blog_admin_update", {
    p_blog_id: blogId,
    p_payload: payload,
  });

  if (error) {
    throw new Error(error.message || "Failed to update blog.");
  }
}

export async function updateBlogStatus(blogId: string, status: BlogStatus): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.rpc("blog_admin_set_status", {
    p_blog_id: blogId,
    p_status: status,
  });

  if (error) {
    throw new Error(error.message || "Failed to update blog status.");
  }
}

export async function deleteBlog(blogId: string): Promise<void> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("blog_admin_delete", {
    p_blog_id: blogId,
  });

  if (error) {
    throw new Error(error.message || "Failed to delete blog.");
  }

  const payload = toRpcRecord(data, "Invalid blog delete response.");
  if (!payload.ok) {
    throw new Error("Blog delete was not acknowledged.");
  }
}

export async function getDashboardStats(): Promise<BlogDashboardStatsResponse> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("blog_dashboard_stats");

  if (error) {
    throw new Error(error.message || "Failed to fetch dashboard stats.");
  }

  const payload = toRpcRecord(data, "Invalid dashboard stats response.");
  return {
    total_blogs: Number(payload.total_blogs ?? 0),
    published_count: Number(payload.published_count ?? 0),
    draft_count: Number(payload.draft_count ?? 0),
    archived_count: Number(payload.archived_count ?? 0),
    total_views: Number(payload.total_views ?? 0),
    total_likes: Number(payload.total_likes ?? 0),
  };
}

export async function getDashboardRecentActivity(limit: number = 5): Promise<BlogDashboardRecentActivityResponse> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("blog_dashboard_recent_activity", {
    p_limit: limit,
  });

  if (error) {
    throw new Error(error.message || "Failed to fetch dashboard recent activity.");
  }

  const payload = toRpcRecord(data, "Invalid dashboard recent activity response.");
  return {
    items: Array.isArray(payload.items)
      ? (payload.items as BlogDashboardRecentActivityResponse["items"])
      : [],
  };
}

export async function getDashboardTimeseries(
  metric: BlogDashboardTimeseriesMetric,
  start: string | null,
  end: string | null,
  bucket: BlogDashboardTimeseriesBucket
): Promise<BlogDashboardTimeseriesResponse> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("blog_dashboard_timeseries", {
    p_metric: metric,
    p_start: start,
    p_end: end,
    p_bucket: bucket,
  });

  if (error) {
    throw new Error(error.message || "Failed to fetch dashboard timeseries.");
  }

  const payload = toRpcRecord(data, "Invalid dashboard timeseries response.");
  return {
    points: Array.isArray(payload.points)
      ? (payload.points as BlogDashboardTimeseriesResponse["points"])
      : [],
  };
}

export const dashboardBlogService = {
  getAdminBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  updateBlogStatus,
  deleteBlog,
  getDashboardStats,
  getDashboardRecentActivity,
  getDashboardTimeseries,
};

