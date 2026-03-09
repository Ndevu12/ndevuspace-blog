"use client";

import React, { useEffect, useCallback } from "react";
import { PreviewModalProps } from "../types";
import Button from "@/components/atoms/Button/Button";
import Typography from "@/components/atoms/Typography/Typography";

export const PreviewModal: React.FC<PreviewModalProps> = ({
  data,
  onClose,
}) => {
  // Handle escape key press
  const handleEscapeKey = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  // Handle backdrop click
  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  // Add event listeners
  useEffect(() => {
    document.addEventListener("keydown", handleEscapeKey);
    // Prevent body scrolling
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
      document.body.style.overflow = "unset";
    };
  }, [handleEscapeKey]);

  const imageUrl = data.featuredImage
    ? URL.createObjectURL(data.featuredImage)
    : data.imageUrl || "";

  // Helper function to get category name from ID
  const getCategoryName = (categoryId: string): string => {
    const categories: { [key: string]: string } = {
      programming: "Programming",
      webdev: "Web Development",
      design: "UX/UI Design",
      technology: "Technology",
    };
    return categories[categoryId] || "General";
  };

  // Create preview HTML content
  const createPreviewContent = () => {
    return (
      <article className="max-w-4xl mx-auto">
        <header className="mb-8">
          <Typography
            variant="h1"
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            {data.title || "Blog Title"}
          </Typography>

          {data.subtitle && (
            <Typography variant="h2" className="text-xl text-gray-300 mb-4">
              {data.subtitle}
            </Typography>
          )}

          <div className="flex items-center justify-between flex-wrap gap-4 pb-8 border-b border-gray-700/50">
            <div className="flex items-center">
              <img
                src="/images/mypic.png"
                alt="Author"
                className="w-12 h-12 rounded-full border-2 border-yellow-500"
                onError={(e) => {
                  // Fallback to a placeholder if image doesn't exist
                  const target = e.target as HTMLImageElement;
                  target.src = `data:image/svg+xml;base64,${btoa(
                    '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#eab308" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>'
                  )}`;
                }}
              />
              <div className="ml-3">
                <p className="font-medium">{data.author || "Ndevu"}</p>
                <p className="text-sm text-gray-400">Full Stack Developer</p>
              </div>
            </div>

            <div className="flex items-center gap-6 text-sm text-gray-400">
              <span className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                {data.publishDate
                  ? new Date(data.publishDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : new Date().toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
              </span>
              <span className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {data.readingTime || "5"} min read
              </span>
              <span className="flex items-center gap-2">
                <i className="fas fa-eye"></i>
                Preview
              </span>
            </div>
          </div>
        </header>

        {imageUrl && (
          <figure className="mb-10 relative overflow-hidden rounded-xl">
            <img
              src={imageUrl}
              alt={data.title}
              className="w-full h-auto rounded-xl"
              onError={(e) => {
                // Hide the figure if image fails to load
                const figure = (e.target as HTMLElement).closest("figure");
                if (figure) {
                  figure.style.display = "none";
                }
              }}
            />
            {data.imageCaption && (
              <figcaption className="text-sm text-gray-400 mt-2 italic text-center">
                {data.imageCaption}
              </figcaption>
            )}
          </figure>
        )}

        {/* Category badge if selected */}
        {data.categoryId && (
          <div className="mb-6">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
              <i className="fas fa-tag mr-2"></i>
              {getCategoryName(data.categoryId)}
            </span>
          </div>
        )}

        {data.description && (
          <Typography
            variant="p"
            className="text-xl text-gray-300 mb-6 leading-relaxed font-light"
          >
            {data.description}
          </Typography>
        )}

        <div
          className="article-content prose prose-invert prose-lg max-w-none 
                     prose-headings:text-white prose-p:text-gray-300 prose-strong:text-white 
                     prose-em:text-gray-300 prose-blockquote:border-yellow-500 prose-blockquote:text-gray-300
                     prose-code:text-yellow-400 prose-code:bg-gray-800 prose-pre:bg-gray-900
                     prose-a:text-yellow-400 prose-a:hover:text-yellow-300"
          dangerouslySetInnerHTML={{
            __html:
              data.content ||
              "<p class='text-gray-400 italic'>No content yet...</p>",
          }}
        />

        {data.tags.length > 0 && (
          <div className="mt-10 pt-6 border-t border-gray-700/50">
            <Typography
              variant="h3"
              className="text-lg font-bold mb-3 flex items-center"
            >
              <i className="fas fa-tags mr-2 text-yellow-500"></i>
              Tags:
            </Typography>
            <div className="flex flex-wrap gap-2">
              {data.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-secondary text-gray-300 rounded-full text-sm border border-gray-700 hover:border-yellow-500/50 transition-colors"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </article>
    );
  };

  return (
    <div
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-primary w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-secondary z-10 px-6 py-3 flex items-center justify-between border-b border-gray-700">
          <Typography variant="h3" className="font-bold">
            Article Preview
          </Typography>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 rounded"
            title="Close Preview"
            aria-label="Close Preview"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">{createPreviewContent()}</div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-secondary z-10 px-6 py-3 flex justify-end border-t border-gray-700">
          <Button variant="secondary" onClick={onClose}>
            Close Preview
          </Button>
        </div>
      </div>
    </div>
  );
};
