// Category service (non-dummy mode is intentionally unimplemented).
// This project should not query real data unless explicitly requested.

import type { BlogCategory } from "@/types/blog";

function notImplemented(name: string): never {
  throw new Error(`${name} is not implemented (dummy mode only).`);
}

export async function getAllCategories(): Promise<BlogCategory[]> {
  return notImplemented("getAllCategories");
}

export async function getCategoryById(_id: string): Promise<BlogCategory | null> {
  return notImplemented("getCategoryById");
}

export async function createCategory(_categoryData: { name: string; icon: string }): Promise<BlogCategory | null> {
  return notImplemented("createCategory");
}

export async function updateCategory(_id: string, _categoryData: { name: string; icon: string }): Promise<BlogCategory | null> {
  return notImplemented("updateCategory");
}

export async function deleteCategory(_id: string): Promise<boolean> {
  return notImplemented("deleteCategory");
}

