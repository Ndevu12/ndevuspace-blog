import { BlogPost, BlogCategory } from '@/types/blog';

export interface BlogAdminFilters {
  page: number;
  limit: number;
  status: string;
  category: string;
  search: string;
  sortBy: 'createdAt' | 'updatedAt' | 'title' | 'viewsCount' | 'likesCount';
  sortOrder: 'asc' | 'desc';
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
