import type { BlogAdminFilters, BlogAdminResponse, BlogStatus } from "@/types/admin";
import type { BlogPost } from "@/types/blog";
import { dummyBlogs } from "@/data/dummyBlogs";

function sortBlogs(blogs: BlogPost[], sortBy: BlogAdminFilters["sortBy"], sortOrder: BlogAdminFilters["sortOrder"]) {
  const dir = sortOrder === "asc" ? 1 : -1;
  return [...blogs].sort((a, b) => {
    const aVal =
      sortBy === "title"
        ? a.title
        : sortBy === "updatedAt"
          ? a.updatedAt ?? a.createdAt
          : sortBy === "createdAt"
            ? a.createdAt
            : sortBy === "viewsCount"
              ? String(a.viewsCount ?? 0)
              : String(a.likesCount ?? a.likes ?? 0);
    const bVal =
      sortBy === "title"
        ? b.title
        : sortBy === "updatedAt"
          ? b.updatedAt ?? b.createdAt
          : sortBy === "createdAt"
            ? b.createdAt
            : sortBy === "viewsCount"
              ? String(b.viewsCount ?? 0)
              : String(b.likesCount ?? b.likes ?? 0);

    if (sortBy === "title") return aVal.localeCompare(bVal) * dir;
    return (new Date(aVal).getTime() - new Date(bVal).getTime()) * dir;
  });
}

function filterBlogs(filters: BlogAdminFilters): BlogPost[] {
  let blogs = [...dummyBlogs];

  if (filters.status) {
    blogs = blogs.filter((b) => (b.status ?? "draft") === filters.status);
  }
  if (filters.category) {
    blogs = blogs.filter((b) => b.category?._id === filters.category);
  }
  if (filters.search) {
    const q = filters.search.toLowerCase();
    blogs = blogs.filter((b) => b.title.toLowerCase().includes(q) || b.description.toLowerCase().includes(q));
  }

  return sortBlogs(blogs, filters.sortBy, filters.sortOrder);
}

function paginate(blogs: BlogPost[], page: number, limit: number) {
  const start = (page - 1) * limit;
  const slice = blogs.slice(start, start + limit);
  const total = blogs.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return { slice, total, totalPages };
}

export async function getAdminBlogs(filters: BlogAdminFilters): Promise<BlogAdminResponse> {
  const filtered = filterBlogs(filters);
  const { slice, total, totalPages } = paginate(filtered, filters.page, filters.limit);

  return {
    blogs: slice,
    pagination: {
      currentPage: filters.page,
      totalPages,
      totalBlogs: total,
      blogsPerPage: filters.limit,
    },
  };
}

export async function getBlogById(blogId: string): Promise<BlogPost | null> {
  return dummyBlogs.find((b) => b._id === blogId) ?? null;
}

export async function createBlog(_formData: FormData): Promise<void> {
  // Dummy implementation: no-op.
}

export async function updateBlog(_blogId: string, _formData: FormData): Promise<void> {
  // Dummy implementation: no-op.
}

export async function updateBlogStatus(_blogId: string, _status: BlogStatus): Promise<void> {
  // Dummy implementation: no-op.
}

export async function deleteBlog(_blogId: string): Promise<void> {
  // Dummy implementation: no-op.
}

export const dashboardBlogService = {
  getAdminBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  updateBlogStatus,
  deleteBlog,
};

