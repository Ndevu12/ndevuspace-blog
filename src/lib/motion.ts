// Motion design tokens — the single source of timing, easing, and variant
// truth for the public pages. Components compose these; they never define
// their own durations or curves inline.

import type { Transition, Variants } from "framer-motion";

// ─── Easing & duration scale ───

/** Standard deceleration curve for entrances. */
export const EASE_OUT = [0.22, 0.61, 0.36, 1] as const;

export const DURATION = {
  /** Micro-interactions: icon swaps, taps. */
  fast: 0.15,
  /** Element entrances: cards, headings. */
  base: 0.35,
  /** Page-level moments: hero reveal, scroll reveals. */
  slow: 0.45,
} as const;

// ─── Springs ───

/** Sliding indicators (active pill, TOC rail) — quick, minimal overshoot. */
export const SPRING_SNAPPY: Transition = {
  type: "spring",
  stiffness: 420,
  damping: 34,
};

/** Layout reflow (grid re-sorting) — calm, no wobble. */
export const SPRING_GENTLE: Transition = {
  type: "spring",
  stiffness: 260,
  damping: 32,
};

// ─── Shared variants ───

/** Standard entrance: fade in while rising into place. */
export const fadeRise: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.base, ease: EASE_OUT },
  },
};

/** Media entrance: fade with a slight settle from scale. */
export const fadeScale: Variants = {
  hidden: { opacity: 0, scale: 0.985 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: DURATION.slow, ease: EASE_OUT },
  },
};

/** Parent that staggers `fadeRise`/`fadeScale` children. */
export function staggerContainer(stagger = 0.08, delay = 0): Variants {
  return {
    hidden: {},
    visible: {
      transition: { staggerChildren: stagger, delayChildren: delay },
    },
  };
}

/**
 * Props for a one-off entrance on a motion element. Returns an empty object
 * when the user prefers reduced motion, so the element renders statically.
 */
export function entrance(reducedMotion: boolean | null, delay = 0) {
  if (reducedMotion) return {};
  return {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: DURATION.base, ease: EASE_OUT, delay },
  } as const;
}
