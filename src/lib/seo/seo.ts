import type { Metadata } from "next";
import { SITE_URL, DEFAULT_AUTHOR } from "../constants";
import type { BlogPost } from "@/types/blog";

// ─── Site configuration (single source of truth) ───

export const siteConfig = {
  name: "ndevuspace Blog",
  description:
    "Tech blog by Jean Paul Elisa — articles on software engineering, web development, and technology.",
  url: SITE_URL,
  author: DEFAULT_AUTHOR,
  keywords: [
    "blog",
    "software engineering",
    "web development",
    "technology",
    "ndevuspace",
  ],
} as const;

// ─── Root layout metadata (structural — inherited by all pages) ───

export const rootMetadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [...siteConfig.keywords],
  authors: [{ name: siteConfig.author.name }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: siteConfig.name,
  },
  twitter: {
    card: "summary_large_image",
  },
};

// ─── Metadata builders ───

/** Build full article metadata for a blog post */
export function buildBlogPostMetadata(post: BlogPost): Metadata {
  const title = post.metaTitle || post.title;
  const description = post.metaDescription || post.description;

  return {
    title,
    description,
    keywords: post.tags,
    openGraph: {
      title,
      description,
      url: `${siteConfig.url}/blog/${post.slug}`,
      type: "article",
      images: post.imageUrl
        ? [{ url: post.imageUrl, width: 1200, height: 630, alt: post.title }]
        : undefined,
      publishedTime: post.createdAt,
      modifiedTime: post.updatedAt,
      authors: post.author
        ? [`${post.author.firstName} ${post.author.lastName}`]
        : undefined,
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: post.imageUrl ? [post.imageUrl] : undefined,
    },
  };
}

/** Fallback metadata when a blog post is not found */
export const blogNotFoundMetadata: Metadata = {
  title: "Post Not Found",
  description: "The requested blog post could not be found.",
};
