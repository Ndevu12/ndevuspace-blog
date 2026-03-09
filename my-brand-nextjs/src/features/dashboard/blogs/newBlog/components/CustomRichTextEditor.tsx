"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { RichTextEditorProps } from "../types";
import { Loading } from "@/components/atoms/Loading";

interface EditorState {
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  isStrikethrough: boolean;
  fontSize: string;
  fontFamily: string;
  alignment: string;
  listType: string;
}

export const CustomRichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onContentChange,
  placeholder = "Start writing your content here...",
  className = "",
}) => {
  console.log(
    "CustomRichTextEditor - content:",
    content ? "HAS CONTENT" : "NO CONTENT",
    content?.substring(0, 50)
  );

  const editorRef = useRef<HTMLDivElement>(null);
  const [editorState, setEditorState] = useState<EditorState>({
    isBold: false,
    isItalic: false,
    isUnderline: false,
    isStrikethrough: false,
    fontSize: "14px",
    fontFamily: "Arial",
    alignment: "left",
    listType: "",
  });
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");

  // Initialize editor content
  useEffect(() => {
    if (editorRef.current) {
      // Always update content when it changes
      const currentContent = editorRef.current.innerHTML;
      const newContent = content || "";

      if (currentContent !== newContent) {
        editorRef.current.innerHTML = newContent;
      }
    }
  }, [content]);

  // Handle content changes
  const handleContentChange = useCallback(() => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      onContentChange(newContent);
    }
  }, [onContentChange]);

  // Update editor state based on current selection
  const updateEditorState = useCallback(() => {
    try {
      setEditorState({
        isBold: document.queryCommandState("bold"),
        isItalic: document.queryCommandState("italic"),
        isUnderline: document.queryCommandState("underline"),
        isStrikethrough: document.queryCommandState("strikeThrough"),
        fontSize: document.queryCommandValue("fontSize") || "14px",
        fontFamily: document.queryCommandValue("fontName") || "Arial",
        alignment: document.queryCommandValue("justify") || "left",
        listType: document.queryCommandValue("insertUnorderedList")
          ? "ul"
          : document.queryCommandValue("insertOrderedList")
          ? "ol"
          : "",
      });
    } catch (error) {
      console.warn("Error updating editor state:", error);
    }
  }, []);

  // Execute editor command
  const executeCommand = useCallback(
    (command: string, value?: string) => {
      try {
        document.execCommand(command, false, value);
        handleContentChange();
        updateEditorState();
        editorRef.current?.focus();
      } catch (error) {
        console.warn(`Error executing command ${command}:`, error);
      }
    },
    [handleContentChange, updateEditorState]
  );

  // Handle special formatting
  const handleFormat = (format: string, value?: string) => {
    switch (format) {
      case "bold":
      case "italic":
      case "underline":
      case "strikeThrough":
        executeCommand(format);
        break;
      case "h1":
      case "h2":
      case "h3":
      case "h4":
      case "h5":
      case "h6":
        executeCommand("formatBlock", `<${format}>`);
        break;
      case "p":
        executeCommand("formatBlock", "<p>");
        break;
      case "ul":
        executeCommand("insertUnorderedList");
        break;
      case "ol":
        executeCommand("insertOrderedList");
        break;
      case "quote":
        executeCommand("formatBlock", "<blockquote>");
        break;
      case "code":
        executeCommand("formatBlock", "<pre>");
        break;
      case "alignLeft":
        executeCommand("justifyLeft");
        break;
      case "alignCenter":
        executeCommand("justifyCenter");
        break;
      case "alignRight":
        executeCommand("justifyRight");
        break;
      case "alignJustify":
        executeCommand("justifyFull");
        break;
      case "indent":
        executeCommand("indent");
        break;
      case "outdent":
        executeCommand("outdent");
        break;
      case "undo":
        executeCommand("undo");
        break;
      case "redo":
        executeCommand("redo");
        break;
      case "removeFormat":
        executeCommand("removeFormat");
        break;
      case "fontSize":
        if (value) executeCommand("fontSize", value);
        break;
      case "fontName":
        if (value) executeCommand("fontName", value);
        break;
      case "foreColor":
        if (value) executeCommand("foreColor", value);
        break;
      case "backColor":
        if (value) executeCommand("backColor", value);
        break;
      default:
        break;
    }
  };

  // Handle link insertion
  const handleInsertLink = () => {
    const selection = window.getSelection();
    const selectedText = selection?.toString() || "";

    setLinkText(selectedText);
    setLinkUrl("");
    setShowLinkModal(true);
  };

  const insertLink = () => {
    if (linkUrl) {
      if (linkText) {
        // Insert link with custom text
        executeCommand(
          "insertHTML",
          `<a href="${linkUrl}" target="_blank">${linkText}</a>`
        );
      } else {
        // Use selected text or URL as link text
        executeCommand("createLink", linkUrl);
      }
    }
    setShowLinkModal(false);
    setLinkUrl("");
    setLinkText("");
  };

  // Handle image insertion
  const handleInsertImage = () => {
    const url = prompt("Enter image URL:");
    if (url) {
      executeCommand("insertImage", url);
    }
  };

  // Handle paste events with HTML recognition and auto-styling
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();

    const clipboardData = e.clipboardData;
    const htmlContent = clipboardData.getData("text/html");
    const plainText = clipboardData.getData("text/plain");

    if (htmlContent && htmlContent.trim()) {
      // Process HTML content with smart cleaning and auto-styling
      const processedHtml = processAndCleanHtml(htmlContent);
      insertHtmlAtCursor(processedHtml);
    } else if (plainText) {
      // Fallback to plain text
      executeCommand("insertText", plainText);
    }
  };

  // Process and clean HTML content while preserving semantic elements
  const processAndCleanHtml = (htmlContent: string): string => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = htmlContent;

    // Walk through nodes and clean/style them
    walkAndCleanNodes(tempDiv);

    return tempDiv.innerHTML;
  };

  // Walk through DOM nodes and apply semantic cleaning and auto-styling
  const walkAndCleanNodes = (element: Element): void => {
    const allowedElements: Record<string, string> = {
      // Headings
      h1: "text-2xl font-bold mb-4 mt-6 text-white",
      h2: "text-xl font-bold mb-3 mt-5 text-white",
      h3: "text-lg font-bold mb-3 mt-4 text-white",
      h4: "text-base font-bold mb-2 mt-3 text-white",
      h5: "text-sm font-bold mb-2 mt-3 text-white",
      h6: "text-xs font-bold mb-2 mt-3 text-white",

      // Text formatting
      strong: "font-bold",
      b: "font-bold",
      em: "italic",
      i: "italic",
      u: "underline",
      s: "line-through",
      del: "line-through",

      // Structure
      p: "mb-4 leading-relaxed text-white",
      div: "text-white",
      span: "",

      // Lists
      ul: "list-disc pl-6 mb-4 text-white",
      ol: "list-decimal pl-6 mb-4 text-white",
      li: "mb-1 text-white",

      // Links
      a: "text-blue-400 underline hover:text-blue-300",

      // Code
      code: "bg-gray-700 text-green-400 px-2 py-1 rounded text-sm font-mono",
      pre: "bg-gray-800 text-green-400 p-4 rounded-md overflow-x-auto font-mono text-sm mb-4",

      // Quotes
      blockquote: "border-l-4 border-yellow-500 pl-4 italic my-4 text-gray-300",

      // Tables
      table: "border-collapse border border-gray-600 mb-4 w-full",
      thead: "",
      tbody: "",
      tr: "border-b border-gray-600",
      th: "border border-gray-600 px-4 py-2 font-bold bg-gray-700 text-white",
      td: "border border-gray-600 px-4 py-2 text-white",
    };

    const children = Array.from(element.children);

    children.forEach((child) => {
      const tagName = child.tagName.toLowerCase();

      if (allowedElements[tagName] !== undefined) {
        // Clean unwanted attributes
        const allowedAttrs = ["href", "src", "alt", "title"];
        const attrs = Array.from(child.attributes);

        attrs.forEach((attr) => {
          if (!allowedAttrs.includes(attr.name)) {
            child.removeAttribute(attr.name);
          }
        });

        // Apply semantic styling
        const styling = allowedElements[tagName];
        if (styling) {
          child.className = styling;
        }

        // Convert deprecated elements
        if (tagName === "b") {
          const strong = document.createElement("strong");
          strong.innerHTML = child.innerHTML;
          strong.className = allowedElements["b"];
          child.parentNode?.replaceChild(strong, child);
        } else if (tagName === "i") {
          const em = document.createElement("em");
          em.innerHTML = child.innerHTML;
          em.className = allowedElements["i"];
          child.parentNode?.replaceChild(em, child);
        }

        // Recursively process children
        walkAndCleanNodes(child);
      } else {
        // Remove unwanted elements but preserve their text content
        const textContent = child.textContent || "";
        if (textContent.trim()) {
          const span = document.createElement("span");
          span.textContent = textContent;
          span.className = "text-white";
          child.parentNode?.replaceChild(span, child);
        } else {
          child.remove();
        }
      }
    });
  };

  // Insert HTML content at cursor position
  const insertHtmlAtCursor = (html: string): void => {
    const selection = window.getSelection();

    if (!selection || selection.rangeCount === 0) {
      // No selection, append to editor
      if (editorRef.current) {
        editorRef.current.innerHTML += html;
      }
    } else {
      // Insert at cursor position
      const range = selection.getRangeAt(0);
      range.deleteContents();

      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = html;

      const fragment = document.createDocumentFragment();
      while (tempDiv.firstChild) {
        fragment.appendChild(tempDiv.firstChild);
      }

      range.insertNode(fragment);

      // Move cursor to end of inserted content
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    }

    handleContentChange();
    updateEditorState();
  };

  // Handle key events
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle common shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case "b":
          e.preventDefault();
          handleFormat("bold");
          break;
        case "i":
          e.preventDefault();
          handleFormat("italic");
          break;
        case "u":
          e.preventDefault();
          handleFormat("underline");
          break;
        case "z":
          e.preventDefault();
          handleFormat(e.shiftKey ? "redo" : "undo");
          break;
        default:
          break;
      }
    }
  };

  // Toolbar component
  const Toolbar = () => (
    <div className="border-b border-gray-600 p-3 bg-primary/30">
      <div className="flex flex-wrap items-center gap-1">
        {/* Undo/Redo */}
        <div className="flex items-center gap-1 mr-2">
          <button
            type="button"
            onClick={() => handleFormat("undo")}
            className="p-2 rounded hover:bg-primary/50 transition-colors"
            title="Undo (Ctrl+Z)"
          >
            <i className="fas fa-undo text-gray-300"></i>
          </button>
          <button
            type="button"
            onClick={() => handleFormat("redo")}
            className="p-2 rounded hover:bg-primary/50 transition-colors"
            title="Redo (Ctrl+Y)"
          >
            <i className="fas fa-redo text-gray-300"></i>
          </button>
        </div>

        <div className="h-6 w-px bg-gray-600 mx-2"></div>

        {/* Basic Formatting */}
        <div className="flex items-center gap-1 mr-2">
          <button
            type="button"
            onClick={() => handleFormat("bold")}
            className={`p-2 rounded transition-colors ${
              editorState.isBold
                ? "bg-yellow-500 text-black"
                : "hover:bg-primary/50 text-gray-300"
            }`}
            title="Bold (Ctrl+B)"
          >
            <i className="fas fa-bold"></i>
          </button>
          <button
            type="button"
            onClick={() => handleFormat("italic")}
            className={`p-2 rounded transition-colors ${
              editorState.isItalic
                ? "bg-yellow-500 text-black"
                : "hover:bg-primary/50 text-gray-300"
            }`}
            title="Italic (Ctrl+I)"
          >
            <i className="fas fa-italic"></i>
          </button>
          <button
            type="button"
            onClick={() => handleFormat("underline")}
            className={`p-2 rounded transition-colors ${
              editorState.isUnderline
                ? "bg-yellow-500 text-black"
                : "hover:bg-primary/50 text-gray-300"
            }`}
            title="Underline (Ctrl+U)"
          >
            <i className="fas fa-underline"></i>
          </button>
          <button
            type="button"
            onClick={() => handleFormat("strikeThrough")}
            className={`p-2 rounded transition-colors ${
              editorState.isStrikethrough
                ? "bg-yellow-500 text-black"
                : "hover:bg-primary/50 text-gray-300"
            }`}
            title="Strikethrough"
          >
            <i className="fas fa-strikethrough"></i>
          </button>
        </div>

        <div className="h-6 w-px bg-gray-600 mx-2"></div>

        {/* Headings */}
        <div className="flex items-center gap-1 mr-2">
          <select
            onChange={(e) => handleFormat(e.target.value)}
            className="p-1 rounded bg-primary text-gray-300 border border-gray-600 text-sm"
            title="Format"
          >
            <option value="">Format</option>
            <option value="p">Paragraph</option>
            <option value="h1">Heading 1</option>
            <option value="h2">Heading 2</option>
            <option value="h3">Heading 3</option>
            <option value="h4">Heading 4</option>
            <option value="h5">Heading 5</option>
            <option value="h6">Heading 6</option>
            <option value="quote">Quote</option>
            <option value="code">Code Block</option>
          </select>
        </div>

        <div className="h-6 w-px bg-gray-600 mx-2"></div>

        {/* Lists */}
        <div className="flex items-center gap-1 mr-2">
          <button
            type="button"
            onClick={() => handleFormat("ul")}
            className="p-2 rounded hover:bg-primary/50 transition-colors text-gray-300"
            title="Bullet List"
          >
            <i className="fas fa-list-ul"></i>
          </button>
          <button
            type="button"
            onClick={() => handleFormat("ol")}
            className="p-2 rounded hover:bg-primary/50 transition-colors text-gray-300"
            title="Numbered List"
          >
            <i className="fas fa-list-ol"></i>
          </button>
          <button
            type="button"
            onClick={() => handleFormat("outdent")}
            className="p-2 rounded hover:bg-primary/50 transition-colors text-gray-300"
            title="Decrease Indent"
          >
            <i className="fas fa-outdent"></i>
          </button>
          <button
            type="button"
            onClick={() => handleFormat("indent")}
            className="p-2 rounded hover:bg-primary/50 transition-colors text-gray-300"
            title="Increase Indent"
          >
            <i className="fas fa-indent"></i>
          </button>
        </div>

        <div className="h-6 w-px bg-gray-600 mx-2"></div>

        {/* Alignment */}
        <div className="flex items-center gap-1 mr-2">
          <button
            type="button"
            onClick={() => handleFormat("alignLeft")}
            className="p-2 rounded hover:bg-primary/50 transition-colors text-gray-300"
            title="Align Left"
          >
            <i className="fas fa-align-left"></i>
          </button>
          <button
            type="button"
            onClick={() => handleFormat("alignCenter")}
            className="p-2 rounded hover:bg-primary/50 transition-colors text-gray-300"
            title="Align Center"
          >
            <i className="fas fa-align-center"></i>
          </button>
          <button
            type="button"
            onClick={() => handleFormat("alignRight")}
            className="p-2 rounded hover:bg-primary/50 transition-colors text-gray-300"
            title="Align Right"
          >
            <i className="fas fa-align-right"></i>
          </button>
          <button
            type="button"
            onClick={() => handleFormat("alignJustify")}
            className="p-2 rounded hover:bg-primary/50 transition-colors text-gray-300"
            title="Justify"
          >
            <i className="fas fa-align-justify"></i>
          </button>
        </div>

        <div className="h-6 w-px bg-gray-600 mx-2"></div>

        {/* Links and Images */}
        <div className="flex items-center gap-1 mr-2">
          <button
            type="button"
            onClick={handleInsertLink}
            className="p-2 rounded hover:bg-primary/50 transition-colors text-gray-300"
            title="Insert Link"
          >
            <i className="fas fa-link"></i>
          </button>
          <button
            type="button"
            onClick={handleInsertImage}
            className="p-2 rounded hover:bg-primary/50 transition-colors text-gray-300"
            title="Insert Image"
          >
            <i className="fas fa-image"></i>
          </button>
        </div>

        <div className="h-6 w-px bg-gray-600 mx-2"></div>

        {/* Clear Formatting */}
        <button
          type="button"
          onClick={() => handleFormat("removeFormat")}
          className="p-2 rounded hover:bg-primary/50 transition-colors text-gray-300"
          title="Clear Formatting"
        >
          <i className="fas fa-remove-format"></i>
        </button>
      </div>
    </div>
  );

  // Link Modal
  const LinkModal = () =>
    showLinkModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-secondary p-6 rounded-lg border border-gray-700 w-96">
          <h3 className="text-lg font-bold mb-4 text-white">Insert Link</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Link URL *
              </label>
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full p-2 bg-primary border border-gray-600 rounded text-white"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Link Text
              </label>
              <input
                type="text"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                placeholder="Link text (optional)"
                className="w-full p-2 bg-primary border border-gray-600 rounded text-white"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={() => setShowLinkModal(false)}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={insertLink}
              disabled={!linkUrl}
              className="px-4 py-2 bg-yellow-500 text-black rounded hover:bg-yellow-600 disabled:opacity-50"
            >
              Insert Link
            </button>
          </div>
        </div>
      </div>
    );

  return (
    <div
      className={`border border-gray-700 rounded-lg bg-primary/50 ${className}`}
    >
      <Toolbar />
      <div
        ref={editorRef}
        contentEditable
        onInput={handleContentChange}
        onKeyDown={handleKeyDown}
        onMouseUp={updateEditorState}
        onKeyUp={updateEditorState}
        onPaste={handlePaste}
        className="editor-content min-h-[400px] p-4 text-white focus:outline-none leading-relaxed text-sm prose prose-invert max-w-none 
                  [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4 [&_h1]:mt-6 [&_h1]:text-white
                  [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mb-3 [&_h2]:mt-5 [&_h2]:text-white  
                  [&_h3]:text-lg [&_h3]:font-bold [&_h3]:mb-3 [&_h3]:mt-4 [&_h3]:text-white
                  [&_h4]:text-base [&_h4]:font-bold [&_h4]:mb-2 [&_h4]:mt-3 [&_h4]:text-white
                  [&_h5]:text-sm [&_h5]:font-bold [&_h5]:mb-2 [&_h5]:mt-3 [&_h5]:text-white
                  [&_h6]:text-xs [&_h6]:font-bold [&_h6]:mb-2 [&_h6]:mt-3 [&_h6]:text-white
                  [&_p]:mb-4 [&_p]:leading-relaxed [&_p]:text-white
                  [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ul]:text-white
                  [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4 [&_ol]:text-white
                  [&_li]:mb-1 [&_li]:text-white
                  [&_strong]:font-bold [&_em]:italic [&_u]:underline [&_s]:line-through [&_del]:line-through
                  [&_a]:text-blue-400 [&_a]:underline hover:[&_a]:text-blue-300
                  [&_code]:bg-gray-700 [&_code]:text-green-400 [&_code]:px-2 [&_code]:py-1 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono
                  [&_pre]:bg-gray-800 [&_pre]:text-green-400 [&_pre]:p-4 [&_pre]:rounded-md [&_pre]:overflow-x-auto [&_pre]:font-mono [&_pre]:text-sm [&_pre]:mb-4
                  [&_blockquote]:border-l-4 [&_blockquote]:border-yellow-500 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-4 [&_blockquote]:text-gray-300
                  [&_table]:border-collapse [&_table]:border [&_table]:border-gray-600 [&_table]:mb-4 [&_table]:w-full
                  [&_tr]:border-b [&_tr]:border-gray-600
                  [&_th]:border [&_th]:border-gray-600 [&_th]:px-4 [&_th]:py-2 [&_th]:font-bold [&_th]:bg-gray-700 [&_th]:text-white
                  [&_td]:border [&_td]:border-gray-600 [&_td]:px-4 [&_td]:py-2 [&_td]:text-white"
        data-placeholder={placeholder}
        suppressContentEditableWarning={true}
      />
      <LinkModal />

      {/* Fallback textarea (hidden by default) */}
      <textarea
        className="hidden w-full min-h-[400px] p-4 bg-primary/50 text-white border-0 resize-none focus:outline-none"
        placeholder={placeholder}
        value={content || ""}
        onChange={(e) => onContentChange(e.target.value)}
      />
    </div>
  );
};
