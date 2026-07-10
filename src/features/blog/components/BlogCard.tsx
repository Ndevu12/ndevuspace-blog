import { BlogPost } from "@/types/blog";
import Image from "next/image";
import Link from "next/link";
import {
  getAuthorName,
  getAuthorImage,
  getCategoryName,
  getPostImageSrc,
  getReadTime,
  formatDate,
} from "@/lib/blogUtils";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type BlogCardVariant = "default" | "featured" | "compact";

interface BlogCardProps {
  post: BlogPost;
  /**
   * "featured" — horizontal media/content split for a full-width slot.
   * "compact" — cover + title + read time, for dense grids (related posts).
   */
  variant?: BlogCardVariant;
}

/** Mono glass chip rendered over the cover image. */
function CoverChip({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "glass-scrim absolute flex items-center font-mono text-[10px] uppercase tracking-[0.12em]",
        className
      )}
    >
      {children}
    </span>
  );
}

export function BlogCard({ post, variant = "default" }: BlogCardProps) {
  const authorName = getAuthorName(post.author);
  const featured = variant === "featured";
  const compact = variant === "compact";

  return (
    <article className="group relative h-full">
      <Card
        className={cn(
          "h-full gap-0 overflow-hidden py-0 transition-all duration-300",
          "group-hover:ring-primary/40 group-hover:shadow-[0_16px_40px_-18px] group-hover:shadow-primary/35",
          "motion-safe:group-hover:-translate-y-0.5 motion-safe:group-active:scale-[0.99]",
          featured && "md:grid md:grid-cols-2"
        )}
      >
        {/* Cover */}
        <div
          className={cn(
            "relative aspect-video overflow-hidden",
            featured && "md:aspect-auto md:h-full md:min-h-64"
          )}
        >
          <Image
            src={getPostImageSrc(post)}
            alt={post.title}
            fill
            sizes={
              featured
                ? "(max-width: 768px) 100vw, 50vw"
                : compact
                  ? "(max-width: 768px) 100vw, 25vw"
                  : "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            }
            className="object-cover transition-transform duration-300 motion-safe:group-hover:scale-[1.03]"
          />
          {post.isNew && (
            <CoverChip className="right-3 top-3 gap-1.5 rounded-full px-2.5 py-1">
              <span
                aria-hidden
                className="h-1.5 w-1.5 rounded-full bg-emerald-400 motion-safe:animate-pulse-soft"
              />
              New
            </CoverChip>
          )}
          {/* Meta strip — category + read time over the image */}
          <CoverChip className="inset-x-3 bottom-3 justify-between gap-3 rounded-lg px-3 py-1.5">
            <span className="truncate">{getCategoryName(post.category)}</span>
            <span className="shrink-0">{getReadTime(post)}</span>
          </CoverChip>
        </div>

        {/* Content */}
        <CardContent
          className={cn(
            "flex flex-1 flex-col gap-3 p-5",
            featured && "md:justify-center md:p-7",
            compact && "gap-2 p-4"
          )}
        >
          <h3
            className={cn(
              "font-bold leading-snug text-foreground transition-colors duration-200 group-hover:text-primary",
              featured && "text-lg md:text-2xl",
              compact && "line-clamp-2 text-base font-semibold",
              !featured && !compact && "text-lg"
            )}
          >
            {post.title}
          </h3>

          {!compact && (
            <p
              className={cn(
                "line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground",
                featured && "md:flex-none md:text-base"
              )}
            >
              {post.description}
            </p>
          )}

          {/* Footer */}
          {!compact && (
            <div className="mt-auto flex items-center justify-between border-t border-border pt-4">
              <div className="flex items-center gap-2.5">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={getAuthorImage(post)} alt={authorName} />
                  <AvatarFallback className="text-xs">
                    {authorName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-meta">{formatDate(post.createdAt)}</span>
              </div>
              <span
                aria-hidden
                className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors duration-300 group-hover:border-primary group-hover:bg-primary/10 group-hover:text-primary"
              >
                <ArrowRight className="h-4 w-4 transition-transform duration-300 motion-safe:group-hover:translate-x-0.5" />
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stretched link — the whole card is one target */}
      <Link
        href={`/blog/${post.slug}`}
        aria-label={post.title}
        className="absolute inset-0 z-10 rounded-xl"
      />
    </article>
  );
}
