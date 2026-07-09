"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { BlogPost } from "@/types/blog";
import { BlogCard } from "./BlogCard";
import { BlogCardSkeleton } from "@/components/shared/LoadingStates";
import { DURATION, EASE_OUT, SPRING_GENTLE } from "@/lib/motion";
import { cn } from "@/lib/utils";

const GRID_CLASSES = "grid grid-cols-1 gap-8 md:grid-cols-2";

/** Maximum stagger delay so long batches don't trickle in forever. */
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
 * Post grid with batch-aware choreography. Owns all layout concerns
 * (columns, spans); BlogCard stays grid-agnostic.
 *
 * Entrances only run when a card mounts, so each batch (initial load,
 * Load More append) staggers from zero while cards already on screen stay
 * put; re-sorting glides existing cards to their new positions via layout
 * animation.
 */
export function BlogGrid({ posts, featureFirst = false }: BlogGridProps) {
  const prefersReducedMotion = useReducedMotion();

  // Entrance delay per post, assigned by position within the batch that
  // introduced it — state adjusted during render so delays are ready on
  // each batch's mount pass.
  const [delayById, setDelayById] = useState<ReadonlyMap<string, number>>(
    new Map()
  );
  const unseen = posts.filter((post) => !delayById.has(post.id));
  if (unseen.length > 0) {
    const next = new Map(delayById);
    unseen.forEach((post, batchIndex) => {
      next.set(post.id, Math.min(batchIndex * 0.06, MAX_STAGGER_DELAY));
    });
    setDelayById(next);
  }

  return (
    <div className={GRID_CLASSES}>
      {posts.map((post, index) => {
        const featured = featureFirst && index === 0;

        return (
          <motion.div
            key={post.id}
            layout={prefersReducedMotion ? false : "position"}
            className={cn("h-full", featured && "md:col-span-2")}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              layout: SPRING_GENTLE,
              duration: DURATION.base,
              ease: EASE_OUT,
              delay: delayById.get(post.id) ?? 0,
            }}
          >
            <BlogCard post={post} variant={featured ? "featured" : "default"} />
          </motion.div>
        );
      })}
    </div>
  );
}
