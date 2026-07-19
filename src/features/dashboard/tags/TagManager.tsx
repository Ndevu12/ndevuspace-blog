"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2, Tag, Merge } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useTagManagerStore } from "./store";
import type { AdminTag } from "./services/tagAdminService";

export function TagManager() {
  const [isPending, startTransition] = useTransition();
  const {
    tags,
    loading,
    selectedIds,
    loadTags,
    addTag,
    renameTag,
    removeTag,
    mergeSelected,
    toggleSelected,
    clearSelection,
  } = useTagManagerStore();

  // Create / rename dialog: editing is null for create, a tag for rename.
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AdminTag | null>(null);
  const [name, setName] = useState("");

  // Merge target (an id among the selected tags).
  const [mergeTarget, setMergeTarget] = useState<string>("");

  useEffect(() => {
    loadTags().catch(() => toast.error("Failed to load tags"));
  }, [loadTags]);

  const selectedTags = useMemo(
    () => tags.filter((t) => selectedIds.includes(t.id)),
    [tags, selectedIds]
  );

  function openCreate() {
    setEditing(null);
    setName("");
    setDialogOpen(true);
  }

  function openRename(tag: AdminTag) {
    setEditing(tag);
    setName(tag.name);
    setDialogOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Tag name is required");
      return;
    }
    startTransition(async () => {
      try {
        if (editing) {
          await renameTag(editing.id, trimmed);
          toast.success("Tag renamed");
        } else {
          await addTag(trimmed);
          toast.success("Tag created");
        }
        setDialogOpen(false);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to save tag");
      }
    });
  }

  function handleDelete(tag: AdminTag) {
    startTransition(async () => {
      try {
        await removeTag(tag.id);
        toast.success(`Deleted “${tag.name}”`);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to delete tag");
      }
    });
  }

  function handleMerge() {
    const target = mergeTarget;
    if (!target) return;
    const sourceCount = selectedIds.filter((id) => id !== target).length;
    if (sourceCount === 0) return;
    startTransition(async () => {
      try {
        const { mergedCount, movedLinks } = await mergeSelected(target);
        setMergeTarget("");
        toast.success(
          `Merged ${mergedCount} tag${mergedCount === 1 ? "" : "s"} (${movedLinks} post link${movedLinks === 1 ? "" : "s"} moved)`
        );
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to merge tags");
      }
    });
  }

  const targetName = selectedTags.find((t) => t.id === mergeTarget)?.name;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tags</h1>
          <p className="text-muted-foreground">
            Manage the topic taxonomy ({tags.length} total)
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          New Tag
        </Button>
      </div>

      {/* Merge bar — appears once two or more tags are selected */}
      {selectedIds.length >= 2 && (
        <div className="flex flex-col gap-3 rounded-md border bg-muted/40 p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm">
            <Merge className="h-4 w-4 text-primary" />
            <span>
              {selectedIds.length} selected — merge into one canonical tag:
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Select value={mergeTarget} onValueChange={setMergeTarget}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Choose target tag" />
              </SelectTrigger>
              <SelectContent>
                {selectedTags.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <AlertDialog>
              <AlertDialogTrigger
                render={<Button disabled={!mergeTarget || isPending} />}
              >
                Merge
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Merge tags</AlertDialogTitle>
                  <AlertDialogDescription>
                    The other selected tags will be merged into{" "}
                    <strong>{targetName}</strong> and then deleted. Every post
                    linked to them will be re-linked to{" "}
                    <strong>{targetName}</strong>. This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleMerge}>
                    Merge
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Button variant="ghost" size="sm" onClick={clearSelection}>
              Clear
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]" />
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead className="w-[90px] text-right">Posts</TableHead>
              <TableHead className="w-[110px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-4" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="ml-auto h-5 w-8" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-16" />
                  </TableCell>
                </TableRow>
              ))
            ) : tags.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Tag className="h-8 w-8" />
                    <p>No tags yet.</p>
                    <Button variant="outline" size="sm" onClick={openCreate}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create one
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              tags.map((tag) => (
                <TableRow key={tag.id} data-state={selectedIds.includes(tag.id) ? "selected" : undefined}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(tag.id)}
                      onCheckedChange={() => toggleSelected(tag.id)}
                      aria-label={`Select ${tag.name}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{tag.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {tag.slug}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {tag.postCount}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openRename(tag)}
                        aria-label={`Rename ${tag.name}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              aria-label={`Delete ${tag.name}`}
                            />
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete tag</AlertDialogTitle>
                            <AlertDialogDescription>
                              Delete &ldquo;{tag.name}&rdquo;? It will be removed
                              from {tag.postCount} post
                              {tag.postCount === 1 ? "" : "s"}. This cannot be
                              undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(tag)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create / rename dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Rename tag" : "Create tag"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tag-name">Name *</Label>
              <Input
                id="tag-name"
                autoFocus
                placeholder="e.g. TypeScript"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                The URL slug is generated from the name automatically.
              </p>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {editing ? "Save" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
