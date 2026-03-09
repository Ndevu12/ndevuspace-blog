import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export interface AvatarProps {
  src?: string;
  alt: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  fallback?: string;
  className?: string;
  border?: boolean;
  borderColor?: "yellow" | "gray" | "blue" | "green";
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  (
    {
      src,
      alt,
      size = "md",
      fallback,
      className,
      border = false,
      borderColor = "yellow",
      ...props
    },
    ref
  ) => {
    const [imageError, setImageError] = React.useState(false);

    const sizes = {
      xs: "w-6 h-6 text-xs",
      sm: "w-8 h-8 text-sm",
      md: "w-10 h-10 text-base",
      lg: "w-12 h-12 text-lg",
      xl: "w-16 h-16 text-xl",
      "2xl": "w-20 h-20 text-2xl",
    };

    const borderColors = {
      yellow: "border-yellow-400",
      gray: "border-gray-400",
      blue: "border-blue-400",
      green: "border-green-400",
    };

    const borderClass = border ? `border-2 ${borderColors[borderColor]}` : "";

    // Generate initials from alt text as fallback
    const getInitials = (name: string) => {
      return name
        ? name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
        : "";
    };

    const baseClasses = cn(
      "relative rounded-full overflow-hidden bg-secondary flex items-center justify-center",
      sizes[size],
      borderClass,
      className
    );

    if (!src || imageError) {
      return (
        <div ref={ref} className={baseClasses} {...props}>
          <span className="font-medium text-gray-300">
            {fallback || getInitials(alt)}
          </span>
        </div>
      );
    }

    return (
      <div ref={ref} className={baseClasses} {...props}>
        <Image
          src={src}
          alt={alt}
          fill
          sizes={`${sizes[size].split(" ")[0].replace("w-", "")}rem`}
          className="object-cover"
          onError={() => setImageError(true)}
        />
      </div>
    );
  }
);

Avatar.displayName = "Avatar";

export default Avatar;
