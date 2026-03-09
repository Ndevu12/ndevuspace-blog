"use client";

import { BlogPost } from "@/types/blog";
import Image from "next/image";
import Link from "next/link";
import { getAuthorName, getAuthorImage } from "@/lib/blogUtils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Star, Bookmark, ArrowRight, Share2 } from "lucide-react";
import { toast } from "sonner";

interface FeaturedBlogCardProps {
  post: BlogPost;
}

function getCategoryName(category: BlogPost["category"]): string {
  if (!category) return "Uncategorized";
  if (typeof category === "string") return category;
  return category.name || "Uncategorized";
}

export function FeaturedBlogCard({ post }: FeaturedBlogCardProps) {
  const formattedDate = new Date(post.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const authorName = getAuthorName(post.author);
  const categoryName = getCategoryName(post.category);

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    const url = `${window.location.origin}/blog/${post.slug}`;

    if (
      navigator.share &&
      /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      )
    ) {
      navigator.share({ title: post.title, url });
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    }
  };

  return (
    <article>
      <Card className="overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 group">
        <div className="relative">
          <div className="relative w-full h-64 md:h-80 overflow-hidden">
            <Image
              src={post.imageUrl || "/images/blog/placeholder.jpg"}
              alt={post.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Featured Badge */}
          <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground font-bold text-sm px-4 py-2 rounded-full">
            <Star className="h-4 w-4 mr-2" />
            FEATURED
          </Badge>

          {/* Content Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="secondary" className="backdrop-blur-sm text-xs">
                <Bookmark className="h-3 w-3 mr-1" />
                {categoryName}
              </Badge>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold mb-4 group-hover:text-primary transition-colors">
              <Link href={`/blog/${post.slug}`} className="hover:underline">
                {post.title}
              </Link>
            </h2>

            <p className="text-gray-200 mb-6 leading-relaxed text-lg max-w-3xl">
              {post.description}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Avatar className="h-10 w-10 border-2 border-primary">
                  <AvatarImage
                    src={getAuthorImage(post)}
                    alt={authorName}
                  />
                  <AvatarFallback>{authorName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="ml-3">
                  <p className="font-medium text-white">{authorName}</p>
                  <p className="text-sm text-gray-300">
                    {formattedDate} &bull; {post.readTime || "5 min read"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-300 hover:text-primary"
                  onClick={handleShare}
                  title="Share article"
                >
                  <Share2 className="h-4 w-4" />
                </Button>

                <Link href={`/blog/${post.slug}`}>
                  <Button>
                    Read Article
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </article>
  );
}
