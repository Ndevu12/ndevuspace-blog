"use client";

import React from "react";
import { BlogFiltersProps } from "../types";
import Button from "@/components/atoms/Button/Button";

export const BlogFilters: React.FC<BlogFiltersProps> = ({
  filters,
  categories,
  onFiltersChange,
  onApplyFilters,
  onClearFilters,
  isVisible,
}) => {
  if (!isVisible) return null;

  return (
    <div className="mb-6 bg-secondary rounded-lg p-4 border border-gray-700">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Category filter */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Filter by Category
          </label>
          <select
            value={filters.category}
            onChange={(e) => onFiltersChange({ category: e.target.value })}
            className="w-full bg-primary/50 border border-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-yellow-400 transition-colors text-white"
            title="Filter blogs by category"
            aria-label="Filter by Category"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status filter */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Filter by Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => onFiltersChange({ status: e.target.value })}
            className="w-full bg-primary/50 border border-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-yellow-400 transition-colors text-white"
            title="Filter blogs by status"
            aria-label="Filter by Status"
          >
            <option value="">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        {/* Sort options */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Sort By
          </label>
          <select
            value={`${filters.sortBy}_${filters.sortOrder}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split("_");
              onFiltersChange({
                sortBy: sortBy as any,
                sortOrder: sortOrder as "asc" | "desc",
              });
            }}
            className="w-full bg-primary/50 border border-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-yellow-400 transition-colors text-white"
            title="Sort blogs by criteria"
            aria-label="Sort By"
          >
            <option value="createdAt_desc">Newest First</option>
            <option value="createdAt_asc">Oldest First</option>
            <option value="title_asc">Title (A-Z)</option>
            <option value="title_desc">Title (Z-A)</option>
            <option value="updatedAt_desc">Recently Updated</option>
            <option value="updatedAt_asc">Least Recently Updated</option>
          </select>
        </div>

        {/* Filter actions */}
        <div className="flex items-end gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={onApplyFilters}
            className="bg-yellow-500 hover:bg-yellow-400 text-black font-medium"
          >
            Apply Filters
          </Button>
          <Button variant="secondary" size="sm" onClick={onClearFilters}>
            Clear
          </Button>
        </div>
      </div>
    </div>
  );
};
