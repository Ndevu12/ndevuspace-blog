import { API_BASE_URL } from '@/lib/constants';
import { safeFetch } from 'utils/apiResponse';
import { BlogCategory } from '@/types/blog';

/**
 * Handle specific blog API errors with user-friendly messages
 */
function getErrorMessage(error: string, code?: string): string {
  switch (code) {
    case 'INVALID_LIMIT':
      return 'Invalid number of items requested';
    case 'INVALID_PAGE':
      return 'Invalid page number';
    case 'INVALID_SORT_FIELD':
      return 'Invalid sorting option';
    default:
      return error || 'Failed to load content';
  }
}

// Fetch recent blogs (for recent endpoint)
export async function getRecentBlogs(limit: number = 3): Promise<any[]> {
  const result = await safeFetch(`${API_BASE_URL}/blogs/public/recent?limit=${limit}`);
  
  if (!result.success) {
    console.error('Error fetching recent blogs:', result.error);
    return [];
  }

  return result.data?.blogs || result.data || [];
}

// Simple function to fetch recent blogs for home page
export const getRecentBlogsForHome = async (): Promise<any[]> => {
  return await getRecentBlogs(3);
};

// Fetch all blog categories from server
export async function getAllBlogCategories(): Promise<BlogCategory[]> {
  const result = await safeFetch(`${API_BASE_URL}/blog-category`);
  
  if (!result.success) {
    console.error('Error fetching categories:', result.error);
    return [];
  }
  
  return result.data || [];
}

// Fetch a single category by ID
export async function getCategoryById(id: string): Promise<BlogCategory | null> {
  const result = await safeFetch(`${API_BASE_URL}/blog-category/${id}`);
  
  if (!result.success) {
    console.error(`Error fetching category ${id}:`, result.error);
    return null;
  }
  
  return result.data || null;
}

// Fetch paginated blogs for blog page
export async function getBlogsPaginated(page: number = 1, limit: number = 10): Promise<{
  blogs: any[];
  totalCount: number;
  hasMore: boolean;
  currentPage: number;
  totalPages: number;
  pagination: any;
}> {
  const result = await safeFetch(`${API_BASE_URL}/blogs/public?page=${page}&limit=${limit}`);
  
  if (!result.success) {
    console.error('Error fetching paginated blogs:', result.error);
    return { 
      blogs: [], 
      totalCount: 0, 
      hasMore: false,
      currentPage: 1,
      totalPages: 1,
      pagination: {}
    };
  }
  
  const blogs = result.data?.blogs || [];
  const pagination = result.data?.pagination || {};
  
  return {
    blogs,
    totalCount: pagination.totalBlogs || 0,
    hasMore: pagination.hasNextPage || false,
    currentPage: pagination.currentPage || page,
    totalPages: pagination.totalPages || 1,
    pagination
  };
}

// Fetch single blog by ID
export async function getBlogById(id: string) {
  const result = await safeFetch(`${API_BASE_URL}/blogs/public/${id}`);
  
  if (result.success && result.data) {
    return result.data;
  }
  
  // Log error for debugging but don't throw
  if (result.error) {
    const userMessage = getErrorMessage(result.error, result.code);
    console.error(`Error fetching blog ${id}:`, userMessage, result.code ? `(${result.code})` : '');
  }
  
  return null;
}

// Fetch single blog by slug
export async function getBlogBySlug(slug: string) {
  const result = await safeFetch(`${API_BASE_URL}/blogs/by-slug/${slug}`);
  
  if (result.success && result.data) {
    return result.data;
  }
  
  // Log error for debugging but don't throw
  if (result.error) {
    const userMessage = getErrorMessage(result.error, result.code);
    console.error(`Error fetching blog by slug ${slug}:`, userMessage, result.code ? `(${result.code})` : '');
  }
  
  return null;
}

// Fetch blogs by category
export async function getBlogsByCategory(categoryId: string, page: number = 1, limit: number = 10) {
  const url = `${API_BASE_URL}/blogs/by-category/${categoryId}?page=${page}&limit=${limit}`;
  
  const result = await safeFetch(url);
    
  if (!result.success) {
    return { 
      blogs: [], 
      totalCount: 0, 
      hasMore: false,
      currentPage: 1,
      totalPages: 1,
      pagination: {}
    };
  }
  
  const blogs = result.data.blogs || [];
  const pagination = result.data?.pagination || {};
  
  return {
    blogs,
    totalCount: pagination.totalBlogs || 0,
    hasMore: pagination.hasNextPage || false,
    currentPage: pagination.currentPage || page,
    totalPages: pagination.totalPages || 1,
    pagination
  };
}

// Fetch blogs by tag
export async function getBlogsByTag(tag: string, page: number = 1, limit: number = 10, sortBy?: string, sortOrder?: string, status?: string) {
  // Build URL with parameters
  const params = new URLSearchParams({
    tag: tag,
    page: page.toString(),
    limit: limit.toString(),
  });
  
  if (sortBy) params.append('sortBy', sortBy);
  if (sortOrder) params.append('sortOrder', sortOrder);
  if (status) params.append('status', status);
  
  const url = `${API_BASE_URL}/blogs/by-tag?${params.toString()}`;
  
  const result = await safeFetch(url);
    
  if (!result.success) {
    console.error(`Error fetching blogs by tag "${tag}":`, result.error);
    return { 
      blogs: [], 
      totalCount: 0, 
      hasMore: false,
      currentPage: 1,
      totalPages: 1,
      pagination: {},
      filters: {}
    };
  }
  
  const blogs = result.data?.blogs || [];
  const pagination = result.data?.pagination || {};
  const filters = result.data?.filters || {};
  
  return {
    blogs,
    totalCount: pagination.totalBlogs || 0,
    hasMore: pagination.hasNextPage || false,
    currentPage: pagination.currentPage || page,
    totalPages: pagination.totalPages || 1,
    pagination,
    filters
  };
}

// Search blogs by title
export async function searchBlogsByTitle(query: string, page: number = 1, limit: number = 10) {
  const result = await safeFetch(`${API_BASE_URL}/blogs/by-title?title=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
  
  if (!result.success) {
    console.error(`Error searching blogs by title "${query}":`, result.error);
    return { 
      blogs: [], 
      totalCount: 0, 
      hasMore: false,
      currentPage: 1,
      totalPages: 1,
      pagination: {}
    };
  }
  
  const blogs = result.data?.blogs || [];
  const pagination = result.data?.pagination || {};
  
  return {
    blogs,
    totalCount: pagination.totalBlogs || 0,
    hasMore: pagination.hasNextPage || false,
    currentPage: pagination.currentPage || page,
    totalPages: pagination.totalPages || 1,
    pagination
  };
}
