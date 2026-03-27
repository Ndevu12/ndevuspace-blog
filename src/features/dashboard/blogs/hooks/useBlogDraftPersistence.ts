"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { useWatch, type Control, type UseFormReset } from "react-hook-form";
import {
  useBlogDraftStore,
  type BlogDraftEntry,
  type BlogDraftValues,
} from "../store/blogDraftStore";

const AUTOSAVE_DEBOUNCE_MS = 600;

const EMPTY_VALUES: BlogDraftValues = {
  title: "",
  description: "",
  content: "",
  categoryId: "",
  tags: [],
  readingTime: "5",
  imageUrl: "",
  metaTitle: "",
  metaDescription: "",
  status: "draft",
};

type DraftMode = "new" | "edit";

interface UseBlogDraftPersistenceOptions<FormValues extends Partial<BlogDraftValues>> {
  mode: DraftMode;
  blogId?: string;
  control: Control<FormValues>;
  reset: UseFormReset<FormValues>;
  tags: string[];
  resetTags?: (tags: string[]) => void;
  isDirty: boolean;
  sourceFingerprint?: string;
  isReady?: boolean;
  canHydrateDraft?: (draft: BlogDraftEntry) => boolean;
}

interface UseBlogDraftPersistenceResult {
  clearDraft: () => void;
  hasUnsavedChanges: boolean;
}

function normalizeValues(
  values: Partial<BlogDraftValues> | undefined,
  tags: string[]
): BlogDraftValues {
  return {
    title: values?.title ?? EMPTY_VALUES.title,
    description: values?.description ?? EMPTY_VALUES.description,
    content: values?.content ?? EMPTY_VALUES.content,
    categoryId: values?.categoryId ?? EMPTY_VALUES.categoryId,
    tags,
    readingTime: values?.readingTime ?? EMPTY_VALUES.readingTime,
    imageUrl: values?.imageUrl ?? EMPTY_VALUES.imageUrl,
    metaTitle: values?.metaTitle ?? EMPTY_VALUES.metaTitle,
    metaDescription: values?.metaDescription ?? EMPTY_VALUES.metaDescription,
    status: values?.status ?? EMPTY_VALUES.status,
  };
}

export function useBlogDraftPersistence<FormValues extends Partial<BlogDraftValues>>({
  mode,
  blogId,
  control,
  reset,
  tags,
  resetTags,
  isDirty,
  sourceFingerprint,
  isReady = true,
  canHydrateDraft,
}: UseBlogDraftPersistenceOptions<FormValues>): UseBlogDraftPersistenceResult {
  const values = useWatch({ control });
  const newDraft = useBlogDraftStore((state) => state.newDraft);
  const editDraft = useBlogDraftStore((state) =>
    blogId ? state.editDraftsById[blogId] : undefined
  );
  const setNewDraft = useBlogDraftStore((state) => state.setNewDraft);
  const clearNewDraft = useBlogDraftStore((state) => state.clearNewDraft);
  const setEditDraft = useBlogDraftStore((state) => state.setEditDraft);
  const clearEditDraft = useBlogDraftStore((state) => state.clearEditDraft);

  const draftEntry = mode === "new" ? newDraft : editDraft;
  const hydratedRef = useRef(false);
  const skipAutosaveRef = useRef(false);
  const baselineRef = useRef<string | null>(null);

  const snapshot = useMemo(
    () => normalizeValues(values, tags),
    [values, tags]
  );

  useEffect(() => {
    hydratedRef.current = false;
    baselineRef.current = null;
  }, [mode, blogId]);

  useEffect(() => {
    if (!isReady) return;
    if (hydratedRef.current) return;

    if (draftEntry) {
      if (canHydrateDraft && !canHydrateDraft(draftEntry)) {
        baselineRef.current = JSON.stringify(snapshot);
        hydratedRef.current = true;
        return;
      }
      skipAutosaveRef.current = true;
      reset(draftEntry.values as FormValues);
      resetTags?.(draftEntry.values.tags);
      baselineRef.current = JSON.stringify(draftEntry.values);
      hydratedRef.current = true;
      queueMicrotask(() => {
        skipAutosaveRef.current = false;
      });
      return;
    }

    baselineRef.current = JSON.stringify(snapshot);
    hydratedRef.current = true;
  }, [canHydrateDraft, draftEntry, isReady, reset, resetTags, snapshot]);

  useEffect(() => {
    if (!isReady || !hydratedRef.current || skipAutosaveRef.current) return;

    const timeoutId = window.setTimeout(() => {
      if (mode === "new") {
        setNewDraft(snapshot, sourceFingerprint);
        return;
      }

      if (blogId) {
        setEditDraft(blogId, snapshot, sourceFingerprint);
      }
    }, AUTOSAVE_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [blogId, isReady, mode, setEditDraft, setNewDraft, snapshot, sourceFingerprint]);

  const clearDraft = useCallback(() => {
    if (mode === "new") {
      clearNewDraft();
    } else if (blogId) {
      clearEditDraft(blogId);
    }
    baselineRef.current = JSON.stringify(snapshot);
  }, [blogId, clearEditDraft, clearNewDraft, mode, snapshot]);

  const hasUnsavedChanges = useMemo(() => {
    if (!isReady) {
      return false;
    }

    return isDirty || Boolean(draftEntry);
  }, [draftEntry, isDirty, isReady]);

  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  return { clearDraft, hasUnsavedChanges };
}
