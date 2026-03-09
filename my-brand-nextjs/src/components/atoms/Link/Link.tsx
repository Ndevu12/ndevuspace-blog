import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface CustomLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "nav" | "footer" | "button" | "inline";
  external?: boolean;
  scroll?: boolean;
  prefetch?: boolean;
  active?: boolean;
}

const CustomLink = React.forwardRef<HTMLAnchorElement, CustomLinkProps>(
  (
    {
      href,
      children,
      className,
      variant = "default",
      external = false,
      scroll = true,
      prefetch = true,
      active = false,
      ...props
    },
    ref
  ) => {
    const baseClasses =
      "transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-primary";

    const variants = {
      default: "text-white hover:text-yellow-400",
      nav: cn(
        "relative px-4 py-2 font-medium rounded-lg border border-transparent hover:border-yellow-500 hover:bg-secondary/50 hover:text-yellow-400",
        active && "text-yellow-400 bg-secondary/30 border-yellow-500"
      ),
      footer: "text-gray-300 hover:text-yellow-400 block py-1",
      button:
        "inline-flex items-center justify-center px-6 py-2.5 bg-[#2f2b2b] border border-[#916868] text-white rounded-full hover:bg-primary hover:text-[#e0c110] hover:border-yellow-400 min-w-[150px] text-center",
      inline:
        "text-yellow-400 hover:text-yellow-300 font-medium underline decoration-transparent hover:decoration-current underline-offset-4",
    };

    // External link
    if (external) {
      return (
        <a
          ref={ref}
          href={href}
          className={cn(baseClasses, variants[variant], className)}
          target="_blank"
          rel="noopener noreferrer"
          {...props}
        >
          {children}
        </a>
      );
    }

    // Internal link
    return (
      <Link
        href={href}
        scroll={scroll}
        prefetch={prefetch}
        className={cn(baseClasses, variants[variant], className)}
        ref={ref}
        {...props}
      >
        {children}
      </Link>
    );
  }
);

CustomLink.displayName = "CustomLink";

export default CustomLink;
