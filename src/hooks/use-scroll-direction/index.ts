"use client";

import { useSyncExternalStore } from "react";

/**
 * Detect scroll direction (up / down) using useSyncExternalStore for
 * tear-free concurrent-mode safe reads.
 */

let lastScrollY = 0;
let direction: "up" | "down" = "up";

function subscribe(callback: () => void) {
  const handleScroll = () => {
    const scrollY = window.scrollY;
    const newDirection = scrollY > lastScrollY ? "down" : "up";
    if (newDirection !== direction && Math.abs(scrollY - lastScrollY) > 10) {
      direction = newDirection;
      callback();
    }
    lastScrollY = scrollY > 0 ? scrollY : 0;
  };

  window.addEventListener("scroll", handleScroll, { passive: true });
  return () => window.removeEventListener("scroll", handleScroll);
}

function getSnapshot() {
  return direction;
}

function getServerSnapshot() {
  return "up" as const;
}

export function useScrollDirection() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
