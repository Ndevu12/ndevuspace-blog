import type { Metadata } from "next";
import { BlogPage } from "@/features/blog";
import { homeMetadata } from "../../lib/seo/metadata";
import {
  getBlogsPaginated,
  getAllBlogCategories,
  getPublicTags,
} from "@/features/blog/services/resolvedBlogService";
import { TOPIC_PAGE_SIZE } from "@/features/blog/topicCloudStore";

export const metadata: Metadata = homeMetadata;

export default async function BlogListingPage() {
  // Fetch initial data server-side (where process.env[key] works correctly)
  const [initialBlogs, initialCategories, initialTags] = await Promise.all([
    getBlogsPaginated(1, 10),
    getAllBlogCategories(),
    getPublicTags(1, TOPIC_PAGE_SIZE),
  ]);

  return (
    <BlogPage
      initialBlogs={initialBlogs}
      initialCategories={initialCategories}
      initialTags={initialTags}
    />
  );
}
