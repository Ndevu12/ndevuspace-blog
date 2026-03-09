"use client";

import React, { useState } from "react";
import { TagManagerProps } from "../types";
import Input from "@/components/atoms/Input/Input";

export const TagManager: React.FC<TagManagerProps> = ({
  tags,
  onTagsChange,
  placeholder = "Type a tag and press Enter or comma to add",
}) => {
  const [inputValue, setInputValue] = useState("");

  const addTag = (tagName: string) => {
    const trimmedTag = tagName.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      onTagsChange([...tags, trimmedTag]);
    }
  };

  const removeTag = (tagToRemove: string) => {
    onTagsChange(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (inputValue.trim()) {
        addTag(inputValue);
        setInputValue("");
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  return (
    <div>
      <Input
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
      />

      {/* Tags container */}
      <div className="flex flex-wrap gap-2 mt-3">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="bg-primary/70 text-gray-300 px-2 py-1 text-sm rounded-full flex items-center"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="ml-1 text-gray-400 hover:text-red-400 focus:outline-none"
              title={`Remove ${tag} tag`}
            >
              <i className="fas fa-times"></i>
            </button>
          </span>
        ))}
      </div>
    </div>
  );
};
