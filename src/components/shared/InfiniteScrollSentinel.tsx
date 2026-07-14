"use client";

import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIntersectionObserver } from "@/hooks";

interface InfiniteScrollSentinelProps {
  onLoadMore: () => void;
  hasMore: boolean;
  loading: boolean;
  /** Label for the accessible manual fallback button. */
  loadMoreLabel?: string;
}

/**
 * Auto-loads the next page when the sentinel scrolls into view. Keeps a
 * focusable "Load more" button as an accessible fallback (keyboard / AT
 * users who don't trigger the scroll observer), and announces loading via
 * an aria-live region. Renders nothing once there's nothing left to load.
 */
export function InfiniteScrollSentinel({
  onLoadMore,
  hasMore,
  loading,
  loadMoreLabel = "Load more",
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
      className="my-12 flex flex-col items-center gap-4"
    >
      <p role="status" aria-live="polite" className="min-h-5">
        {loading && (
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Loading more articles…
          </span>
        )}
      </p>
      {hasMore && !loading && (
        <Button variant="outline" onClick={onLoadMore}>
          {loadMoreLabel}
        </Button>
      )}
    </div>
  );
}
