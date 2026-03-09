"use client";

import React from "react";
import { BlogTableProps } from "../types";
import { BlogPost } from "@/types/blog";
import { formatDate } from "@/lib/utils";
import Button from "@/components/atoms/Button/Button";

export const BlogTable: React.FC<BlogTableProps> = ({
  blogs,
  onEdit,
  onView,
  onDelete,
  loading = false,
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return (
          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
            Published
          </span>
        );
      case "draft":
        return (
          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
            Draft
          </span>
        );
      case "archived":
        return (
          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
            Archived
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
            {status || "Unknown"}
          </span>
        );
    }
  };

  const getCategoryBadge = (blog: BlogPost) => {
    if (!blog.category) {
      return (
        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-600/20 text-gray-300">
          Uncategorized
        </span>
      );
    }

    return (
      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-600/20 text-blue-400">
        <i className={`fas fa-${blog.category?.icon || "bookmark"} mr-1`}></i>
        {blog.category?.name || "Uncategorized"}
      </span>
    );
  };

  const handleDelete = (blog: BlogPost) => {
    const confirmMessage = `Are you sure you want to delete "${blog.title}"? This action cannot be undone.`;
    if (window.confirm(confirmMessage)) {
      onDelete(blog._id);
    }
  };

  if (loading) {
    return (
      <div className="bg-secondary rounded-xl shadow-lg p-6 border border-gray-700">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-10 text-center text-gray-400"
                >
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-yellow-500 mx-auto mb-4"></div>
                  Loading blogs...
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-secondary rounded-xl shadow-lg p-6 border border-gray-700">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {blogs.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-10 text-center text-gray-400"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 mx-auto text-gray-500 mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p className="text-lg font-bold mb-1">No blogs found</p>
                  <p>Try adjusting your filters or create a new blog</p>
                </td>
              </tr>
            ) : (
              blogs.map((blog) => {
                const blogWithStatus = blog as BlogPost & {
                  status?: string;
                };
                const fallbackImage =
                  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjMzc0MTUxIi8+Cjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOUNBM0FGIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5CbG9nPC90ZXh0Pgo8L3N2Zz4K";

                return (
                  <tr
                    key={blog._id}
                    className="hover:bg-gray-800/30 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          className="h-10 w-10 rounded-md object-cover bg-gray-800 mr-4"
                          src={blog.imageUrl || fallbackImage}
                          alt={blog.title}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = fallbackImage;
                          }}
                        />
                        <div>
                          <button
                            onClick={() => onView(blog._id)}
                            className="text-sm font-medium text-white hover:text-yellow-400 transition-colors text-left"
                            title={`View blog: ${blog.title}`}
                          >
                            {blog.title}
                          </button>
                          <div className="text-xs text-gray-400">
                            {blog.description?.substring(0, 60)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getCategoryBadge(blog)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">
                        {formatDate(blog.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(blogWithStatus.status || "published")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => onEdit(blog._id)}
                          className="text-indigo-400 hover:text-indigo-300 font-medium"
                          title="Edit blog"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onView(blog._id)}
                          className="text-blue-400 hover:text-blue-300 font-medium"
                          title="View blog"
                        >
                          View
                        </button>
                        <button
                          onClick={() => {
                            if (
                              window.confirm(
                                "Are you sure you want to delete this blog?"
                              )
                            ) {
                              onDelete(blog._id);
                            }
                          }}
                          className="text-red-400 hover:text-red-300 font-medium"
                          title="Delete blog"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
