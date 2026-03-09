"use client";

import { BlogPost, BlogComment } from "@/types/blog";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { BlogSidebar } from "./components/BlogSidebar";
import { ShareArticle } from "./components/ShareArticle";
import { TableOfContents } from "./components/TableOfContents";
import { CommentForm, Comment } from "@/features/comments";
import {
  getRecentBlogs,
  getBlogsByCategory,
  getBlogsPaginated,
} from "@/services/blogService";
import { getAuthorName, getAuthorImage } from "utils/blogUtils";
import ClientLayout from "@/components/layout";
import { useRouter } from "next/navigation";

interface BlogDetailPageProps {
  post: BlogPost;
}

export function BlogDetailPage({ post }: BlogDetailPageProps) {
  const router = useRouter();
  const [popularPosts, setPopularPosts] = useState<BlogPost[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [currentUrl, setCurrentUrl] = useState<string>("");

  useEffect(() => {
    setCurrentUrl(window.location.href);
  }, []);

  const handleTagClick = (tag: string) => {
    router.push(`/blog?tag=${encodeURIComponent(tag)}`);
  };

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const recentPosts = await getRecentBlogs(3);
        setPopularPosts(recentPosts);

        const allBlogsData = await getBlogsPaginated(1, 20);
        const allTags =
          allBlogsData.blogs?.flatMap((blog: any) => blog.tags || []) || [];
        const stringTags = allTags.filter(
          (tag: any): tag is string => typeof tag === "string"
        );
        const uniqueTags: string[] = Array.from(new Set(stringTags));
        setAllTags(uniqueTags);

        if (post.category?._id) {
          const categoryPosts = await getBlogsByCategory(
            post.category._id,
            1,
            6
          );
          const filtered = categoryPosts.blogs
            .filter((p: BlogPost) => p.slug !== post.slug)
            .slice(0, 3);
          setRelatedPosts(filtered);
        }

        if (post.comments && Array.isArray(post.comments)) {
          setComments(post.comments);
        }
      } catch (error) {
        console.error("Error fetching blog detail data:", error);
        setPopularPosts([]);
        setAllTags([]);
        setRelatedPosts([]);
        setComments([]);
      }
    };

    fetchData();
  }, [post._id, post.slug, post.category, post.tags, post.comments]);

  const handleCommentAdded = (newComment: Comment) => {
    const blogComment: BlogComment = {
      _id: newComment._id,
      blogId: newComment.blogId,
      content: newComment.content,
      name: newComment.name,
      createdAt: newComment.createdAt,
    };
    setComments((prev) => [blogComment, ...prev]);
  };

  if (!post) {
    return (
      <ClientLayout>
        <section className="flex flex-col min-h-screen">
          <div className="max-w-4xl mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Blog Post Not Found
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              The blog post you are looking for does not exist or has been
              removed.
            </p>
          </div>
        </section>
      </ClientLayout>
    );
  }

  const formattedDate = new Date(post.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <ClientLayout>
      {/* Article Header */}
      <section className="relative bg-white dark:bg-gray-800 pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4">
          {/* Breadcrumb */}
          <nav className="mb-8">
            <ol className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <li>
                <Link
                  href="/"
                  className="hover:text-yellow-500 dark:hover:text-yellow-400"
                >
                  Home
                </Link>
              </li>
              <li>
                <span className="mx-2">/</span>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="hover:text-yellow-500 dark:hover:text-yellow-400"
                >
                  Blog
                </Link>
              </li>
              <li>
                <span className="mx-2">/</span>
              </li>
              <li className="text-gray-700 dark:text-gray-300 truncate">
                {post.title}
              </li>
            </ol>
          </nav>

          {/* Category Badge */}
          <div className="mb-6">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-600/20 text-gray-400`}
            >
              <i
                className={`fas fa-${post.category?.icon || "bookmark"} mr-2`}
              ></i>
              {post.category?.name || "Uncategorized"}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            {post.title}
          </h1>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-6 mb-8 text-gray-600 dark:text-gray-400">
            <div className="flex items-center">
              <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-yellow-500 mr-3">
                <Image
                  src={getAuthorImage(post)}
                  alt={getAuthorName(post.author)}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {getAuthorName(post.author)}
                </p>
              </div>
            </div>
            <div className="flex items-center text-sm">
              <i className="fas fa-calendar mr-2"></i>
              {formattedDate}
            </div>
            <div className="flex items-center text-sm">
              <i className="fas fa-clock mr-2"></i>
              {post.readTime}
            </div>
          </div>

          {/* Featured Image */}
          {post.imageUrl && (
            <div className="relative w-full h-64 md:h-96 rounded-xl overflow-hidden mb-8">
              <Image
                src={post.imageUrl}
                alt={post.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Description */}
          <div className="prose prose-lg dark:prose-invert max-w-none mb-8">
            <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
              {post.description}
            </p>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Article Content */}
          <div className="lg:w-3/4">
            <article className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
              {/* Article Body */}
              <div className="prose prose-lg dark:prose-invert max-w-none">
                {post.content ? (
                  <div dangerouslySetInnerHTML={{ __html: post.content }} />
                ) : (
                  <div className="space-y-6"></div>
                )}
              </div>

              {/* Tags */}
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleTagClick(tag)}
                      className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm hover:bg-yellow-100 dark:hover:bg-yellow-500/20 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Share Article */}
              {currentUrl && (
                <ShareArticle
                  title={post.title}
                  url={currentUrl}
                  className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700"
                  inline={true}
                />
              )}
            </article>

            {/* Comments Section */}
            <section className="mt-12 space-y-8">
              {/* Display Comments */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Comments ({comments.length})
                </h3>

                {comments.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">
                      No comments yet. Be the first to comment!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {comments.map((comment) => (
                      <div
                        key={comment._id}
                        className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-b-0 last:pb-0"
                      >
                        <div className="flex items-start space-x-4">
                          {/* Avatar */}
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                              {comment.name.charAt(0).toUpperCase()}
                            </div>
                          </div>

                          {/* Comment Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                                {comment.name}
                              </h4>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(comment.createdAt).toLocaleDateString(
                                  "en-US",
                                  {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </span>
                            </div>
                            <div className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                              {comment.content}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Comment Form */}
              <CommentForm
                blogId={post._id}
                onCommentAdded={handleCommentAdded}
              />
            </section>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <section className="mt-12">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Related Articles
                </h3>
                <div className="grid md:grid-cols-3 gap-6">
                  {relatedPosts.map((relatedPost) => (
                    <Link
                      key={relatedPost._id || relatedPost.id}
                      href={`/blog/${relatedPost.slug}`}
                      className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                    >
                      <div className="relative w-full h-40">
                        <Image
                          src={
                            relatedPost.imageUrl ||
                            "/images/placeholder-blog.jpg"
                          }
                          alt={relatedPost.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2 overflow-hidden max-h-[3rem]">
                          {relatedPost.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {relatedPost.readTime}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:w-1/4 space-y-8">
            {/* Table of Contents */}
            <TableOfContents />

            {/* Share Article for Mobile */}
            <div className="lg:hidden">
              {currentUrl && (
                <ShareArticle title={post.title} url={currentUrl} />
              )}
            </div>

            {/* Blog Sidebar */}
            <BlogSidebar
              popularPosts={popularPosts}
              tags={allTags}
              onTagClick={handleTagClick}
              activeTag={null}
            />
          </aside>
        </div>
      </main>
    </ClientLayout>
  );
}
