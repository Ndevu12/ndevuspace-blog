"use client";

import { useMemo, useRef, useEffect } from "react";
import { BlogCategory } from "@/types/blog";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";

export type CategoryTabsVariant = "horizontal" | "sidebar";

interface CategoryTabsProps {
  categories: BlogCategory[];
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
  isSearchActive?: boolean;
  /** Sticky horizontal strip (listing) vs stacked sidebar list. */
  variant?: CategoryTabsVariant;
}

export function CategoryTabs({
  categories,
  activeCategory,
  onCategoryChange,
  isSearchActive = false,
  variant = "horizontal",
}: CategoryTabsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(false);

  // All categories including "All Topics"
  const allCategories = useMemo(
    () => [
      { id: "all", name: "All Topics", icon: "grid" } as BlogCategory,
      ...categories.filter((category) => category.id !== "all"),
    ],
    [categories]
  );

  // Track mount without causing re-render
  useEffect(() => {
    mountedRef.current = true;
  }, []);

  // Auto-scroll to active category (horizontal strip only)
  useEffect(() => {
    if (variant !== "horizontal") return;
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
  }, [activeCategory, variant]);

  if (variant === "sidebar") {
    return (
      <nav aria-label="Blog categories" className="flex flex-col gap-1">
        {allCategories.map((category) => {
          const categoryId = category.id;
          const isActive =
            activeCategory === categoryId && !isSearchActive;

          return (
            <button
              key={categoryId}
              type="button"
              onClick={() => onCategoryChange(categoryId)}
              className={cn(
                "flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : isSearchActive
                    ? "border border-border bg-muted/50 text-muted-foreground opacity-70"
                    : "border border-transparent text-foreground hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
              )}
            >
              {categoryId === "all" && (
                <LayoutGrid className="h-4 w-4 shrink-0" aria-hidden />
              )}
              <span>{category.name}</span>
            </button>
          );
        })}
      </nav>
    );
  }

  return (
    <div className="bg-muted/50 py-4 border-y border-border/50">
      <div className="max-w-6xl mx-auto px-4">
        <ScrollArea className="w-full">
          <div
            ref={scrollRef}
            className="flex gap-2 md:gap-4 justify-start md:justify-center min-w-max pb-2"
          >
            {allCategories.map((category) => {
              const categoryId = category.id;
              const isActive =
                activeCategory === categoryId && !isSearchActive;

              return (
                <button
                  key={categoryId}
                  data-category={categoryId}
                  onClick={() => onCategoryChange(categoryId)}
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
                  {categoryId === "all" && (
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
