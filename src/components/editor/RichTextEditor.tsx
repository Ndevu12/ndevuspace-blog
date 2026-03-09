"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link,
  Image,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Undo,
  Redo,
  RemoveFormatting,
  Minus,
  type LucideIcon,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface RichTextEditorProps {
  content: string;
  onContentChange: (content: string) => void;
  placeholder?: string;
  className?: string;
}

interface ToolbarButtonProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  active?: boolean;
}

/* ------------------------------------------------------------------ */
/*  Toolbar button                                                     */
/* ------------------------------------------------------------------ */

function ToolbarButton({ icon: Icon, label, onClick, active }: ToolbarButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();          // keep focus in contentEditable
              onClick();
            }}
            className={cn(
              "inline-flex items-center justify-center rounded-md p-1.5 text-sm transition-colors",
              "hover:bg-accent hover:text-accent-foreground",
              "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
              active && "bg-accent text-accent-foreground",
            )}
            aria-label={label}
          />
        }
      >
        <Icon className="h-4 w-4" />
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

/* ------------------------------------------------------------------ */
/*  Editor                                                             */
/* ------------------------------------------------------------------ */

export function RichTextEditor({
  content,
  onContentChange,
  placeholder = "Write your blog content here...",
  className,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Track whether the editor has focus so we can show/hide placeholder
  const [hasFocus, setHasFocus] = useState(false);
  const [isEmpty, setIsEmpty] = useState(!content);
  // Track active formatting state for visual feedback on toolbar buttons
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());

  /* ---------- sync external content → editor DOM ---------- */
  const isInternalChange = useRef(false);

  useEffect(() => {
    if (isInternalChange.current) {
      isInternalChange.current = false;
      return;
    }
    const el = editorRef.current;
    if (el && el.innerHTML !== content) {
      el.innerHTML = content;
      setIsEmpty(!content || content === "<br>");
    }
  }, [content]);

  /* ---------- poll selection state for toolbar highlights ---------- */
  const updateActiveFormats = useCallback(() => {
    const formats = new Set<string>();
    if (document.queryCommandState("bold")) formats.add("bold");
    if (document.queryCommandState("italic")) formats.add("italic");
    if (document.queryCommandState("underline")) formats.add("underline");
    if (document.queryCommandState("strikeThrough")) formats.add("strikeThrough");
    if (document.queryCommandState("insertUnorderedList")) formats.add("insertUnorderedList");
    if (document.queryCommandState("insertOrderedList")) formats.add("insertOrderedList");

    // Block-level formatting
    const block = document.queryCommandValue("formatBlock");
    if (block) formats.add(block.toLowerCase());

    // Alignment
    if (document.queryCommandState("justifyLeft")) formats.add("justifyLeft");
    if (document.queryCommandState("justifyCenter")) formats.add("justifyCenter");
    if (document.queryCommandState("justifyRight")) formats.add("justifyRight");
    if (document.queryCommandState("justifyFull")) formats.add("justifyFull");

    setActiveFormats(formats);
  }, []);

  /* ---------- helpers ---------- */
  const exec = useCallback(
    (command: string, value?: string) => {
      document.execCommand(command, false, value);
      editorRef.current?.focus();
      updateActiveFormats();
    },
    [updateActiveFormats],
  );

  const handleInput = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;
    const html = el.innerHTML;
    isInternalChange.current = true;
    onContentChange(html);
    setIsEmpty(!html || html === "<br>");
    updateActiveFormats();
  }, [onContentChange, updateActiveFormats]);

  const insertLink = useCallback(() => {
    const url = window.prompt("Enter URL:");
    if (url) exec("createLink", url);
  }, [exec]);

  const insertImage = useCallback(() => {
    const url = window.prompt("Enter image URL:");
    if (url) exec("insertImage", url);
  }, [exec]);

  const insertCodeBlock = useCallback(() => {
    const code = window.prompt("Paste your code:");
    if (code) {
      const escaped = code
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      document.execCommand(
        "insertHTML",
        false,
        `<pre style="background:${isDark ? "#1e293b" : "#f1f5f9"};padding:1rem;border-radius:0.5rem;overflow-x:auto;font-family:monospace;font-size:14px;line-height:1.5"><code>${escaped}</code></pre><p><br></p>`,
      );
      handleInput();
    }
  }, [isDark, handleInput]);

  /* ---------- toolbar definition ---------- */
  const is = (f: string) => activeFormats.has(f);

  return (
    <TooltipProvider delay={300}>
      <div
        className={cn(
          "rounded-lg border bg-background text-foreground shadow-sm",
          className,
        )}
      >
        {/* ---- Toolbar ---- */}
        <div className="flex flex-wrap items-center gap-0.5 border-b px-2 py-1.5">
          <ToolbarButton icon={Undo} label="Undo" onClick={() => exec("undo")} />
          <ToolbarButton icon={Redo} label="Redo" onClick={() => exec("redo")} />

          <Separator orientation="vertical" className="mx-1 h-6" />

          <ToolbarButton
            icon={Heading1}
            label="Heading 1"
            active={is("h1")}
            onClick={() => exec("formatBlock", "h1")}
          />
          <ToolbarButton
            icon={Heading2}
            label="Heading 2"
            active={is("h2")}
            onClick={() => exec("formatBlock", "h2")}
          />
          <ToolbarButton
            icon={Heading3}
            label="Heading 3"
            active={is("h3")}
            onClick={() => exec("formatBlock", "h3")}
          />

          <Separator orientation="vertical" className="mx-1 h-6" />

          <ToolbarButton icon={Bold} label="Bold" active={is("bold")} onClick={() => exec("bold")} />
          <ToolbarButton icon={Italic} label="Italic" active={is("italic")} onClick={() => exec("italic")} />
          <ToolbarButton icon={Underline} label="Underline" active={is("underline")} onClick={() => exec("underline")} />
          <ToolbarButton icon={Strikethrough} label="Strikethrough" active={is("strikeThrough")} onClick={() => exec("strikeThrough")} />

          <Separator orientation="vertical" className="mx-1 h-6" />

          <ToolbarButton icon={AlignLeft} label="Align left" active={is("justifyLeft")} onClick={() => exec("justifyLeft")} />
          <ToolbarButton icon={AlignCenter} label="Align center" active={is("justifyCenter")} onClick={() => exec("justifyCenter")} />
          <ToolbarButton icon={AlignRight} label="Align right" active={is("justifyRight")} onClick={() => exec("justifyRight")} />
          <ToolbarButton icon={AlignJustify} label="Justify" active={is("justifyFull")} onClick={() => exec("justifyFull")} />

          <Separator orientation="vertical" className="mx-1 h-6" />

          <ToolbarButton icon={List} label="Bullet list" active={is("insertUnorderedList")} onClick={() => exec("insertUnorderedList")} />
          <ToolbarButton icon={ListOrdered} label="Numbered list" active={is("insertOrderedList")} onClick={() => exec("insertOrderedList")} />
          <ToolbarButton icon={Quote} label="Blockquote" active={is("blockquote")} onClick={() => exec("formatBlock", "blockquote")} />
          <ToolbarButton icon={Minus} label="Horizontal rule" onClick={() => exec("insertHorizontalRule")} />

          <Separator orientation="vertical" className="mx-1 h-6" />

          <ToolbarButton icon={Link} label="Insert link" onClick={insertLink} />
          <ToolbarButton icon={Image} label="Insert image" onClick={insertImage} />
          <ToolbarButton icon={Code} label="Code block" onClick={insertCodeBlock} />
          <ToolbarButton icon={RemoveFormatting} label="Clear formatting" onClick={() => exec("removeFormat")} />
        </div>

        {/* ---- Editable area ---- */}
        <div className="relative">
          {isEmpty && !hasFocus && (
            <p className="pointer-events-none absolute left-4 top-4 text-muted-foreground select-none">
              {placeholder}
            </p>
          )}
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            className={cn(
              "prose max-w-none min-h-[400px] px-4 py-4 outline-none",
              "font-[Inter,system-ui,-apple-system,BlinkMacSystemFont,'Segoe_UI',sans-serif] text-base leading-relaxed",
              "focus:ring-0",
              isDark && "prose-invert",
            )}
            onInput={handleInput}
            onFocus={() => { setHasFocus(true); updateActiveFormats(); }}
            onBlur={() => setHasFocus(false)}
            onKeyUp={updateActiveFormats}
            onMouseUp={updateActiveFormats}
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      </div>
    </TooltipProvider>
  );
}
