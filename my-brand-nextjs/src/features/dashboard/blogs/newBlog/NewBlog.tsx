"use client";

import React, { useState, useRef, useEffect } from "react";
import Typography from "@/components/atoms/Typography";
import Button from "@/components/atoms/Button";
import { NewBlogForm, PreviewModal } from "./components";
import { BlogFormData } from "./types";
import { buildBlogFormData } from "./utils/dataTransform";
import { blogAdminService } from "../allBlogs/services";
import { useRouter } from "next/navigation";
import { getAuthorName } from "utils/blogUtils";
import { Loading } from "@/components/atoms/Loading";

interface NewBlogProps {
  blogId?: string; // Optional blog ID for edit mode
}

export default function NewBlog({ blogId }: NewBlogProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<BlogFormData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [initialData, setInitialData] = useState<
    Partial<BlogFormData> | undefined
  >(undefined);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  const isEditMode = Boolean(blogId);

  // Load blog data for editing
  useEffect(() => {
    const loadBlogData = async () => {
      if (isEditMode && blogId) {
        setIsLoading(true);
        try {
          const blog = await blogAdminService.getAdminBlog(blogId);
          if (blog) {
            // Helper function to safely format dates
            const formatDateForInput = (dateString?: string) => {
              if (!dateString) return undefined;
              try {
                const date = new Date(dateString);
                // Ensure we get a consistent format
                date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
                return date.toISOString().slice(0, 16);
              } catch {
                return undefined;
              }
            };

            // Convert BlogPost to BlogFormData format
            const blogFormData = {
              title: blog.title,
              subtitle: (blog as any).subtitle || "",
              description: blog.description,
              content: blog.content || "",
              categoryId:
                typeof blog.category === "object"
                  ? blog.category._id
                  : (blog.category as unknown as string) || "",
              tags: blog.tags,
              readingTime: blog.readTime?.replace(" min read", "") || "5",
              author: getAuthorName(blog.author),
              imageUrl: blog.imageUrl,
              imageCaption: (blog as any).imageCaption || "",
              metaTitle: (blog as any).metaTitle || blog.title,
              metaDescription:
                (blog as any).metaDescription || blog.description,
              status:
                ((blog as any).status as "published" | "draft") || "draft",
              publishDate:
                formatDateForInput((blog as any).publishDate) ||
                formatDateForInput(blog.createdAt),
            };

            setInitialData(blogFormData);
          } else {
            console.error("Blog not found");
            router.push("/dashboard/blogs");
          }
        } catch (error) {
          console.error("Error loading blog:", error);
          router.push("/dashboard/blogs");
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadBlogData();
  }, [blogId, isEditMode, router]);

  const handlePreview = (data: BlogFormData) => {
    setPreviewData(data);
    setIsPreviewOpen(true);
  };

  const handleSubmit = async (data: BlogFormData) => {
    setIsSubmitting(true);
    try {
      const formData = buildBlogFormData(data);

      if (isEditMode && blogId) {
        // Update existing blog - FormData only
        await blogAdminService.updateBlog(blogId, formData);
        router.push("/dashboard/blogs");
      } else {
        // Create new blog - FormData only
        await blogAdminService.createBlog(formData);
        router.push("/dashboard/blogs");
      }
    } catch (error) {
      console.error("Error saving blog:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = () => {
    if (formRef.current) {
      const data = formRef.current.getFormData();
      handleSubmit({ ...data, status: "draft" });
    }
  };

  const handlePublish = () => {
    if (formRef.current) {
      formRef.current.submitForm();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary to-black/90">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <Typography variant="h1" className="text-2xl font-bold">
              {isEditMode ? "Edit Article" : "Create New Article"}
            </Typography>
            <Typography variant="p" className="text-gray-400">
              {isEditMode
                ? "Update your existing blog article"
                : "Share your thoughts and expertise with the world"}
            </Typography>
          </div>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                if (formRef.current) {
                  const data = formRef.current.getFormData();
                  handlePreview(data);
                }
              }}
              className="flex items-center"
            >
              <i className="fas fa-eye mr-2"></i>
              Preview
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleSaveDraft}
              disabled={isSubmitting}
              className="flex items-center"
            >
              <i className="fas fa-save mr-2"></i>
              Save Draft
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handlePublish}
              disabled={isSubmitting}
              className="flex items-center"
            >
              {isSubmitting ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  {isEditMode ? "Updating..." : "Publishing..."}
                </>
              ) : (
                <>
                  <i className="fas fa-rocket mr-2"></i>
                  {isEditMode ? "Update Article" : "Publish Article"}
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Form */}
        <NewBlogForm
          ref={formRef}
          onSubmit={handleSubmit}
          onPreview={handlePreview}
          isSubmitting={isSubmitting}
          initialData={initialData}
          isEditMode={isEditMode}
        />

        {/* Preview Modal */}
        {isPreviewOpen && previewData && (
          <PreviewModal
            data={previewData}
            onClose={() => setIsPreviewOpen(false)}
          />
        )}
      </div>
    </div>
  );
}
