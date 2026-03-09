"use client";

import React from "react";
import { BlogFormData } from "../types";
import Input from "@/components/atoms/Input/Input";
import Typography from "@/components/atoms/Typography/Typography";

interface SEOSectionProps {
  data: BlogFormData;
  errors: Partial<Record<keyof BlogFormData, string>>;
  onChange: (field: keyof BlogFormData, value: any) => void;
}

export const SEOSection: React.FC<SEOSectionProps> = ({
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
        SEO Settings
      </Typography>

      <div className="space-y-6">
        {/* Meta Title */}
        <Input
          label="Meta Title"
          value={data.metaTitle || ""}
          onChange={(e) => onChange("metaTitle", e.target.value)}
          placeholder="SEO-optimized title (defaults to article title if left blank)"
          helperText="50-60 characters recommended"
        />

        {/* Meta Description */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Meta Description
          </label>
          <textarea
            value={data.metaDescription || ""}
            onChange={(e) => onChange("metaDescription", e.target.value)}
            rows={2}
            placeholder="SEO-optimized description (defaults to article description if left blank)"
            className="w-full bg-primary/50 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
          <p className="text-xs text-gray-400 mt-1">
            150-160 characters recommended
          </p>
        </div>
      </div>
    </div>
  );
};
