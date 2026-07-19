import { create } from "zustand";
import {
  getAdminTags,
  createTag,
  updateTag,
  deleteTag,
  mergeTags,
  type AdminTag,
} from "./services/tagAdminService";

interface TagManagerState {
  tags: AdminTag[];
  loading: boolean;
  /** IDs currently ticked for a merge. */
  selectedIds: string[];

  loadTags: () => Promise<void>;
  addTag: (name: string) => Promise<void>;
  renameTag: (id: string, name: string) => Promise<void>;
  removeTag: (id: string) => Promise<void>;
  /** Merge every selected source into `targetId`, then reload and clear selection. */
  mergeSelected: (targetId: string) => Promise<{ mergedCount: number; movedLinks: number }>;

  toggleSelected: (id: string) => void;
  clearSelection: () => void;
}

export const useTagManagerStore = create<TagManagerState>((set, get) => ({
  tags: [],
  loading: true,
  selectedIds: [],

  loadTags: async () => {
    set({ loading: true });
    try {
      const tags = await getAdminTags();
      set({ tags, loading: false });
    } catch (err) {
      console.error("Failed to load tags:", err);
      set({ loading: false });
      throw err;
    }
  },

  addTag: async (name) => {
    await createTag(name);
    await get().loadTags();
  },

  renameTag: async (id, name) => {
    await updateTag(id, name);
    await get().loadTags();
  },

  removeTag: async (id) => {
    await deleteTag(id);
    set((s) => ({ selectedIds: s.selectedIds.filter((x) => x !== id) }));
    await get().loadTags();
  },

  mergeSelected: async (targetId) => {
    const sources = get().selectedIds.filter((id) => id !== targetId);
    const result = await mergeTags(sources, targetId);
    set({ selectedIds: [] });
    await get().loadTags();
    return result;
  },

  toggleSelected: (id) =>
    set((s) => ({
      selectedIds: s.selectedIds.includes(id)
        ? s.selectedIds.filter((x) => x !== id)
        : [...s.selectedIds, id],
    })),

  clearSelection: () => set({ selectedIds: [] }),
}));
