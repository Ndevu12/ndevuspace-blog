import React from "react";
import { cn } from "@/lib/utils";
import LoadingSpinner from "../Loading";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  asChild?: boolean;
  loading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      children,
      loading = false,
      loadingText,
      icon,
      iconPosition = "left",
      disabled,
      ...props
    },
    ref
  ) => {
    const baseClasses =
      "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-primary disabled:opacity-50 disabled:pointer-events-none";

    const variants = {
      primary:
        "relative inline-flex items-center gap-3 bg-brand hover:bg-brand-dark text-white font-bold px-10 py-5 rounded-3xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-brand/20",
      secondary:
        "bg-secondary text-white border border-gray-100 hover:border-gray-400 hover:text-gray-400",
      outline:
        "border border-gray-100 text-gray-400 hover:bg-gray-400 hover:text-black",
      ghost:
        "border border-gray-100 dark:bg-ghost dark:text-gray-300 hover:text-gray-400 hover:bg-secondary/50",
    };

    const sizes = {
      sm: "px-4 py-2 text-sm min-w-[120px] h-9",
      md: "px-6 py-2.5 text-base min-w-[150px] h-11",
      lg: "px-8 py-3 text-lg min-w-[180px] h-12",
    };

    const isDisabled = disabled || loading;
    const displayText = loading && loadingText ? loadingText : children;
    const showIcon = icon && !loading;
    const showSpinner = loading;

    // Remove asChild from props before spreading onto button
    const { asChild, ...restProps } = props;
    return (
      <button
        className={cn(baseClasses, variants[variant], sizes[size], className)}
        ref={ref}
        disabled={isDisabled}
        {...restProps}
      >
        {showSpinner && (
          <LoadingSpinner
            size={size === "sm" ? "xs" : size === "lg" ? "sm" : "xs"}
            color="white"
          />
        )}
        {showIcon && iconPosition === "left" && (
          <span className="flex-shrink-0">{icon}</span>
        )}
        <span>{displayText}</span>
        {showIcon && iconPosition === "right" && (
          <span className="flex-shrink-0">{icon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
