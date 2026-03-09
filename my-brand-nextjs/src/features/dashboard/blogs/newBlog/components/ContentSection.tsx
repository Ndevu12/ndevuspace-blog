"use client";

import React from "react";
import { BlogFormData } from "../types";
import Typography from "@/components/atoms/Typography/Typography";
import { RichTextEditor } from "./RichTextEditor";
import { CustomRichTextEditor } from "./CustomRichTextEditor";

interface ContentSectionProps {
  data: BlogFormData;
  errors: Partial<Record<keyof BlogFormData, string>>;
  onChange: (field: keyof BlogFormData, value: any) => void;
  isEditMode?: boolean; // New prop for edit mode detection
}

export const ContentSection: React.FC<ContentSectionProps> = ({
  data,
  errors,
  onChange,
  isEditMode = false,
}) => {
  return (
    <div className="bg-secondary rounded-xl shadow-lg p-6 border border-gray-700">
      <Typography
        variant="h3"
        className="text-lg font-bold mb-4 flex items-center"
      >
        <span className="inline-block w-2 h-8 bg-yellow-500 rounded-sm mr-2"></span>
        Article Content
      </Typography>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Main Content <span className="text-red-400">*</span>
        </label>

        {/* Conditional Editor Rendering */}
        {isEditMode ? (
          <CustomRichTextEditor
            content={data.content}
            onContentChange={(content) => onChange("content", content)}
            placeholder="Start writing your content here..."
          />
        ) : (
          <RichTextEditor
            content={data.content}
            onContentChange={(content) => onChange("content", content)}
            placeholder="Start writing your content here..."
          />
        )}

        {errors.content && (
          <p className="text-sm text-red-500 mt-2">{errors.content}</p>
        )}

        <p className="text-xs text-gray-400 mt-1">
          {isEditMode
            ? "Use the rich toolbar above to format your content. All existing formatting will be preserved."
            : "Use the toolbar to format text, add images, and embed media"}
        </p>
      </div>
    </div>
  );
};
