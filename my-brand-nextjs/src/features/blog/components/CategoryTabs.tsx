"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { BlogCategory } from "@/types/blog";

interface CategoryTabsProps {
  categories: BlogCategory[];
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
  isSearchActive?: boolean; // Add search state prop
}

export function CategoryTabs({
  categories,
  activeCategory,
  onCategoryChange,
  isSearchActive = false,
}: CategoryTabsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isCalculated, setIsCalculated] = useState(false);

  // All categories including "All Topics"
  const allCategories = useMemo(
    () => [
      { _id: "all", name: "All Topics", icon: "grid" } as BlogCategory,
      ...categories.filter((category) => category._id !== "all"),
    ],
    [categories]
  );

  // Calculate category button sizes and adjust visibility
  useEffect(() => {
    const calculateButtonSizes = () => {
      if (!containerRef.current || !scrollContainerRef.current) return;

      const container = containerRef.current;
      const scrollContainer = scrollContainerRef.current;
      const containerWidth = container.offsetWidth;
      const padding = 32; // Container padding (16px each side)
      const availableWidth = containerWidth - padding;

      // Create temporary buttons to measure actual widths
      const tempContainer = document.createElement("div");
      tempContainer.className =
        "flex gap-2 md:gap-4 invisible absolute -top-full";
      tempContainer.style.fontSize =
        window.getComputedStyle(container).fontSize;
      tempContainer.style.fontFamily =
        window.getComputedStyle(container).fontFamily;

      document.body.appendChild(tempContainer);

      const buttonWidths: number[] = [];

      allCategories.forEach((category) => {
        const tempButton = document.createElement("button");
        tempButton.className =
          "px-4 py-2 rounded-full font-medium whitespace-nowrap flex-shrink-0";
        tempButton.innerHTML = `${
          category._id !== "all"
            ? `<i class="fas fa-${category.icon} mr-2"></i>`
            : ""
        }${category.name}`;
        tempContainer.appendChild(tempButton);
        buttonWidths.push(tempButton.offsetWidth);
      });
      document.body.removeChild(tempContainer);

      // Apply responsive sizing to scroll container
      const gap = window.innerWidth >= 768 ? 16 : 8; // md:gap-4 vs gap-2
      let totalWidth = 0;
      let visibleButtons = 0;

      for (let i = 0; i < buttonWidths.length; i++) {
        const buttonWithGap = buttonWidths[i] + (i > 0 ? gap : 0);
        if (totalWidth + buttonWithGap <= availableWidth) {
          totalWidth += buttonWithGap;
          visibleButtons++;
        } else {
          break;
        }
      }

      // If not all buttons fit, enable horizontal scrolling
      if (visibleButtons < allCategories.length) {
        scrollContainer.style.width = `${Math.max(
          availableWidth,
          totalWidth
        )}px`;
      } else {
        scrollContainer.style.width = "auto";
      }

      setIsCalculated(true);
    };

    // Calculate on mount and resize
    const timer = setTimeout(calculateButtonSizes, 100); // Small delay to ensure DOM is ready
    window.addEventListener("resize", calculateButtonSizes);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", calculateButtonSizes);
    };
  }, [allCategories]);

  // Auto-scroll to show active category
  useEffect(() => {
    if (!scrollContainerRef.current || !isCalculated) return;

    const activeButton = scrollContainerRef.current.querySelector(
      `[data-category="${activeCategory}"]`
    ) as HTMLElement;
    if (activeButton) {
      const container = scrollContainerRef.current.parentElement;
      if (container) {
        const containerRect = container.getBoundingClientRect();
        const buttonRect = activeButton.getBoundingClientRect();

        // Check if button is fully visible
        if (
          buttonRect.left < containerRect.left ||
          buttonRect.right > containerRect.right
        ) {
          // Scroll to center the active button
          const scrollLeft =
            activeButton.offsetLeft -
            container.offsetWidth / 2 +
            activeButton.offsetWidth / 2;
          container.scrollTo({ left: scrollLeft, behavior: "smooth" });
        }
      }
    }
  }, [activeCategory, isCalculated]);

  return (
    <div className="bg-gray-100/50 dark:bg-secondary/50 py-4 border-y border-gray-200/50 dark:border-gray-800/50">
      <div className="max-w-6xl mx-auto px-4" ref={containerRef}>
        <div className="overflow-x-auto scrollbar-hide">
          <div
            ref={scrollContainerRef}
            className={`flex gap-2 md:gap-4 justify-start md:justify-center min-w-max transition-opacity duration-300 ${
              isCalculated ? "opacity-100" : "opacity-0"
            }`}
          >
            {allCategories.map((category) => (
              <button
                key={category._id}
                data-category={category._id}
                onClick={() => onCategoryChange(category._id)}
                className={`px-4 py-2 rounded-full font-medium transition-all duration-300 whitespace-nowrap flex-shrink-0 ${
                  activeCategory === category._id && !isSearchActive
                    ? "bg-yellow-500 text-black shadow-lg"
                    : isSearchActive
                    ? "bg-gray-200 dark:bg-gray-700 border border-gray-400 dark:border-gray-600 text-gray-500 dark:text-gray-400 opacity-60"
                    : "bg-white/70 dark:bg-secondary border border-gray-300 dark:border-gray-700 hover:border-yellow-400 dark:hover:border-yellow-400 text-gray-700 dark:text-white hover:shadow-md"
                }`}
              >
                {category._id !== "all" && (
                  <i className={`fas fa-${category.icon} mr-2`}></i>
                )}
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
