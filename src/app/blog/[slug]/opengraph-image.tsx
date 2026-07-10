import { ImageResponse } from "next/og";
import { getBlogBySlug } from "@/features/blog/services/resolvedBlogService";
import { getCategoryName, getReadTime, formatDate } from "@/lib/blogUtils";
import { siteConfig } from "@/lib/seo/seo";

export const alt = "Article cover";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

interface OgImageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Per-post social card in the site's visual system: near-black ground,
 * brand-blue glow, mono category eyebrow, bold balanced title, wordmark +
 * meta footer.
 */
export default async function Image({ params }: OgImageProps) {
  const { slug } = await params;
  const post = await getBlogBySlug(slug);

  const title = post?.title ?? siteConfig.name;
  const category = post ? getCategoryName(post.category) : "Blog";
  const meta = post
    ? `${formatDate(post.createdAt)}  ·  ${getReadTime(post)}`
    : "";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          backgroundColor: "#0a0a0f",
          backgroundImage:
            "radial-gradient(circle at 80% 10%, rgba(59, 130, 246, 0.18) 0%, transparent 55%), radial-gradient(circle at 10% 90%, rgba(124, 58, 237, 0.12) 0%, transparent 50%)",
        }}
      >
        {/* Category eyebrow */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "40px",
              height: "2px",
              backgroundColor: "#3b82f6",
            }}
          />
          <span
            style={{
              fontSize: 24,
              color: "#3b82f6",
              textTransform: "uppercase",
              letterSpacing: "0.18em",
            }}
          >
            {category}
          </span>
        </div>

        {/* Title */}
        <div
          style={{
            display: "flex",
            fontSize: title.length > 70 ? 52 : 64,
            fontWeight: 700,
            color: "#f1f5f9",
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
            maxWidth: "1000px",
          }}
        >
          {title}
        </div>

        {/* Footer: wordmark + meta */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
            <span
              style={{ fontSize: 32, fontWeight: 700, color: "#3b82f6" }}
            >
              ndevuspace
            </span>
            <span style={{ fontSize: 22, color: "#94a3b8" }}>blog</span>
          </div>
          <span
            style={{
              fontSize: 22,
              color: "#94a3b8",
              letterSpacing: "0.06em",
            }}
          >
            {meta}
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
