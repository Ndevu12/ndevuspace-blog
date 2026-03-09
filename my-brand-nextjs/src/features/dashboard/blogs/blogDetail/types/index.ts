import { BlogPost } from '@/types/blog';
import { AdminBlogPost } from '../../allBlogs/types';

export interface BlogDetailProps {
  blogId: string;
  className?: string;
}

export interface AdminBlogDetailProps extends BlogDetailProps {
  onEdit?: (blogId: string) => void;
  onDelete?: (blogId: string) => void;
  onBack?: () => void;
}

export interface BlogHeaderProps {
  blog: AdminBlogPost;
  onEdit?: (blogId: string) => void;
  onDelete?: (blogId: string) => void;
  onBack?: () => void;
}

export interface BlogContentProps {
  blog: AdminBlogPost;
}

export interface BlogStatsProps {
  blog: AdminBlogPost;
  stats?: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
  };
}

export interface BlogActionsProps {
  blogId: string;
  onEdit?: (blogId: string) => void;
  onDelete?: (blogId: string) => void;
  onDuplicate?: (blogId: string) => void;
  onToggleStatus?: (blogId: string) => void;
}

export interface BlogMetaProps {
  blog: AdminBlogPost;
  showEditHistory?: boolean;
}

export type BlogStatus = 'published' | 'draft' | 'archived' | 'scheduled';

export interface BlogDetailService {
  getBlogById: (id: string) => Promise<AdminBlogPost | null>;
  updateBlogStatus: (id: string, status: BlogStatus) => Promise<void>;
  deleteBlog: (id: string) => Promise<void>;
  duplicateBlog: (id: string) => Promise<string>;
  getBlogStats: (id: string) => Promise<{
    views: number;
    likes: number;
    comments: number;
    shares: number;
  }>;
}
