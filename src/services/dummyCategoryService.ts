// Dummy category service — mirrors categoryService.ts read interface using in-memory data
// Used when NEXT_PUBLIC_USE_DUMMY_DATA=true, resolved via resolvedCategoryService.ts

import type { BlogCategory } from "@/types/blog";
import { dummyCategories } from "@/data/dummyBlogs";

/** Get all categories */
export async function getAllCategories(): Promise<BlogCategory[]> {
  return dummyCategories;
}

/** Get a single category by ID */
export async function getCategoryById(
  id: string
): Promise<BlogCategory | null> {
  return dummyCategories.find((c) => c._id === id) ?? null;
}
