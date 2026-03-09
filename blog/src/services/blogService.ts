// Public blog service — ported from my-brand-nextjs/src/services/blogService.ts
// + likeBlog() from src/scripts/actions/blogs/blogActions.js

import { API_BASE_URL } from "@/lib/constants";
import { safeFetch } from "@/lib/api";
import type { BlogCategory, BlogPost, PaginatedBlogsResponse } from "@/types/blog";

// ─── Public Blog Endpoints ───

/** Fetch recent blogs */
export async function getRecentBlogs(limit: number = 3): Promise<BlogPost[]> {
  const result = await safeFetch<{ blogs?: BlogPost[] }>(
    `${API_BASE_URL}/blogs/public/recent?limit=${limit}`
  );

  if (!result.success) {
    return [];
  }

  return (result.data?.blogs ?? (result.data as unknown as BlogPost[])) || [];
}

/** Fetch paginated blogs for the listing page */
export async function getBlogsPaginated(
  page: number = 1,
  limit: number = 10
): Promise<PaginatedBlogsResponse> {
  const result = await safeFetch<{
    blogs: BlogPost[];
    pagination: Record<string, unknown>;
  }>(`${API_BASE_URL}/blogs/public?page=${page}&limit=${limit}`);

  if (!result.success) {
    return {
      blogs: [],
      totalCount: 0,
      hasMore: false,
      currentPage: 1,
      totalPages: 1,
      pagination: {},
    };
  }

  const blogs = result.data?.blogs || [];
  const pagination = result.data?.pagination || {};

  return {
    blogs,
    totalCount: (pagination.totalBlogs as number) || 0,
    hasMore: (pagination.hasNextPage as boolean) || false,
    currentPage: (pagination.currentPage as number) || page,
    totalPages: (pagination.totalPages as number) || 1,
    pagination,
  };
}

/** Fetch a single blog by ID */
export async function getBlogById(id: string): Promise<BlogPost | null> {
  const result = await safeFetch<BlogPost>(
    `${API_BASE_URL}/blogs/public/${id}`
  );

  if (result.success && result.data) return result.data;

  return null;
}

/** Fetch a single blog by slug */
export async function getBlogBySlug(slug: string): Promise<BlogPost | null> {
  const result = await safeFetch<BlogPost>(
    `${API_BASE_URL}/blogs/by-slug/${slug}`
  );

  if (result.success && result.data) return result.data;

  return null;
}

/** Fetch blogs by category */
export async function getBlogsByCategory(
  categoryId: string,
  page: number = 1,
  limit: number = 10
): Promise<PaginatedBlogsResponse> {
  const result = await safeFetch<{
    blogs: BlogPost[];
    pagination: Record<string, unknown>;
  }>(
    `${API_BASE_URL}/blogs/by-category/${categoryId}?page=${page}&limit=${limit}`
  );

  if (!result.success) {
    return {
      blogs: [],
      totalCount: 0,
      hasMore: false,
      currentPage: 1,
      totalPages: 1,
      pagination: {},
    };
  }

  const blogs = result.data?.blogs || [];
  const pagination = result.data?.pagination || {};

  return {
    blogs,
    totalCount: (pagination.totalBlogs as number) || 0,
    hasMore: (pagination.hasNextPage as boolean) || false,
    currentPage: (pagination.currentPage as number) || page,
    totalPages: (pagination.totalPages as number) || 1,
    pagination,
  };
}

/** Fetch blogs by tag */
export async function getBlogsByTag(
  tag: string,
  page: number = 1,
  limit: number = 10,
  sortBy?: string,
  sortOrder?: string,
  status?: string
): Promise<PaginatedBlogsResponse & { filters: Record<string, unknown> }> {
  const params = new URLSearchParams({
    tag,
    page: page.toString(),
    limit: limit.toString(),
  });

  if (sortBy) params.append("sortBy", sortBy);
  if (sortOrder) params.append("sortOrder", sortOrder);
  if (status) params.append("status", status);

  const result = await safeFetch<{
    blogs: BlogPost[];
    pagination: Record<string, unknown>;
    filters: Record<string, unknown>;
  }>(`${API_BASE_URL}/blogs/by-tag?${params.toString()}`);

  if (!result.success) {
    return {
      blogs: [],
      totalCount: 0,
      hasMore: false,
      currentPage: 1,
      totalPages: 1,
      pagination: {},
      filters: {},
    };
  }

  const blogs = result.data?.blogs || [];
  const pagination = result.data?.pagination || {};
  const filters = result.data?.filters || {};

  return {
    blogs,
    totalCount: (pagination.totalBlogs as number) || 0,
    hasMore: (pagination.hasNextPage as boolean) || false,
    currentPage: (pagination.currentPage as number) || page,
    totalPages: (pagination.totalPages as number) || 1,
    pagination,
    filters,
  };
}

/** Search blogs by title */
export async function searchBlogsByTitle(
  query: string,
  page: number = 1,
  limit: number = 10
): Promise<PaginatedBlogsResponse> {
  const result = await safeFetch<{
    blogs: BlogPost[];
    pagination: Record<string, unknown>;
  }>(
    `${API_BASE_URL}/blogs/by-title?title=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
  );

  if (!result.success) {
    return {
      blogs: [],
      totalCount: 0,
      hasMore: false,
      currentPage: 1,
      totalPages: 1,
      pagination: {},
    };
  }

  const blogs = result.data?.blogs || [];
  const pagination = result.data?.pagination || {};

  return {
    blogs,
    totalCount: (pagination.totalBlogs as number) || 0,
    hasMore: (pagination.hasNextPage as boolean) || false,
    currentPage: (pagination.currentPage as number) || page,
    totalPages: (pagination.totalPages as number) || 1,
    pagination,
  };
}

/** Like / unlike a blog post */
export async function likeBlog(
  blogId: string
): Promise<{ likes: number } | null> {
  const result = await safeFetch<{ likes: number }>(
    `${API_BASE_URL}/blogs/like/${blogId}`,
    {
      method: "PUT",
      credentials: "include",
    }
  );

  if (!result.success) {
    return null;
  }

  return result.data;
}

/** Fetch blog author by blog ID */
export async function getAuthorByBlogId(blogId: string) {
  const result = await safeFetch(`${API_BASE_URL}/blogs/author/${blogId}`);

  if (!result.success) {
    return null;
  }

  return result.data;
}

// ─── Category Endpoints (public-facing) ───

/** Fetch all blog categories */
export async function getAllBlogCategories(): Promise<BlogCategory[]> {
  const result = await safeFetch<BlogCategory[]>(
    `${API_BASE_URL}/blog-category`
  );

  if (!result.success) {
    return [];
  }

  return result.data || [];
}
