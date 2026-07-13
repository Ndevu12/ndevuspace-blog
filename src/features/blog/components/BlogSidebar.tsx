"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { BlogCategory } from "@/types/blog";
import { CategoryTabs } from "./CategoryTabs";
import { TopicCloud } from "./TopicCloud";

export interface BlogSidebarProps {
  tags: string[];
  onTagClick?: (tag: string) => void;
  activeTag?: string | null;
  categories?: BlogCategory[];
  activeCategory?: string;
  onCategoryChange?: (categoryId: string) => void;
  isSearchActive?: boolean;
  /** Listing page: horizontal CategoryTabs show below `lg`; hide sidebar categories to avoid duplicate nav. */
  hideCategoryNavUntilLg?: boolean;
}

export function BlogSidebar({
  tags,
  onTagClick,
  activeTag,
  categories,
  activeCategory,
  onCategoryChange,
  isSearchActive = false,
  hideCategoryNavUntilLg = false,
}: BlogSidebarProps) {
  const showCategories =
    categories !== undefined &&
    activeCategory !== undefined &&
    onCategoryChange !== undefined;

  return (
    <div className="space-y-8">
      {showCategories && (
        <div
          className={hideCategoryNavUntilLg ? "hidden lg:block" : undefined}
        >
        <Card>
          <CardHeader>
            <h3 className="text-eyebrow">Categories</h3>
          </CardHeader>
          <CardContent>
            <CategoryTabs
              variant="sidebar"
              categories={categories}
              activeCategory={activeCategory}
              onCategoryChange={onCategoryChange}
              isSearchActive={isSearchActive}
            />
          </CardContent>
        </Card>
        </div>
      )}

      {/* Topic Cloud */}
      <Card>
        <CardHeader>
          <h3 className="text-eyebrow">Topic Cloud</h3>
        </CardHeader>
        <CardContent>
          <TopicCloud
            tags={tags}
            activeTag={activeTag}
            onTagClick={onTagClick}
          />
        </CardContent>
      </Card>
    </div>
  );
}
