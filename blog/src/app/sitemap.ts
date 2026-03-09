import type { MetadataRoute } from "next";
import { SITE_URL, API_BASE_URL } from "@/lib/constants";

interface BlogListResponse {
  data: {
    blogs: Array<{
      slug: string;
      updatedAt?: string;
      createdAt: string;
    }>;
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const currentDate = new Date().toISOString();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 1.0,
    },
  ];

  // Dynamic blog pages
  try {
    const response = await fetch(
      `${API_BASE_URL}/blogs/public?page=1&limit=100`,
      { next: { revalidate: 3600 } } // Revalidate every hour
    );

    if (response.ok) {
      const json: BlogListResponse = await response.json();
      const blogs = json.data?.blogs ?? [];

      const blogPages: MetadataRoute.Sitemap = blogs.map((blog) => ({
        url: `${SITE_URL}/blog/${blog.slug}`,
        lastModified: blog.updatedAt || blog.createdAt,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      }));

      return [...staticPages, ...blogPages];
    }
  } catch (error) {
    console.error("Failed to fetch blogs for sitemap:", error);
  }

  return staticPages;
}
