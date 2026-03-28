"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { BlogCategory } from "@/types/blog";
import { CategoryTabs } from "./CategoryTabs";

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
            <h3 className="font-bold flex items-center">
              <span className="inline-block w-1 h-8 bg-primary rounded-sm mr-2" />
              Categories
            </h3>
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
          <h3 className="font-bold flex items-center">
            <span className="inline-block w-1 h-8 bg-primary rounded-sm mr-2" />
            Topic Cloud
          </h3>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, idx) => {
              const isActive = activeTag === tag;
              return (
                <button
                  key={`${tag}-${idx}`}
                  onClick={() => onTagClick?.(tag)}
                >
                  <Badge
                    variant={isActive ? "default" : "secondary"}
                    className={`cursor-pointer transition-colors ${
                      !isActive &&
                      "hover:bg-primary/10 hover:text-primary"
                    }`}
                  >
                    {tag}
                  </Badge>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
