"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { toast } from "sonner";
import {
  Save,
  Rocket,
  Loader2,
  ArrowLeft,
  X,
  Plus,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { RichTextEditor } from "@/components/editor/RichTextEditor";
import { adminBlogService } from "@/services/adminBlogService";
import { useCategories, useTagInput } from "@/hooks";

const blogFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  content: z.string().min(20, "Content must be at least 20 characters"),
  categoryId: z.string().min(1, "Please select a category"),
  tags: z.array(z.string()).optional(),
  readingTime: z.string().optional(),
  imageUrl: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  status: z.enum(["published", "draft"]),
});

type BlogFormValues = z.infer<typeof blogFormSchema>;

interface EditBlogProps {
  blogId: string;
}

export function EditBlog({ blogId }: EditBlogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { categories } = useCategories();
  const { tags, tagInput, setTagInput, addTag, removeTag, handleKeyDown, resetTags } = useTagInput();
  const [content, setContent] = useState("");
  const [dataLoading, setDataLoading] = useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<BlogFormValues>({
    resolver: zodResolver(blogFormSchema),
    defaultValues: {
      title: "",
      description: "",
      content: "",
      categoryId: "",
      tags: [],
      readingTime: "5",
      imageUrl: "",
      metaTitle: "",
      metaDescription: "",
      status: "draft",
    },
  });

  const status = watch("status");

  // Load blog data
  useEffect(() => {
    async function loadData() {
      try {
        const blog = await adminBlogService.getBlogById(blogId);

        if (!blog) {
          toast.error("Blog not found");
          router.push("/dashboard/blogs");
          return;
        }

        const categoryId =
          typeof blog.category === "object"
            ? blog.category?._id || ""
            : (blog.category as unknown as string) || "";

        const formTags = blog.tags || [];
        resetTags(formTags);
        setContent(blog.content || "");

        reset({
          title: blog.title,
          description: blog.description,
          content: blog.content || "",
          categoryId,
          tags: formTags,
          readingTime: blog.readTime?.replace(" min read", "") || "5",
          imageUrl: blog.imageUrl || "",
          metaTitle: blog.metaTitle || "",
          metaDescription: blog.metaDescription || "",
          status: (blog.status as "published" | "draft") || "draft",
        });
      } catch (error) {
        console.error("Error loading blog:", error);
        toast.error("Failed to load blog data");
        router.push("/dashboard/blogs");
      } finally {
        setDataLoading(false);
      }
    }
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blogId, router, reset]);

  // Sync content with form
  useEffect(() => {
    setValue("content", content);
  }, [content, setValue]);

  // Sync tags with form
  useEffect(() => {
    setValue("tags", tags);
  }, [tags, setValue]);

  function onSubmit(data: BlogFormValues) {
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("title", data.title);
        formData.append("description", data.description);
        formData.append("content", data.content);
        if (data.categoryId) formData.append("category", data.categoryId);
        if (data.tags?.length) formData.append("tags", JSON.stringify(data.tags));
        if (data.readingTime) formData.append("readTime", `${data.readingTime} min read`);
        if (data.imageUrl) formData.append("imageUrl", data.imageUrl);
        if (data.metaTitle) formData.append("metaTitle", data.metaTitle);
        if (data.metaDescription) formData.append("metaDescription", data.metaDescription);
        formData.append("status", data.status);

        await adminBlogService.updateBlog(blogId, formData);
        toast.success("Blog updated successfully!");
        router.push("/dashboard/blogs");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to update blog"
        );
      }
    });
  }

  function handleSaveDraft() {
    setValue("status", "draft");
    handleSubmit(onSubmit)();
  }

  function handlePublish() {
    setValue("status", "published");
    handleSubmit(onSubmit)();
  }

  if (dataLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Skeleton className="h-[200px] w-full" />
            <Skeleton className="h-[400px] w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-[120px] w-full" />
            <Skeleton className="h-[120px] w-full" />
            <Skeleton className="h-[120px] w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Edit Blog</h1>
            <p className="text-muted-foreground">Update your blog post</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleSaveDraft}
            disabled={isPending}
          >
            <Save className="mr-2 h-4 w-4" />
            Save Draft
          </Button>
          <Button onClick={handlePublish} disabled={isPending}>
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Rocket className="mr-2 h-4 w-4" />
            )}
            Update & Publish
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Blog Details</CardTitle>
              <CardDescription>Update your post information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input id="title" placeholder="Blog title" {...register("title")} />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description"
                  rows={3}
                  {...register("description")}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">
                    {errors.description.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Content *</CardTitle>
              <CardDescription>Edit your blog content</CardDescription>
            </CardHeader>
            <CardContent>
              <RichTextEditor content={content} onContentChange={setContent} />
              {errors.content && (
                <p className="text-sm text-destructive mt-2">
                  {errors.content.message}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Publish Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="publish-switch">Published</Label>
                <Switch
                  id="publish-switch"
                  checked={status === "published"}
                  onCheckedChange={(checked) =>
                    setValue("status", checked ? "published" : "draft")
                  }
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {status === "published"
                  ? "This post is live."
                  : "This post is a draft."}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Category *</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={watch("categoryId")}
                onValueChange={(v) => setValue("categoryId", String(v ?? ""))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat._id} value={cat._id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categoryId && (
                <p className="text-sm text-destructive mt-2">
                  {errors.categoryId.message}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Add tag"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <Button type="button" variant="outline" size="icon" onClick={addTag}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <button
                        type="button"
                        aria-label="remove tag"
                        onClick={() => removeTag(tag)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Media & SEO</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="imageUrl">Featured Image URL</Label>
                <Input id="imageUrl" placeholder="https://..." {...register("imageUrl")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="readingTime">Reading Time (min)</Label>
                <Input id="readingTime" type="number" min="1" {...register("readingTime")} />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="metaTitle">Meta Title</Label>
                <Input id="metaTitle" placeholder="SEO title" {...register("metaTitle")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="metaDescription">Meta Description</Label>
                <Textarea
                  id="metaDescription"
                  placeholder="SEO description"
                  rows={2}
                  {...register("metaDescription")}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
