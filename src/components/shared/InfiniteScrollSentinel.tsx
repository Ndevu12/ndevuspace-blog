"use client";

import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useIntersectionObserver } from "@/hooks";

interface InfiniteScrollSentinelProps {
  onLoadMore: () => void;
  hasMore: boolean;
  loading: boolean;
}

/**
 * Auto-loads the next page when the sentinel scrolls into view and
 * announces loading via an aria-live region. Renders nothing once there's
 * nothing left to load.
 */
export function InfiniteScrollSentinel({
  onLoadMore,
  hasMore,
  loading,
}: InfiniteScrollSentinelProps) {
  // Start fetching a little before the very bottom for a seamless feel.
  const { ref, isIntersecting } = useIntersectionObserver({
    rootMargin: "600px 0px",
  });

  useEffect(() => {
    if (isIntersecting && hasMore && !loading) {
      onLoadMore();
    }
  }, [isIntersecting, hasMore, loading, onLoadMore]);

  if (!hasMore && !loading) return null;

  return (
    <div
      ref={ref as React.Ref<HTMLDivElement>}
      role="status"
      aria-live="polite"
      className="my-12 flex min-h-6 items-center justify-center"
    >
      {loading && (
        <span className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Loading more articles…
        </span>
      )}
    </div>
  );
}
