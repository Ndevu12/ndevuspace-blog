import { BlogPost } from '@/types/blog';
import { AdminBlogPost } from '../allBlogs/types';
import { BlogDetailService, BlogStatus } from './types';
import { API_BASE_URL } from '@/lib/constants';
import { safeFetch } from 'utils/apiResponse';
import { getCategoryById } from '@/services/blogService';

/**
 * Handle specific blog API errors with user-friendly messages
 */
function getBlogDetailErrorMessage(error: string | null, code?: string): string {
  switch (code) {
    case 'BLOG_NOT_FOUND':
      return 'Blog not found';
    case 'UNAUTHORIZED':
      return 'You are not authorized to perform this action';
    case 'FORBIDDEN':
      return 'Access denied';
    default:
      return error || 'An unexpected error occurred';
  }
}

class AdminBlogDetailService implements BlogDetailService {
  async getBlogById(id: string): Promise<AdminBlogPost | null> {
    const result = await safeFetch(`${API_BASE_URL}/blogs/${id}`, {
      credentials: 'include', // Include cookies for authentication
    });

    if (!result.success) {
      if (result.code === 'BLOG_NOT_FOUND') {
        return null;
      }
      const errorMessage = getBlogDetailErrorMessage(result.error, result.code);
      throw new Error(errorMessage);
    }

    const blog = result.data;

    // If blog has a category but it's incomplete (only ID), fetch full category details
    if (blog?.category && typeof blog.category === 'string') {
      try {
        const fullCategory = await getCategoryById(blog.category);
        if (fullCategory) {
          blog.category = fullCategory;
        }
      } catch (error) {
        console.warn('Failed to fetch category details:', error);
        // Keep the original category ID if fetching fails
      }
    }

    return blog;
  }

  async updateBlogStatus(id: string, status: BlogStatus): Promise<void> {
    const result = await safeFetch(`${API_BASE_URL}/blogs/update/${id}`, {
      method: 'PUT',
      credentials: 'include', // Include cookies for authentication
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });

    if (!result.success) {
      const errorMessage = getBlogDetailErrorMessage(result.error, result.code);
      throw new Error(errorMessage);
    }
  }

  async deleteBlog(id: string): Promise<void> {
    const result = await safeFetch(`${API_BASE_URL}/blogs/delete/${id}`, {
      method: 'DELETE',
      credentials: 'include', // Include cookies for authentication
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!result.success) {
      const errorMessage = getBlogDetailErrorMessage(result.error, result.code);
      throw new Error(errorMessage);
    }
  }

  async duplicateBlog(id: string): Promise<string> {
    // First, get the original blog
    const originalBlog = await this.getBlogById(id);
    if (!originalBlog) {
      throw new Error('Original blog not found');
    }

    // Create a new blog based on the original
    const duplicatedBlogData = {
      title: `${originalBlog.title} (Copy)`,
      description: originalBlog.description,
      content: originalBlog.content,
      categoryId: originalBlog.category?._id,
      tags: originalBlog.tags,
      imageUrl: originalBlog.imageUrl,
      readTime: originalBlog.readTime,
      status: 'draft' as const,
      metaTitle: originalBlog.metaTitle,
      metaDescription: originalBlog.metaDescription,
    };

    const result = await safeFetch(`${API_BASE_URL}/blogs/create`, {
      method: 'POST',
      credentials: 'include', // Include cookies for authentication
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(duplicatedBlogData),
    });

    if (!result.success) {
      const errorMessage = getBlogDetailErrorMessage(result.error, result.code);
      throw new Error(errorMessage);
    }

    return result.data._id || result.data.id;
  }

  async getBlogStats(id: string): Promise<{
    views: number;
    likes: number;
    comments: number;
    shares: number;
  }> {
    const result = await safeFetch(`${API_BASE_URL}/blogs/${id}/stats`, {
      credentials: 'include', // Include cookies for authentication
    });

    if (!result.success) {
      // If stats endpoint doesn't exist, return default values
      return {
        views: 0,
        likes: 0,
        comments: 0,
        shares: 0,
      };
    }

    return result.data;
  }
}

export const adminBlogDetailService = new AdminBlogDetailService();
