"use client";

import type { BlogCategory, BlogPost } from "@/types/blog";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { BlogSidebar } from "./components/BlogSidebar";
import { ShareArticle } from "./components/ShareArticle";
import { TableOfContents } from "./components/TableOfContents";
import { useBlogDetailStore } from "./detailStore";
import {
  getAuthorName,
  getAuthorImage,
  formatDate,
  getSafeImageSrc,
} from "@/lib/blogUtils";
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
import { ReadingProgress } from "@/components/shared/ReadingProgress";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Calendar, Clock, Heart } from "lucide-react";
import { toast } from "sonner";

interface BlogDetailPageProps {
  post: BlogPost;
  categories: BlogCategory[];
}

export function BlogDetailPage({ post, categories }: BlogDetailPageProps) {
  const router = useRouter();

  // ─── Store ───
  const {
    allTags,
    relatedPosts,
    liked,
    likeCount,
    currentUrl,
    initializePost,
    fetchSidebarData,
    toggleLike,
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

  const handleCategoryChange = (categoryId: string) => {
    if (categoryId === "all") {
      router.push("/blog");
      return;
    }
    const cat = categories.find((c) => c.id === categoryId);
    if (cat) {
      router.push(`/blog?category=${encodeURIComponent(cat.name)}`);
    }
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
  const heroImageSrc = getSafeImageSrc(post.imageUrl, "/images/blog/placeholder.jpg");

  return (
    <>
      <ReadingProgress />

      {/* Article Header */}
      <section className="relative bg-card pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4">
          {/* Breadcrumb */}
          <Breadcrumb className="mb-8">
            <BreadcrumbList>
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

          {/* Category eyebrow */}
          <p className="text-eyebrow mb-4">
            {post.category?.name || "Uncategorized"}
          </p>

          {/* Title */}
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 leading-tight">
            {post.title}
          </h1>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-6 mb-8">
            <div className="flex items-center">
              <Avatar className="h-12 w-12 border-2 border-primary mr-3">
                <AvatarImage src={getAuthorImage(post)} alt={authorName} />
                <AvatarFallback>{authorName.charAt(0)}</AvatarFallback>
              </Avatar>
              <p className="font-medium text-foreground">{authorName}</p>
            </div>
            <span className="text-meta flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {formatDate(post.createdAt)}
            </span>
            <span className="text-meta flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {post.readTime || "5 min read"}
            </span>
          </div>

          {/* Featured Image */}
          {post.imageUrl?.trim() && (
            <div className="relative w-full h-64 md:h-96 rounded-xl overflow-hidden mb-8">
              <Image
                src={heroImageSrc}
                alt={post.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Description */}
          <p className="text-xl text-foreground/80 leading-relaxed">
            {post.description}
          </p>
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

          {/* Article Content — long-form reads on the open page, no card chrome */}
          <div className="lg:w-3/5">
            <article>
              <div
                className="prose-blog prose prose-lg dark:prose-invert max-w-none"
                data-article-content
              >
                {post.content ? (
                  <div dangerouslySetInnerHTML={{ __html: post.content }} />
                ) : (
                  <div className="space-y-6" />
                )}
              </div>

              {/* Tags */}
              <div className="mt-10 flex flex-col gap-3 border-t border-border pt-6">
                <h3 className="text-eyebrow">Tags</h3>
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

              {/* Actions — share & appreciation in one cluster */}
              <div className="mt-6 flex flex-wrap items-end justify-between gap-6 border-t border-border pt-6">
                {currentUrl && (
                  <ShareArticle title={post.title} url={currentUrl} />
                )}
                <Button
                  variant={liked ? "default" : "outline"}
                  size="sm"
                  onClick={handleLike}
                  className="gap-1.5 rounded-full"
                >
                  <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
                  <span className="tabular-nums">{likeCount}</span>
                </Button>
              </div>
            </article>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <section className="mt-14">
                <SectionHeading
                  eyebrow="Keep reading"
                  title="Related Articles"
                  className="mb-6"
                />
                <div className="grid md:grid-cols-3 gap-6">
                  {relatedPosts.map((relatedPost) => (
                    <Link
                      key={relatedPost.id}
                      href={`/blog/${relatedPost.slug}`}
                      className="group h-full"
                    >
                      <Card className="h-full gap-0 overflow-hidden py-0 transition-all duration-300 group-hover:ring-primary/40 group-hover:shadow-[0_16px_40px_-18px] group-hover:shadow-primary/35 motion-safe:group-hover:-translate-y-0.5">
                        <div className="relative aspect-video overflow-hidden">
                          <Image
                            src={getSafeImageSrc(
                              relatedPost.imageUrl,
                              "/images/blog/placeholder.jpg"
                            )}
                            alt={relatedPost.title}
                            fill
                            sizes="(max-width: 768px) 100vw, 25vw"
                            className="object-cover transition-transform duration-300 motion-safe:group-hover:scale-[1.03]"
                          />
                        </div>
                        <CardContent className="flex flex-col gap-2 p-4">
                          <h4 className="line-clamp-2 text-base font-semibold leading-snug transition-colors duration-200 group-hover:text-primary">
                            {relatedPost.title}
                          </h4>
                          <p className="text-meta">
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
          <aside className="lg:w-1/5">
            <div className="lg:sticky lg:top-24">
              <BlogSidebar
                categories={categories}
                activeCategory={post.category?.id ?? "all"}
                onCategoryChange={handleCategoryChange}
                isSearchActive={false}
                tags={allTags}
                onTagClick={handleTagClick}
                activeTag={null}
              />
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}
