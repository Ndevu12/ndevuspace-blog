// Comment service (non-dummy mode is intentionally unimplemented).
// This project should not query real data unless explicitly requested.

import type { BlogComment } from "@/types/blog";

export interface CommentData {
  name: string;
  email: string;
  content: string;
}

export async function addComment(
  blogId: string,
  commentData: CommentData
): Promise<BlogComment | null> {
  void blogId;
  void commentData;
  throw new Error("addComment is not implemented (dummy mode only).");
}

export async function deleteComment(commentId: string): Promise<boolean> {
  void commentId;
  throw new Error("deleteComment is not implemented (dummy mode only).");
}

export async function getCommentsForBlog(blogId: string): Promise<BlogComment[]> {
  void blogId;
  throw new Error("getCommentsForBlog is not implemented (dummy mode only).");
}

