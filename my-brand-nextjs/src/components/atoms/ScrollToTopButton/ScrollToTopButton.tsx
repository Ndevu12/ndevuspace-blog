"use client";

import { useEffect, useState } from "react";

/**
 * ScrollToTopButton Component
 *
 * A floating action button that appears when user scrolls down
 * and smoothly scrolls back to top when clicked.
 * Matches the original portfolio design and behavior.
 */
export default function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);
  const [isLightTheme, setIsLightTheme] = useState(false);

  useEffect(() => {
    // Check theme on mount and listen for changes
    const checkTheme = () => {
      setIsLightTheme(document.body.classList.contains("light-theme"));
    };

    checkTheme();

    // Listen for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });

    const toggleVisibility = () => {
      // Show button when user scrolls down 300px (same as original)
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    // Add scroll event listener
    window.addEventListener("scroll", toggleVisibility);

    // Clean up event listeners on component unmount
    return () => {
      window.removeEventListener("scroll", toggleVisibility);
      observer.disconnect();
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`
        fixed bottom-8 right-8 z-40
        w-12 h-12 rounded-full
        flex items-center justify-center
        cursor-pointer
        transition-all duration-300 ease-in-out
        transform
        
        /* Visibility and animation states */
        ${
          isVisible
            ? "opacity-100 visible translate-y-0"
            : "opacity-0 invisible translate-y-2"
        }
        
        /* Theme-based styling */
        ${
          isLightTheme
            ? "bg-amber-600 text-white shadow-lg shadow-amber-600/50 hover:shadow-xl hover:shadow-amber-600/70 focus:ring-amber-600"
            : "bg-yellow-400 text-black shadow-lg shadow-yellow-400/50 hover:shadow-xl hover:shadow-yellow-400/70 focus:ring-yellow-400"
        }
        
        /* Hover effects - matches original behavior */
        hover:transform hover:-translate-y-1
        hover:scale-105
        
        /* Focus styles for accessibility */
        focus:outline-none focus:ring-2 focus:ring-offset-2
        
        /* Active state */
        active:scale-95
      `}
      aria-label="Scroll to top"
    >
      {/* Up arrow icon - matches original SVG */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5 10l7-7m0 0l7 7m-7-7v18"
        />
      </svg>
    </button>
  );
}
