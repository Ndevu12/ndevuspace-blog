import React from "react";
import { cn } from "@/lib/utils";

export interface LoadingSpinnerProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  color?: "primary" | "secondary" | "yellow" | "white";
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  color = "yellow",
  className,
}) => {
  const sizes = {
    xs: "w-4 h-4",
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  const colors = {
    primary: "border-primary",
    secondary: "border-secondary",
    yellow: "border-yellow-400",
    white: "border-white",
  };

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-transparent",
        `border-t-current`,
        sizes[size],
        colors[color],
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export interface LoadingProps {
  text?: string;
  spinner?: boolean;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  fullPage?: boolean;
}

export const Loading: React.FC<LoadingProps> = ({
  text = "Loading...",
  spinner = true,
  size = "md",
  className,
  fullPage = false,
}) => {
  const containerClass = fullPage
    ? "min-h-screen flex items-center justify-center"
    : "flex items-center justify-center py-12";

  return (
    <div className={cn(containerClass, className)}>
      <div className="flex flex-col items-center gap-4">
        {spinner && <LoadingSpinner size={size} />}
        {text && (
          <p className="text-gray-300 text-center font-medium">{text}</p>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner;
