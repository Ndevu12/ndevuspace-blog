"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { BlogPost } from "@/types/blog";
import { BlogCard } from "./BlogCard";
import { BlogCardSkeleton } from "@/components/shared/LoadingStates";
import { cn } from "@/lib/utils";

const GRID_CLASSES = "grid grid-cols-1 gap-8 md:grid-cols-2";

/** Maximum stagger delay so long lists don't trickle in forever. */
const MAX_STAGGER_DELAY = 0.4;

export function BlogGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className={GRID_CLASSES}>
      {Array.from({ length: count }).map((_, i) => (
        <BlogCardSkeleton key={i} />
      ))}
    </div>
  );
}

interface BlogGridProps {
  posts: BlogPost[];
  /** Render the first post full-width as a featured card. */
  featureFirst?: boolean;
}

/**
 * Post grid with a staggered fade-rise entrance. Owns all layout concerns
 * (columns, spans); BlogCard stays grid-agnostic.
 */
export function BlogGrid({ posts, featureFirst = false }: BlogGridProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className={GRID_CLASSES}>
      {posts.map((post, index) => {
        const featured = featureFirst && index === 0;
        return (
          <motion.div
            key={post.id}
            className={cn("h-full", featured && "md:col-span-2")}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.35,
              ease: "easeOut",
              delay: Math.min(index * 0.05, MAX_STAGGER_DELAY),
            }}
          >
            <BlogCard post={post} variant={featured ? "featured" : "default"} />
          </motion.div>
        );
      })}
    </div>
  );
}
