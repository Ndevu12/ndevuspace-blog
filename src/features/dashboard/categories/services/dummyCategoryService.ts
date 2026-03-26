// Dummy category service — mirrors categoryService.ts read interface using in-memory data

import type { BlogCategory } from "@/types/blog";
import { dummyCategories } from "@/data/dummyBlogs";

export async function getAllCategories(): Promise<BlogCategory[]> {
  return dummyCategories;
}

export async function getCategoryById(id: string): Promise<BlogCategory | null> {
  return dummyCategories.find((c) => c._id === id) ?? null;
}

