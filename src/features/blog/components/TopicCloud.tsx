"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TopicCloudProps {
  tags: string[];
  activeTag?: string | null;
  onTagClick?: (tag: string) => void;
  className?: string;
}

/**
 * Tappable tag cloud. Shared between the desktop sidebar and the mobile
 * "Topics" sheet so both stay in sync.
 */
export function TopicCloud({
  tags,
  activeTag,
  onTagClick,
  className,
}: TopicCloudProps) {
  if (tags.length === 0) {
    return <p className="text-sm text-muted-foreground">No topics yet.</p>;
  }

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {tags.map((tag, idx) => {
        const isActive = activeTag === tag;
        return (
          <button
            key={`${tag}-${idx}`}
            onClick={() => onTagClick?.(tag)}
            className="pressable transition-transform duration-150"
          >
            <Badge
              variant={isActive ? "default" : "secondary"}
              className={cn(
                "cursor-pointer transition-colors",
                !isActive && "hover:bg-primary/10 hover:text-primary"
              )}
            >
              {tag}
            </Badge>
          </button>
        );
      })}
    </div>
  );
}
