// Public blog service (non-dummy mode is intentionally unimplemented).
// This project should not query real data unless explicitly requested.

import type { BlogCategory, BlogPost, PaginatedBlogsResponse } from "@/types/blog";

function notImplemented(name: string): never {
  throw new Error(`${name} is not implemented (dummy mode only).`);
}

export async function getRecentBlogs(_limit: number = 3): Promise<BlogPost[]> {
  return notImplemented("getRecentBlogs");
}

export async function getBlogsPaginated(
  _page: number = 1,
  _limit: number = 10
): Promise<PaginatedBlogsResponse> {
  return notImplemented("getBlogsPaginated");
}

export async function getBlogById(_id: string): Promise<BlogPost | null> {
  return notImplemented("getBlogById");
}

export async function getBlogBySlug(_slug: string): Promise<BlogPost | null> {
  return notImplemented("getBlogBySlug");
}

export async function getBlogsByCategory(
  _categoryId: string,
  _page: number = 1,
  _limit: number = 10
): Promise<PaginatedBlogsResponse> {
  return notImplemented("getBlogsByCategory");
}

export async function getBlogsByTag(
  _tag: string,
  _page: number = 1,
  _limit: number = 10
): Promise<PaginatedBlogsResponse & { filters: Record<string, unknown> }> {
  return notImplemented("getBlogsByTag");
}

export async function searchBlogsByTitle(
  _query: string,
  _page: number = 1,
  _limit: number = 10
): Promise<PaginatedBlogsResponse> {
  return notImplemented("searchBlogsByTitle");
}

export async function likeBlog(
  _blogId: string
): Promise<{ likes: number } | null> {
  return notImplemented("likeBlog");
}

export async function getAuthorByBlogId(_blogId: string) {
  return notImplemented("getAuthorByBlogId");
}

export async function getAllBlogCategories(): Promise<BlogCategory[]> {
  return notImplemented("getAllBlogCategories");
}

