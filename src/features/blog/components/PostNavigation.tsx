import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { AdjacentBlogs, BlogPost } from "@/types/blog";
import { cn } from "@/lib/utils";

interface PostNavigationLinkProps {
  post: BlogPost;
  direction: "previous" | "next";
}

function PostNavigationLink({ post, direction }: PostNavigationLinkProps) {
  const isNext = direction === "next";

  return (
    <Link
      href={`/blog/${post.slug}`}
      className={cn(
        "group flex flex-col gap-2 rounded-xl border border-border bg-card p-4 transition-all duration-200",
        "hover:border-primary/50 hover:shadow-[0_12px_32px_-18px] hover:shadow-primary/30",
        "motion-safe:hover:-translate-y-0.5",
        isNext && "items-end text-right"
      )}
    >
      <span className="flex items-center gap-1.5 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground transition-colors duration-200 group-hover:text-primary">
        {!isNext && <ArrowLeft className="h-3 w-3" aria-hidden />}
        {isNext ? "Next article" : "Previous article"}
        {isNext && <ArrowRight className="h-3 w-3" aria-hidden />}
      </span>
      <span className="line-clamp-2 text-sm font-semibold leading-snug text-foreground transition-colors duration-200 group-hover:text-primary">
        {post.title}
      </span>
    </Link>
  );
}

interface PostNavigationProps {
  adjacent: AdjacentBlogs;
  className?: string;
}

/**
 * Previous/next chronological navigation at the end of an article.
 * "Previous" is the older post, "Next" the newer one.
 */
export function PostNavigation({ adjacent, className }: PostNavigationProps) {
  const { older, newer } = adjacent;
  if (!older && !newer) return null;

  return (
    <nav
      aria-label="Adjacent articles"
      className={cn("grid gap-4 sm:grid-cols-2", className)}
    >
      {older ? (
        <PostNavigationLink post={older} direction="previous" />
      ) : (
        <span aria-hidden className="hidden sm:block" />
      )}
      {newer && <PostNavigationLink post={newer} direction="next" />}
    </nav>
  );
}
