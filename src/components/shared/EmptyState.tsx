import { Button } from "@/components/ui/button";

export interface EmptyStateProps {
  /** Illustrative element shown above the title (icon, emoji, …). */
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

/**
 * Centered empty/error state: icon, title, supporting copy, and an
 * optional recovery action.
 */
export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div className={`py-12 text-center ${className ?? ""}`}>
      {icon && (
        <div className="mb-4 flex justify-center text-muted-foreground">
          {icon}
        </div>
      )}
      <h3 className="mb-2 text-xl font-bold">{title}</h3>
      {description && <p className="text-muted-foreground">{description}</p>}
      {actionLabel && onAction && (
        <Button variant="link" className="mt-4 text-primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
