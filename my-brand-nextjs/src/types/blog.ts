export interface Author {
  _id: string;
  user: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface BlogComment {
  _id: string;
  blogId: string;
  content: string;
  name: string;
  createdAt: string;
  __v?: number;
}

export interface BlogPost {
  _id: string; // MongoDB _id from server
  id?: string; // Optional fallback id
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
  likes?: number; // Likes count from server
  comments?: BlogComment[]; // Comments from server
}

export interface BlogCategory {
  _id: string;
  name: string;
  icon: string;
}

export interface BlogSearchFilters {
  category?: string;
  tags?: string[];
  query?: string;
  sortBy?: 'newest' | 'oldest' | 'popular';
  page?: number;
  limit?: number;
}

export interface BlogMetadata {
  totalPosts: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface BlogPageProps {
  posts: BlogPost[];
  featuredPost?: BlogPost;
  categories: BlogCategory[];
  popularPosts: BlogPost[];
  metadata: BlogMetadata;
}

export interface BlogServerResponse {
  posts: BlogPost[];
  pagination: BlogMetadata;
  filters: BlogSearchFilters;
}