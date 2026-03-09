import { BlogPost } from "@/types/blog";
import Image from "next/image";
import Link from "next/link";
import { getAuthorName, getAuthorImage } from "utils/blogUtils";

interface FeaturedBlogCardProps {
  post: BlogPost;
}

export function FeaturedBlogCard({ post }: FeaturedBlogCardProps) {
  const formattedDate = new Date(post.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
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
    <article className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 group">
      <div className="relative">
        <div className="relative w-full h-64 md:h-80 overflow-hidden">
          <Image
            src={post.imageUrl || "/images/placeholder-blog.jpg"}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

        {/* Featured Badge */}
        <div className="absolute top-4 left-4 bg-yellow-500 text-black font-bold text-sm px-4 py-2 rounded-full flex items-center">
          <i className="fas fa-star mr-2"></i>
          FEATURED
        </div>

        {/* Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="text-xs px-3 py-1 rounded-full bg-gray-600/20 text-gray-400 backdrop-blur-sm">
              <i className={`fas fa-${categoryIcon} mr-1`}></i>
              {categoryName}
            </span>
          </div>

          <h2 className="text-2xl md:text-3xl font-bold mb-4 group-hover:text-yellow-400 transition-colors">
            <Link href={`/blog/${post.slug}`} className="hover:underline">
              {post.title}
            </Link>
          </h2>

          <p className="text-gray-200 mb-6 leading-relaxed text-lg max-w-3xl">
            {post.description}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-yellow-500">
                <Image
                  src={getAuthorImage(post)}
                  alt={authorName}
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              </div>
              <div className="ml-3">
                <p className="font-medium text-white">{authorName}</p>
                <p className="text-sm text-gray-300">
                  {formattedDate} • {post.readTime || "5 min read"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Quick Share */}
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    const url = `${window.location.origin}/blog/${post.slug}`;
                    const shareData = {
                      title: post.title,
                      url: url,
                    };

                    if (
                      navigator.share &&
                      /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
                        navigator.userAgent
                      )
                    ) {
                      navigator.share(shareData);
                    } else {
                      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                        post.title
                      )}&url=${encodeURIComponent(url)}`;
                      window.open(twitterUrl, "_blank");
                    }
                  }}
                  className="text-gray-300 hover:text-yellow-400 transition-colors"
                  title="Share article"
                >
                  <i className="fas fa-share-alt text-sm"></i>
                </button>
              </div>

              <Link
                href={`/blog/${post.slug}`}
                className="bg-yellow-500 text-black px-6 py-3 rounded-lg font-medium hover:bg-yellow-400 transition-colors duration-200 flex items-center"
              >
                Read Article
                <i className="fas fa-arrow-right ml-2"></i>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
