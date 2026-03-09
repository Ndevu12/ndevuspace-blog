import { BlogPost } from "@/types/blog";
import Image from "next/image";
import Link from "next/link";
import { getAuthorName, getAuthorImage } from "utils/blogUtils";

interface BlogCardProps {
  post: BlogPost;
}

export function BlogCard({ post }: BlogCardProps) {
  const formattedDate = new Date(post.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  // Helper function to get category name
  const getCategoryName = (category: any): string => {
    if (typeof category === "string") {
      return category;
    }

    // Handle single category object (server format)
    return category?.name || "Uncategorized";
  };

  // Helper function to get category icon
  const getCategoryIcon = (category: any): string => {
    if (typeof category === "string") {
      return "bookmark";
    }

    // Handle single category object (server format)
    return category?.icon || "bookmark";
  };

  const authorName = getAuthorName(post.author);
  const categoryName = getCategoryName(post.category);
  const categoryIcon = getCategoryIcon(post.category);

  return (
    <article className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 group">
      <div className="relative">
        <div className="relative w-full h-48 overflow-hidden">
          <Image
            src={post.imageUrl || "/images/placeholder-blog.jpg"}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
        </div>
        {post.isNew && (
          <div className="absolute top-0 right-0 bg-yellow-500 text-black font-bold text-xs px-3 py-1 m-2 rounded">
            NEW
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
      </div>

      <div className="p-5">
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="text-xs px-2 py-1 rounded-full bg-gray-600/20 text-gray-400">
            <i className={`fas fa-${categoryIcon} mr-1`}></i>
            {categoryName}
          </span>
          {post.tags.slice(0, 1).map((tag) => (
            <span
              key={tag}
              className="text-xs bg-gray-200 dark:bg-gray-600/30 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>

        <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white group-hover:text-yellow-500 dark:group-hover:text-yellow-400 transition-colors">
          <Link href={`/blog/${post.slug}`} className="hover:underline">
            {post.title}
          </Link>
        </h3>

        <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed overflow-hidden max-h-[4.5rem]">
          {post.description}
        </p>

        <div className="flex justify-between items-center border-t border-gray-200 dark:border-gray-700/50 pt-4 mt-auto">
          <div className="flex items-center">
            <div className="relative w-8 h-8 rounded-full overflow-hidden border border-yellow-500">
              <Image
                src={getAuthorImage(post)}
                alt={authorName}
                fill
                sizes="32px"
                className="object-cover"
              />
            </div>
            <div className="ml-2">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formattedDate}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {post.readTime || "5 min read"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/blog/${post.slug}`}
              className="text-yellow-500 dark:text-yellow-400 hover:text-yellow-600 dark:hover:text-yellow-300 text-sm font-medium transition-colors"
            >
              Read
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
