"use client";

import React from "react";
import { BlogPaginationProps } from "../types";
import Button from "@/components/atoms/Button/Button";

export const BlogPagination: React.FC<BlogPaginationProps> = ({
  pagination,
  onPageChange,
  onPageSizeChange,
}) => {
  const { currentPage, totalPages, totalBlogs, blogsPerPage } = pagination;

  // Don't render pagination if there's only one page or no blogs
  if (totalPages <= 1 || totalBlogs === 0) {
    return null;
  }

  // Calculate display info
  const startItem = (currentPage - 1) * blogsPerPage + 1;
  const endItem = Math.min(currentPage * blogsPerPage, totalBlogs);

  // Generate optimized page numbers with smart compression
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const delta = 1; // Show 1 page on each side of current page

    // Always show first page
    if (currentPage > 1) {
      pages.push(1);
    }

    // Add ellipsis after first page if needed
    if (currentPage > 3) {
      pages.push("...");
    }

    // Add pages around current page
    const start = Math.max(1, currentPage - delta);
    const end = Math.min(totalPages, currentPage + delta);

    for (let i = start; i <= end; i++) {
      if (i !== 1 && i !== totalPages) {
        pages.push(i);
      } else if (i === currentPage) {
        // Always show current page even if it's first or last
        pages.push(i);
      }
    }

    // Add ellipsis before last page if needed
    if (currentPage < totalPages - 2) {
      pages.push("...");
    }

    // Always show last page
    if (currentPage < totalPages && totalPages > 1) {
      pages.push(totalPages);
    }

    // Remove duplicates and sort
    const uniquePages = Array.from(
      new Set(pages.filter((p) => typeof p === "number"))
    ) as number[];
    const ellipsisPages = pages.filter((p) => p === "...");

    // Rebuild with proper order
    const result: (number | string)[] = [];
    const sortedPages = uniquePages.sort((a, b) => a - b);

    for (let i = 0; i < sortedPages.length; i++) {
      const page = sortedPages[i];
      const nextPage = sortedPages[i + 1];

      result.push(page);

      // Add ellipsis if there's a gap
      if (nextPage && nextPage - page > 1) {
        result.push("...");
      }
    }

    return result;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="mt-6 flex items-center justify-between flex-wrap gap-4 bg-secondary/50 p-4 rounded-lg border border-gray-700">
      {/* Info text */}
      <div className="flex items-center gap-4">
        <div className="text-sm text-gray-300">
          <span className="font-medium text-white">
            Showing {startItem} to {endItem}
          </span>
          <span className="text-gray-400"> of {totalBlogs} blogs</span>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-sm text-gray-400">
          <span>Page</span>
          <span className="bg-yellow-500 text-gray-900 px-2 py-1 rounded font-medium">
            {currentPage}
          </span>
          <span>of {totalPages}</span>
        </div>

        {/* Page size selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Show:</span>
          <select
            value={blogsPerPage}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="bg-primary/50 border border-gray-700 rounded px-2 py-1 text-sm focus:outline-none focus:border-yellow-400 transition-colors text-white hover:border-gray-600"
            title="Select number of blogs per page"
            aria-label="Blogs per page"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          <span className="text-sm text-gray-400">per page</span>
        </div>
      </div>

      {/* Pagination controls */}
      <div className="flex items-center space-x-1">
        {/* Previous button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className={`p-2 rounded-md transition-all ${
            currentPage <= 1
              ? "text-gray-500 cursor-not-allowed opacity-50"
              : "text-gray-300 hover:bg-gray-700 hover:text-white"
          }`}
          title="Previous page"
        >
          <i className="fas fa-chevron-left"></i>
        </Button>

        {/* Page numbers */}
        {pageNumbers.map((page, index) => {
          if (page === "...") {
            return (
              <span
                key={`ellipsis-${index}`}
                className="px-3 py-2 text-gray-500 select-none"
              >
                ...
              </span>
            );
          }

          const pageNum = page as number;
          const isCurrentPage = pageNum === currentPage;

          return (
            <Button
              key={`page-${pageNum}`}
              variant="ghost"
              size="sm"
              onClick={() => onPageChange(pageNum)}
              className={`min-w-[40px] px-3 py-2 rounded-md transition-all font-medium ${
                isCurrentPage
                  ? "bg-yellow-500 text-gray-900 shadow-lg ring-2 ring-yellow-500/20 scale-105"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white hover:scale-105"
              }`}
              title={
                isCurrentPage
                  ? `Current page ${pageNum}`
                  : `Go to page ${pageNum}`
              }
            >
              {pageNum}
            </Button>
          );
        })}

        {/* Next button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className={`p-2 rounded-md transition-all ${
            currentPage >= totalPages
              ? "text-gray-500 cursor-not-allowed opacity-50"
              : "text-gray-300 hover:bg-gray-700 hover:text-white"
          }`}
          title="Next page"
        >
          <i className="fas fa-chevron-right"></i>
        </Button>
      </div>
    </div>
  );
};
