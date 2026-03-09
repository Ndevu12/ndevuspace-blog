import React from "react";
import { cn } from "@/lib/utils";
import CustomLink from "@/components/atoms/Link";

export interface NavigationItem {
  label: string;
  href: string;
  active?: boolean;
  external?: boolean;
}

export interface NavigationProps {
  items: NavigationItem[];
  className?: string;
  orientation?: "horizontal" | "vertical";
  variant?: "default" | "mobile" | "footer";
  onItemClick?: (item: NavigationItem) => void;
}

const Navigation: React.FC<NavigationProps> = ({
  items,
  className,
  orientation = "horizontal",
  variant = "default",
  onItemClick,
}) => {
  const orientationClasses = {
    horizontal: "flex items-center space-x-1",
    vertical: "flex flex-col space-y-4",
  };

  const variantClasses = {
    default: "",
    mobile: "flex flex-col space-y-4 p-4",
    footer: "flex flex-col space-y-3",
  };

  const linkVariant = variant === "footer" ? "footer" : "nav";

  return (
    <nav
      className={cn(
        orientationClasses[orientation],
        variantClasses[variant],
        className
      )}
    >
      {items.map((item, index) => (
        <CustomLink
          key={index}
          href={item.href}
          variant={linkVariant}
          external={item.external}
          active={item.active}
        >
          <span
            onClick={
              onItemClick
                ? (e) => {
                    e.preventDefault();
                    onItemClick(item);
                  }
                : undefined
            }
            className={onItemClick ? "cursor-pointer" : undefined}
          >
            {item.label}
          </span>
        </CustomLink>
      ))}
    </nav>
  );
};

export interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  items: NavigationItem[];
  className?: string;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  items,
  className,
}) => {
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 bg-black/80 backdrop-blur-sm z-[999] transform transition-transform duration-300 lg:hidden",
        className
      )}
    >
      <div className="h-full w-3/4 ml-auto bg-secondary border-l border-gray-800 overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-800">
          <h2 className="text-xl font-bold text-yellow-400">Menu</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            aria-label="Close menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Navigation Items */}
        <div className="p-4">
          <Navigation
            items={items}
            orientation="vertical"
            variant="mobile"
            onItemClick={onClose}
          />
        </div>
      </div>
    </div>
  );
};

export default Navigation;
