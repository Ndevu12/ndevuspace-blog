"use client";

import { create } from "zustand";
import type { BlogPost, BlogComment } from "@/types/blog";
import {
  getBlogsByCategory,
  incrementBlogView,
  likeBlog,
} from "./services/resolvedBlogService";

// ─── Types ───

interface BlogDetailState {
  // Sidebar data
  relatedPosts: BlogPost[];

  // Comments
  comments: BlogComment[];

  // Like state
  liked: boolean;
  likeCount: number;

  // Client-only state
  currentUrl: string;

  // Loading
  sidebarLoading: boolean;
}

interface BlogDetailActions {
  // Initialization
  initializePost: (post: BlogPost) => void;
  fetchRelatedPosts: (post: BlogPost) => Promise<void>;

  // Like
  toggleLike: (postId: string) => Promise<void>;

  // Views — best-effort, once per session per post
  trackView: (postId: string) => Promise<void>;

  // Comments
  addComment: (comment: BlogComment) => void;

  // Reset
  reset: () => void;
}

const initialState: BlogDetailState = {
  relatedPosts: [],
  comments: [],
  liked: false,
  likeCount: 0,
  currentUrl: "",
  sidebarLoading: true,
};

// ─── Store ───

export const useBlogDetailStore = create<BlogDetailState & BlogDetailActions>(
  (set, get) => ({
    ...initialState,

    initializePost: (post) => {
      // Read browser-only state
      const url = typeof window !== "undefined" ? window.location.href : "";
      const likedPosts: string[] = typeof window !== "undefined"
        ? JSON.parse(localStorage.getItem("likedPosts") || "[]")
        : [];

      set({
        currentUrl: url,
        liked: likedPosts.includes(post.id),
        likeCount: post.likes || 0,
        comments: post.comments && Array.isArray(post.comments) ? post.comments : [],
      });
    },

    fetchRelatedPosts: async (post) => {
      set({ sidebarLoading: true });

      try {
        let relatedPosts: BlogPost[] = [];
        if (post.category?.id) {
          const categoryPosts = await getBlogsByCategory(post.category.id, 1, 6);
          relatedPosts = categoryPosts.blogs
            .filter((p) => p.slug !== post.slug)
            .slice(0, 3);
        }

        set({ relatedPosts, sidebarLoading: false });
      } catch (error) {
        console.error("Error fetching related posts:", error);
        set({ relatedPosts: [], sidebarLoading: false });
      }
    },

    toggleLike: async (postId) => {
      const { liked } = get();

      try {
        const result = await likeBlog(postId);
        if (result) {
          const likedPosts: string[] = JSON.parse(
            localStorage.getItem("likedPosts") || "[]"
          );

          if (liked) {
            const updated = likedPosts.filter((id) => id !== postId);
            localStorage.setItem("likedPosts", JSON.stringify(updated));
            set({ liked: false, likeCount: result.likes });
          } else {
            likedPosts.push(postId);
            localStorage.setItem("likedPosts", JSON.stringify(likedPosts));
            set({ liked: true, likeCount: result.likes });
          }

          return; // success — toast handled in component for flexibility
        }
      } catch {
        throw new Error("Failed to like article");
      }
    },

    trackView: async (postId) => {
      if (typeof window === "undefined") return;

      const key = `viewed:${postId}`;
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");

      try {
        await incrementBlogView(postId);
      } catch {
        // Best-effort — never surface view-tracking errors to the reader.
      }
    },

    addComment: (comment) => {
      set((state) => ({ comments: [comment, ...state.comments] }));
    },

    reset: () => set(initialState),
  })
);
