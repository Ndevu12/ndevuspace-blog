// Dummy blog service — mirrors blogService.ts interface using in-memory data
// Used when NEXT_PUBLIC_USE_DUMMY_DATA=true, resolved at the consumer (store) level

import type { BlogCategory, BlogPost, PaginatedBlogsResponse } from "@/types/blog";
import { dummyBlogs, dummyCategories } from "@/data/dummyBlogs";

// ─── Helpers ───

function paginate(
  posts: BlogPost[],
  page: number,
  limit: number
): PaginatedBlogsResponse {
  const start = (page - 1) * limit;
  const sliced = posts.slice(start, start + limit);
  const totalPages = Math.ceil(posts.length / limit);

  return {
    blogs: sliced,
    totalCount: posts.length,
    hasMore: page < totalPages,
    currentPage: page,
    totalPages,
    pagination: {},
  };
}

function sortByNewest(posts: BlogPost[]): BlogPost[] {
  return [...posts].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

// ─── Public API (same signatures as blogService) ───

/** Fetch recent blogs */
export async function getRecentBlogs(limit: number = 3): Promise<BlogPost[]> {
  return sortByNewest(dummyBlogs).slice(0, limit);
}

/** Fetch paginated blogs for the listing page */
export async function getBlogsPaginated(
  page: number = 1,
  limit: number = 10
): Promise<PaginatedBlogsResponse> {
  return paginate(sortByNewest(dummyBlogs), page, limit);
}

/** Fetch a single blog by ID */
export async function getBlogById(id: string): Promise<BlogPost | null> {
  return dummyBlogs.find((b) => b._id === id) ?? null;
}

/** Fetch a single blog by slug */
export async function getBlogBySlug(slug: string): Promise<BlogPost | null> {
  return dummyBlogs.find((b) => b.slug === slug) ?? null;
}

/** Fetch blogs by category */
export async function getBlogsByCategory(
  categoryId: string,
  page: number = 1,
  limit: number = 10
): Promise<PaginatedBlogsResponse> {
  const filtered = dummyBlogs.filter((b) => b.category?._id === categoryId);
  return paginate(filtered, page, limit);
}

/** Fetch blogs by tag */
export async function getBlogsByTag(
  tag: string,
  page: number = 1,
  limit: number = 10,
  _sortBy?: string,
  _sortOrder?: string,
  _status?: string
): Promise<PaginatedBlogsResponse & { filters: Record<string, unknown> }> {
  const filtered = dummyBlogs.filter((b) =>
    b.tags.some((t) => t.toLowerCase() === tag.toLowerCase())
  );
  return { ...paginate(filtered, page, limit), filters: {} };
}

/** Search blogs by title */
export async function searchBlogsByTitle(
  query: string,
  page: number = 1,
  limit: number = 10
): Promise<PaginatedBlogsResponse> {
  const q = query.toLowerCase();
  const filtered = dummyBlogs.filter(
    (b) =>
      b.title.toLowerCase().includes(q) ||
      b.description.toLowerCase().includes(q)
  );
  return paginate(filtered, page, limit);
}

/** Like / unlike a blog post (simulated) */
export async function likeBlog(
  blogId: string
): Promise<{ likes: number } | null> {
  const post = dummyBlogs.find((b) => b._id === blogId);
  return post ? { likes: (post.likes ?? 0) + 1 } : null;
}

/** Fetch blog author by blog ID */
export async function getAuthorByBlogId(blogId: string) {
  const post = dummyBlogs.find((b) => b._id === blogId);
  return post?.author ?? null;
}

// ─── Category Endpoints ───

/** Fetch all blog categories */
export async function getAllBlogCategories(): Promise<BlogCategory[]> {
  return dummyCategories;
}
