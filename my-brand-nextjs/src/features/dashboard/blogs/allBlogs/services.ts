import { BlogPost } from '@/types/blog';
import { BlogAdminFilters, BlogAdminResponse, AdminBlogPost } from './types';
import { API_BASE_URL } from '@/lib/constants';
import { safeFetch } from 'utils/apiResponse';

/**
 * Handle admin-specific blog API errors with user-friendly messages
 */
function getAdminErrorMessage(error: string | null, code?: string): string {
  switch (code) {
    case 'UNAUTHORIZED':
      return 'You are not authorized to access this resource';
    case 'FORBIDDEN':
      return 'Admin access required';
    case 'INVALID_LIMIT':
      return 'Invalid number of items requested';
    case 'INVALID_PAGE':
      return 'Invalid page number';
    case 'INVALID_SORT_FIELD':
      return 'Invalid sorting option';
    default:
      return error || 'Failed to load admin data';
  }
}

// API service for admin blog operations
export class BlogAdminService {
  
  // Get all blogs with filtering, sorting, and pagination (Admin view)
  async getAdminBlogs(filters: BlogAdminFilters): Promise<BlogAdminResponse> {
    // Build query parameters
    const queryParams = new URLSearchParams();
    
    // Add pagination
    queryParams.append('page', filters.page.toString());
    queryParams.append('limit', filters.limit.toString());
    
    // Add search if provided
    if (filters.search) {
      queryParams.append('search', filters.search);
    }
    
    // Add category filter if provided
    if (filters.category) {
      queryParams.append('category', filters.category);
    }
    
    // Add status filter if provided
    if (filters.status) {
      queryParams.append('status', filters.status);
    }
    
    // Add sorting
    if (filters.sortBy) {
      queryParams.append('sortBy', filters.sortBy);
    }
    if (filters.sortOrder) {
      queryParams.append('sortOrder', filters.sortOrder);
    }

    const url = `${API_BASE_URL}/blogs?${queryParams.toString()}`;
    
    const result = await safeFetch(url, {
      method: 'GET',
      credentials: 'include', // Include cookies for authentication
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!result.success) {
      const errorMessage = getAdminErrorMessage(result.error, result.code);
      throw new Error(errorMessage);
    }

    // Extract blogs and pagination from response
    const blogs = result.data?.blogs || [];
    const pagination = result.data?.pagination || {
      currentPage: filters.page,
      totalPages: 1,
      totalBlogs: 0,
      blogsPerPage: filters.limit,
    };

    return {
      blogs,
      pagination,
    };
  }
  
  // Delete a blog (Admin only)
  async deleteBlog(blogId: string): Promise<void> {
    const result = await safeFetch(`${API_BASE_URL}/blogs/delete/${blogId}`, {
      method: 'DELETE',
      credentials: 'include', // Include cookies for authentication
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!result.success) {
      const errorMessage = getAdminErrorMessage(result.error, result.code);
      throw new Error(errorMessage);
    }
  }
  
  // Update blog status (Admin only)
  async updateBlogStatus(blogId: string, status: 'published' | 'draft' | 'archived'): Promise<void> {
    const result = await safeFetch(`${API_BASE_URL}/blogs/update/${blogId}`, {
      method: 'PUT',
      credentials: 'include', // Include cookies for authentication
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });
    
    if (!result.success) {
      const errorMessage = getAdminErrorMessage(result.error, result.code);
      throw new Error(errorMessage);
    }
  }
  
  // Get single blog with admin data (Admin only)
  async getAdminBlog(blogId: string): Promise<AdminBlogPost> {
    const result = await safeFetch(`${API_BASE_URL}/blogs/${blogId}`, {
      method: 'GET',
      credentials: 'include', // Include cookies for authentication
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!result.success) {
      const errorMessage = getAdminErrorMessage(result.error, result.code);
      throw new Error(errorMessage);
    }
    
    return result.data;
  }
  
  // Create a new blog (Admin only) - FormData only
  async createBlog(formData: FormData): Promise<AdminBlogPost> {
    const result = await safeFetch(`${API_BASE_URL}/blogs/create`, {
      method: 'POST',
      credentials: 'include', // Include cookies for authentication
      // No Content-Type header - let browser set multipart/form-data
      body: formData,
    });
    
    if (!result.success) {
      const errorMessage = getAdminErrorMessage(result.error, result.code);
      throw new Error(errorMessage);
    }
    
    return result.data;
  }
  
  // Update an existing blog (Admin only) - FormData only
  async updateBlog(blogId: string, formData: FormData): Promise<AdminBlogPost> {
    const result = await safeFetch(`${API_BASE_URL}/blogs/update/${blogId}`, {
      method: 'PUT',
      credentials: 'include', // Include cookies for authentication
      // No Content-Type header - let browser set multipart/form-data
      body: formData,
    });
    
    if (!result.success) {
      const errorMessage = getAdminErrorMessage(result.error, result.code);
      throw new Error(errorMessage);
    }
    
    return result.data;
  }
}

// Export a singleton instance
export const blogAdminService = new BlogAdminService();
