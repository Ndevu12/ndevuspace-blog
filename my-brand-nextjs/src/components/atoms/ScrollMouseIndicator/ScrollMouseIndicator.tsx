"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * ScrollMouseIndicator Component
 *
 * Shows a mouse scroll indicator throughout the home page.
 * Disappears only when the contact section or footer comes into view.
 */
export default function ScrollMouseIndicator() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Observer for contact section and footer
    const observerOptions = {
      threshold: 0.2, // Trigger when 20% of the section is visible
      rootMargin: "0px 0px -50px 0px", // Trigger a bit before the section is fully visible
    };

    const observer = new IntersectionObserver((entries) => {
      let shouldHide = false;

      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          shouldHide = true;
        }
      });

      setIsVisible(!shouldHide);
    }, observerOptions);

    // Find contact section and footer
    const contactSection = document.getElementById("contactme");
    const footerSection = document.querySelector("main-footer");

    if (contactSection) {
      observer.observe(contactSection);
    }
    if (footerSection) {
      observer.observe(footerSection);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleClick = () => {
    // Smooth scroll down one viewport height
    window.scrollBy({
      top: window.innerHeight,
      behavior: "smooth",
    });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div
      onClick={handleClick}
      className={cn(
        "fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 cursor-pointer",
        "transition-all duration-300 ease-out"
      )}
    >
      <div className="flex flex-col items-center gap-2 animate-bounce">
        <span className="text-gray-600 dark:text-gray-400 text-xs font-medium">
          Scroll to explore
        </span>
        <div className="w-6 h-10 border-2 border-gray-300 dark:border-gray-400/50 rounded-full flex justify-center relative overflow-hidden">
          <div className="w-1 h-3 bg-yellow-400 rounded-full mt-2 animate-pulse" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-yellow-400/20 to-transparent animate-pulse" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <svg
            className="w-4 h-4 text-yellow-500 dark:text-yellow-400/80 animate-bounce [animation-delay:0.5s]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
