"use client";

import { cn } from "@/lib/utils";

interface TopicBadgeProps {
  name: string;
  postCount: number;
  /** Highest count in the set; used to size this topic relative to the rest. */
  maxPostCount: number;
  active?: boolean;
  onClick?: () => void;
}

/**
 * Weight buckets, largest first. `min` is the postCount/maxPostCount ratio
 * threshold, so sizing is relative and stable regardless of the absolute
 * count range (dummy 1–4 or production 1–50 both spread across the buckets).
 */
const WEIGHTS = [
  { min: 0.75, className: "text-base font-bold px-3.5 py-1.5" },
  { min: 0.5, className: "text-sm font-semibold px-3 py-1.5" },
  { min: 0.25, className: "text-sm font-medium px-3 py-1" },
  { min: 0, className: "text-xs font-medium px-2.5 py-1 opacity-90" },
] as const;

function weightClass(postCount: number, maxPostCount: number): string {
  const ratio = maxPostCount > 0 ? postCount / maxPostCount : 0;
  return (WEIGHTS.find((w) => ratio >= w.min) ?? WEIGHTS[WEIGHTS.length - 1])
    .className;
}

/** A single topic chip, sized by how many posts carry it. */
export function TopicBadge({
  name,
  postCount,
  maxPostCount,
  active = false,
  onClick,
}: TopicBadgeProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={`${postCount} ${postCount === 1 ? "article" : "articles"}`}
      className={cn(
        "pressable rounded-full border transition-colors duration-150",
        weightClass(postCount, maxPostCount),
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-secondary text-secondary-foreground hover:border-primary/50 hover:text-primary"
      )}
    >
      {name}
    </button>
  );
}
