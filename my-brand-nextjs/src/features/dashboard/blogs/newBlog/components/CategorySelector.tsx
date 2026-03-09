"use client";

import React, { useState, useEffect } from "react";
import { CategorySelectorProps } from "../types";
import { BlogCategory } from "@/types/blog";
import { getAllBlogCategories } from "@/services/blogService";
import { Loading } from "@/components/atoms/Loading";

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectedCategoryId,
  onCategoryChange,
}) => {
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch categories from server on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const serverCategories = await getAllBlogCategories();
        setCategories(serverCategories);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load categories"
        );
        console.error("Error fetching categories:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategorySelect = (categoryId: string) => {
    onCategoryChange(categoryId);
  };

  // Show loading state
  if (isLoading) {
    return <Loading text="Loading categories..." size="lg" />;
  }

  // Show error state
  if (error) {
    return (
      <div className="text-center text-red-400 py-8">
        <i className="fas fa-exclamation-triangle text-2xl mb-2"></i>
        <p className="text-sm">Failed to load categories</p>
        <p className="text-xs text-gray-500 mt-1">{error}</p>
      </div>
    );
  }

  // Show empty state if no categories
  if (categories.length === 0) {
    return (
      <div className="text-center text-gray-400 py-8">
        <i className="fas fa-folder-open text-2xl mb-2"></i>
        <p className="text-sm">No categories available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {categories.map((category) => {
        const isSelected = category._id === selectedCategoryId;

        return (
          <label
            key={category._id}
            className={`flex items-center space-x-2 bg-primary/50 p-3 rounded-lg border cursor-pointer hover:border-yellow-400/50 transition-colors ${
              isSelected ? "border-yellow-400" : "border-gray-700"
            }`}
          >
            <input
              type="radio"
              name="category"
              value={category._id}
              checked={isSelected}
              onChange={() => handleCategorySelect(category._id)}
              className="text-yellow-500 focus:ring-yellow-500"
            />
            <span className="flex items-center">
              <i className={`fas ${category.icon} mr-2 text-accent`}></i>
              <span className="text-white">{category.name}</span>
            </span>
          </label>
        );
      })}
    </div>
  );
};
