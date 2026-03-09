// Blog domain types — ported from my-brand-nextjs/src/types/blog.ts
// with additions for like toggle and enhanced metadata

import { z } from "zod/v4";

// ─── Core Entities ───

export interface Author {
  _id: string;
  user: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface BlogComment {
  _id: string;
  blogId: string;
  content: string;
  name: string;
  email?: string;
  createdAt: string;
  __v?: number;
}

export interface BlogCategory {
  _id: string;
  name: string;
  icon: string;
}

export interface BlogPost {
  _id: string;
  id?: string;
  slug: string;
  title: string;
  description: string;
  content?: string;
  author: Author;
  authorImage?: string;
  createdAt: string;
  updatedAt?: string;
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

// ─── Page Props ───

export interface BlogPageProps {
  posts: BlogPost[];
  featuredPost?: BlogPost;
  categories: BlogCategory[];
  popularPosts: BlogPost[];
  metadata: BlogMetadata;
}

// ─── Server Response ───

export interface BlogServerResponse {
  posts: BlogPost[];
  pagination: BlogMetadata;
  filters: BlogSearchFilters;
}

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
