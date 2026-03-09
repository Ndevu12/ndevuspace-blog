import { API_BASE_URL } from '@/lib/constants';
import { safeFetch } from 'utils/apiResponse';

export interface CommentData {
  name: string;
  email: string;
  content: string;
}

export interface Comment {
  _id: string;
  name: string;
  email: string;
  content: string;
  blogId: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Handle specific comment API errors with user-friendly messages
 */
function getCommentErrorMessage(error: string, code?: string): string {
  switch (code) {
    case 'VALIDATION_ERROR':
      return 'Please fill in all required fields correctly';
    case 'BLOG_NOT_FOUND':
      return 'The blog post was not found';
    case 'COMMENT_TOO_LONG':
      return 'Comment is too long';
    default:
      return error || 'Failed to process comment';
  }
}

// Add a comment to a blog
export async function addComment(blogId: string, commentData: CommentData): Promise<Comment | null> {
  try {
    const result = await safeFetch(`${API_BASE_URL}/comment/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        blogId,
        name: commentData.name,
        email: commentData.email,
        content: commentData.content,
      }),
    });

    if (result.success && result.data) {
      return result.data;
    }

    // Log error for debugging but don't throw
    if (result.error) {
      const userMessage = getCommentErrorMessage(result.error, result.code);
      console.error(`Error adding comment to blog ${blogId}:`, userMessage, result.code ? `(${result.code})` : '');
    }

    return null;
  } catch (error) {
    console.error('Error adding comment:', error);
    return null;
  }
}

// Get comments for a specific blog (if needed in the future)
export async function getCommentsForBlog(blogId: string): Promise<Comment[]> {
  try {
    const result = await safeFetch(`${API_BASE_URL}/blogs/${blogId}`);
    
    if (result.success && result.data?.comments) {
      return result.data.comments;
    }
    
    return [];
  } catch (error) {
    console.error(`Error fetching comments for blog ${blogId}:`, error);
    return [];
  }
}
