import React from "react";
import { cn } from "@/lib/utils";

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: (value: string) => void;
  placeholder?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  loading?: boolean;
  debounceMs?: number;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onSubmit,
  placeholder = "Search...",
  className,
  size = "md",
  showIcon = true,
  loading = false,
  debounceMs = 300,
}) => {
  const [internalValue, setInternalValue] = React.useState(value);
  const debounceRef = React.useRef<NodeJS.Timeout | null>(null);

  // Sync internal value with prop value
  React.useEffect(() => {
    setInternalValue(value);
  }, [value]);

  // Debounced onChange
  React.useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      if (internalValue !== value) {
        onChange(internalValue);
      }
    }, debounceMs);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [internalValue, onChange, value, debounceMs]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(internalValue);
    }
  };

  const handleClear = () => {
    setInternalValue("");
    onChange("");
  };

  const sizes = {
    sm: "h-9 px-3 text-sm",
    md: "h-11 px-4 text-base",
    lg: "h-12 px-5 text-lg",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  return (
    <form onSubmit={handleSubmit} className={cn("relative", className)}>
      <div className="relative">
        {/* Search Icon */}
        {showIcon && (
          <div
            className={cn(
              "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400",
              loading && "animate-pulse"
            )}
          >
            {loading ? (
              <div
                className={cn(
                  "animate-spin border-2 border-transparent border-t-current rounded-full",
                  iconSizes[size]
                )}
              />
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={iconSizes[size]}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            )}
          </div>
        )}

        {/* Input */}
        <input
          type="text"
          value={internalValue}
          onChange={(e) => setInternalValue(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "w-full bg-[#252547] border border-[#444464] rounded-lg text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-300",
            sizes[size],
            showIcon && "pl-10",
            (internalValue || loading) && "pr-10"
          )}
        />

        {/* Clear Button */}
        {internalValue && !loading && (
          <button
            type="button"
            onClick={handleClear}
            title="Clear search"
            aria-label="Clear search"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={iconSizes[size]}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    </form>
  );
};

export default SearchBar;
