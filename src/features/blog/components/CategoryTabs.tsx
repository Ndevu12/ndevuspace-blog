"use client";

import { useMemo, useRef, useEffect, useId } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { BlogCategory } from "@/types/blog";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { LayoutGrid } from "lucide-react";
import { SPRING_SNAPPY } from "@/lib/motion";
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

/**
 * Active-state fill that glides between items via shared layout animation.
 * Scoped by instance so multiple tab sets on one page never cross-animate.
 */
function ActiveIndicator({
  layoutId,
  className,
}: {
  layoutId: string | undefined;
  className: string;
}) {
  return (
    <motion.span
      aria-hidden
      layoutId={layoutId}
      transition={SPRING_SNAPPY}
      className={className}
    />
  );
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
  const prefersReducedMotion = useReducedMotion();
  const instanceId = useId();
  const indicatorLayoutId = prefersReducedMotion
    ? undefined
    : `${instanceId}-active-category`;

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
                "relative flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-all duration-200 motion-safe:active:scale-[0.98]",
                isActive
                  ? "text-primary-foreground"
                  : isSearchActive
                    ? "border border-border bg-muted/50 text-muted-foreground opacity-70"
                    : "border border-transparent text-foreground hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
              )}
            >
              {isActive && (
                <ActiveIndicator
                  layoutId={indicatorLayoutId}
                  className="absolute inset-0 rounded-lg bg-primary shadow-sm"
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                {categoryId === "all" && (
                  <LayoutGrid className="h-4 w-4 shrink-0" aria-hidden />
                )}
                <span>{category.name}</span>
              </span>
            </button>
          );
        })}
      </nav>
    );
  }

  return (
    <div className="glass border-y border-border/60 py-3">
      <div className="max-w-6xl mx-auto px-4">
        <ScrollArea className="w-full">
          <div
            ref={scrollRef}
            className="flex gap-2 md:gap-3 justify-start md:justify-center min-w-max pb-2"
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
                  className={cn(
                    "relative flex flex-shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 motion-safe:active:scale-[0.97]",
                    isActive
                      ? "border-transparent text-primary-foreground"
                      : isSearchActive
                        ? "border-border bg-muted text-muted-foreground opacity-60"
                        : "border-border bg-card/60 text-foreground hover:border-primary/50 hover:text-primary"
                  )}
                >
                  {isActive && (
                    <ActiveIndicator
                      layoutId={indicatorLayoutId}
                      className="absolute inset-0 rounded-full bg-primary shadow-[0_0_16px] shadow-primary/40"
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    {categoryId === "all" && (
                      <LayoutGrid className="h-4 w-4" aria-hidden />
                    )}
                    {category.name}
                  </span>
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
