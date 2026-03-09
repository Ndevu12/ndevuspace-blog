// Category service — new TypeScript port from src/scripts/actions/categories/categoryActions.js
// Full CRUD for blog categories (admin)

import { API_BASE_URL } from "@/lib/constants";
import { safeFetch } from "@/lib/api";
import type { BlogCategory } from "@/types/blog";

// ─── Error Handling ───

function getCategoryErrorMessage(error: string | null, code?: string): string {
  switch (code) {
    case "UNAUTHORIZED":
      return "You are not authorized to manage categories";
    case "VALIDATION_ERROR":
      return "Please check your input and try again";
    case "CATEGORY_NOT_FOUND":
      return "Category not found";
    case "DUPLICATE_CATEGORY":
      return "A category with this name already exists";
    default:
      return error || "Failed to process category request";
  }
}

// ─── Category CRUD ───

/** Get all categories */
export async function getAllCategories(): Promise<BlogCategory[]> {
  const result = await safeFetch<BlogCategory[] | { data: BlogCategory[] }>(
    `${API_BASE_URL}/blog-category`
  );

  if (!result.success) {
    return [];
  }

  // API may return array directly or { data: [...] }
  const data = result.data;
  if (Array.isArray(data)) return data;
  if (data && "data" in data) return data.data;
  return [];
}

/** Get a single category by ID */
export async function getCategoryById(
  id: string
): Promise<BlogCategory | null> {
  const result = await safeFetch<{ category?: BlogCategory }>(
    `${API_BASE_URL}/blog-category/${id}`
  );

  if (!result.success) {
    return null;
  }

  return (result.data?.category ?? result.data) as BlogCategory | null;
}

/** Create a new category */
export async function createCategory(categoryData: {
  name: string;
  icon: string;
}): Promise<BlogCategory | null> {
  const result = await safeFetch<{ category?: BlogCategory }>(
    `${API_BASE_URL}/blog-category/create`,
    {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(categoryData),
    }
  );

  if (!result.success) {
    throw new Error(getCategoryErrorMessage(result.error, result.code));
  }

  return (result.data?.category ?? result.data) as BlogCategory | null;
}

/** Update an existing category */
export async function updateCategory(
  id: string,
  categoryData: { name: string; icon: string }
): Promise<BlogCategory | null> {
  const result = await safeFetch<{ category?: BlogCategory }>(
    `${API_BASE_URL}/blog-category/update/${id}`,
    {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(categoryData),
    }
  );

  if (!result.success) {
    throw new Error(getCategoryErrorMessage(result.error, result.code));
  }

  return (result.data?.category ?? result.data) as BlogCategory | null;
}

/** Delete a category */
export async function deleteCategory(id: string): Promise<boolean> {
  const result = await safeFetch(`${API_BASE_URL}/blog-category/delete/${id}`, {
    method: "DELETE",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  if (!result.success) {
    throw new Error(getCategoryErrorMessage(result.error, result.code));
  }

  return true;
}
