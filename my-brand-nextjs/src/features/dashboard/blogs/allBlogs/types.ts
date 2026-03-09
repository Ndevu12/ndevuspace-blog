import { BlogPost, BlogCategory } from '@/types/blog';

// Extended BlogPost interface with admin-specific properties
export interface AdminBlogPost extends BlogPost {
  status?: 'published' | 'draft' | 'archived';
}

export interface BlogAdminFilters {
  page: number;
  limit: number;
  status: string;
  category: string;
  search: string;
  sortBy: 'createdAt' | 'updatedAt' | 'title';
  sortOrder: 'asc' | 'desc';
}

export interface BlogAdminPagination {
  currentPage: number;
  totalPages: number;
  totalBlogs: number;
  blogsPerPage: number;
}

export interface BlogAdminResponse {
  blogs: AdminBlogPost[];
  pagination: BlogAdminPagination;
}

export interface AllBlogsProps {
  className?: string;
}

export interface BlogTableProps {
  blogs: AdminBlogPost[];
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
