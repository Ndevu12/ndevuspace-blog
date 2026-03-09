"use client";

import React from "react";
import { BlogFormData } from "../types";
import Input from "@/components/atoms/Input/Input";
import Typography from "@/components/atoms/Typography/Typography";
import { ImageUploader } from "./ImageUploader";

interface BasicInfoSectionProps {
  data: BlogFormData;
  errors: Partial<Record<keyof BlogFormData, string>>;
  onChange: (field: keyof BlogFormData, value: any) => void;
}

export const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
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
        Basic Information
      </Typography>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column - Text inputs */}
        <div className="space-y-6">
          {/* Title */}
          <Input
            label="Article Title *"
            value={data.title}
            onChange={(e) => onChange("title", e.target.value)}
            placeholder="Enter a compelling title for your article"
            error={errors.title}
            helperText="Try to keep it under 70 characters for optimal SEO"
          />

          {/* Subtitle */}
          <Input
            label="Subtitle"
            value={data.subtitle || ""}
            onChange={(e) => onChange("subtitle", e.target.value)}
            placeholder="A brief subtitle or tagline (optional)"
          />

          {/* Short description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Short Description <span className="text-red-400">*</span>
            </label>
            <textarea
              value={data.description}
              onChange={(e) => onChange("description", e.target.value)}
              rows={3}
              placeholder="A brief summary of your article that will appear in cards and search results"
              className="w-full bg-primary/50 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-500">{errors.description}</p>
            )}
            <p className="text-xs text-gray-400 mt-1">
              150-160 characters recommended for best display in search results
            </p>
          </div>

          {/* Reading time and Author */}
          <div className="flex gap-6">
            <div className="w-1/2">
              <Input
                label="Reading Time (minutes)"
                type="number"
                min="1"
                value={data.readingTime || ""}
                onChange={(e) => onChange("readingTime", e.target.value)}
                placeholder="5"
              />
            </div>
            <div className="w-1/2">
              <Input
                label="Author"
                value={data.author}
                onChange={(e) => onChange("author", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Right column - Featured image */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Featured Image <span className="text-red-400">*</span>
          </label>

          <ImageUploader
            featuredImage={data.featuredImage}
            imageUrl={data.imageUrl}
            onImageSelect={(file: File | null) =>
              onChange("featuredImage", file)
            }
            onImageUrlChange={(url: string) => onChange("imageUrl", url)}
          />

          {errors.featuredImage && (
            <p className="text-sm text-red-500">{errors.featuredImage}</p>
          )}

          {/* Image caption */}
          <Input
            label="Image Caption"
            value={data.imageCaption || ""}
            onChange={(e) => onChange("imageCaption", e.target.value)}
            placeholder="Describe the featured image"
          />
        </div>
      </div>
    </div>
  );
};
