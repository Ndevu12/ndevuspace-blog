"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AllBlogsProps, BlogAdminFilters, AdminBlogPost } from "./types";
import { BlogActions } from "./components/BlogActions";
import { BlogFilters } from "./components/BlogFilters";
import { BlogTable } from "./components/BlogTable";
import { BlogPagination } from "./components/BlogPagination";
import { blogAdminService } from "./services";
import { blogCategories } from "@/lib/blogData";
import Typography from "@/components/atoms/Typography/Typography";

export const AllBlogs: React.FC<AllBlogsProps> = ({ className }) => {
  const router = useRouter();
  const [blogs, setBlogs] = useState<AdminBlogPost[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalBlogs: 0,
    blogsPerPage: 10,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filtersVisible, setFiltersVisible] = useState(false);

  const [filters, setFilters] = useState<BlogAdminFilters>({
    page: 1,
    limit: 10,
    status: "",
    category: "",
    search: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  // Debounced search function
  const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);

      return () => {
        clearTimeout(handler);
      };
    }, [value, delay]);

    return debouncedValue;
  };

  const debouncedSearch = useDebounce(filters.search, 300);

  // Load blogs function
  const loadBlogs = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await blogAdminService.getAdminBlogs(filters);
      setBlogs(response.blogs);
      setPagination(response.pagination);
    } catch (err) {
      console.error("Error loading blogs:", err);
      setError("Failed to load blogs. Please try again.");
      setBlogs([]);
      setPagination({
        currentPage: 1,
        totalPages: 1,
        totalBlogs: 0,
        blogsPerPage: filters.limit,
      });
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Load blogs when filters change (except search)
  useEffect(() => {
    loadBlogs();
  }, [
    filters.page,
    filters.limit,
    filters.status,
    filters.category,
    filters.sortBy,
    filters.sortOrder,
    debouncedSearch, // Use debounced search
    loadBlogs, // Add loadBlogs dependency
  ]);

  // Handle filter changes
  const handleFiltersChange = (newFilters: Partial<BlogAdminFilters>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: newFilters.page !== undefined ? newFilters.page : 1, // Reset to page 1 when filters change
    }));
  };

  // Handle search change
  const handleSearchChange = (search: string) => {
    setFilters((prev) => ({
      ...prev,
      search,
      page: 1, // Reset to page 1 when search changes
    }));
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handlePageSizeChange = (pageSize: number) => {
    setFilters((prev) => ({
      ...prev,
      limit: pageSize,
      page: 1, // Reset to page 1 when page size changes
    }));
  };

  // Handle actions
  const handleToggleFilters = () => {
    setFiltersVisible(!filtersVisible);
  };

  const handleApplyFilters = () => {
    // Filters are applied automatically via useEffect
    setFiltersVisible(false);
  };

  const handleClearFilters = () => {
    const clearedFilters: BlogAdminFilters = {
      page: 1,
      limit: 10,
      status: "",
      category: "",
      search: "",
      sortBy: "createdAt",
      sortOrder: "desc",
    };
    setFilters(clearedFilters);
    setFiltersVisible(false);
  };

  const handleNewBlog = () => {
    // Navigation is handled by Link component in BlogActions
  };

  const handleEditBlog = (blogId: string) => {
    router.push(`/dashboard/blogs/edit/${blogId}`);
  };

  const handleViewBlog = (blogId: string) => {
    router.push(`/dashboard/blogs/view/${blogId}`);
  };

  const handleDeleteBlog = async (blogId: string) => {
    try {
      await blogAdminService.deleteBlog(blogId);
      // Show success notification (you can integrate a toast library here)
      console.log("Blog deleted successfully");
      // Reload blogs
      await loadBlogs();
    } catch (err) {
      console.error("Error deleting blog:", err);
      // Show error notification
      alert("Failed to delete blog. Please try again.");
    }
  };

  return (
    <div className={className}>
      {/* Page Actions */}
      <BlogActions
        searchValue={filters.search}
        onSearchChange={handleSearchChange}
        onToggleFilters={handleToggleFilters}
        onNewBlog={handleNewBlog}
        filtersVisible={filtersVisible}
      />

      {/* Filters Panel */}
      <BlogFilters
        filters={filters}
        categories={blogCategories.filter((cat) => cat._id !== "all")} // Exclude 'all' category from filters
        onFiltersChange={handleFiltersChange}
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
        isVisible={filtersVisible}
        onToggleVisibility={handleToggleFilters}
      />

      {/* Error State */}
      {error && (
        <div className="mb-6 bg-red-500/20 border border-red-500/50 rounded-lg p-4">
          <div className="flex items-center">
            <i className="fas fa-exclamation-triangle text-red-400 mr-2"></i>
            <Typography variant="p" className="text-red-400">
              {error}
            </Typography>
            <button
              onClick={loadBlogs}
              className="ml-auto text-red-400 hover:text-red-300"
              title="Retry"
            >
              <i className="fas fa-refresh"></i>
            </button>
          </div>
        </div>
      )}

      {/* Blog Table */}
      <BlogTable
        blogs={blogs}
        onEdit={handleEditBlog}
        onView={handleViewBlog}
        onDelete={handleDeleteBlog}
        loading={loading}
      />

      {/* Pagination */}
      {!loading && blogs.length > 0 && (
        <BlogPagination
          pagination={pagination}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}
    </div>
  );
};

export default AllBlogs;
