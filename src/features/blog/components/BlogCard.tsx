"use client";

import { BlogPost } from "@/types/blog";
import Image from "next/image";
import Link from "next/link";
import {
  getAuthorName,
  getAuthorImage,
  formatDate,
  getSafeImageSrc,
} from "@/lib/blogUtils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Bookmark, Clock } from "lucide-react";

interface BlogCardProps {
  post: BlogPost;
}

// Helper: get category name from string or object
function getCategoryName(category: BlogPost["category"]): string {
  if (!category) return "Uncategorized";
  if (typeof category === "string") return category;
  return category.name || "Uncategorized";
}

export function BlogCard({ post }: BlogCardProps) {
  const authorName = getAuthorName(post.author);
  const categoryName = getCategoryName(post.category);
  const imageSrc = getSafeImageSrc(post.imageUrl, "/images/blog/placeholder.jpg");

  return (
    <article>
      <Card className="overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 group h-full flex flex-col">
        {/* Image */}
        <div className="relative">
          <div className="relative w-full h-48 overflow-hidden">
            <Image
              src={imageSrc}
              alt={post.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
          </div>
          {post.isNew && (
            <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground font-bold text-xs">
              NEW
            </Badge>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        </div>

        {/* Content */}
        <CardContent className="p-5 flex flex-col flex-1">
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge variant="secondary" className="text-xs">
              <Bookmark className="h-3 w-3 mr-1" />
              {categoryName}
            </Badge>
            {post.tags.slice(0, 1).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors">
            <Link href={`/blog/${post.slug}`} className="hover:underline">
              {post.title}
            </Link>
          </h3>

          {/* Description */}
          <p className="text-muted-foreground mb-4 leading-relaxed overflow-hidden max-h-[4.5rem] flex-1">
            {post.description}
          </p>

          {/* Footer */}
          <div className="flex justify-between items-center border-t border-border pt-4 mt-auto">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8 border border-primary">
                <AvatarImage src={getAuthorImage(post)} alt={authorName} />
                <AvatarFallback className="text-xs">
                  {authorName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-xs text-muted-foreground">
                  {formatDate(post.createdAt)}
                </p>
                <p className="text-xs text-muted-foreground/70 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {post.readTime || "5 min read"}
                </p>
              </div>
            </div>

            <Link
              href={`/blog/${post.slug}`}
              className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
            >
              Read
            </Link>
          </div>
        </CardContent>
      </Card>
    </article>
  );
}
