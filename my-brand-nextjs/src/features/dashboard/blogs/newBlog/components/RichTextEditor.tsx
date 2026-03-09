"use client";

import React, { useEffect, useRef, useState } from "react";
import { RichTextEditorProps } from "../types";
import { TINYMCE_CDN_URL } from "@/lib/constants";
import { Loading } from "@/components/atoms/Loading";

declare global {
  interface Window {
    tinymce: any;
  }
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onContentChange,
  placeholder = "Start writing your content here...",
  className = "",
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const editorInstanceRef = useRef<any>(null);
  const onContentChangeRef = useRef(onContentChange);
  const isUpdatingContentRef = useRef(false);
  const [editorId, setEditorId] = useState<string>("");
  const [isClient, setIsClient] = useState(false);

  // Update the ref when onContentChange changes
  useEffect(() => {
    onContentChangeRef.current = onContentChange;
  }, [onContentChange]);

  // Generate stable editor ID on client side only
  useEffect(() => {
    setIsClient(true);
    setEditorId(`editor-${Date.now()}-${Math.floor(Math.random() * 1000)}`);
  }, []);

  useEffect(() => {
    if (!isClient || !editorId) return;

    const loadTinyMCE = async () => {
      // Check if TinyMCE CDN URL is available
      if (!TINYMCE_CDN_URL) {
        console.error(
          "TINYMCE_CDN_URL is not defined. Please set NEXT_PUBLIC_TINYMCE_CDN_URL in your environment variables."
        );
        return;
      }

      // Load TinyMCE script if not already loaded
      if (!window.tinymce) {
        const script = document.createElement("script");
        script.src = TINYMCE_CDN_URL;
        script.setAttribute("referrerpolicy", "origin");
        document.head.appendChild(script);

        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = () =>
            reject(new Error("Failed to load TinyMCE script"));
        });
      }

      // Initialize TinyMCE
      if (window.tinymce && editorRef.current) {
        await window.tinymce.init({
          target: editorRef.current,
          height: 500,
          menubar: false,
          plugins: [
            "advlist",
            "autolink",
            "lists",
            "link",
            "image",
            "charmap",
            "preview",
            "anchor",
            "searchreplace",
            "visualblocks",
            "code",
            "fullscreen",
            "insertdatetime",
            "media",
            "table",
            "code",
            "help",
            "wordcount",
          ],
          toolbar:
            "undo redo | blocks | " +
            "bold italic forecolor | alignleft aligncenter " +
            "alignright alignjustify | bullist numlist outdent indent | " +
            "removeformat | image link | code | help",
          content_style:
            "body { font-family:Roboto,Arial,sans-serif; font-size:16px; color:#d1d5db; }",
          skin: "oxide-dark",
          content_css: "dark",
          placeholder: placeholder,
          setup: (editor: any) => {
            editorInstanceRef.current = editor;

            // Set up event handlers
            editor.on("init", () => {
              // Editor is ready - content will be set by separate useEffect
            });

            editor.on("change", () => {
              if (!isUpdatingContentRef.current) {
                const content = editor.getContent();
                onContentChangeRef.current(content);
              }
            });

            editor.on("keyup", () => {
              if (!isUpdatingContentRef.current) {
                const content = editor.getContent();
                onContentChangeRef.current(content);
              }
            });
          },
          images_upload_handler: (blobInfo: any) => {
            return new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = function () {
                resolve(reader.result as string);
              };
              reader.onerror = function () {
                reject("Image upload failed");
              };
              reader.readAsDataURL(blobInfo.blob());
            });
          },
        });
      }
    };

    loadTinyMCE().catch((error) => {
      console.error("Failed to initialize TinyMCE:", error);
    });

    // Cleanup
    return () => {
      if (editorInstanceRef.current) {
        editorInstanceRef.current.remove();
        editorInstanceRef.current = null;
      }
    };
  }, [isClient, editorId, placeholder]);

  // Update content when prop changes (separate from initialization)
  useEffect(() => {
    const updateEditorContent = () => {
      if (editorInstanceRef.current && content !== undefined) {
        const currentContent = editorInstanceRef.current.getContent();

        // Only update if content is different
        if (currentContent !== content) {
          isUpdatingContentRef.current = true;

          try {
            editorInstanceRef.current.setContent(content || "");
          } catch (error) {
            console.error("Error setting editor content:", error);
          } finally {
            // Re-enable content change detection after a brief delay
            setTimeout(() => {
              isUpdatingContentRef.current = false;
            }, 100);
          }
        }
      }
    };

    // If editor is already initialized, update content immediately
    if (editorInstanceRef.current) {
      updateEditorContent();
    } else {
      // If editor is not ready, wait for it with a small delay
      const timeout = setTimeout(() => {
        updateEditorContent();
      }, 500);

      return () => clearTimeout(timeout);
    }
  }, [content]);

  if (!isClient || !editorId) {
    return <Loading text="Loading editor..." size="lg" />;
  }

  return (
    <div
      className={`min-h-[400px] bg-primary/50 border border-gray-700 rounded-lg ${className}`}
    >
      <div ref={editorRef} id={editorId}></div>
    </div>
  );
};
