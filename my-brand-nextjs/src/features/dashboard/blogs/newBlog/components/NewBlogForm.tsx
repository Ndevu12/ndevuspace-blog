"use client";

import React, {
  forwardRef,
  useImperativeHandle,
  useState,
  useEffect,
} from "react";
import { BlogFormData, NewBlogFormProps } from "../types";
import { BasicInfoSection } from "./BasicInfoSection";
import { ContentSection } from "./ContentSection";
import { CategorySection } from "./CategorySection";
import { SEOSection } from "./SEOSection";
import { PublishingSection } from "./PublishingSection";
import Button from "@/components/atoms/Button/Button";

const NewBlogForm = forwardRef<HTMLFormElement, NewBlogFormProps>(
  (
    {
      onSubmit,
      onPreview,
      isSubmitting = false,
      initialData,
      isEditMode = false,
    },
    ref
  ) => {
    // Create a stable default date that's consistent between server and client
    const getDefaultPublishDate = () => {
      // Use a fixed date format that's consistent across server/client
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      return now.toISOString().slice(0, 16);
    };

    // Default form data
    const defaultData: BlogFormData = {
      title: "",
      subtitle: "",
      description: "",
      content: "",
      categoryId: "",
      tags: [],
      readingTime: "5",
      author: "Ndevu",
      imageUrl: "",
      imageCaption: "",
      metaTitle: "",
      metaDescription: "",
      status: "draft",
      publishDate: getDefaultPublishDate(),
    };

    const [data, setData] = useState<BlogFormData>(() => {
      return initialData ? { ...defaultData, ...initialData } : defaultData;
    });

    const [errors, setErrors] = useState<
      Partial<Record<keyof BlogFormData, string>>
    >({});

    // Update form data when initialData changes (for edit mode)
    useEffect(() => {
      if (initialData && Object.keys(initialData).length > 0) {
        setData((prev) => ({
          ...prev,
          ...initialData,
        }));
      }
    }, [initialData]);

    useImperativeHandle(
      ref,
      () =>
        ({
          getFormData: () => data,
          requestPreview: () => {
            handlePreview();
          },
          saveDraft: () => {
            handleSaveDraft();
          },
          submitForm: () => {
            if (validateForm()) {
              const submitData = {
                ...data,
                metaTitle: data.metaTitle || data.title,
                metaDescription: data.metaDescription || data.description,
              };
              onSubmit(submitData);
            }
          },
        } as any)
    );

    const updateFormData = (field: keyof BlogFormData, value: any) => {
      setData((prev) => ({
        ...prev,
        [field]: value,
      }));

      // Clear error when field is updated
      if (errors[field]) {
        setErrors((prev) => ({
          ...prev,
          [field]: undefined,
        }));
      }
    };

    const validateForm = (): boolean => {
      const newErrors: Partial<Record<keyof BlogFormData, string>> = {};

      if (!data.title.trim()) {
        newErrors.title = "Title is required";
      }

      if (!data.description.trim()) {
        newErrors.description = "Description is required";
      }

      if (!data.content.trim()) {
        newErrors.content = "Content is required";
      }

      if (!data.categoryId) {
        newErrors.categoryId = "Category is required";
      }

      if (data.tags.length === 0) {
        newErrors.tags = "At least one tag is required";
      }

      if (!data.featuredImage && !data.imageUrl) {
        newErrors.featuredImage = "Featured image is required";
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const handlePreview = () => {
      // Auto-set meta fields if not provided
      const previewData = {
        ...data,
        metaTitle: data.metaTitle || data.title,
        metaDescription: data.metaDescription || data.description,
      };
      onPreview(previewData);
    };

    const handleSaveDraft = () => {
      const draftData = {
        ...data,
        status: "draft" as const,
      };
      onSubmit(draftData);
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateForm()) {
        return;
      }

      // Auto-set meta fields if not provided
      const submitData = {
        ...data,
        metaTitle: data.metaTitle || data.title,
        metaDescription: data.metaDescription || data.description,
      };

      await onSubmit(submitData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <BasicInfoSection
          data={data}
          errors={errors}
          onChange={updateFormData}
        />

        {/* Content */}
        <ContentSection
          data={data}
          errors={errors}
          onChange={updateFormData}
          isEditMode={isEditMode}
        />

        {/* Categorization */}
        <CategorySection
          data={data}
          errors={errors}
          onChange={updateFormData}
        />

        {/* SEO Settings */}
        <SEOSection data={data} errors={errors} onChange={updateFormData} />

        {/* Publishing Options */}
        <PublishingSection
          data={data}
          errors={errors}
          onChange={updateFormData}
        />

        {/* Form Actions */}
        <div className="flex flex-col md:flex-row justify-end gap-4 pb-10">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              if (
                confirm(
                  "Are you sure you want to discard this blog? All changes will be lost."
                )
              ) {
                // TODO: Redirect to blogs list
                window.location.href = "/dashboard/blogs";
              }
            }}
            icon={<i className="fas fa-trash" />}
            iconPosition="left"
          >
            Discard
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting}
            loadingText="Saving..."
            icon={<i className="fas fa-paper-plane" />}
            iconPosition="left"
            className="bg-yellow-500 hover:bg-yellow-400 text-black font-medium"
          >
            Save & Publish
          </Button>
        </div>
      </form>
    );
  }
);

NewBlogForm.displayName = "NewBlogForm";

export { NewBlogForm };
