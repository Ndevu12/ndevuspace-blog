import { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getAdjacentBlogs,
  getAllBlogCategories,
  getBlogBySlug,
} from "@/features/blog/services/resolvedBlogService";
import { BlogDetailPage } from "@/features/blog";
import { highlightCodeBlocks } from "@/lib/highlightCode";
import {
  buildBlogPostJsonLd,
  buildBlogPostMetadata,
  blogNotFoundMetadata,
  serializeJsonLd,
} from "@/lib/seo/seo";

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
  const [post, categories, adjacent] = await Promise.all([
    getBlogBySlug(slug),
    getAllBlogCategories(),
    getAdjacentBlogs(slug).catch(() => ({ newer: null, older: null })),
  ]);

  if (!post) {
    notFound();
  }

  // Stored article HTML has plain <pre><code> — highlight it server-side.
  const highlightedPost = post.content
    ? { ...post, content: highlightCodeBlocks(post.content) }
    : post;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(buildBlogPostJsonLd(post)),
        }}
      />
      <BlogDetailPage
        post={highlightedPost}
        categories={categories}
        adjacent={adjacent}
      />
    </>
  );
}
