// Dummy blog service — mirrors blogService.ts interface using in-memory data
// Used when NEXT_PUBLIC_USE_DUMMY_DATA=true, resolved at the consumer level

import type {
  AdjacentBlogs,
  BlogCategory,
  BlogPost,
  BlogTag,
  PaginatedBlogsResponse,
  PaginatedTagsResponse,
} from "@/types/blog";
import { dummyBlogs, dummyCategories } from "@/data/dummyBlogs";

const TAG_CLOUD_CAP = 30;

function slugifyTag(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Mirror of blog_public_tags_list against the in-memory posts: count
 * published posts per tag, keep the top {@link TAG_CLOUD_CAP} by popularity,
 * then serve that capped set in alphabetical pages.
 */
function rankPublishedTags(): BlogTag[] {
  const counts = new Map<string, number>();
  for (const blog of dummyBlogs) {
    for (const tag of blog.tags || []) {
      if (tag) counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }

  return Array.from(counts.entries())
    .map(([name, postCount]) => ({ name, postCount }))
    // Popularity first, then name — to select the capped set.
    .sort((a, b) => b.postCount - a.postCount || a.name.localeCompare(b.name))
    .slice(0, TAG_CLOUD_CAP)
    // Display alphabetically so paginated batches stay A–Z.
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(({ name, postCount }) => ({
      id: slugifyTag(name),
      name,
      slug: slugifyTag(name),
      postCount,
    }));
}

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

export async function getBlogsPaginated(
  page: number = 1,
  limit: number = 10
): Promise<PaginatedBlogsResponse> {
  return paginate(sortByNewest(dummyBlogs), page, limit);
}

export async function getBlogById(id: string): Promise<BlogPost | null> {
  return dummyBlogs.find((b) => b.id === id) ?? null;
}

export async function getBlogBySlug(slug: string): Promise<BlogPost | null> {
  return dummyBlogs.find((b) => b.slug === slug) ?? null;
}

export async function getBlogsByCategory(
  categoryId: string,
  page: number = 1,
  limit: number = 10
): Promise<PaginatedBlogsResponse> {
  const filtered = dummyBlogs.filter((b) => b.category?.id === categoryId);
  return paginate(filtered, page, limit);
}

export async function getBlogsByTags(
  tags: string[],
  page: number = 1,
  limit: number = 10
): Promise<PaginatedBlogsResponse> {
  const needles = new Set(
    tags.map((t) => t.trim().toLowerCase()).filter(Boolean)
  );
  // Empty selection = no tag filter (mirrors the RPC), so return everything.
  const matched =
    needles.size === 0
      ? dummyBlogs
      : dummyBlogs.filter((b) =>
          // OR / union: a post matches if it carries any selected tag.
          b.tags.some((t) => needles.has(t.toLowerCase()))
        );
  return paginate(sortByNewest(matched), page, limit);
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
  const post = dummyBlogs.find((b) => b.id === blogId);
  return post ? { likes: (post.likes ?? 0) + 1 } : null;
}

export async function getAdjacentBlogs(slug: string): Promise<AdjacentBlogs> {
  const ordered = sortByNewest(dummyBlogs);
  const index = ordered.findIndex((b) => b.slug === slug);
  if (index === -1) {
    return { newer: null, older: null };
  }

  return {
    newer: ordered[index - 1] ?? null,
    older: ordered[index + 1] ?? null,
  };
}

export async function incrementBlogView(blogId: string): Promise<number | null> {
  const post = dummyBlogs.find((b) => b.id === blogId);
  return post ? (post.viewsCount ?? 0) + 1 : null;
}

export async function getPublicTags(
  page: number = 1,
  limit: number = 10
): Promise<PaginatedTagsResponse> {
  const all = rankPublishedTags();
  const start = (page - 1) * limit;
  const tags = all.slice(start, start + limit);
  return {
    tags,
    totalCount: all.length,
    maxPostCount: all.reduce((max, tag) => Math.max(max, tag.postCount), 0),
    hasMore: start + limit < all.length,
    currentPage: page,
  };
}

export async function getAllBlogCategories(): Promise<BlogCategory[]> {
  return dummyCategories;
}

