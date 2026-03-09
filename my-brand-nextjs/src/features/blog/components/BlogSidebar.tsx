import {
  MY_GITHUB_PROFILE_URL,
  MY_LINKEDIN_PROFILE_URL,
} from "@/lib/constants";
import { randomNUmberGenerator } from "@/lib/utils";
import { BlogPost } from "@/types/blog";
import Image from "next/image";
import Link from "next/link";

interface BlogSidebarProps {
  popularPosts: BlogPost[];
  tags: string[];
  onTagClick?: (tag: string) => void;
  activeTag?: string | null;
}

export function BlogSidebar({
  popularPosts,
  tags,
  onTagClick,
  activeTag,
}: BlogSidebarProps) {
  return (
    <div className="space-y-8">
      {/* About Author */}
      <div className="bg-white dark:bg-secondary rounded-xl overflow-hidden shadow-lg">
        <div className="h-24 bg-gradient-to-r from-yellow-500/30 to-purple-500/30 relative">
          <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2">
            <div className="relative w-20 h-20 rounded-full overflow-hidden border-4 border-white dark:border-secondary">
              <Image
                src="/images/mypic.png"
                alt="Ndevu"
                fill
                sizes="80px"
                className="object-cover"
              />
            </div>
          </div>
        </div>
        <div className="pt-12 p-6 text-center">
          <h3 className="text-xl font-bold mb-1 text-gray-900 dark:text-white">
            Ndevu
          </h3>
          <p className="text-yellow-500 dark:text-yellow-400 text-sm mb-3">
            Full Stack Developer
          </p>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
            Passionate about creating elegant solutions to complex problems. I
            share insights about web development, software engineering, and
            technology.
          </p>
          <div className="flex justify-center gap-4">
            <a
              href="https://twitter.com"
              className="text-gray-400 hover:text-yellow-500 dark:hover:text-yellow-400 transition-colors"
              aria-label="Twitter"
            >
              <i className="fab fa-twitter text-lg"></i>
            </a>
            <a
              href={MY_GITHUB_PROFILE_URL}
              className="text-gray-400 hover:text-yellow-500 dark:hover:text-yellow-400 transition-colors"
              aria-label="GitHub"
            >
              <i className="fab fa-github text-lg"></i>
            </a>
            <a
              href={MY_LINKEDIN_PROFILE_URL}
              className="text-gray-400 hover:text-yellow-500 dark:hover:text-yellow-400 transition-colors"
              aria-label="LinkedIn"
            >
              <i className="fab fa-linkedin text-lg"></i>
            </a>
          </div>
        </div>
      </div>

      {/* Popular Posts */}
      <div className="bg-white dark:bg-secondary rounded-xl p-6 shadow-lg">
        <h3 className="font-bold mb-4 flex items-center text-gray-900 dark:text-white">
          <span className="inline-block w-3 h-10 bg-yellow-500 rounded-sm mr-2"></span>
          Popular Posts
        </h3>

        <div className="space-y-4">
          {popularPosts.map((post) => (
            <div key={post._id || post.id} className="flex gap-3 group">
              <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden">
                <Image
                  src={post.imageUrl || "/images/placeholder-blog.jpg"}
                  alt={post.title}
                  fill
                  sizes="64px"
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-yellow-500 dark:group-hover:text-yellow-400 transition-colors overflow-hidden max-h-[2.5rem] mb-1">
                  <Link href={`/blog/${post.slug}`} className="hover:underline">
                    {post.title}
                  </Link>
                </h4>
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                  <span>
                    {new Date(post.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <span className="mx-1">•</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Topic Cloud */}
      <div className="bg-white dark:bg-secondary rounded-xl p-6 shadow-lg">
        <h3 className="font-bold mb-4 flex items-center text-gray-900 dark:text-white">
          <span className="inline-block w-3 h-10 bg-yellow-500 rounded-sm mr-2"></span>
          Topic Cloud
        </h3>

        <div className="flex flex-wrap gap-2">
          {tags.map((tag, idx) => {
            const isActive = activeTag === tag;
            return (
              <button
                key={`${tag}-${randomNUmberGenerator()}`}
                onClick={() => onTagClick?.(tag)}
                className={`px-3 py-1 rounded-full text-sm transition-colors duration-200 ${
                  isActive
                    ? "bg-yellow-500 text-white dark:bg-yellow-400 dark:text-gray-900"
                    : "bg-gray-100 dark:bg-primary text-gray-700 dark:text-gray-300 hover:bg-yellow-100 dark:hover:bg-yellow-500/20 hover:text-yellow-600 dark:hover:text-yellow-400"
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
