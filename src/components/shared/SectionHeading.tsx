import { cn } from "@/lib/utils";

type HeadingLevel = "h2" | "h3";

export interface SectionHeadingProps {
  /** Mono uppercase label rendered above the title. */
  eyebrow?: string;
  title: string;
  /** Mono metadata line rendered below the title, e.g. "Showing 12 of 24 posts". */
  meta?: string;
  as?: HeadingLevel;
  className?: string;
  titleClassName?: string;
}

/**
 * Section header in the site's editorial voice: mono eyebrow, balanced
 * title, optional mono meta line. Single source for what used to be the
 * colored-bar heading pattern.
 */
export function SectionHeading({
  eyebrow,
  title,
  meta,
  as: Heading = "h2",
  className,
  titleClassName,
}: SectionHeadingProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {eyebrow && (
        <span className="text-eyebrow flex items-center gap-2.5">
          <span aria-hidden className="h-px w-5 bg-primary" />
          {eyebrow}
        </span>
      )}
      <Heading className={cn("text-foreground", titleClassName)}>
        {title}
      </Heading>
      {meta && <p className="text-meta tabular-nums">{meta}</p>}
    </div>
  );
}
