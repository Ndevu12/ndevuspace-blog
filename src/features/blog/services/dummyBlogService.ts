// Dummy blog service — mirrors blogService.ts interface using in-memory data
// Used when NEXT_PUBLIC_USE_DUMMY_DATA=true, resolved at the consumer level

import type { BlogCategory, BlogPost, PaginatedBlogsResponse } from "@/types/blog";
import { dummyBlogs, dummyCategories } from "@/data/dummyBlogs";

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

export async function getRecentBlogs(limit: number = 3): Promise<BlogPost[]> {
  return sortByNewest(dummyBlogs).slice(0, limit);
}

export async function getBlogsPaginated(
  page: number = 1,
  limit: number = 10
): Promise<PaginatedBlogsResponse> {
  return paginate(sortByNewest(dummyBlogs), page, limit);
}

export async function getBlogById(id: string): Promise<BlogPost | null> {
  return dummyBlogs.find((b) => b.id === id || b._id === id) ?? null;
}

export async function getBlogBySlug(slug: string): Promise<BlogPost | null> {
  return dummyBlogs.find((b) => b.slug === slug) ?? null;
}

export async function getBlogsByCategory(
  categoryId: string,
  page: number = 1,
  limit: number = 10
): Promise<PaginatedBlogsResponse> {
  const filtered = dummyBlogs.filter(
    (b) => b.category?.id === categoryId || b.category?._id === categoryId
  );
  return paginate(filtered, page, limit);
}

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

export async function likeBlog(
  blogId: string
): Promise<{ likes: number } | null> {
  const post = dummyBlogs.find((b) => b.id === blogId || b._id === blogId);
  return post ? { likes: (post.likes ?? 0) + 1 } : null;
}

export async function getAllBlogCategories(): Promise<BlogCategory[]> {
  return dummyCategories;
}

