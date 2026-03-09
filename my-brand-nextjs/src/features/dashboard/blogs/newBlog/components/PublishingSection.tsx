"use client";

import React from "react";
import { BlogFormData } from "../types";
import Input from "@/components/atoms/Input/Input";
import Typography from "@/components/atoms/Typography/Typography";

interface PublishingSectionProps {
  data: BlogFormData;
  errors: Partial<Record<keyof BlogFormData, string>>;
  onChange: (field: keyof BlogFormData, value: any) => void;
}

export const PublishingSection: React.FC<PublishingSectionProps> = ({
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
        Publishing Options
      </Typography>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Status
          </label>
          <div className="flex items-center space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="status"
                value="published"
                checked={data.status === "published"}
                onChange={(e) =>
                  onChange("status", e.target.value as "published" | "draft")
                }
                className="text-yellow-500 focus:ring-yellow-500 bg-primary border-gray-600 focus:bg-yellow-500"
              />
              <span className="ml-2 text-white">Published</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="status"
                value="draft"
                checked={data.status === "draft"}
                onChange={(e) =>
                  onChange("status", e.target.value as "published" | "draft")
                }
                className="text-yellow-500 focus:ring-yellow-500 bg-primary border-gray-600 focus:bg-yellow-500"
              />
              <span className="ml-2 text-white">Draft</span>
            </label>
          </div>
        </div>

        {/* Publication Date */}
        <div>
          <Input
            label="Publication Date"
            type="datetime-local"
            value={data.publishDate || ""}
            onChange={(e) => onChange("publishDate", e.target.value)}
            helperText="Leave blank to publish immediately"
          />
        </div>
      </div>
    </div>
  );
};
