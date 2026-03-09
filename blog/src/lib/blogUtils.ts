// Blog-specific utilities — ported from my-brand-nextjs/utils/blogUtils.ts

import { DEFAULT_AUTHOR } from "./constants";
import type { Author, BlogPost } from "@/types/blog";
import { format, formatDistanceToNow, parseISO } from "date-fns";

/**
 * Get display name for an author
 */
export function getAuthorName(author: Author | string | null | undefined): string {
  if (!author) return DEFAULT_AUTHOR.name;

  if (typeof author === "string") return author;

  if (author.firstName && author.lastName) {
    return `${author.firstName} ${author.lastName}`;
  }

  if (author.firstName) return author.firstName;

  return DEFAULT_AUTHOR.name;
}

/**
 * Get author image URL from a blog post
 */
export function getAuthorImage(post: BlogPost | null | undefined): string {
  if (!post) return DEFAULT_AUTHOR.image;

  if (post.authorImage) return post.authorImage;

  if (
    post.author &&
    typeof post.author === "object" &&
    "image" in post.author
  ) {
    return (post.author as Author & { image?: string }).image || DEFAULT_AUTHOR.image;
  }

  return DEFAULT_AUTHOR.image;
}

/**
 * Format a date string for display (e.g., "Jan 15, 2025")
 */
export function formatDate(dateString: string): string {
  try {
    return format(parseISO(dateString), "MMM d, yyyy");
  } catch {
    return dateString;
  }
}

/**
 * Format a date as relative time (e.g., "3 days ago")
 */
export function formatRelativeDate(dateString: string): string {
  try {
    return formatDistanceToNow(parseISO(dateString), { addSuffix: true });
  } catch {
    return dateString;
  }
}

/**
 * Get the blog post ID (handles both _id and id fields)
 */
export function getBlogId(post: BlogPost): string {
  return post._id || post.id || "";
}
