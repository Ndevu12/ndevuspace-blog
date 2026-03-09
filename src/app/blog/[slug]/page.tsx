import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBlogBySlug } from "@/services/resolvedBlogService";
import { BlogDetailPage } from "@/features/blog/BlogDetailPage";
import { buildBlogPostMetadata, blogNotFoundMetadata } from "@/lib/seo/seo";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogBySlug(slug);

  if (!post) {
    return blogNotFoundMetadata;
  }

  return buildBlogPostMetadata(post);
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getBlogBySlug(slug);

  if (!post) {
    notFound();
  }

  return <BlogDetailPage post={post} />;
}
