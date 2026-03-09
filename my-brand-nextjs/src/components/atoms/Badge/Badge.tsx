import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "tech" | "category" | "status" | "new";
  color?:
    | "blue"
    | "green"
    | "purple"
    | "orange"
    | "pink"
    | "yellow"
    | "red"
    | "cyan"
    | "indigo"
    | "gray";
  size?: "sm" | "md" | "lg";
  className?: string;
  icon?: React.ReactNode;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      children,
      variant = "default",
      color = "gray",
      size = "md",
      className,
      icon,
      ...props
    },
    ref
  ) => {
    const baseClasses =
      "inline-flex items-center gap-1 font-medium rounded-full transition-all duration-300";

    const variants = {
      default: "border",
      tech: "border-0",
      category: "border-0",
      status: "border uppercase tracking-wide",
      new: "bg-yellow-500 text-black font-bold uppercase tracking-wide animate-pulse",
    };

    const colors = {
      blue: {
        default: "bg-blue-600/20 text-blue-300 border-blue-600/30",
        tech: "bg-blue-600/30 text-blue-400",
        category: "bg-blue-600/20 text-blue-300",
        status: "bg-blue-600/10 text-blue-400 border-blue-600/40",
      },
      green: {
        default: "bg-green-600/20 text-green-300 border-green-600/30",
        tech: "bg-green-600/30 text-green-400",
        category: "bg-green-600/20 text-green-300",
        status: "bg-green-600/10 text-green-400 border-green-600/40",
      },
      purple: {
        default: "bg-purple-600/20 text-purple-300 border-purple-600/30",
        tech: "bg-purple-600/30 text-purple-400",
        category: "bg-purple-600/20 text-purple-300",
        status: "bg-purple-600/10 text-purple-400 border-purple-600/40",
      },
      orange: {
        default: "bg-orange-600/20 text-orange-300 border-orange-600/30",
        tech: "bg-orange-600/30 text-orange-400",
        category: "bg-orange-600/20 text-orange-300",
        status: "bg-orange-600/10 text-orange-400 border-orange-600/40",
      },
      pink: {
        default: "bg-pink-600/20 text-pink-300 border-pink-600/30",
        tech: "bg-pink-600/30 text-pink-400",
        category: "bg-pink-600/20 text-pink-300",
        status: "bg-pink-600/10 text-pink-400 border-pink-600/40",
      },
      yellow: {
        default: "bg-yellow-600/20 text-yellow-300 border-yellow-600/30",
        tech: "bg-yellow-600/30 text-yellow-400",
        category: "bg-yellow-600/20 text-yellow-300",
        status: "bg-yellow-600/10 text-yellow-400 border-yellow-600/40",
      },
      red: {
        default: "bg-red-600/20 text-red-300 border-red-600/30",
        tech: "bg-red-600/30 text-red-400",
        category: "bg-red-600/20 text-red-300",
        status: "bg-red-600/10 text-red-400 border-red-600/40",
      },
      cyan: {
        default: "bg-cyan-600/20 text-cyan-300 border-cyan-600/30",
        tech: "bg-cyan-600/30 text-cyan-400",
        category: "bg-cyan-600/20 text-cyan-300",
        status: "bg-cyan-600/10 text-cyan-400 border-cyan-600/40",
      },
      indigo: {
        default: "bg-indigo-600/20 text-indigo-300 border-indigo-600/30",
        tech: "bg-indigo-600/30 text-indigo-400",
        category: "bg-indigo-600/20 text-indigo-300",
        status: "bg-indigo-600/10 text-indigo-400 border-indigo-600/40",
      },
      gray: {
        default: "bg-gray-600/20 text-gray-300 border-gray-600/30",
        tech: "bg-gray-600/30 text-gray-400",
        category: "bg-gray-600/20 text-gray-300",
        status: "bg-gray-600/10 text-gray-400 border-gray-600/40",
      },
    };

    const sizes = {
      sm: "px-2 py-0.5 text-xs",
      md: "px-3 py-1 text-sm",
      lg: "px-4 py-1.5 text-base",
    };

    const colorClass =
      variant === "new" ? "" : colors[color]?.[variant] || colors.gray[variant];

    return (
      <span
        ref={ref}
        className={cn(
          baseClasses,
          variants[variant],
          colorClass,
          sizes[size],
          className
        )}
        {...props}
      >
        {icon && <span className="flex-shrink-0">{icon}</span>}
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";

export default Badge;
