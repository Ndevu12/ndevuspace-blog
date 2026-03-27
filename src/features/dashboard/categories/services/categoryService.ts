import { createClient } from "@/lib/supabase/client";
import type { BlogCategory } from "@/types/blog";

export async function getAllCategories(): Promise<BlogCategory[]> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("blog_category_admin_list", {
    p_include_counts: false,
  });

  if (error) {
    throw new Error(error.message || "Failed to fetch categories.");
  }

  if (!data || typeof data !== "object" || !("categories" in data)) {
    return [];
  }

  const { categories } = data as { categories?: BlogCategory[] };
  return Array.isArray(categories) ? categories : [];
}

export async function getCategoryById(id: string): Promise<BlogCategory | null> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("blog_category_admin_get", {
    p_category_id: id,
  });

  if (error) {
    throw new Error(error.message || "Failed to fetch category.");
  }

  if (!data || typeof data !== "object") {
    return null;
  }

  return data as BlogCategory;
}

export async function createCategory(categoryData: { name: string; icon: string }): Promise<BlogCategory | null> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("blog_category_admin_create", {
    p_name: categoryData.name,
    p_slug: null,
    p_description: null,
    p_icon: categoryData.icon,
  });

  if (error) {
    throw new Error(error.message || "Failed to create category.");
  }

  if (!data || typeof data !== "object") {
    return null;
  }

  return data as BlogCategory;
}

export async function updateCategory(id: string, categoryData: { name: string; icon: string }): Promise<BlogCategory | null> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("blog_category_admin_update", {
    p_category_id: id,
    p_name: categoryData.name,
    p_slug: null,
    p_description: null,
    p_icon: categoryData.icon,
  });

  if (error) {
    throw new Error(error.message || "Failed to update category.");
  }

  if (!data || typeof data !== "object") {
    return null;
  }

  return data as BlogCategory;
}

export async function deleteCategory(id: string): Promise<boolean> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("blog_category_admin_delete", {
    p_category_id: id,
  });

  if (error) {
    throw new Error(error.message || "Failed to delete category.");
  }

  if (!data || typeof data !== "object" || !("ok" in data)) {
    return false;
  }

  return Boolean((data as { ok?: boolean }).ok);
}
