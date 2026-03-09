"use client";

import { useSyncExternalStore } from "react";

/**
 * Track window dimensions using useSyncExternalStore.
 * Avoids SSR hydration mismatches by returning 0 on the server.
 */

interface WindowSize {
  width: number;
  height: number;
}

function subscribe(callback: () => void) {
  window.addEventListener("resize", callback);
  return () => window.removeEventListener("resize", callback);
}

function getSnapshot(): WindowSize {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}

function getServerSnapshot(): WindowSize {
  return { width: 0, height: 0 };
}

export function useWindowSize() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
