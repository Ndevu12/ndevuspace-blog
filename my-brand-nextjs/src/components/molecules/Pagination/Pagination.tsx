import React from "react";
import { cn } from "@/lib/utils";
import Button from "@/components/atoms/Button";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize?: number;
  totalItems?: number;
  maxVisiblePages?: number;
  showTotal?: boolean;
  size?: "sm" | "md" | "lg";
  align?: "left" | "center" | "right";
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  pageSize = 10,
  totalItems,
  maxVisiblePages = 7,
  showTotal = true,
  size = "md",
  align = "center",
  className,
}) => {
  // Don't render if there's only one page or no pages
  if (totalPages <= 1) return null;

  // Ensure current page is within bounds
  const safePage = Math.max(1, Math.min(currentPage, totalPages));

  // Calculate visible page numbers
  const getVisiblePages = () => {
    const delta = Math.floor(maxVisiblePages / 2);
    let start = Math.max(1, safePage - delta);
    let end = Math.min(totalPages, start + maxVisiblePages - 1);

    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(1, end - maxVisiblePages + 1);
    }

    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  const visiblePages = getVisiblePages();
  const showFirstPage = visiblePages[0] > 1;
  const showLastPage = visiblePages[visiblePages.length - 1] < totalPages;
  const showStartEllipsis = visiblePages[0] > 2;
  const showEndEllipsis =
    visiblePages[visiblePages.length - 1] < totalPages - 1;

  const sizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  const buttonSizes = {
    sm: "px-2 py-1 text-sm min-w-[32px] h-8",
    md: "px-3 py-1.5 text-base min-w-[36px] h-9",
    lg: "px-4 py-2 text-lg min-w-[40px] h-10",
  };

  const alignments = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
  };

  const handlePageClick = (page: number) => {
    if (page !== safePage && page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  const PaginationButton: React.FC<{
    page?: number;
    active?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
    onClick?: () => void;
  }> = ({ page, active = false, disabled = false, children, onClick }) => (
    <button
      onClick={onClick || (() => page && handlePageClick(page))}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 border focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-primary",
        buttonSizes[size],
        active
          ? "bg-yellow-500 text-black border-yellow-500 shadow-lg"
          : "bg-secondary border-gray-700 text-gray-300 hover:border-yellow-400 hover:text-yellow-400 hover:bg-secondary/80",
        disabled &&
          "opacity-50 cursor-not-allowed hover:border-gray-700 hover:text-gray-300 hover:bg-secondary"
      )}
    >
      {children}
    </button>
  );

  return (
    <div className={cn("py-4", className)}>
      {/* Total items info */}
      {showTotal && totalItems && (
        <div
          className={cn("mb-4 text-gray-400", sizes[size], alignments[align])}
        >
          <div className="flex">
            Showing{" "}
            <span className="font-medium text-white mx-1">
              {Math.min((safePage - 1) * pageSize + 1, totalItems)}
            </span>
            to{" "}
            <span className="font-medium text-white mx-1">
              {Math.min(safePage * pageSize, totalItems)}
            </span>
            of <span className="font-medium text-white mx-1">{totalItems}</span>
            results
          </div>
        </div>
      )}

      {/* Pagination controls */}
      <div className={cn("flex items-center gap-2", alignments[align])}>
        {/* Previous button */}
        <PaginationButton
          disabled={safePage <= 1}
          onClick={() => handlePageClick(safePage - 1)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span className="ml-1 hidden sm:inline">Previous</span>
        </PaginationButton>

        {/* First page */}
        {showFirstPage && (
          <>
            <PaginationButton page={1}>1</PaginationButton>
            {showStartEllipsis && (
              <span className="px-2 text-gray-500">...</span>
            )}
          </>
        )}

        {/* Visible page numbers */}
        {visiblePages.map((page) => (
          <PaginationButton key={page} page={page} active={page === safePage}>
            {page}
          </PaginationButton>
        ))}

        {/* Last page */}
        {showLastPage && (
          <>
            {showEndEllipsis && <span className="px-2 text-gray-500">...</span>}
            <PaginationButton page={totalPages}>{totalPages}</PaginationButton>
          </>
        )}

        {/* Next button */}
        <PaginationButton
          disabled={safePage >= totalPages}
          onClick={() => handlePageClick(safePage + 1)}
        >
          <span className="mr-1 hidden sm:inline">Next</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </PaginationButton>
      </div>
    </div>
  );
};

export default Pagination;
