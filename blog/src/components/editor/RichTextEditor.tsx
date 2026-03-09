"use client";

import { useRef, useState } from "react";
import { useTheme } from "next-themes";
import { Editor } from "@tinymce/tinymce-react";
import { TINYMCE_API_KEY } from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";

interface RichTextEditorProps {
  content: string;
  onContentChange: (content: string) => void;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({
  content,
  onContentChange,
  placeholder = "Write your blog content here...",
  className,
}: RichTextEditorProps) {
  const editorRef = useRef<unknown>(null);
  const [loading, setLoading] = useState(true);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <div className={className}>
      {loading && (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      )}
      <div className={loading ? "hidden" : ""}>
        <Editor
          apiKey={TINYMCE_API_KEY}
          onInit={(_evt, editor) => {
            editorRef.current = editor;
            setLoading(false);
          }}
          value={content}
          onEditorChange={(newContent) => onContentChange(newContent)}
          init={{
            height: 500,
            menubar: true,
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
              "help",
              "wordcount",
              "codesample",
            ],
            toolbar:
              "undo redo | blocks | " +
              "bold italic forecolor | alignleft aligncenter " +
              "alignright alignjustify | bullist numlist outdent indent | " +
              "link image codesample | removeformat | help",
            content_style:
              "body { font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 16px; line-height: 1.6; }",
            placeholder,
            skin: isDark ? "oxide-dark" : "oxide",
            content_css: isDark ? "dark" : "default",
            codesample_languages: [
              { text: "HTML/XML", value: "markup" },
              { text: "JavaScript", value: "javascript" },
              { text: "TypeScript", value: "typescript" },
              { text: "CSS", value: "css" },
              { text: "Python", value: "python" },
              { text: "Java", value: "java" },
              { text: "C/C++", value: "c" },
              { text: "Bash", value: "bash" },
              { text: "JSON", value: "json" },
              { text: "SQL", value: "sql" },
            ],
          }}
        />
      </div>
    </div>
  );
}
