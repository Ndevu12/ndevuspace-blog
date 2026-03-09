import { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogDetailPage } from "@/features/blog";
import { getBlogBySlug } from "@/services/blogService";
import { getAuthorName } from "utils/blogUtils";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogBySlug(slug);

  if (!post) {
    return {
      title: "Blog Post Not Found | NdevuSpace",
      description: "The requested blog post could not be found.",
    };
  }

  // Enhanced SEO with server metaTitle and metaDescription
  const title = post.metaTitle || `${post.title} | NdevuSpace Blog`;
  const description = post.metaDescription || post.description;

  return {
    title,
    description,
    openGraph: {
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.description,
      url: `/blog/${post.slug}`,
      siteName: "NdevuSpace",
      images: [
        {
          url: post.imageUrl || "/images/blog-og.png",
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      locale: "en_US",
      type: "article",
      publishedTime: post.createdAt,
      authors: [getAuthorName(post.author)],
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.description,
      images: [post.imageUrl || "/images/blog-og.png"],
    },
  };
}

export default async function BlogPost({ params }: Props) {
  const { slug } = await params;
  const post = await getBlogBySlug(slug);

  if (!post) {
    notFound();
  }

  return <BlogDetailPage post={post} />;
}
