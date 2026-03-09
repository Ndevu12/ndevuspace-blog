import { useState, useCallback } from "react";

/**
 * Shared hook for managing tag input state.
 * Provides tag list management with add/remove and keyboard support.
 * Used by NewBlog and EditBlog forms.
 */
export function useTagInput(initialTags: string[] = []) {
  const [tags, setTags] = useState<string[]>(initialTags);
  const [tagInput, setTagInput] = useState("");

  const addTag = useCallback(() => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags((prev) => [...prev, trimmed]);
      setTagInput("");
    }
  }, [tagInput, tags]);

  const removeTag = useCallback((tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        addTag();
      }
    },
    [addTag]
  );

  const resetTags = useCallback((newTags: string[]) => {
    setTags(newTags);
    setTagInput("");
  }, []);

  return {
    tags,
    tagInput,
    setTagInput,
    addTag,
    removeTag,
    handleKeyDown,
    resetTags,
  };
}
