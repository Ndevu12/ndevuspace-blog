import { createClient } from "@/lib/supabase/client";
import type {
  AdjacentBlogs,
  BlogCategory,
  BlogPost,
  BlogTag,
  PaginatedBlogsResponse,
  PaginatedTagsResponse,
} from "@/types/blog";

type RpcObject = Record<string, unknown>;

function assertRpcObject(data: unknown, errorMessage: string): RpcObject {
  if (!data || typeof data !== "object") {
    throw new Error(errorMessage);
  }
  return data as RpcObject;
}

function parsePaginatedBlogs(data: unknown): PaginatedBlogsResponse {
  const payload = assertRpcObject(data, "Invalid blog list response.");
  return {
    blogs: Array.isArray(payload.blogs) ? (payload.blogs as BlogPost[]) : [],
    totalCount: typeof payload.totalCount === "number" ? payload.totalCount : 0,
    hasMore: Boolean(payload.hasMore),
    currentPage: typeof payload.currentPage === "number" ? payload.currentPage : 1,
    totalPages: typeof payload.totalPages === "number" ? payload.totalPages : 0,
    pagination:
      payload.pagination && typeof payload.pagination === "object"
        ? (payload.pagination as Record<string, unknown>)
        : {},
  };
}

export async function getBlogsPaginated(
  page: number = 1,
  limit: number = 10
): Promise<PaginatedBlogsResponse> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("blog_public_list_published", {
    p_page: page,
    p_limit: limit,
    p_category_id: null,
    p_tag_slug: null,
    p_search: null,
    p_sort: "newest",
  });

  if (error) {
    throw new Error(error.message || "Failed to fetch blog list.");
  }

  return parsePaginatedBlogs(data);
}

export async function getBlogById(id: string): Promise<BlogPost | null> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("blog_admin_get", {
    p_blog_id: id,
  });

  if (error) {
    throw new Error(error.message || "Failed to fetch blog.");
  }

  if (!data || typeof data !== "object") {
    return null;
  }

  return data as BlogPost;
}

export async function getBlogBySlug(slug: string): Promise<BlogPost | null> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("blog_public_get_by_slug", {
    p_slug: slug,
  });

  if (error) {
    throw new Error(error.message || "Failed to fetch blog.");
  }

  if (!data || typeof data !== "object") {
    return null;
  }

  return data as BlogPost;
}

export async function getBlogsByCategory(
  categoryId: string,
  page: number = 1,
  limit: number = 10
): Promise<PaginatedBlogsResponse> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("blog_public_list_by_category", {
    p_category_id: categoryId,
    p_page: page,
    p_limit: limit,
    p_sort: "newest",
  });

  if (error) {
    throw new Error(error.message || "Failed to fetch blogs by category.");
  }

  return parsePaginatedBlogs(data);
}

export async function getBlogsByTags(
  tags: string[],
  page: number = 1,
  limit: number = 10
): Promise<PaginatedBlogsResponse> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("blog_public_list_by_tags", {
    p_tag_slugs: tags,
    p_page: page,
    p_limit: limit,
    p_sort: "newest",
  });

  if (error) {
    throw new Error(error.message || "Failed to fetch blogs by tags.");
  }

  return parsePaginatedBlogs(data);
}

export async function searchBlogsByTitle(
  query: string,
  page: number = 1,
  limit: number = 10
): Promise<PaginatedBlogsResponse> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("blog_public_search", {
    p_query: query,
    p_page: page,
    p_limit: limit,
  });

  if (error) {
    throw new Error(error.message || "Failed to search blogs.");
  }

  return parsePaginatedBlogs(data);
}

export async function likeBlog(
  blogId: string
): Promise<{ likes: number } | null> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("blog_public_toggle_like", {
    p_blog_id: blogId,
  });

  if (error) {
    throw new Error(error.message || "Failed to toggle blog like.");
  }

  const payload = assertRpcObject(data, "Invalid like response.");
  if (typeof payload.likes_count !== "number") {
    return null;
  }

  return { likes: payload.likes_count };
}

export async function getAdjacentBlogs(slug: string): Promise<AdjacentBlogs> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("blog_public_get_adjacent", {
    p_slug: slug,
  });

  if (error) {
    throw new Error(error.message || "Failed to fetch adjacent blogs.");
  }

  if (!data || typeof data !== "object") {
    return { newer: null, older: null };
  }

  const payload = data as { newer?: BlogPost | null; older?: BlogPost | null };
  return { newer: payload.newer ?? null, older: payload.older ?? null };
}

export async function incrementBlogView(blogId: string): Promise<number | null> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("blog_public_increment_view", {
    p_blog_id: blogId,
  });

  if (error) {
    throw new Error(error.message || "Failed to record blog view.");
  }

  const payload = assertRpcObject(data, "Invalid view increment response.");
  return typeof payload.views_count === "number" ? payload.views_count : null;
}

function parsePaginatedTags(data: unknown): PaginatedTagsResponse {
  const payload = assertRpcObject(data, "Invalid tags response.");
  return {
    tags: Array.isArray(payload.tags) ? (payload.tags as BlogTag[]) : [],
    totalCount: typeof payload.totalCount === "number" ? payload.totalCount : 0,
    maxPostCount:
      typeof payload.maxPostCount === "number" ? payload.maxPostCount : 0,
    hasMore: Boolean(payload.hasMore),
    currentPage:
      typeof payload.currentPage === "number" ? payload.currentPage : 1,
  };
}

export async function getPublicTags(
  page: number = 1,
  limit: number = 10
): Promise<PaginatedTagsResponse> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("blog_public_tags_list", {
    p_page: page,
    p_limit: limit,
  });

  if (error) {
    throw new Error(error.message || "Failed to fetch tags.");
  }

  return parsePaginatedTags(data);
}

export async function getAllBlogCategories(): Promise<BlogCategory[]> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("blog_public_categories_list", {
    p_include_counts: false,
  });

  if (error) {
    throw new Error(error.message || "Failed to fetch categories.");
  }

  const payload = assertRpcObject(data, "Invalid categories response.");
  return Array.isArray(payload.categories)
    ? (payload.categories as BlogCategory[])
    : [];
}

