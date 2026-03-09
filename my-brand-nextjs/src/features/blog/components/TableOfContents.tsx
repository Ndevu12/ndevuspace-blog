"use client";

import { useEffect, useState } from "react";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  className?: string;
}

export function TableOfContents({ className = "" }: TableOfContentsProps) {
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [isCollapsed, setIsCollapsed] = useState(true);

  useEffect(() => {
    // Generate table of contents from headings in the article
    const generateTOC = () => {
      // Try multiple selectors to find the article content
      const articleContent =
        document.querySelector(".prose") ||
        document.querySelector("article") ||
        document.querySelector("main");


      if (!articleContent) {
        console.log("No article content found"); // Debug log
        return;
      }

      const headings = articleContent.querySelectorAll("h2, h3");

      const items: TocItem[] = [];

      headings.forEach((heading, index) => {
        // Ensure each heading has an ID
        if (!heading.id) {
          heading.id =
            heading.textContent?.toLowerCase().replace(/[^\w]+/g, "-") ||
            `heading-${index}`;
        }

        items.push({
          id: heading.id,
          text: heading.textContent || "",
          level: parseInt(heading.tagName.charAt(1)),
        });
      });

      setTocItems(items);
    };

    // Set up intersection observer for active section highlighting
    const setupObserver = () => {
      const headings = document.querySelectorAll(
        ".prose h2, .prose h3, article h2, article h3, main h2, main h3"
      );

      const observerOptions = {
        rootMargin: "-100px 0px -70% 0px",
        threshold: 0,
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      }, observerOptions);

      headings.forEach((heading) => {
        observer.observe(heading);
      });

      return () => {
        headings.forEach((heading) => {
          observer.unobserve(heading);
        });
      };
    };

    // Generate TOC when component mounts
    const timer = setTimeout(() => {
      generateTOC();
      setupObserver();
    }, 500); // Increased delay to ensure content is rendered

    // Also try to regenerate TOC after a longer delay in case content loads slowly
    const fallbackTimer = setTimeout(() => {
      if (tocItems.length === 0) {
        generateTOC();
      }
    }, 2000);

    return () => {
      clearTimeout(timer);
      clearTimeout(fallbackTimer);
    };
  }, []);

  const handleTocClick = (id: string) => {
    const target = document.getElementById(id);
    if (target) {
      window.scrollTo({
        top: target.offsetTop - 100,
        behavior: "smooth",
      });

      // On mobile, collapse TOC after clicking a link
      if (window.innerWidth < 1024) {
        setIsCollapsed(true);
      }
    }
  };

  // Don't render if no headings found
  if (tocItems.length === 0) {
    return (
      <div
        className={`bg-white dark:bg-secondary rounded-xl p-6 sticky top-24 ${className}`}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-900 dark:text-white flex items-center">
            <span className="inline-block w-3 h-10 bg-yellow-500 rounded-sm mr-2"></span>
            Table of Contents
          </h3>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Loading table of contents...
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white dark:bg-secondary rounded-xl p-6 sticky top-24 ${className}`}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-gray-900 dark:text-white flex items-center">
          <span className="inline-block w-3 h-10 bg-yellow-500 rounded-sm mr-2"></span>
          Table of Contents
        </h3>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-gray-400 hover:text-yellow-400 transition-colors lg:hidden"
          aria-label="Toggle table of contents"
        >
          {isCollapsed ? (
            <i className="fas fa-chevron-down text-lg"></i>
          ) : (
            <i className="fas fa-chevron-up text-lg"></i>
          )}
        </button>
      </div>

      <nav
        className={`space-y-2 text-sm ${
          isCollapsed ? "hidden lg:block" : "block"
        }`}
      >
        {tocItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleTocClick(item.id)}
            className={`
              block w-full text-left py-2 border-l-2 transition-all duration-200
              ${item.level === 2 ? "pl-4" : "pl-6 text-xs"}
              ${
                activeId === item.id
                  ? "text-yellow-500 dark:text-yellow-400 border-yellow-500 dark:border-yellow-400 bg-yellow-50 dark:bg-yellow-500/10"
                  : "text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:text-yellow-500 dark:hover:text-yellow-400 hover:border-yellow-500 dark:hover:border-yellow-400"
              }
            `}
          >
            {item.text}
          </button>
        ))}
      </nav>
    </div>
  );
}
