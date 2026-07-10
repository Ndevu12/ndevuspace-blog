import { getBlogsPaginated } from "@/features/blog/services/resolvedBlogService";
import { siteConfig } from "@/lib/seo/seo";
import { getAuthorName } from "@/lib/blogUtils";

/** Revalidate the feed hourly. */
export const revalidate = 3600;

const FEED_ITEM_LIMIT = 20;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const { blogs } = await getBlogsPaginated(1, FEED_ITEM_LIMIT);

  const items = blogs
    .map((post) => {
      const url = `${siteConfig.url}/blog/${post.slug}`;
      return [
        "<item>",
        `<title>${escapeXml(post.title)}</title>`,
        `<link>${escapeXml(url)}</link>`,
        `<guid isPermaLink="true">${escapeXml(url)}</guid>`,
        `<pubDate>${new Date(post.createdAt).toUTCString()}</pubDate>`,
        `<author>${escapeXml(getAuthorName(post.author))}</author>`,
        `<description>${escapeXml(post.description)}</description>`,
        ...post.tags.map((tag) => `<category>${escapeXml(tag)}</category>`),
        "</item>",
      ].join("");
    })
    .join("");

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">` +
    `<channel>` +
    `<title>${escapeXml(siteConfig.name)}</title>` +
    `<link>${escapeXml(siteConfig.url)}</link>` +
    `<description>${escapeXml(siteConfig.description)}</description>` +
    `<language>en</language>` +
    `<atom:link href="${escapeXml(`${siteConfig.url}/feed.xml`)}" rel="self" type="application/rss+xml"/>` +
    items +
    `</channel>` +
    `</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}
