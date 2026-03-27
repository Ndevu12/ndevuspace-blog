import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type BlogDraftStatus = "draft" | "published";

export interface BlogDraftValues {
  title: string;
  description: string;
  content: string;
  categoryId: string;
  tags: string[];
  readingTime: string;
  imageUrl: string;
  metaTitle: string;
  metaDescription: string;
  status: BlogDraftStatus;
}

export interface BlogDraftEntry {
  values: BlogDraftValues;
  updatedAt: number;
  sourceFingerprint?: string;
}

interface BlogDraftStoreState {
  newDraft: BlogDraftEntry | null;
  editDraftsById: Record<string, BlogDraftEntry>;
  setNewDraft: (values: BlogDraftValues, sourceFingerprint?: string) => void;
  clearNewDraft: () => void;
  setEditDraft: (blogId: string, values: BlogDraftValues, sourceFingerprint?: string) => void;
  clearEditDraft: (blogId: string) => void;
  clearAllDrafts: () => void;
}

const STORAGE_KEY = "dashboard-blog-drafts";
const PERSIST_VERSION = 1;

export const useBlogDraftStore = create<BlogDraftStoreState>()(
  persist(
    (set) => ({
      newDraft: null,
      editDraftsById: {},
      setNewDraft: (values, sourceFingerprint) =>
        set({
          newDraft: {
            values,
            updatedAt: Date.now(),
            ...(sourceFingerprint ? { sourceFingerprint } : {}),
          },
        }),
      clearNewDraft: () => set({ newDraft: null }),
      setEditDraft: (blogId, values, sourceFingerprint) =>
        set((state) => ({
          editDraftsById: {
            ...state.editDraftsById,
            [blogId]: {
              values,
              updatedAt: Date.now(),
              ...(sourceFingerprint ? { sourceFingerprint } : {}),
            },
          },
        })),
      clearEditDraft: (blogId) =>
        set((state) => {
          const nextEditDrafts = { ...state.editDraftsById };
          delete nextEditDrafts[blogId];
          return { editDraftsById: nextEditDrafts };
        }),
      clearAllDrafts: () =>
        set({
          newDraft: null,
          editDraftsById: {},
        }),
    }),
    {
      name: STORAGE_KEY,
      version: PERSIST_VERSION,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        newDraft: state.newDraft,
        editDraftsById: state.editDraftsById,
      }),
    }
  )
);
