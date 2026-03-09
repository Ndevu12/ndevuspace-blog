"use client";

import React from "react";
import { BlogFormData } from "../types";
import Typography from "@/components/atoms/Typography/Typography";
import { CategorySelector } from "./CategorySelector";
import { TagManager } from "./TagManager";

interface CategorySectionProps {
  data: BlogFormData;
  errors: Partial<Record<keyof BlogFormData, string>>;
  onChange: (field: keyof BlogFormData, value: any) => void;
}

export const CategorySection: React.FC<CategorySectionProps> = ({
  data,
  errors,
  onChange,
}) => {
  return (
    <div className="bg-secondary rounded-xl shadow-lg p-6 border border-gray-700">
      <Typography
        variant="h3"
        className="text-lg font-bold mb-4 flex items-center"
      >
        <span className="inline-block w-2 h-8 bg-yellow-500 rounded-sm mr-2"></span>
        Categorization
      </Typography>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Categories */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Category <span className="text-red-400">*</span>
          </label>

          <CategorySelector
            selectedCategoryId={data.categoryId}
            onCategoryChange={(categoryId: string) =>
              onChange("categoryId", categoryId)
            }
          />

          {errors.categoryId && (
            <p className="text-sm text-red-500 mt-2">{errors.categoryId}</p>
          )}
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Tags <span className="text-red-400">*</span>
          </label>

          <TagManager
            tags={data.tags}
            onTagsChange={(tags: string[]) => onChange("tags", tags)}
            placeholder="Type a tag and press Enter or comma to add"
          />

          {errors.tags && (
            <p className="text-sm text-red-500 mt-2">{errors.tags}</p>
          )}
        </div>
      </div>
    </div>
  );
};
