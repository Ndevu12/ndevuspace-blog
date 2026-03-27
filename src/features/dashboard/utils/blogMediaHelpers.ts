export function sanitizeFileName(fileName: string): string {
  const dotIndex = fileName.lastIndexOf(".");
  const base = dotIndex > 0 ? fileName.slice(0, dotIndex) : fileName;
  const ext = dotIndex > 0 ? fileName.slice(dotIndex).toLowerCase() : "";
  const safeBase = base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return `${safeBase || "image"}${ext}`;
}

export function resolveBlogMediaObjectPath(input: {
  userId: string;
  blogId?: string;
  fileName: string;
}): string {
  const targetSegment = input.blogId && input.blogId.trim() ? input.blogId.trim() : "draft";
  const safeName = sanitizeFileName(input.fileName);
  const uniquePrefix = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  return `authors/${input.userId}/blogs/${targetSegment}/${uniquePrefix}-${safeName}`;
}
