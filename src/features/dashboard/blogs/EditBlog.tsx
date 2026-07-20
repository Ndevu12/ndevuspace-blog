"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { toast } from "sonner";
import {
  Save,
  Rocket,
  CalendarClock,
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
import { estimateReadTime } from "@/lib/blogUtils";
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
import { useCategories, useTagInput } from "@/hooks";
import { dashboardBlogService } from "@/features/dashboard/services/dashboardBlogService";
import { blogMediaService } from "@/features/dashboard/services/blogMediaService";
import { useBlogDraftPersistence } from "./hooks/useBlogDraftPersistence";
import { blogFormSchema } from "./validations/editBlogs.validations";

type BlogFormValues = z.infer<typeof blogFormSchema>;

interface EditBlogProps {
  blogId: string;
}

/** Format an ISO datetime to a `datetime-local` input value in local time. */
function toDateTimeLocal(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

export function EditBlog({ blogId }: EditBlogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const { categories } = useCategories();
  const { tags, tagInput, setTagInput, addTag, removeTag, handleKeyDown, resetTags } = useTagInput();
  const [dataLoading, setDataLoading] = useState(true);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<BlogFormValues>({
    resolver: zodResolver(blogFormSchema),
    defaultValues: {
      title: "",
      description: "",
      content: "",
      categoryId: "",
      tags: [],
      imageUrl: "",
      metaTitle: "",
      metaDescription: "",
      status: "draft",
      publishAt: "",
    },
  });

  const status = watch("status");
  const publishAt = watch("publishAt") ?? "";
  const content = watch("content");
  const categoryId = watch("categoryId") ?? "";
  const imageUrl = watch("imageUrl") ?? "";
  const [sourceFingerprint, setSourceFingerprint] = useState<string>("");

  const canHydrateDraft = useMemo(
    () => (draft: { sourceFingerprint?: string }) =>
      !draft.sourceFingerprint || draft.sourceFingerprint === sourceFingerprint,
    [sourceFingerprint]
  );

  const { clearDraft } = useBlogDraftPersistence({
    mode: "edit",
    blogId,
    control,
    reset,
    tags,
    resetTags,
    isDirty,
    sourceFingerprint,
    isReady: !dataLoading && Boolean(sourceFingerprint),
    canHydrateDraft,
  });

  // Load blog data
  useEffect(() => {
    async function loadData() {
      try {
        const blog = await dashboardBlogService.getBlogById(blogId);

        if (!blog) {
          toast.error("Blog not found");
          router.push("/dashboard/blogs");
          return;
        }

        const categoryId =
          typeof blog.category === "object"
            ? blog.category?.id || ""
            : (blog.category as unknown as string) || "";

        const formTags = blog.tags || [];
        const baselineValues = {
          title: blog.title,
          description: blog.description,
          content: blog.content || "",
          categoryId,
          tags: formTags,
          imageUrl: blog.imageUrl || "",
          metaTitle: blog.metaTitle || "",
          metaDescription: blog.metaDescription || "",
          status:
            (blog.status as "published" | "draft" | "scheduled") || "draft",
          publishAt: toDateTimeLocal(blog.publishAt),
        };
        const nextSourceFingerprint = JSON.stringify(baselineValues);

        resetTags(formTags);
        reset(baselineValues);
        setSourceFingerprint(nextSourceFingerprint);
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
        formData.append("tags", JSON.stringify(data.tags ?? []));
        formData.append("readTime", estimateReadTime(data.content));
        if (data.imageUrl) formData.append("imageUrl", data.imageUrl);
        if (data.metaTitle) formData.append("metaTitle", data.metaTitle);
        if (data.metaDescription) formData.append("metaDescription", data.metaDescription);
        formData.append("status", data.status);
        if (data.status === "scheduled" && data.publishAt) {
          formData.append("publishAt", new Date(data.publishAt).toISOString());
        }

        await dashboardBlogService.updateBlog(blogId, formData);
        clearDraft();
        toast.success(
          data.status === "scheduled"
            ? "Blog scheduled."
            : "Blog updated successfully!"
        );
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

  function handleSchedule() {
    const when = publishAt;
    if (!when) {
      toast.error("Pick a date & time to schedule");
      return;
    }
    if (new Date(when) <= new Date()) {
      toast.error("Pick a time in the future");
      return;
    }
    setValue("status", "scheduled");
    handleSubmit(onSubmit)();
  }

  async function handleImageUpload(file: File | null) {
    if (!file) return;
    setIsUploadingImage(true);
    try {
      const uploadedUrl = await blogMediaService.uploadFeaturedImage(file, { blogId });
      setValue("imageUrl", uploadedUrl, { shouldDirty: true, shouldValidate: true });
      toast.success("Image uploaded successfully.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to upload image");
    } finally {
      setIsUploadingImage(false);
    }
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
          {publishAt && (
            <Button
              variant="secondary"
              onClick={handleSchedule}
              disabled={isPending}
            >
              <CalendarClock className="mr-2 h-4 w-4" />
              Schedule
            </Button>
          )}
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
              <RichTextEditor
                content={content}
                onContentChange={(nextContent) =>
                  setValue("content", nextContent, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
              />
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
                  onCheckedChange={(checked: boolean) =>
                    setValue("status", checked ? "published" : "draft")
                  }
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {status === "published"
                  ? "This post is live."
                  : status === "scheduled"
                    ? "This post will publish automatically at the time below."
                    : "This post is a draft."}
              </p>

              <div className="space-y-2 border-t border-border pt-4">
                <Label htmlFor="publish-at">Schedule for later</Label>
                <Input
                  id="publish-at"
                  type="datetime-local"
                  {...register("publishAt")}
                />
                <p className="text-xs text-muted-foreground">
                  Set a future time and press <strong>Schedule</strong> — it
                  publishes automatically then (checked every minute), no further
                  action needed.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Category *</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={categoryId}
                onValueChange={(v) => setValue("categoryId", v ?? "")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
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
                <div className="space-y-2">
                  <Label htmlFor="imageUpload">Or upload from computer</Label>
                  <Input
                    id="imageUpload"
                    type="file"
                    accept="image/*"
                    disabled={isUploadingImage}
                    onChange={(e) => {
                      const selected = e.target.files?.[0] ?? null;
                      void handleImageUpload(selected);
                      e.currentTarget.value = "";
                    }}
                  />
                  <p className="text-xs text-muted-foreground">
                    {isUploadingImage
                      ? "Uploading image..."
                      : imageUrl
                        ? "Uploaded image URL is filled above. You can still paste a different URL."
                        : "Upload an image or paste a URL above."}
                  </p>
                </div>
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
