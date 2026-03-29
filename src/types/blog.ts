// Blog domain types — ported from my-brand-nextjs/src/types/blog.ts
// with additions for like toggle and enhanced metadata

import { z } from "zod/v4";
import type { AdminBlogPost } from "./admin";

export type Uuid = string;
export type IsoDateString = string;

// ─── Core Entities ───

export interface Author {
  id: Uuid;
  user?: string;
  firstName?: string;
  lastName?: string;
  createdAt?: IsoDateString;
  updatedAt?: IsoDateString;
}

export interface BlogComment {
  id: Uuid;
  blogId: Uuid;
  content: string;
  name: string;
  email?: string;
  createdAt: IsoDateString;
}

export interface BlogCategory {
  id: Uuid;
  name: string;
  slug?: string;
  icon?: string;
}

/** Domain post; Supabase `blog_row_json` must align with {@link BlogRowJson}. */
export interface BlogPost {
  id: Uuid;
  slug: string;
  title: string;
  description: string;
  content?: string;
  author: Author;
  authorImage?: string;
  createdAt: IsoDateString;
  updatedAt?: IsoDateString;
  imageUrl?: string;
  category?: BlogCategory;
  tags: string[];
  readTime?: string;
  isNew?: boolean;
  isFeatured?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  likes?: number;
  comments?: BlogComment[];
  status?: "published" | "draft" | "archived";
  viewsCount?: number;
  likesCount?: number;
}

// ─── RPC blog_row_json wire contract ───

/** Author object inside `blog_row_json.author`; maps to {@link Author}. */
export interface BlogRowJsonAuthor {
  id: string;
  user: string;
  firstName?: string;
  lastName?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** Category object inside `blog_row_json.category`; maps to {@link BlogCategory}. */
export interface BlogRowJsonCategory {
  id: string;
  name: string;
  icon: string;
}

/** JSON object for one blog returned from `blog_*` RPCs. */
export interface BlogRowJson {
  id: string;
  slug: string;
  title: string;
  description?: string;
  content?: string;
  author: BlogRowJsonAuthor;
  authorImage?: string;
  createdAt: string;
  updatedAt?: string;
  imageUrl?: string;
  category?: BlogRowJsonCategory;
  /** Tag names only, ordered. */
  tags: string[];
  /** Display string, e.g. `"5 min read"` (not raw minutes). */
  readTime?: string;
  isNew?: boolean;
  isFeatured?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  /** Optional shorthand count for cards; prefer `likesCount` for analytics. */
  likes?: number;
  status?: BlogPost["status"];
  viewsCount?: number;
  likesCount?: number;
  /** Admin/dashboard only when RPC provides it. */
  commentsCount?: number;
  comments?: BlogPost["comments"];
}

/** Every top-level key SQL may emit for `blog_row_json` (camelCase). */
export const BLOG_ROW_JSON_KEYS = {
  id: "id",
  slug: "slug",
  title: "title",
  description: "description",
  content: "content",
  author: "author",
  authorImage: "authorImage",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  imageUrl: "imageUrl",
  category: "category",
  tags: "tags",
  readTime: "readTime",
  isNew: "isNew",
  isFeatured: "isFeatured",
  metaTitle: "metaTitle",
  metaDescription: "metaDescription",
  likes: "likes",
  status: "status",
  viewsCount: "viewsCount",
  likesCount: "likesCount",
  commentsCount: "commentsCount",
  comments: "comments",
} as const;

export type BlogRowJsonKey = (typeof BLOG_ROW_JSON_KEYS)[keyof typeof BLOG_ROW_JSON_KEYS];

/**
 * Source map for SQL `jsonb_build_object` / projection lists.
 * `postgresSource` describes intended `public` schema source.
 */
export const BLOG_ROW_JSON_SQL_SOURCES = [
  {
    jsonKey: BLOG_ROW_JSON_KEYS.id,
    blogPostKey: "id",
    postgresSource: "blogs.id",
  },
  { jsonKey: BLOG_ROW_JSON_KEYS.slug, blogPostKey: "slug", postgresSource: "blogs.slug" },
  { jsonKey: BLOG_ROW_JSON_KEYS.title, blogPostKey: "title", postgresSource: "blogs.title" },
  {
    jsonKey: BLOG_ROW_JSON_KEYS.description,
    blogPostKey: "description",
    postgresSource: "coalesce(blogs.description, '')",
  },
  { jsonKey: BLOG_ROW_JSON_KEYS.content, blogPostKey: "content", postgresSource: "blogs.content" },
  {
    jsonKey: BLOG_ROW_JSON_KEYS.author,
    blogPostKey: "author",
    postgresSource:
      "json object from user_profiles (by blogs.author_id) or blogs.author denormalized + profile fields",
  },
  {
    jsonKey: BLOG_ROW_JSON_KEYS.authorImage,
    blogPostKey: "authorImage",
    postgresSource: "coalesce(blogs.author_image, profile.avatar_url)",
  },
  {
    jsonKey: BLOG_ROW_JSON_KEYS.createdAt,
    blogPostKey: "createdAt",
    postgresSource: "blogs.created_at (ISO-8601 text)",
  },
  {
    jsonKey: BLOG_ROW_JSON_KEYS.updatedAt,
    blogPostKey: "updatedAt",
    postgresSource: "blogs.updated_at (ISO-8601 text)",
  },
  { jsonKey: BLOG_ROW_JSON_KEYS.imageUrl, blogPostKey: "imageUrl", postgresSource: "blogs.image_url" },
  {
    jsonKey: BLOG_ROW_JSON_KEYS.category,
    blogPostKey: "category",
    postgresSource: "json from join blog_categories: id, name, icon ← blog_categories.icon",
  },
  {
    jsonKey: BLOG_ROW_JSON_KEYS.tags,
    blogPostKey: "tags",
    postgresSource: "text[] of blog_tags.name via blog_tag_links for blogs.id, ordered",
  },
  {
    jsonKey: BLOG_ROW_JSON_KEYS.readTime,
    blogPostKey: "readTime",
    postgresSource: "display string from blogs.read_time, e.g. format('%s min read', read_time)",
  },
  { jsonKey: BLOG_ROW_JSON_KEYS.isNew, blogPostKey: "isNew", postgresSource: "blogs.is_new" },
  {
    jsonKey: BLOG_ROW_JSON_KEYS.isFeatured,
    blogPostKey: "isFeatured",
    postgresSource: "blogs.is_featured",
  },
  { jsonKey: BLOG_ROW_JSON_KEYS.metaTitle, blogPostKey: "metaTitle", postgresSource: "blogs.meta_title" },
  {
    jsonKey: BLOG_ROW_JSON_KEYS.metaDescription,
    blogPostKey: "metaDescription",
    postgresSource: "blogs.meta_description",
  },
  {
    jsonKey: BLOG_ROW_JSON_KEYS.likes,
    blogPostKey: "likes",
    postgresSource: "optional: omit or mirror likes_count as number for list cards",
  },
  {
    jsonKey: BLOG_ROW_JSON_KEYS.status,
    blogPostKey: "status",
    postgresSource: "blogs.status::text (blog_status enum)",
  },
  { jsonKey: BLOG_ROW_JSON_KEYS.viewsCount, blogPostKey: "viewsCount", postgresSource: "blogs.views_count" },
  { jsonKey: BLOG_ROW_JSON_KEYS.likesCount, blogPostKey: "likesCount", postgresSource: "blogs.likes_count" },
  {
    jsonKey: BLOG_ROW_JSON_KEYS.commentsCount,
    blogPostKey: "commentsCount (AdminBlogPost)",
    postgresSource: "optional aggregate when dashboard RPC provides it",
  },
  {
    jsonKey: BLOG_ROW_JSON_KEYS.comments,
    blogPostKey: "comments",
    postgresSource: "optional; usually omitted in list/detail RPCs",
  },
] as const;

const EMPTY_AUTHOR_SENTINEL: Author = {
  id: "",
  user: "",
  firstName: "",
  lastName: "",
  createdAt: "1970-01-01T00:00:00.000Z",
  updatedAt: "1970-01-01T00:00:00.000Z",
};

function authorFromRow(a: BlogRowJsonAuthor): Author {
  return {
    id: a.id,
    user: a.user,
    firstName: a.firstName ?? "",
    lastName: a.lastName ?? "",
    createdAt: a.createdAt ?? EMPTY_AUTHOR_SENTINEL.createdAt,
    updatedAt: a.updatedAt ?? EMPTY_AUTHOR_SENTINEL.updatedAt,
  };
}

function categoryFromRow(c: BlogRowJsonCategory): BlogCategory {
  return {
    id: c.id,
    name: c.name,
    icon: c.icon,
  };
}

/** Normalize RPC `blog_row_json` into {@link BlogPost}. */
export function blogRowJsonToBlogPost(row: BlogRowJson): BlogPost {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description ?? "",
    content: row.content,
    author: authorFromRow(row.author),
    authorImage: row.authorImage,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    imageUrl: row.imageUrl,
    category: row.category ? categoryFromRow(row.category) : undefined,
    tags: row.tags ?? [],
    readTime: row.readTime,
    isNew: row.isNew,
    isFeatured: row.isFeatured,
    metaTitle: row.metaTitle,
    metaDescription: row.metaDescription,
    likes: row.likes,
    comments: row.comments,
    status: row.status,
    viewsCount: row.viewsCount,
    likesCount: row.likesCount,
  };
}

/** Same as {@link blogRowJsonToBlogPost} but preserves optional admin aggregates. */
export function blogRowJsonToAdminBlogPost(row: BlogRowJson): AdminBlogPost {
  const post = blogRowJsonToBlogPost(row);
  return {
    ...post,
    status: row.status ?? post.status ?? "draft",
    commentsCount: row.commentsCount,
  };
}

// ─── Search & Filters ───

export interface BlogSearchFilters {
  category?: string;
  tags?: string[];
  query?: string;
  sortBy?: "newest" | "oldest" | "popular";
  page?: number;
  limit?: number;
}

// ─── Pagination ───

export interface BlogMetadata {
  totalPosts: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// ─── Server Response ───

export interface BlogServerResponse {
  posts: BlogPost[];
  pagination: BlogMetadata;
  filters: BlogSearchFilters;
}

/** Public list/search RPC jsonb: camelCase envelope keys (see `blogRowJson` wire note). */
export interface PaginatedBlogsResponse {
  blogs: BlogPost[];
  totalCount: number;
  hasMore: boolean;
  currentPage: number;
  totalPages: number;
  pagination: Record<string, unknown>;
}

// ─── Zod Schemas (for form validation) ───

export const commentFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.email("Please enter a valid email address"),
  content: z.string().min(5, "Comment must be at least 5 characters"),
});

export type CommentFormData = z.infer<typeof commentFormSchema>;
