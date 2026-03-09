"use client";

import { useMemo, useRef, useEffect } from "react";
import { BlogCategory } from "@/types/blog";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { LayoutGrid } from "lucide-react";

interface CategoryTabsProps {
  categories: BlogCategory[];
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
  isSearchActive?: boolean;
}

export function CategoryTabs({
  categories,
  activeCategory,
  onCategoryChange,
  isSearchActive = false,
}: CategoryTabsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(false);

  // All categories including "All Topics"
  const allCategories = useMemo(
    () => [
      { _id: "all", name: "All Topics", icon: "grid" } as BlogCategory,
      ...categories.filter((category) => category._id !== "all"),
    ],
    [categories]
  );

  // Track mount without causing re-render
  useEffect(() => {
    mountedRef.current = true;
  }, []);

  // Auto-scroll to active category
  useEffect(() => {
    if (!scrollRef.current || !mountedRef.current) return;

    const activeButton = scrollRef.current.querySelector(
      `[data-category="${activeCategory}"]`
    ) as HTMLElement;

    if (activeButton) {
      const container = scrollRef.current;
      const containerRect = container.getBoundingClientRect();
      const buttonRect = activeButton.getBoundingClientRect();

      if (
        buttonRect.left < containerRect.left ||
        buttonRect.right > containerRect.right
      ) {
        const scrollLeft =
          activeButton.offsetLeft -
          container.offsetWidth / 2 +
          activeButton.offsetWidth / 2;
        container.scrollTo({ left: scrollLeft, behavior: "smooth" });
      }
    }
  }, [activeCategory]);

  return (
    <div className="bg-muted/50 py-4 border-y border-border/50">
      <div className="max-w-6xl mx-auto px-4">
        <ScrollArea className="w-full">
          <div
            ref={scrollRef}
            className="flex gap-2 md:gap-4 justify-start md:justify-center min-w-max pb-2"
          >
            {allCategories.map((category) => {
              const isActive =
                activeCategory === category._id && !isSearchActive;

              return (
                <button
                  key={category._id}
                  data-category={category._id}
                  onClick={() => onCategoryChange(category._id)}
                  className={`
                    px-4 py-2 rounded-full font-medium transition-all duration-300 whitespace-nowrap flex-shrink-0 flex items-center gap-2
                    ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-lg"
                        : isSearchActive
                        ? "bg-muted border border-border text-muted-foreground opacity-60"
                        : "bg-card border border-border hover:border-primary text-foreground hover:shadow-md"
                    }
                  `}
                >
                  {category._id === "all" && (
                    <LayoutGrid className="h-4 w-4" />
                  )}
                  {category.name}
                </button>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  );
}
