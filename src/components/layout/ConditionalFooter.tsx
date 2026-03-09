"use client";

import { usePathname } from "next/navigation";
import { Footer } from "./Footer";

/**
 * Renders the Footer only on public routes (hides on /dashboard/*).
 */
export function ConditionalFooter() {
  const pathname = usePathname();
  if (pathname.startsWith("/dashboard")) return null;
  return <Footer />;
}
