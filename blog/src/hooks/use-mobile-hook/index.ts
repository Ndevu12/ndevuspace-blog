"use client";

import { useSyncExternalStore } from "react";

const MOBILE_BREAKPOINT = 768;

function subscribe(callback: () => void) {
  const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getSnapshot() {
  return window.innerWidth < MOBILE_BREAKPOINT;
}

function getServerSnapshot() {
  return false;
}

/**
 * Detect if the current viewport is mobile-sized.
 * Uses useSyncExternalStore for concurrent-mode safe media query tracking.
 */
export function useIsMobile() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
