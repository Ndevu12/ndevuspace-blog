"use client";

import { useEffect } from "react";
import { create } from "zustand";
import type { BlogTag, PaginatedTagsResponse } from "@/types/blog";
import { getPublicTags } from "./services/resolvedBlogService";

/** Topics per infinite-scroll batch. */
export const TOPIC_PAGE_SIZE = 10;

interface TopicCloudState {
  topics: BlogTag[];
  currentPage: number;
  hasMore: boolean;
  /** Highest postCount in the capped set; constant across pages, for weighting. */
  maxPostCount: number;
  loading: boolean;
  /** True once page 1 has been provided (server hydrate or client fetch). */
  initialized: boolean;
  error: string | null;
}

interface TopicCloudActions {
  /** Seed page 1 from server-rendered props. Idempotent — no-ops once initialized. */
  hydrate: (firstPage: PaginatedTagsResponse) => void;
  /** Fetch page 1 on the client if the store was never seeded. Idempotent. */
  ensureLoaded: () => Promise<void>;
  /** Append the next batch. Guarded against concurrent / past-the-end calls. */
  loadMore: () => Promise<void>;
}

/** Append new tags, de-duplicating by id (defensive against overlapping pages). */
function mergeTags(existing: BlogTag[], incoming: BlogTag[]): BlogTag[] {
  if (incoming.length === 0) return existing;
  const seen = new Set(existing.map((tag) => tag.id));
  return existing.concat(incoming.filter((tag) => !seen.has(tag.id)));
}

const initialState: TopicCloudState = {
  topics: [],
  currentPage: 0,
  hasMore: false,
  maxPostCount: 0,
  loading: false,
  initialized: false,
  error: null,
};

/**
 * Global topic-cloud store, shared by the listing and article pages so the
 * canonical topics are fetched once and reused across navigation. Topics are
 * server-ranked (popularity-capped, A–Z) and paginated for infinite scroll.
 */
export const useTopicCloudStore = create<TopicCloudState & TopicCloudActions>(
  (set, get) => ({
    ...initialState,

    hydrate: (firstPage) => {
      if (get().initialized) return;
      set({
        topics: firstPage.tags,
        currentPage: firstPage.currentPage,
        hasMore: firstPage.hasMore,
        maxPostCount: firstPage.maxPostCount,
        initialized: true,
        error: null,
      });
    },

    ensureLoaded: async () => {
      const { initialized, loading } = get();
      if (initialized || loading) return;

      set({ loading: true });
      try {
        const data = await getPublicTags(1, TOPIC_PAGE_SIZE);
        set({
          topics: data.tags,
          currentPage: data.currentPage,
          hasMore: data.hasMore,
          maxPostCount: data.maxPostCount,
          initialized: true,
          error: null,
        });
      } catch (err) {
        console.error("Failed to load topics:", err);
        set({ error: "Failed to load topics.", initialized: true });
      } finally {
        set({ loading: false });
      }
    },

    loadMore: async () => {
      const { loading, hasMore, currentPage } = get();
      if (loading || !hasMore) return;

      set({ loading: true });
      try {
        const nextPage = currentPage + 1;
        const data = await getPublicTags(nextPage, TOPIC_PAGE_SIZE);
        set((state) => ({
          topics: mergeTags(state.topics, data.tags),
          currentPage: data.currentPage,
          hasMore: data.hasMore,
          error: null,
        }));
      } catch (err) {
        console.error("Failed to load more topics:", err);
        set({ error: "Failed to load more topics." });
      } finally {
        set({ loading: false });
      }
    },
  })
);

/**
 * Seed the shared topic store from a server-rendered first page, once per
 * load. Call at the page level so the cloud paints without a client fetch.
 */
export function useHydrateTopicCloud(firstPage?: PaginatedTagsResponse) {
  const hydrate = useTopicCloudStore((s) => s.hydrate);
  useEffect(() => {
    if (firstPage) hydrate(firstPage);
  }, [firstPage, hydrate]);
}
