import { create } from "zustand";
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "./services/resolvedCategoryService";
import type { BlogCategory } from "@/types/blog";
import type { CategoryFormData } from "@/types/admin";

interface CategoryManagerState {
  categories: BlogCategory[];
  loading: boolean;
  dialogOpen: boolean;
  editingCategory: BlogCategory | null;

  // Actions
  setDialogOpen: (open: boolean) => void;
  setEditingCategory: (category: BlogCategory | null) => void;
  openCreateDialog: () => void;
  openEditDialog: (category: BlogCategory) => void;
  closeDialog: () => void;
  loadCategories: () => Promise<void>;
  saveCategory: (data: CategoryFormData) => Promise<void>;
  removeCategory: (categoryId: string) => Promise<void>;
}

export const useCategoryManagerStore = create<CategoryManagerState>(
  (set, get) => ({
    categories: [],
    loading: true,
    dialogOpen: false,
    editingCategory: null,

    setDialogOpen: (open) => set({ dialogOpen: open }),
    setEditingCategory: (category) => set({ editingCategory: category }),

    openCreateDialog: () =>
      set({ editingCategory: null, dialogOpen: true }),

    openEditDialog: (category) =>
      set({ editingCategory: category, dialogOpen: true }),

    closeDialog: () =>
      set({ dialogOpen: false, editingCategory: null }),

    loadCategories: async () => {
      set({ loading: true });
      try {
        const cats = await getAllCategories();
        set({ categories: cats, loading: false });
      } catch (err) {
        console.error("Failed to load categories:", err);
        set({ loading: false });
        throw err;
      }
    },

    saveCategory: async (data) => {
      const { editingCategory } = get();
      if (editingCategory) {
        await updateCategory(editingCategory.id, data);
      } else {
        await createCategory(data);
      }
      get().closeDialog();
      await get().loadCategories();
    },

    removeCategory: async (categoryId) => {
      await deleteCategory(categoryId);
      await get().loadCategories();
    },
  })
);
