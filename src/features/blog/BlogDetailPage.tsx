"use client";

import { BlogPost } from "@/types/blog";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { BlogSidebar } from "./components/BlogSidebar";
import { ShareArticle } from "./components/ShareArticle";
import { TableOfContents } from "./components/TableOfContents";
import { CommentForm, CommentList } from "@/features/comments";
import { useBlogDetailStore } from "./detailStore";
import { getAuthorName, getAuthorImage, formatDate } from "@/lib/blogUtils";
import { useRouter } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Bookmark,
  Calendar,
  Clock,
  Heart,
} from "lucide-react";
import { toast } from "sonner";

interface BlogDetailPageProps {
  post: BlogPost;
}

export function BlogDetailPage({ post }: BlogDetailPageProps) {
  const router = useRouter();

  // ─── Store ───
  const {
    popularPosts,
    allTags,
    relatedPosts,
    comments,
    liked,
    likeCount,
    currentUrl,
    initializePost,
    fetchSidebarData,
    toggleLike,
    addComment,
    reset,
  } = useBlogDetailStore();

  // Initialize on mount / post change
  useEffect(() => {
    initializePost(post);
    fetchSidebarData(post);

    return () => {
      reset();
    };
  }, [post, initializePost, fetchSidebarData, reset]);

  const handleTagClick = (tag: string) => {
    router.push(`/blog?tag=${encodeURIComponent(tag)}`);
  };

  const handleLike = async () => {
    try {
      await toggleLike(post.id);
      if (!liked) {
        toast.success("Article liked!");
      }
    } catch {
      toast.error("Failed to like article");
    }
  };

  if (!post) {
    return (
      <section className="flex flex-col min-h-screen">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold mb-6">Blog Post Not Found</h1>
          <p className="text-muted-foreground">
            The blog post you are looking for does not exist or has been removed.
          </p>
        </div>
      </section>
    );
  }

  const authorName = getAuthorName(post.author);

  return (
    <>
      {/* Article Header */}
      <section className="relative bg-card pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4">
          {/* Breadcrumb */}
          <Breadcrumb className="mb-8">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/blog">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/blog">Blog</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="truncate max-w-[200px]">
                  {post.title}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Category Badge */}
          <div className="mb-6">
            <Badge variant="secondary">
              <Bookmark className="h-3 w-3 mr-1" />
              {post.category?.name || "Uncategorized"}
            </Badge>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
            {post.title}
          </h1>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-6 mb-8 text-muted-foreground">
            <div className="flex items-center">
              <Avatar className="h-12 w-12 border-2 border-primary mr-3">
                <AvatarImage src={getAuthorImage(post)} alt={authorName} />
                <AvatarFallback>{authorName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-foreground">{authorName}</p>
              </div>
            </div>
            <div className="flex items-center text-sm gap-1">
              <Calendar className="h-4 w-4" />
              {formatDate(post.createdAt)}
            </div>
            <div className="flex items-center text-sm gap-1">
              <Clock className="h-4 w-4" />
              {post.readTime || "5 min read"}
            </div>
            {/* Like Button */}
            <Button
              variant={liked ? "default" : "outline"}
              size="sm"
              onClick={handleLike}
              className="gap-1"
            >
              <Heart
                className={`h-4 w-4 ${liked ? "fill-current" : ""}`}
              />
              {likeCount}
            </Button>
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
            <p className="text-xl text-muted-foreground leading-relaxed">
              {post.description}
            </p>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar — Table of Contents */}
          <aside className="hidden lg:block lg:w-1/5">
            <TableOfContents />
          </aside>

          {/* Mobile TOC — shown above content on small screens */}
          <div className="lg:hidden">
            <TableOfContents />
          </div>

          {/* Article Content */}
          <div className="lg:w-3/5">
            <Card>
              <CardContent className="p-8">
                {/* Article Body */}
                <div className="prose-blog prose prose-lg dark:prose-invert max-w-none">
                  {post.content ? (
                    <div dangerouslySetInnerHTML={{ __html: post.content }} />
                  ) : (
                    <div className="space-y-6" />
                  )}
                </div>

                {/* Tags */}
                <div className="mt-8 pt-6 border-t border-border">
                  <h3 className="text-lg font-semibold mb-4">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <button key={tag} onClick={() => handleTagClick(tag)}>
                        <Badge
                          variant="secondary"
                          className="cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors"
                        >
                          #{tag}
                        </Badge>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Share Article */}
                {currentUrl && (
                  <ShareArticle
                    title={post.title}
                    url={currentUrl}
                    className="mt-6 pt-6 border-t border-border"
                    inline={true}
                  />
                )}
              </CardContent>
            </Card>

            {/* Comments Section */}
            {/* <section className="mt-12 space-y-8">
              <CommentList comments={comments} />
              <CommentForm
                blogId={post.id}
                onCommentAdded={addComment}
              />
            </section> */}

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <section className="mt-12">
                <h3 className="text-2xl font-bold mb-6">Related Articles</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  {relatedPosts.map((relatedPost) => (
                    <Link
                      key={relatedPost.id}
                      href={`/blog/${relatedPost.slug}`}
                    >
                      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 h-full">
                        <div className="relative w-full h-40">
                          <Image
                            src={
                              relatedPost.imageUrl ||
                              "/images/blog/placeholder.jpg"
                            }
                            alt={relatedPost.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <CardContent className="p-4">
                          <h4 className="font-semibold mb-2 overflow-hidden max-h-[3rem]">
                            {relatedPost.title}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {relatedPost.readTime || "5 min read"}
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right Sidebar */}
          <aside className="lg:w-1/5 space-y-8">
            {/* Share for mobile */}
            <div className="lg:hidden">
              {currentUrl && (
                <ShareArticle title={post.title} url={currentUrl} />
              )}
            </div>

            <BlogSidebar
              popularPosts={popularPosts}
              tags={allTags}
              onTagClick={handleTagClick}
              activeTag={null}
            />
          </aside>
        </div>
      </main>
    </>
  );
}
