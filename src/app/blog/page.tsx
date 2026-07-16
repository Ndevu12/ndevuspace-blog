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

// Render at request time, not build time. The default (unfiltered) listing is
// served from this server payload — the client only re-fetches when a tag /
// category / search filter is active. Without this, Next.js statically renders
// the page at build time and freezes whatever posts existed then (often none),
// so newly published posts never appear on /blog even though tag/topic views
// (which fetch live on the client) do. Use `revalidate = N` instead if you
// prefer ISR caching over always-fresh rendering.
export const dynamic = "force-dynamic";

export default async function BlogListingPage() {
  // Fetch initial data server-side (where process.env[key] works correctly)
  const [initialBlogs, initialCategories, initialTags] = await Promise.all([
    getBlogsPaginated(1, 10),
    getAllBlogCategories(),
    // Topics are secondary — never let a tag-fetch failure (e.g. the RPC not
    // yet applied) break the page. The client store loads them on mount.
    getPublicTags(1, TOPIC_PAGE_SIZE).catch(() => undefined),
  ]);

  return (
    <BlogPage
      initialBlogs={initialBlogs}
      initialCategories={initialCategories}
      initialTags={initialTags}
    />
  );
}
