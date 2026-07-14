"use client";

import type {
  AdjacentBlogs,
  BlogCategory,
  BlogPost,
  PaginatedTagsResponse,
} from "@/types/blog";
import Image from "next/image";
import { useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArticleCodeBlocks } from "./components/ArticleCodeBlocks";
import { BlogCard } from "./components/BlogCard";
import { BlogSearch } from "./components/BlogSearch";
import { BlogSidebar } from "./components/BlogSidebar";
import { CategoryTabs } from "./components/CategoryTabs";
import { MobileTocButton } from "./components/MobileTocButton";
import { PostNavigation } from "./components/PostNavigation";
import { ShareArticle } from "./components/ShareArticle";
import { TableOfContents } from "./components/TableOfContents";
import { TopicCloud } from "./components/TopicCloud";
import { useBlogDetailStore } from "./detailStore";
import { useHydrateTopicCloud } from "./topicCloudStore";
import {
  getAuthorName,
  getAuthorImage,
  getPostImageSrc,
  getReadTime,
  formatDate,
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
import { Button } from "@/components/ui/button";
import { ReadingProgress } from "@/components/shared/ReadingProgress";
import { Reveal } from "@/components/shared/Reveal";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { fadeRise, fadeScale, staggerContainer, SPRING_SNAPPY } from "@/lib/motion";
import { MobileNav } from "@/components/shared/MobileNav";
import { Calendar, Clock, Heart, LayoutGrid, Search, Tag } from "lucide-react";
import { toast } from "sonner";

interface BlogDetailPageProps {
  post: BlogPost;
  categories: BlogCategory[];
  adjacent?: AdjacentBlogs;
  initialTags: PaginatedTagsResponse;
}

export function BlogDetailPage({
  post,
  categories,
  adjacent,
  initialTags,
}: BlogDetailPageProps) {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();

  useHydrateTopicCloud(initialTags);

  // ─── Store ───
  const {
    relatedPosts,
    liked,
    likeCount,
    currentUrl,
    initializePost,
    fetchRelatedPosts,
    toggleLike,
    trackView,
    reset,
  } = useBlogDetailStore();

  // Initialize on mount / post change
  useEffect(() => {
    initializePost(post);
    fetchRelatedPosts(post);
    trackView(post.id);

    return () => {
      reset();
    };
  }, [post, initializePost, fetchRelatedPosts, trackView, reset]);

  const handleTagClick = (tag: string) => {
    router.push(`/blog?tag=${encodeURIComponent(tag)}`);
  };

  const handleSearch = (query: string) => {
    const q = query.trim();
    router.push(q ? `/blog?search=${encodeURIComponent(q)}` : "/blog");
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
  const heroImageSrc = getPostImageSrc(post);

  return (
    <>
      <ReadingProgress />

      {/* Article Header — staged reveal: breadcrumb → title block → meta → image → lede */}
      <section className="relative bg-card pt-16 pb-16 lg:pt-12">
        <motion.div
          className="max-w-4xl mx-auto px-4"
          variants={staggerContainer(0.09)}
          initial={prefersReducedMotion ? false : "hidden"}
          animate="visible"
        >
          {/* Breadcrumb */}
          <motion.div variants={fadeRise}>
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
          </motion.div>

          {/* Category eyebrow + title */}
          <motion.div variants={fadeRise}>
            <p className="text-eyebrow mb-4">
              {post.category?.name || "Uncategorized"}
            </p>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 leading-tight">
              {post.title}
            </h1>
          </motion.div>

          {/* Meta Information */}
          <motion.div
            variants={fadeRise}
            className="flex flex-wrap items-center gap-6 mb-8"
          >
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
              {getReadTime(post)}
            </span>
          </motion.div>

          {/* Featured Image */}
          {post.imageUrl?.trim() && (
            <motion.div
              variants={fadeScale}
              className="relative w-full h-64 md:h-96 rounded-xl overflow-hidden mb-8"
            >
              <Image
                src={heroImageSrc}
                alt={post.title}
                fill
                className="object-cover"
                priority
              />
            </motion.div>
          )}

          {/* Description */}
          <motion.p
            variants={fadeRise}
            className="text-xl text-foreground/80 leading-relaxed"
          >
            {post.description}
          </motion.p>
        </motion.div>
      </section>

      {/* Floating TOC trigger — mobile only; desktop uses the sidebar TOC */}
      <MobileTocButton />

      {/* Article Content */}
      <main className="max-w-7xl mx-auto px-4 py-12 pb-28 lg:pb-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar — Table of Contents (desktop) */}
          <aside className="hidden lg:block lg:w-1/5">
            <TableOfContents />
          </aside>

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
              <ArticleCodeBlocks contentKey={post.id} />

              {/* Tags */}
              <div className="mt-10 flex flex-col gap-3 border-t border-border pt-6">
                <h3 className="text-eyebrow">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleTagClick(tag)}
                      className="pressable transition-transform duration-150"
                    >
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
                  className="pressable gap-1.5 rounded-full transition-transform"
                >
                  <motion.span
                    animate={
                      liked && !prefersReducedMotion
                        ? { scale: [1, 1.4, 1] }
                        : { scale: 1 }
                    }
                    transition={SPRING_SNAPPY}
                    className="inline-flex"
                  >
                    <Heart
                      className={`h-4 w-4 ${liked ? "fill-current" : ""}`}
                    />
                  </motion.span>
                  <span className="tabular-nums">{likeCount}</span>
                </Button>
              </div>
            </article>

            {/* Chronological navigation */}
            {adjacent && (
              <PostNavigation adjacent={adjacent} className="mt-10" />
            )}

            {/* Related Posts — revealed as the reader reaches them */}
            {relatedPosts.length > 0 && (
              <Reveal className="mt-14">
                <section>
                  <SectionHeading
                    eyebrow="Keep reading"
                    title="Related Articles"
                    className="mb-6"
                  />
                  <div className="grid md:grid-cols-3 gap-6">
                    {relatedPosts.map((relatedPost) => (
                      <BlogCard
                        key={relatedPost.id}
                        post={relatedPost}
                        variant="compact"
                      />
                    ))}
                  </div>
                </section>
              </Reveal>
            )}
          </div>

          {/* Right Sidebar — desktop only; mobile uses the bottom bar below */}
          <aside className="hidden lg:block lg:w-1/5">
            <div className="lg:sticky lg:top-24">
              <BlogSidebar
                categories={categories}
                activeCategory={post.category?.id ?? "all"}
                onCategoryChange={handleCategoryChange}
                isSearchActive={false}
                onTagClick={handleTagClick}
                activeTag={null}
              />
            </div>
          </aside>
        </div>
      </main>

      {/* Mobile bottom bar — category & topic browsing in sheets */}
      <MobileNav
        items={[
          {
            key: "categories",
            label: "Categories",
            icon: <LayoutGrid />,
            title: "Categories",
            content: (close) => (
              <CategoryTabs
                variant="sidebar"
                categories={categories}
                activeCategory={post.category?.id ?? "all"}
                onCategoryChange={(id) => {
                  handleCategoryChange(id);
                  close();
                }}
              />
            ),
          },
          {
            key: "search",
            label: "Search",
            icon: <Search />,
            title: "Search articles",
            content: (close) => (
              <BlogSearch
                autoFocus
                onSearch={(query) => {
                  handleSearch(query);
                  close();
                }}
              />
            ),
          },
          {
            key: "topics",
            label: "Topics",
            icon: <Tag />,
            title: "Topic Cloud",
            content: (close) => (
              <TopicCloud
                onTagClick={(tag) => {
                  handleTagClick(tag);
                  close();
                }}
              />
            ),
          },
        ]}
      />
    </>
  );
}
