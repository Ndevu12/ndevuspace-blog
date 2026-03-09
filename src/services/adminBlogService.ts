// Admin blog service — ported from my-brand-nextjs/src/features/dashboard/blogs/allBlogs/services.ts
// and blogDetail/services.ts

import { API_BASE_URL } from "@/lib/constants";
import { safeFetch } from "@/lib/api";
import type { BlogPost } from "@/types/blog";
import type {
  BlogAdminFilters,
  BlogAdminResponse,
  AdminBlogPost,
  BlogStatus,
  BlogStats,
} from "@/types/admin";

// ─── Error Handling ───

function getAdminErrorMessage(error: string | null, code?: string): string {
  switch (code) {
    case "UNAUTHORIZED":
      return "You are not authorized to access this resource";
    case "FORBIDDEN":
      return "Admin access required";
    case "BLOG_NOT_FOUND":
      return "Blog not found";
    case "INVALID_LIMIT":
      return "Invalid number of items requested";
    case "INVALID_PAGE":
      return "Invalid page number";
    case "INVALID_SORT_FIELD":
      return "Invalid sorting option";
    default:
      return error || "Failed to load admin data";
  }
}

// ─── Admin Blog CRUD ───

class BlogAdminService {
  /** Get all blogs with filtering, sorting, and pagination (Admin view) */
  async getAdminBlogs(filters: BlogAdminFilters): Promise<BlogAdminResponse> {
    const params = new URLSearchParams();
    params.append("page", filters.page.toString());
    params.append("limit", filters.limit.toString());
    if (filters.search) params.append("search", filters.search);
    if (filters.category) params.append("category", filters.category);
    if (filters.status) params.append("status", filters.status);
    if (filters.sortBy) params.append("sortBy", filters.sortBy);
    if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);

    const result = await safeFetch<{
      blogs: BlogPost[];
      pagination: Record<string, unknown>;
    }>(`${API_BASE_URL}/blogs?${params.toString()}`, {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });

    if (!result.success) {
      throw new Error(getAdminErrorMessage(result.error, result.code));
    }

    const blogs = result.data?.blogs || [];
    const pagination = result.data?.pagination || {
      currentPage: filters.page,
      totalPages: 1,
      totalBlogs: 0,
      blogsPerPage: filters.limit,
    };

    return {
      blogs,
      pagination: {
        currentPage: (pagination.currentPage as number) || filters.page,
        totalPages: (pagination.totalPages as number) || 1,
        totalBlogs: (pagination.totalBlogs as number) || 0,
        blogsPerPage: (pagination.blogsPerPage as number) || filters.limit,
      },
    };
  }

  /** Get single blog with admin data */
  async getBlogById(blogId: string): Promise<AdminBlogPost | null> {
    const result = await safeFetch<AdminBlogPost>(
      `${API_BASE_URL}/blogs/${blogId}`,
      {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!result.success) {
      const msg = getAdminErrorMessage(result.error, result.code);
      console.error(`Error fetching admin blog ${blogId}:`, msg);
      return null;
    }

    return result.data;
  }

  /** Create a new blog (FormData for image upload support) */
  async createBlog(formData: FormData): Promise<AdminBlogPost> {
    const result = await safeFetch<AdminBlogPost>(
      `${API_BASE_URL}/blogs/create`,
      {
        method: "POST",
        credentials: "include",
        body: formData,
        // Note: do NOT set Content-Type header — browser sets multipart boundary automatically
      }
    );

    if (!result.success) {
      throw new Error(getAdminErrorMessage(result.error, result.code));
    }

    return result.data as AdminBlogPost;
  }

  /** Update an existing blog (FormData for image upload support) */
  async updateBlog(
    blogId: string,
    formData: FormData
  ): Promise<AdminBlogPost> {
    const result = await safeFetch<AdminBlogPost>(
      `${API_BASE_URL}/blogs/update/${blogId}`,
      {
        method: "PUT",
        credentials: "include",
        body: formData,
      }
    );

    if (!result.success) {
      throw new Error(getAdminErrorMessage(result.error, result.code));
    }

    return result.data as AdminBlogPost;
  }

  /** Update blog status only */
  async updateBlogStatus(blogId: string, status: BlogStatus): Promise<void> {
    const result = await safeFetch(
      `${API_BASE_URL}/blogs/update/${blogId}`,
      {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      }
    );

    if (!result.success) {
      throw new Error(getAdminErrorMessage(result.error, result.code));
    }
  }

  /** Delete a blog */
  async deleteBlog(blogId: string): Promise<void> {
    const result = await safeFetch(
      `${API_BASE_URL}/blogs/delete/${blogId}`,
      {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!result.success) {
      throw new Error(getAdminErrorMessage(result.error, result.code));
    }
  }

  /** Get blog stats (views, likes, comments, shares) */
  async getBlogStats(blogId: string): Promise<BlogStats | null> {
    const result = await safeFetch<BlogStats>(
      `${API_BASE_URL}/blogs/${blogId}/stats`,
      {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!result.success) {
      console.error(`Error fetching stats for blog ${blogId}:`, result.error);
      return null;
    }

    return result.data;
  }
}

export const adminBlogService = new BlogAdminService();
