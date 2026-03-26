import { Suspense } from "react";
import type { Metadata } from "next";
import { BlogPage } from "@/features/blog/BlogPage";
import { BlogListingSkeleton } from "@/components/shared/LoadingStates";
import { homeMetadata } from "../../lib/seo/metadata";
import {
  getBlogsPaginated,
  getAllBlogCategories,
} from "@/features/blog/services/resolvedBlogService";

export const metadata: Metadata = homeMetadata;

export default async function BlogListingPage() {
  // Fetch initial data server-side (where process.env[key] works correctly)
  const [initialBlogs, initialCategories] = await Promise.all([
    getBlogsPaginated(1, 10),
    getAllBlogCategories(),
  ]);

  return (
    <Suspense fallback={<BlogListingSkeleton />}>
      <BlogPage
        initialBlogs={initialBlogs}
        initialCategories={initialCategories}
      />
    </Suspense>
  );
}
