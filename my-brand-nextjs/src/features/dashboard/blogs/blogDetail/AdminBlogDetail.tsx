"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminBlogDetailProps } from "./types";
import { AdminBlogPost } from "../allBlogs/types";
import { adminBlogDetailService } from "./services";
import { BlogHeader } from "./components/BlogHeader";
import { BlogContent } from "./components/BlogContent";
import { BlogStats } from "./components/BlogStats";
import { AdminBlogActions } from "./components/AdminBlogActions";
import Typography from "@/components/atoms/Typography/Typography";

export const AdminBlogDetail: React.FC<AdminBlogDetailProps> = ({
  blogId,
  onEdit,
  onDelete,
  onBack,
  className = "",
}) => {
  const router = useRouter();
  const [blog, setBlog] = useState<AdminBlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBlog = async () => {
      try {
        setLoading(true);
        setError(null);

        const blogData = await adminBlogDetailService.getBlogById(blogId);

        if (!blogData) {
          setError("Blog not found");
          return;
        }

        setBlog(blogData);
      } catch (err) {
        setError("Failed to load blog details");
        console.error("Error loading blog:", err);
      } finally {
        setLoading(false);
      }
    };

    if (blogId) {
      loadBlog();
    }
  }, [blogId]);

  const handleEdit = (id: string) => {
    if (onEdit) {
      onEdit(id);
    } else {
      router.push(`/dashboard/blogs/edit/${id}`);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await adminBlogDetailService.deleteBlog(id);

      if (onDelete) {
        onDelete(id);
      } else {
        router.push("/dashboard/blogs");
      }
    } catch (error) {
      console.error("Failed to delete blog:", error);
      setError(
        error instanceof Error ? error.message : "Failed to delete blog"
      );
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const newBlogId = await adminBlogDetailService.duplicateBlog(id);
      router.push(`/dashboard/blogs/edit/${newBlogId}`);
    } catch (error) {
      console.error("Failed to duplicate blog:", error);
      setError(
        error instanceof Error ? error.message : "Failed to duplicate blog"
      );
    }
  };

  const handleToggleStatus = async (id: string) => {
    if (!blog) return;

    try {
      // Toggle between published/draft status based on current status
      const currentStatus = blog.status || "draft";
      const newStatus = currentStatus === "published" ? "draft" : "published";

      await adminBlogDetailService.updateBlogStatus(id, newStatus);

      // Reload blog data to show updated status
      const updatedBlog = await adminBlogDetailService.getBlogById(id);
      if (updatedBlog) {
        setBlog(updatedBlog);
      }
    } catch (error) {
      console.error("Failed to toggle blog status:", error);
      setError(
        error instanceof Error ? error.message : "Failed to update blog status"
      );
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.push("/dashboard/blogs");
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen bg-primary ${className}`}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            {/* Header skeleton */}
            <div className="bg-secondary rounded-xl p-6 border border-gray-700">
              <div className="h-8 bg-gray-700 rounded mb-4 w-1/4"></div>
              <div className="h-12 bg-gray-700 rounded mb-4"></div>
              <div className="h-6 bg-gray-700 rounded w-3/4"></div>
            </div>

            {/* Content skeleton */}
            <div className="flex gap-6">
              <div className="flex-1 space-y-4">
                <div className="bg-secondary rounded-xl p-6 border border-gray-700">
                  <div className="h-64 bg-gray-700 rounded mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-700 rounded"></div>
                    <div className="h-4 bg-gray-700 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-700 rounded w-4/6"></div>
                  </div>
                </div>
              </div>

              <div className="w-80 space-y-4">
                <div className="bg-secondary rounded-xl p-6 border border-gray-700">
                  <div className="h-6 bg-gray-700 rounded mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-12 bg-gray-700 rounded"></div>
                    <div className="h-12 bg-gray-700 rounded"></div>
                    <div className="h-12 bg-gray-700 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className={`min-h-screen bg-primary ${className}`}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-16">
            <div className="mb-6">
              <i className="fas fa-exclamation-circle text-6xl text-red-400"></i>
            </div>
            <Typography variant="h1" className="text-white mb-4">
              {error || "Blog Not Found"}
            </Typography>
            <Typography variant="p" className="text-gray-400 mb-8">
              {error === "Blog not found"
                ? "The blog post you're looking for doesn't exist or may have been deleted."
                : "There was an error loading the blog details. Please try again."}
            </Typography>
            <button
              onClick={handleBack}
              className="bg-yellow-500 hover:bg-yellow-400 text-black font-medium px-6 py-3 rounded-lg transition-colors"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              Back to All Blogs
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-primary ${className}`}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <BlogHeader
          blog={blog}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onBack={handleBack}
        />

        {/* Main Content */}
        <div className="flex flex-col xl:flex-row gap-6">
          {/* Left Column - Content */}
          <div className="flex-1 space-y-6">
            <BlogContent blog={blog} />
            <BlogStats blog={blog} />
          </div>

          {/* Right Column - Admin Actions */}
          <div className="w-full xl:w-80 space-y-6">
            <AdminBlogActions
              blogId={blog._id || blog.id || blogId}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onDuplicate={handleDuplicate}
              onToggleStatus={handleToggleStatus}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
