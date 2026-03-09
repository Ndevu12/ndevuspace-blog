// Admin dashboard types — ported from my-brand-nextjs/src/types/admin/types.ts
// with additions for blog form data and enhanced filter options

import { z } from "zod/v4";
import type { BlogPost, BlogCategory } from "./blog";

// ─── Admin Filters & Pagination ───

export interface BlogAdminFilters {
  page: number;
  limit: number;
  status: string;
  category: string;
  search: string;
  sortBy: "createdAt" | "updatedAt" | "title" | "viewsCount" | "likesCount";
  sortOrder: "asc" | "desc";
}

export interface BlogAdminPagination {
  currentPage: number;
  totalPages: number;
  totalBlogs: number;
  blogsPerPage: number;
}

export interface BlogAdminResponse {
  blogs: BlogPost[];
  pagination: BlogAdminPagination;
}

// ─── Admin Blog Extended ───

export interface AdminBlogPost extends BlogPost {
  viewsCount?: number;
  likesCount?: number;
  commentsCount?: number;
  status: "published" | "draft" | "archived";
}

export type BlogStatus = "published" | "draft" | "archived";

// ─── Admin Blog Stats ───

export interface BlogStats {
  views: number;
  likes: number;
  comments: number;
  shares: number;
}

// ─── Component Props ───

export interface BlogAdminTableProps {
  className?: string;
}

export interface BlogTableProps {
  blogs: BlogPost[];
  onEdit: (blogId: string) => void;
  onView: (blogId: string) => void;
  onDelete: (blogId: string) => void;
  loading?: boolean;
}

export interface BlogFiltersProps {
  filters: BlogAdminFilters;
  categories: BlogCategory[];
  onFiltersChange: (filters: Partial<BlogAdminFilters>) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
  isVisible: boolean;
  onToggleVisibility: () => void;
}

export interface BlogActionsProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onToggleFilters: () => void;
  onNewBlog: () => void;
  filtersVisible: boolean;
}

export interface BlogPaginationProps {
  pagination: BlogAdminPagination;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

// ─── Zod Schemas ───

export const blogFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  content: z.string().min(20, "Content must be at least 20 characters"),
  category: z.string().min(1, "Please select a category"),
  tags: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  status: z.enum(["published", "draft"]).default("draft"),
});

export type BlogFormData = z.infer<typeof blogFormSchema>;

export const categoryFormSchema = z.object({
  name: z.string().min(2, "Category name must be at least 2 characters"),
  icon: z.string().min(1, "Please provide an icon identifier"),
});

export type CategoryFormData = z.infer<typeof categoryFormSchema>;
