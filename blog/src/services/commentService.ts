// Comment service — ported from my-brand-nextjs/src/services/comment/commentService.ts
// + deleteComment from src/scripts/actions/blogs/commentActions.js

import { API_BASE_URL } from "@/lib/constants";
import { safeFetch } from "@/lib/api";
import type { BlogComment } from "@/types/blog";

// ─── Types ───

export interface CommentData {
  name: string;
  email: string;
  content: string;
}

// ─── Error Handling ───

function getCommentErrorMessage(error: string, code?: string): string {
  switch (code) {
    case "VALIDATION_ERROR":
      return "Please fill in all required fields correctly";
    case "BLOG_NOT_FOUND":
      return "The blog post was not found";
    case "COMMENT_TOO_LONG":
      return "Comment is too long";
    default:
      return error || "Failed to process comment";
  }
}

// ─── Comment Endpoints ───

/** Add a comment to a blog */
export async function addComment(
  blogId: string,
  commentData: CommentData
): Promise<BlogComment | null> {
  const result = await safeFetch<{ comment?: BlogComment }>(
    `${API_BASE_URL}/comment/add`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        blogId,
        name: commentData.name,
        email: commentData.email,
        content: commentData.content,
      }),
    }
  );

  if (result.success && result.data) {
    // API may return { comment: {...} } or the comment directly
    return (result.data.comment ?? result.data) as BlogComment;
  }

  if (result.error) {
    const msg = getCommentErrorMessage(result.error, result.code);
    console.error(`Error adding comment to blog ${blogId}:`, msg);
  }

  return null;
}

/** Delete a comment (admin only) */
export async function deleteComment(commentId: string): Promise<boolean> {
  const result = await safeFetch(`${API_BASE_URL}/comment/${commentId}`, {
    method: "DELETE",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  if (!result.success) {
    console.error(`Error deleting comment ${commentId}:`, result.error);
    return false;
  }

  return true;
}

/** Fetch comments for a specific blog (from blog data) */
export async function getCommentsForBlog(
  blogId: string
): Promise<BlogComment[]> {
  const result = await safeFetch<{ comments?: BlogComment[] }>(
    `${API_BASE_URL}/blogs/${blogId}`
  );

  if (result.success && result.data?.comments) {
    return result.data.comments;
  }

  return [];
}
