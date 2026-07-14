"use client";

import { useEffect, useRef, type RefObject } from "react";

interface UseInfiniteScrollOptions {
  onLoadMore: () => void;
  hasMore: boolean;
  loading: boolean;
  /** Scroll container to observe within; omit to observe the viewport. */
  rootRef?: RefObject<HTMLElement | null>;
  /** Prefetch margin so the next batch starts before the very edge. */
  rootMargin?: string;
  /**
   * Bump whenever the list length changes so the observer re-evaluates
   * against the new layout — this drives "keep loading while the sentinel
   * stays visible" using a fresh reading instead of a stale one.
   */
  resetKey?: number;
}

/**
 * Auto-loads the next batch when a sentinel enters view. Loading is triggered
 * from the intersection callback (reading the latest state via a ref), so it
 * never fires on a stale `loading` transition; re-observing on `resetKey`
 * continues loading short lists and stops once the sentinel is scrolled past.
 * Attach the returned ref to a sentinel at the end of the list.
 */
export function useInfiniteScroll({
  onLoadMore,
  hasMore,
  loading,
  rootRef,
  rootMargin = "200px",
  resetKey = 0,
}: UseInfiniteScrollOptions) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const latest = useRef({ onLoadMore, hasMore, loading });

  // Keep the latest state in a ref (outside render) so the intersection
  // callback always reads current values without re-creating the observer.
  useEffect(() => {
    latest.current = { onLoadMore, hasMore, loading };
  });

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const { onLoadMore: load, hasMore: more, loading: busy } =
          latest.current;
        if (entry.isIntersecting && more && !busy) {
          load();
        }
      },
      { root: rootRef?.current ?? null, rootMargin }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [rootRef, rootMargin, resetKey]);

  return sentinelRef;
}
