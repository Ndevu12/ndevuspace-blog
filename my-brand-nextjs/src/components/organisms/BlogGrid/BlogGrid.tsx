import React from "react";
import { cn } from "@/lib/utils";
import BlogCard, { BlogCardProps } from "@/features/home/components/BlogCard";
import Button from "@/components/atoms/Button";
import SearchBar from "@/components/molecules/SearchBar";
import Pagination from "@/components/molecules/Pagination";
import { Loading } from "@/components/atoms/Loading";

export interface BlogGridProps {
  blogs: BlogCardProps[];
  className?: string;
  showSearch?: boolean;
  showPagination?: boolean;
  showFilters?: boolean;
  pageSize?: number;
  title?: string;
  subtitle?: string;
  showLoadMore?: boolean;
  loading?: boolean;
  onViewAll?: () => void;
}

const BlogGrid: React.FC<BlogGridProps> = ({
  blogs,
  className,
  showSearch = true,
  showPagination = false,
  showFilters = true,
  pageSize = 6,
  title,
  subtitle,
  showLoadMore = false,
  loading = false,
  onViewAll,
}) => {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState<string>("All");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [visibleCount, setVisibleCount] = React.useState(pageSize);

  // Get unique categories
  const categories = React.useMemo(() => {
    const cats = Array.from(
      new Set(
        blogs.map((b) => b.category?.name || b.tags?.[0]?.name).filter(Boolean)
      )
    );
    return ["All", ...cats];
  }, [blogs]);

  // Filter blogs
  const filteredBlogs = React.useMemo(() => {
    return blogs.filter((blog) => {
      const matchesSearch =
        !searchTerm ||
        blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.author.name.toLowerCase().includes(searchTerm.toLowerCase());

      const blogCategory = blog.category?.name || blog.tags?.[0]?.name || "";
      const matchesCategory =
        selectedCategory === "All" || blogCategory === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [blogs, searchTerm, selectedCategory]);

  // Paginate or limit blogs
  const displayedBlogs = React.useMemo(() => {
    if (showPagination) {
      const startIndex = (currentPage - 1) * pageSize;
      return filteredBlogs.slice(startIndex, startIndex + pageSize);
    }

    if (showLoadMore) {
      return filteredBlogs.slice(0, visibleCount);
    }

    return filteredBlogs;
  }, [
    filteredBlogs,
    currentPage,
    pageSize,
    visibleCount,
    showPagination,
    showLoadMore,
  ]);

  const totalPages = Math.ceil(filteredBlogs.length / pageSize);
  const hasMoreBlogs = showLoadMore && visibleCount < filteredBlogs.length;

  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + pageSize, filteredBlogs.length));
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    setVisibleCount(pageSize);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
    setVisibleCount(pageSize);
  };

  if (loading) {
    return (
      <section className={cn("py-16", className)}>
        <div className="max-w-6xl mx-auto px-4">
          <Loading text="Loading articles..." />
        </div>
      </section>
    );
  }

  return (
    <section className={cn("py-16", className)}>
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        {(title || subtitle) && (
          <div className="text-center mb-12">
            {title && (
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {title.split(" ").map((word, index) => (
                  <span
                    key={index}
                    className={
                      index === title.split(" ").length - 1
                        ? "text-yellow-400"
                        : ""
                    }
                  >
                    {word}
                    {index < title.split(" ").length - 1 && " "}
                  </span>
                ))}
              </h2>
            )}
            {subtitle && (
              <p className="text-gray-300 text-lg max-w-2xl mx-auto">
                {subtitle}
              </p>
            )}
          </div>
        )}

        {/* Filters and Search */}
        {(showFilters || showSearch) && (
          <div className="mb-8 space-y-6">
            {/* Search */}
            {showSearch && (
              <div className="max-w-md mx-auto">
                <SearchBar
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="Search articles..."
                />
              </div>
            )}

            {/* Category Filters */}
            {showFilters && categories.length > 1 && (
              <div className="flex flex-wrap justify-center gap-4">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategoryChange(category ?? "")}
                    className={cn(
                      "px-4 py-2 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-400",
                      selectedCategory === category
                        ? "bg-yellow-500 text-black font-medium"
                        : "bg-secondary text-white hover:bg-yellow-500 hover:text-black"
                    )}
                  >
                    {category}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Results Info */}
        {(showSearch || showFilters) && (
          <div className="mb-6 text-center">
            <p className="text-gray-400">
              Showing {displayedBlogs.length} of {filteredBlogs.length} articles
              {searchTerm && ` for "${searchTerm}"`}
              {selectedCategory !== "All" && ` in ${selectedCategory}`}
            </p>
          </div>
        )}

        {/* Blog Grid */}
        {displayedBlogs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {displayedBlogs.map((blog, index) => (
              <BlogCard
                key={blog.id}
                {...blog}
                className="animate-fade-in"
                style={
                  { animationDelay: `${index * 0.1}s` } as React.CSSProperties
                }
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-16 h-16 mx-auto"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-4.5a1.125 1.125 0 01-1.125-1.125v-1.5A3.375 3.375 0 006.125 2.25H2.25v1.125A1.125 1.125 0 013.375 4.5h2.25A1.125 1.125 0 016.75 5.625v1.5a3.375 3.375 0 003.375 3.375h4.5a1.125 1.125 0 011.125 1.125v2.625M19.5 14.25L15.75 18l3.75 3.75"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">
              No articles found
            </h3>
            <p className="text-gray-400 mb-4">
              Try adjusting your search terms or filters.
            </p>
            {(searchTerm || selectedCategory !== "All") && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("All");
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        )}

        {/* Load More Button */}
        {hasMoreBlogs && (
          <div className="text-center">
            <Button onClick={handleLoadMore} variant="outline">
              Load More Articles
            </Button>
          </div>
        )}

        {/* Pagination */}
        {showPagination && totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredBlogs.length}
            pageSize={pageSize}
          />
        )}

        {/* View All Button */}
        {onViewAll && (
          <div className="text-center mt-10">
            <Button onClick={onViewAll}>Read All Articles</Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default BlogGrid;
