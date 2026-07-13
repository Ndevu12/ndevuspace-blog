"use client";

import { motion, useScroll, useSpring, useReducedMotion } from "framer-motion";

/**
 * Fixed hairline progress bar under the sticky header that tracks page
 * scroll. Renders statically (no spring) when the user prefers reduced motion.
 */
export function ReadingProgress() {
  const { scrollYProgress } = useScroll();
  const prefersReducedMotion = useReducedMotion();
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      aria-hidden
      className="fixed inset-x-0 top-0 z-[60] h-0.5 origin-left bg-gradient-to-r from-brand-dark via-brand to-brand-light"
      style={{ scaleX: prefersReducedMotion ? scrollYProgress : smoothProgress }}
    />
  );
}
