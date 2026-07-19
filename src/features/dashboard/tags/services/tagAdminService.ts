import { createClient } from "@/lib/supabase/client";
import { assertRpcObject, type RpcObject } from "@/lib/supabase/rpc";

/** A tag as seen in the admin tag manager. */
export interface AdminTag {
  id: string;
  name: string;
  slug: string;
  postCount: number;
  createdAt: string;
  updatedAt: string;
}

type RpcRecord = RpcObject;

function parseTag(raw: unknown): AdminTag | null {
  if (!raw || typeof raw !== "object") return null;
  const t = raw as RpcRecord;
  if (typeof t.id !== "string") return null;
  return {
    id: t.id,
    name: typeof t.name === "string" ? t.name : "",
    slug: typeof t.slug === "string" ? t.slug : "",
    postCount: typeof t.postCount === "number" ? t.postCount : 0,
    createdAt: typeof t.createdAt === "string" ? t.createdAt : "",
    updatedAt: typeof t.updatedAt === "string" ? t.updatedAt : "",
  };
}

export async function getAdminTags(): Promise<AdminTag[]> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("blog_tag_admin_list");
  if (error) {
    throw new Error(error.message || "Failed to fetch tags.");
  }
  const payload = assertRpcObject(data, "Invalid tags response.");
  const tags = Array.isArray(payload.tags) ? payload.tags : [];
  return tags.map(parseTag).filter((t): t is AdminTag => t !== null);
}

export async function createTag(name: string): Promise<AdminTag> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("blog_tag_admin_create", {
    p_name: name,
    p_slug: null,
  });
  if (error) {
    throw new Error(error.message || "Failed to create tag.");
  }
  const tag = parseTag(data);
  if (!tag) throw new Error("Invalid create-tag response.");
  return tag;
}

export async function updateTag(id: string, name: string): Promise<AdminTag> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("blog_tag_admin_update", {
    p_tag_id: id,
    p_name: name,
    p_slug: null,
  });
  if (error) {
    throw new Error(error.message || "Failed to rename tag.");
  }
  const tag = parseTag(data);
  if (!tag) throw new Error("Invalid update-tag response.");
  return tag;
}

export async function deleteTag(id: string): Promise<void> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("blog_tag_admin_delete", {
    p_tag_id: id,
  });
  if (error) {
    throw new Error(error.message || "Failed to delete tag.");
  }
  const payload = assertRpcObject(data, "Invalid delete-tag response.");
  if (!payload.ok) throw new Error("Tag delete was not acknowledged.");
}

export async function mergeTags(
  sourceIds: string[],
  targetId: string
): Promise<{ mergedCount: number; movedLinks: number }> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("blog_tag_admin_merge", {
    p_source_ids: sourceIds,
    p_target_id: targetId,
  });
  if (error) {
    throw new Error(error.message || "Failed to merge tags.");
  }
  const payload = assertRpcObject(data, "Invalid merge-tags response.");
  if (!payload.ok) throw new Error("Tag merge was not acknowledged.");
  return {
    mergedCount: typeof payload.mergedCount === "number" ? payload.mergedCount : 0,
    movedLinks: typeof payload.movedLinks === "number" ? payload.movedLinks : 0,
  };
}
