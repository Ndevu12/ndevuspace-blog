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

/** Per-variant presentation of a category item and its active indicator. */
const VARIANT_STYLES: Record<
  CategoryTabsVariant,
  { button: string; inactive: string; indicator: string }
> = {
  horizontal: {
    button:
      "flex-shrink-0 whitespace-nowrap rounded-full border px-4 py-2 justify-center",
    inactive:
      "border-border bg-card/60 text-foreground hover:border-primary/50 hover:text-primary",
    indicator: "rounded-full bg-primary shadow-[0_0_16px] shadow-primary/40",
  },
  sidebar: {
    button: "w-full rounded-lg border px-3 py-2.5 text-left",
    inactive:
      "border-transparent text-foreground hover:border-primary/30 hover:bg-primary/5 hover:text-primary",
    indicator: "rounded-lg bg-primary shadow-sm",
  },
};

interface CategoryTabButtonProps {
  category: BlogCategory;
  variant: CategoryTabsVariant;
  isActive: boolean;
  isSearchActive: boolean;
  /** Shared layout id for the gliding active fill; undefined disables it. */
  indicatorLayoutId: string | undefined;
  onClick: () => void;
}

function CategoryTabButton({
  category,
  variant,
  isActive,
  isSearchActive,
  indicatorLayoutId,
  onClick,
}: CategoryTabButtonProps) {
  const styles = VARIANT_STYLES[variant];

  return (
    <button
      type="button"
      data-category={category.id}
      onClick={onClick}
      className={cn(
        "pressable relative flex items-center gap-2 text-sm font-medium transition-all duration-200",
        styles.button,
        isActive
          ? "border-transparent text-primary-foreground"
          : isSearchActive
            ? "border-border bg-muted/50 text-muted-foreground opacity-60"
            : styles.inactive
      )}
    >
      {isActive && (
        <motion.span
          aria-hidden
          layoutId={indicatorLayoutId}
          transition={SPRING_SNAPPY}
          className={cn("absolute inset-0", styles.indicator)}
        />
      )}
      <span className="relative z-10 flex items-center gap-2">
        {category.id === "all" && (
          <LayoutGrid className="h-4 w-4 shrink-0" aria-hidden />
        )}
        <span>{category.name}</span>
      </span>
    </button>
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

  const renderButton = (category: BlogCategory) => (
    <CategoryTabButton
      key={category.id}
      category={category}
      variant={variant}
      isActive={activeCategory === category.id && !isSearchActive}
      isSearchActive={isSearchActive}
      indicatorLayoutId={indicatorLayoutId}
      onClick={() => onCategoryChange(category.id)}
    />
  );

  if (variant === "sidebar") {
    return (
      <nav aria-label="Blog categories" className="flex flex-col gap-1">
        {allCategories.map(renderButton)}
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
            {allCategories.map(renderButton)}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  );
}
