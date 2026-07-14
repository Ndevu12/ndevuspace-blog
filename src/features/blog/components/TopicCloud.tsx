"use client";

import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useInfiniteScroll } from "@/hooks";
import { useTopicCloudStore } from "../topicCloudStore";
import { TopicBadge } from "./TopicBadge";

interface TopicCloudProps {
  activeTag?: string | null;
  onTagClick?: (tag: string) => void;
}

/**
 * Server-sourced, weighted topic cloud. Reads the shared topic store (so the
 * listing and article pages share one fetch) and infinite-scrolls the capped
 * set in alphabetical batches inside its own bounded panel.
 */
export function TopicCloud({ activeTag, onTagClick }: TopicCloudProps) {
  const { topics, maxPostCount, hasMore, loading, initialized, error } =
    useTopicCloudStore();
  const ensureLoaded = useTopicCloudStore((s) => s.ensureLoaded);
  const loadMore = useTopicCloudStore((s) => s.loadMore);

  // Load page 1 if the page didn't already hydrate the store (idempotent).
  useEffect(() => {
    ensureLoaded();
  }, [ensureLoaded]);

  const panelRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useInfiniteScroll({
    onLoadMore: loadMore,
    hasMore,
    loading,
    rootRef: panelRef,
    // Small prefetch so batches stream in as the panel scrolls, rather than
    // all at once — the cloud is short, so a large margin would load everything.
    rootMargin: "48px",
    // Re-evaluate against the new layout after each batch appends.
    resetKey: topics.length,
  });

  const showSkeleton = !initialized && loading;
  const showEmpty = initialized && topics.length === 0;

  // Panel + sentinel always render so the infinite-scroll observer stays
  // attached across the pre-hydration → loaded transition.
  return (
    <div ref={panelRef} className="max-h-56 overflow-y-auto pr-1">
      {showSkeleton ? (
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-7 w-20 rounded-full" />
          ))}
        </div>
      ) : showEmpty ? (
        <p className="text-sm text-muted-foreground">
          {error ?? "No topics yet."}
        </p>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          {topics.map((topic) => (
            <TopicBadge
              key={topic.id}
              name={topic.name}
              postCount={topic.postCount}
              maxPostCount={maxPostCount}
              active={activeTag === topic.name}
              onClick={() => onTagClick?.(topic.name)}
            />
          ))}
        </div>
      )}

      {/* Sentinel — auto-loads the next alphabetical batch within this panel. */}
      <div ref={sentinelRef} className="flex h-8 items-center justify-center">
        {loading && initialized && (
          <Loader2
            className="h-4 w-4 animate-spin text-muted-foreground"
            aria-hidden
          />
        )}
      </div>
    </div>
  );
}
