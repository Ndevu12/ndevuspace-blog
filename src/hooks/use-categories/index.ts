import { useEffect, useState } from "react";
import { getAllCategories } from "@/features/dashboard/categories/services/resolvedCategoryService";
import type { BlogCategory } from "@/types/blog";

/**
 * Shared hook for fetching blog categories.
 * Used by NewBlog, EditBlog, and any component needing the category list.
 */
export function useCategories() {
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const cats = await getAllCategories();
        setCategories(cats);
      } catch (err) {
        console.error("Failed to load categories:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return { categories, loading };
}
