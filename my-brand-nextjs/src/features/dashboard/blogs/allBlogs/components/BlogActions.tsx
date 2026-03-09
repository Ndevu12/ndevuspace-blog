"use client";

import React from "react";
import { BlogActionsProps } from "../types";
import Input from "@/components/atoms/Input/Input";
import Button from "@/components/atoms/Button/Button";
import Link from "next/link";

export const BlogActions: React.FC<BlogActionsProps> = ({
  searchValue,
  onSearchChange,
  onToggleFilters,
  onNewBlog,
  filtersVisible,
}) => {
  return (
    <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h2 className="text-2xl font-bold">Blog Management</h2>
        <p className="text-gray-400">
          View, edit, and manage all your blog posts
        </p>
      </div>
      <div className="mt-4 md:mt-0 flex gap-4">
        {/* Search input */}
        <div className="relative w-64">
          <Input
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search blogs..."
            className="pl-10"
          />
          <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
        </div>

        {/* Filter button */}
        <Button
          variant="secondary"
          size="sm"
          onClick={onToggleFilters}
          icon={
            <i className={`fas ${filtersVisible ? "fa-times" : "fa-filter"}`} />
          }
          iconPosition="left"
        >
          Filter
        </Button>

        {/* New Blog button */}
        <Link href="/dashboard/blogs/newBlog">
          <Button
            variant="primary"
            size="sm"
            icon={<i className="fas fa-plus" />}
            iconPosition="left"
            className="bg-yellow-500 hover:bg-yellow-400 text-black font-medium"
          >
            New Blog
          </Button>
        </Link>
      </div>
    </div>
  );
};
