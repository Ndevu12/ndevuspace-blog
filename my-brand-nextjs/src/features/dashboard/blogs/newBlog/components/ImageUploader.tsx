"use client";

import React, { useState, useRef } from "react";
import { ImageUploaderProps } from "../types";
import Input from "@/components/atoms/Input/Input";

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageSelect,
  onImageUrlChange,
  imageUrl,
  featuredImage,
  className = "",
}) => {
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (featuredImage) {
      const url = URL.createObjectURL(featuredImage);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else if (imageUrl) {
      setPreviewUrl(imageUrl);
    } else {
      setPreviewUrl("");
    }
  }, [featuredImage, imageUrl]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageSelect(file);
      // Clear image URL when file is selected
      onImageUrlChange("");
    }
  };

  const handleImageUrlChange = (url: string) => {
    onImageUrlChange(url);
    // Clear file when URL is entered
    if (url && fileInputRef.current) {
      fileInputRef.current.value = "";
      onImageSelect(null);
    }
  };

  const removeImage = () => {
    onImageSelect(null);
    onImageUrlChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const hasImage = previewUrl !== "";

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Image preview area */}
      <div className="border-2 border-dashed border-gray-700 rounded-lg p-4 h-64 flex flex-col items-center justify-center relative bg-primary/30">
        {hasImage ? (
          <>
            {/* Image preview */}
            <img
              src={previewUrl}
              alt="Preview"
              className="h-full w-full object-cover rounded-lg absolute inset-0"
            />

            {/* Remove button */}
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-2 right-2 bg-black/60 text-white p-2 rounded-full hover:bg-red-500/80 transition-colors"
              title="Remove image"
            >
              <i className="fas fa-times"></i>
            </button>
          </>
        ) : (
          <>
            {/* Upload UI */}
            <div className="flex flex-col items-center justify-center text-center">
              <i className="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-3"></i>
              <p className="text-gray-300 mb-2">
                Drag and drop an image here, or
              </p>
              <label className="cursor-pointer bg-yellow-500 text-black font-medium py-2 px-4 rounded-md hover:bg-yellow-600 transition-colors">
                Browse Files
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-gray-400 mt-2">
                Recommended size: 1200×800 pixels or 3:2 ratio
              </p>
            </div>
          </>
        )}
      </div>

      {/* Image URL input */}
      <Input
        label="Or Enter Image URL"
        type="url"
        value={imageUrl || ""}
        onChange={(e) => handleImageUrlChange(e.target.value)}
        placeholder="https://example.com/image.jpg"
      />
    </div>
  );
};
