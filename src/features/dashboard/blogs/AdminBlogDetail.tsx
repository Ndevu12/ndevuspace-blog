"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { formatDistanceToNow, format } from "date-fns";
import { toast } from "sonner";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Eye,
  Clock,
  Calendar,
  Tag,
  Loader2,
  ExternalLink,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { AdminBlogPost } from "@/types/admin";
import { dashboardBlogService } from "@/features/dashboard/services/dashboardBlogService";

interface AdminBlogDetailProps {
  blogId: string;
}

function getSafeImageSrc(imageUrl?: string): string | null {
  if (!imageUrl) return null;

  const trimmed = imageUrl.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith("/")) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return trimmed;
    }
    return null;
  } catch {
    return null;
  }
}

export function AdminBlogDetail({ blogId }: AdminBlogDetailProps) {
  const router = useRouter();
  const [blog, setBlog] = useState<AdminBlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    async function loadBlog() {
      try {
        setLoading(true);
        setError(null);
        const data = await dashboardBlogService.getBlogById(blogId);
        if (!data) {
          setError("Blog not found");
          return;
        }
        setBlog(data as AdminBlogPost);
      } catch (err) {
        setError("Failed to load blog details");
        console.error("Error loading blog:", err);
      } finally {
        setLoading(false);
      }
    }
    if (blogId) loadBlog();
  }, [blogId]);

  function handleDelete() {
    startTransition(async () => {
      try {
        await dashboardBlogService.deleteBlog(blogId);
        toast.success("Blog deleted successfully");
        router.push("/dashboard/blogs");
      } catch {
        toast.error("Failed to delete blog");
      }
    });
  }

  function handleToggleStatus() {
    if (!blog) return;
    startTransition(async () => {
      try {
        const newStatus = blog.status === "published" ? "draft" : "published";
        await dashboardBlogService.updateBlogStatus(blogId, newStatus);
        setBlog({ ...blog, status: newStatus });
        toast.success(`Blog ${newStatus === "published" ? "published" : "unpublished"}`);
      } catch {
        toast.error("Failed to update status");
      }
    });
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Skeleton className="h-[300px] w-full" />
            <Skeleton className="h-[200px] w-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-[200px] w-full" />
            <Skeleton className="h-[120px] w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <p className="text-lg font-medium text-destructive">
          {error || "Blog not found"}
        </p>
        <Button variant="outline" onClick={() => router.push("/dashboard/blogs")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Blogs
        </Button>
      </div>
    );
  }

  const authorName =
    typeof blog.author === "object"
      ? `${blog.author.firstName} ${blog.author.lastName}`
      : "Unknown Author";

  const categoryName =
    typeof blog.category === "object" ? blog.category?.name : "Uncategorized";
  const blogImageSrc = getSafeImageSrc(blog.imageUrl);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dashboard/blogs")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Badge variant={blog.status === "published" ? "default" : "secondary"}>
            {blog.status || "draft"}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleStatus}
            disabled={isPending}
          >
            {blog.status === "published" ? (
              <ToggleLeft className="mr-2 h-4 w-4" />
            ) : (
              <ToggleRight className="mr-2 h-4 w-4" />
            )}
            {blog.status === "published" ? "Unpublish" : "Publish"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/dashboard/blogs/${blogId}/edit`)}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
          {blog.slug && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(`/blog/${blog.slug}`, "_blank")}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              View Live
            </Button>
          )}
          <AlertDialog>
            <AlertDialogTrigger
              render={<Button variant="destructive" size="sm" disabled={isPending} />}
            >
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Delete
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Blog</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete &quot;{blog.title}&quot;? This
                  action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Title & Image */}
          <Card>
            <CardContent className="pt-6">
              <h1 className="text-2xl font-bold mb-4">{blog.title}</h1>
              <p className="text-muted-foreground mb-4">{blog.description}</p>

              {blogImageSrc && (
                <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-4">
                  <Image
                    src={blogImageSrc}
                    alt={blog.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Content Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Content Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="prose prose-blog dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{
                  __html: blog.content || "<p>No content</p>",
                }}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>
                  Created{" "}
                  {format(new Date(blog.createdAt), "MMM d, yyyy")}
                </span>
              </div>
              {blog.updatedAt && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>
                    Updated{" "}
                    {formatDistanceToNow(new Date(blog.updatedAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <span>{blog.readTime || "5 min read"}</span>
              </div>

              <Separator />

              <div className="text-sm">
                <span className="text-muted-foreground">Author: </span>
                <span className="font-medium">{authorName}</span>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Category: </span>
                <Badge variant="outline">{categoryName}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {blog.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      <Tag className="mr-1 h-3 w-3" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold">
                    {blog.viewsCount || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Views</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {blog.likesCount || blog.likes || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Likes</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {blog.commentsCount || blog.comments?.length || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Comments</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-xs text-muted-foreground">Shares</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SEO */}
          {(blog.metaTitle || blog.metaDescription) && (
            <Card>
              <CardHeader>
                <CardTitle>SEO</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {blog.metaTitle && (
                  <div>
                    <p className="text-xs text-muted-foreground">Meta Title</p>
                    <p className="text-sm">{blog.metaTitle}</p>
                  </div>
                )}
                {blog.metaDescription && (
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Meta Description
                    </p>
                    <p className="text-sm">{blog.metaDescription}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
