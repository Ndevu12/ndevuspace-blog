import React from "react";
import type { JSX } from "react";
import { cn } from "@/lib/utils";

export interface TypographyProps {
  variant?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span" | "small";
  className?: string;
  children: React.ReactNode;
  gradient?: boolean;
  accent?: boolean;
}

const Typography: React.FC<TypographyProps> = ({
  variant = "p",
  className,
  children,
  gradient = false,
  accent = false,
  ...props
}) => {
  const Component = variant as keyof JSX.IntrinsicElements;

  const baseStyles = {
    h1: "text-3xl md:text-5xl font-bold leading-tight",
    h2: "text-2xl md:text-4xl font-bold leading-tight",
    h3: "text-xl md:text-2xl font-bold leading-tight",
    h4: "text-lg md:text-xl font-bold leading-tight",
    h5: "text-base md:text-lg font-semibold leading-tight",
    h6: "text-sm md:text-base font-semibold leading-tight",
    p: "text-base md:text-lg leading-relaxed text-gray-300",
    span: "text-base leading-normal",
    small: "text-sm leading-normal text-gray-400",
  };

  const gradientClass = gradient
    ? "bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent"
    : "";

  const accentClass = accent ? "text-yellow-400" : "";

  return (
    <Component
      className={cn(baseStyles[variant], gradientClass, accentClass, className)}
      {...props}
    >
      {children}
    </Component>
  );
};

export default Typography;
