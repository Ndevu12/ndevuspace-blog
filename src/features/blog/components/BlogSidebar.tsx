"use client";

import { BlogPost } from "@/types/blog";
import Image from "next/image";
import Link from "next/link";
import { getSafeImageSrc } from "@/lib/blogUtils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
      {/* Popular Posts */}
      <Card>
        <CardHeader>
          <h3 className="font-bold flex items-center">
            <span className="inline-block w-1 h-8 bg-primary rounded-sm mr-2" />
            Popular Posts
          </h3>
        </CardHeader>
        <CardContent className="space-y-4">
          {popularPosts.map((post) => (
            <div key={post.id} className="flex gap-3 group">
              <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden">
                <Image
                  src={getSafeImageSrc(post.imageUrl, "/images/blog/placeholder.jpg")}
                  alt={post.title}
                  fill
                  sizes="64px"
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium group-hover:text-primary transition-colors overflow-hidden max-h-[2.5rem] mb-1">
                  <Link href={`/blog/${post.slug}`} className="hover:underline">
                    {post.title}
                  </Link>
                </h4>
                <p className="text-xs text-muted-foreground">
                  {new Date(post.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Topic Cloud */}
      <Card>
        <CardHeader>
          <h3 className="font-bold flex items-center">
            <span className="inline-block w-1 h-8 bg-primary rounded-sm mr-2" />
            Topic Cloud
          </h3>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, idx) => {
              const isActive = activeTag === tag;
              return (
                <button
                  key={`${tag}-${idx}`}
                  onClick={() => onTagClick?.(tag)}
                >
                  <Badge
                    variant={isActive ? "default" : "secondary"}
                    className={`cursor-pointer transition-colors ${
                      !isActive &&
                      "hover:bg-primary/10 hover:text-primary"
                    }`}
                  >
                    {tag}
                  </Badge>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
