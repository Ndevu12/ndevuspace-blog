"use client";

import { useEffect, useState } from "react";

/**
 * Track which section is currently in view (for Table of Contents).
 * Uses IntersectionObserver for efficient scroll tracking.
 */
export function useScrollSpy(sectionIds: string[], offset: number = 100) {
  const [activeSection, setActiveSection] = useState<string>("");

  useEffect(() => {
    if (sectionIds.length === 0) return;

    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the first intersecting entry
        const intersecting = entries.find((entry) => entry.isIntersecting);
        if (intersecting) {
          setActiveSection(intersecting.target.id);
        }
      },
      { rootMargin: `-${offset}px 0px -70% 0px`, threshold: 0 }
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [sectionIds, offset]);

  return activeSection;
}
