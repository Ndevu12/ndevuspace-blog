"use client";

import React from "react";
import { BlogHeaderProps } from "../types";
import { formatDate } from "@/lib/utils";
import Button from "@/components/atoms/Button/Button";

export const BlogHeader: React.FC<BlogHeaderProps> = ({
  blog,
  onEdit,
  onDelete,
  onBack,
}) => {
  const getStatusBadge = (status?: string) => {
    const blogStatus = status || "published";

    switch (blogStatus) {
      case "published":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <i className="fas fa-check-circle mr-2"></i>
            Published
          </span>
        );
      case "draft":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
            <i className="fas fa-edit mr-2"></i>
            Draft
          </span>
        );
      case "archived":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
            <i className="fas fa-archive mr-2"></i>
            Archived
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            <i className="fas fa-question-circle mr-2"></i>
            {blogStatus}
          </span>
        );
    }
  };

  return (
    <div className="bg-secondary rounded-xl p-6 mb-6 border border-gray-700">
      {/* Back Button */}
      <div className="mb-4">
        <Button
          variant="ghost"
          className="text-gray-400 hover:text-white hover:bg-gray-700 px-3 py-2"
          onClick={onBack}
        >
          <i className="fas fa-arrow-left mr-2"></i>
          Back to All Blogs
        </Button>
      </div>

      {/* Blog Title and Status */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <h1 className="text-3xl font-bold text-white">{blog.title}</h1>
            {getStatusBadge(blog.status)}
          </div>

          {blog.description && (
            <p className="text-xl text-gray-300 leading-relaxed">
              {blog.description}
            </p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2">
          <Button
            variant="primary"
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => onEdit?.(blog._id || blog.id || "")}
          >
            <i className="fas fa-edit mr-2"></i>
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="bg-red-600 hover:bg-red-700 text-white"
            onClick={() => onDelete?.(blog._id || blog.id || "")}
          >
            <i className="fas fa-trash-alt mr-2"></i>
            Delete
          </Button>
        </div>
      </div>

      {/* Blog Meta Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-primary/50 rounded-lg">
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-400">
            <i className="fas fa-user-circle"></i>
          </div>
          <div className="text-sm text-gray-400 mt-1">Author</div>
          <div className="text-white font-medium">
            {typeof blog.author === "object"
              ? `${blog.author.firstName} ${blog.author.lastName}`
              : blog.author || "Unknown Author"}
          </div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-blue-400">
            <i className="fas fa-calendar-alt"></i>
          </div>
          <div className="text-sm text-gray-400 mt-1">Created</div>
          <div className="text-white font-medium">
            {formatDate(blog.createdAt)}
          </div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-green-400">
            <i className="fas fa-clock"></i>
          </div>
          <div className="text-sm text-gray-400 mt-1">Read Time</div>
          <div className="text-white font-medium">{blog.readTime}</div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-purple-400">
            <i className={`fas fa-${blog.category?.icon || "bookmark"}`}></i>
          </div>
          <div className="text-sm text-gray-400 mt-1">Category</div>
          <div className="text-white font-medium">
            {blog.category?.name || "Uncategorized"}
          </div>
        </div>
      </div>

      {/* Tags */}
      {blog.tags && blog.tags.length > 0 && (
        <div className="mt-4">
          <div className="text-sm text-gray-400 mb-2">Tags:</div>
          <div className="flex flex-wrap gap-2">
            {blog.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-primary text-gray-300 rounded-full text-sm border border-gray-700"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
