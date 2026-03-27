"use client";

import { useMemo } from "react";
import { RichTextEditor as PackageRichTextEditor } from "rich-text-editor-ndevu";
import { useTheme } from "next-themes";

type ToolbarItem =
  | "bold"
  | "italic"
  | "underline"
  | "strike"
  | "heading1"
  | "heading2"
  | "heading3"
  | "heading4"
  | "heading5"
  | "heading6"
  | "bulletList"
  | "orderedList"
  | "blockquote"
  | "code"
  | "codeBlock"
  | "link"
  | "image"
  | "undo"
  | "redo"
  | "|";

const FULL_TOOLBAR: ToolbarItem[] = [
  "undo",
  "redo",
  "|",
  "bold",
  "italic",
  "underline",
  "strike",
  "|",
  "heading1",
  "heading2",
  "heading3",
  "heading4",
  "heading5",
  "heading6",
  "|",
  "bulletList",
  "orderedList",
  "blockquote",
  "|",
  "code",
  "codeBlock",
  "|",
  "link",
  "image",
];

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
  const { resolvedTheme } = useTheme();
  const theme = useMemo<"dark" | "light">(() => {
    if (resolvedTheme === "dark" || resolvedTheme === "light") {
      return resolvedTheme;
    }
    if (typeof document !== "undefined") {
      return document.documentElement.classList.contains("dark") ? "dark" : "light";
    }
    return "light";
  }, [resolvedTheme]);

  return (
    <div className={className} data-theme={theme}>
      <PackageRichTextEditor
        value={content}
        onChange={onContentChange}
        placeholder={placeholder}
        toolbar={FULL_TOOLBAR}
        theme={theme}
        minHeight={400}
        ariaLabel="Blog content editor"
      />
    </div>
  );
}
